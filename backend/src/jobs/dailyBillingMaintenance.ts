import prisma from '../config/prisma.ts';
import { calculatePenaltyAmount } from './penaltyCalculator.ts';
import fs from 'fs/promises';
import path from 'path';

// State to prevent concurrent execution
let isMaintenanceRunning = false;
const MAINTENANCE_LOCK_ID = 'daily_billing_maintenance_lock';

// Metrics collection
interface MaintenanceMetrics {
  startTime: Date;
  endTime: Date | null;
  durationMs: number | null;
  tasks: {
    overdueUpdates: { updated: number; durationMs: number };
    penaltyUpdates: { updated: number; durationMs: number };
    orderExpirations: { expired: number; durationMs: number };
    orderRecalculations: { recalculated: number; durationMs: number };
  };
  errors: Array<{ task: string; error: string; timestamp: Date }>;
}

// Batch processing utility
async function processInBatches<T>(
  query: (skip: number, take: number) => Promise<T[]>,
  processBatch: (items: T[]) => Promise<void>,
  batchSize = 1000,
  operationName = 'batch operation'
): Promise<{ processed: number; batches: number }> {
  let processed = 0;
  let batches = 0;
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const batchStart = Date.now();
    const items = await query(skip, batchSize);
    
    if (items.length === 0) {
      hasMore = false;
    } else {
      await processBatch(items);
      processed += items.length;
      batches += 1;
      skip += items.length;
      
      console.log(`Batch ${batches} of ${operationName}: Processed ${items.length} items in ${Date.now() - batchStart}ms`);
      
      // Small delay between batches to prevent overwhelming the database
      if (items.length === batchSize) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  return { processed, batches };
}

// Helper function to create a numeric hash from a string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// File-based locking for compatibility
async function acquireFileLock(): Promise<boolean> {
  const lockFile = path.join(process.cwd(), '.maintenance.lock');
  
  try {
    // Try to create lock file exclusively
    await fs.writeFile(lockFile, process.pid.toString(), { flag: 'wx' });
    return true;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EEXIST') {
      // Lock file exists, check if process is still running
      try {
        const pidStr = await fs.readFile(lockFile, 'utf8');
        const pid = parseInt(pidStr);
        
        if (isProcessRunning(pid)) {
          return false; // Another maintenance is running
        } else {
          // Stale lock, remove it and try again
          await fs.unlink(lockFile);
          return await acquireFileLock();
        }
      } catch {
        // Can't read lock file, assume another process has it
        return false;
      }
    }
    return false;
  }
}

async function releaseFileLock(): Promise<void> {
  const lockFile = path.join(process.cwd(), '.maintenance.lock');
  try {
    await fs.unlink(lockFile);
  } catch (error) {
    // Ignore errors when releasing lock
  }
}

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0); // Signal 0 just checks if process exists
    return true;
  } catch {
    return false;
  }
}

// PostgreSQL advisory lock (optional - can fail gracefully)
async function acquireAdvisoryLock(): Promise<boolean> {
  try {
    // Convert lock ID to bigint for PostgreSQL
    const lockId = BigInt(hashString(MAINTENANCE_LOCK_ID));
    
    // Use parameterized query with proper casting
    const result = await prisma.$queryRaw<{ lock_acquired: boolean }[]>`
      SELECT pg_try_advisory_lock(${lockId}) as lock_acquired
    `;
    
    return result[0]?.lock_acquired || false;
  } catch (error) {
    console.log('Advisory lock not available, using file-based locking:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

async function releaseAdvisoryLock(): Promise<void> {
  try {
    const lockId = BigInt(hashString(MAINTENANCE_LOCK_ID));
    await prisma.$queryRaw`
      SELECT pg_advisory_unlock(${lockId})
    `;
  } catch (error) {
    console.log('Failed to release advisory lock (non-critical):', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Individual task functions with their own transactions
async function updateOverdueBills(now: Date): Promise<{ updated: number; durationMs: number }> {
  const startTime = Date.now();
  let updated = 0;

  try {
    // Using updateMany for bulk update - more efficient
    const result = await prisma.$transaction(async (tx) => {
      return await tx.billing_records.updateMany({
        where: {
          payment_status: "UNPAID",
          due_date: { lt: now },
          remaining_amount: { gt: 0 },
        
        },
        data: { 
          payment_status: "OVERDUE", 
          updated_at: now 
        },
      });
    }, {
      timeout: 30000, // 30 second timeout
    });

    updated = result.count;
    
    // Log to audit trail
    // if (updated > 0) {
    //   await prisma.audit_logs.create({
    //     data: {
    //       user_id: null,
    //       action_type: 'SYSTEM_UPDATE',
    //       entity_type: 'billing_records',
    //       entity_id: 'BATCH_OVERDUE',
    //       changes: { 
    //         count: updated, 
    //         operation: 'Updated UNPAID to OVERDUE',
    //         condition: `due_date < ${now.toISOString()}`
    //       },
    //       timestamp: now,
    //       metadata: {
    //         task: 'overdue_update',
    //         execution_time_ms: Date.now() - startTime
    //       }
    //     },
    //   });
    // }

    return { 
      updated, 
      durationMs: Date.now() - startTime 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to update overdue bills: ${errorMessage}`);
  }
}

async function updatePenaltyAmounts(now: Date): Promise<{ updated: number; durationMs: number }> {
  const startTime = Date.now();
  let processed = 0;

  try {
    // Process in smaller chunks to avoid transaction timeouts
    const batchSize = 100;
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      await prisma.$transaction(async (tx) => {
        const overdueBills = await tx.billing_records.findMany({
          where: { 
            payment_status: "OVERDUE",
            // Only process bills that need penalty updates
            OR: [
              { penalty_amount: { equals: 0 } },
              { updated_at: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } } // Updated more than 24h ago
            ]
          },
          select: {
            bill_id: true,
            base_payment: true,
            interest_amount: true,
            due_date: true,
            amount_due: true,
          },
          skip,
          take: batchSize,
          orderBy: { due_date: 'asc' }, // Process oldest first
        });

        if (overdueBills.length === 0) {
          hasMore = false;
          return;
        }

        const updates = overdueBills.map(async (bill) => {
          const principal = Number(bill.base_payment || 0) + Number(bill.interest_amount);
          const newPenalty = await calculatePenaltyAmount(principal, bill.due_date!);
          
          // Only update if penalty changed
          if (newPenalty.penalty > 0) {
            await tx.billing_records.update({
              where: { bill_id: bill.bill_id },
              data: {
                penalty_amount: newPenalty.penalty,
                amount_due: principal + newPenalty.penalty,
                penalty_rate_used: newPenalty.rateUsed,
                updated_at: now,
              },
            });
            return 1;
          }
          return 0;
        });

        const results = await Promise.allSettled(updates);
        const batchProcessed = results.reduce((count, result) => {
          if (result.status === 'fulfilled' && result.value === 1) {
            return count + 1;
          }
          return count;
        }, 0);
        
        processed += batchProcessed;
        skip += batchSize;

        console.log(`  Processed batch: ${batchProcessed} penalties updated`);
      }, {
        timeout: 30000,
      });
    }

    return { 
      updated: processed, 
      durationMs: Date.now() - startTime 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to update penalty amounts: ${errorMessage}`);
  }
}

async function expireOldOrders(now: Date): Promise<{ expired: number; durationMs: number }> {
  const startTime = Date.now();

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Using updateMany for bulk expiration
      return await tx.payment_orders.updateMany({
        where: {
          status: "GENERATED",
          expires_at: { lt: now },
        },
        data: { 
          status: "EXPIRED", 
          updated_at: now 
        },
      });
    }, {
      timeout: 15000,
    });

    // Log expiration
    // if (result.count > 0) {
    //   await prisma.audit_logs.create({
    //     data: {
    //       user_id: null,
    //       action_type: 'SYSTEM_EXPIRE',
    //       entity_type: 'payment_orders',
    //       entity_id: 'BATCH_EXPIRED',
    //       changes: { 
    //         count: result.count, 
    //         operation: 'Expired old payment orders',
    //         condition: `expires_at < ${now.toISOString()}`
    //       },
    //       timestamp: now,
    //       metadata: {
    //         task: 'order_expiration',
    //         execution_time_ms: Date.now() - startTime
    //       }
    //     },
    //   });
    // }

    return { 
      expired: result.count, 
      durationMs: Date.now() - startTime 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to expire old orders: ${errorMessage}`);
  }
}

async function recalculateOrderTotals(now: Date): Promise<{ recalculated: number; durationMs: number }> {
  const startTime = Date.now();
  let recalculated = 0;

  try {
    // Process in batches to avoid large transactions
    const batchSize = 50;
    
    const { processed } = await processInBatches(
      async (skip, take) => {
        return await prisma.payment_orders.findMany({
          where: {
            status: "GENERATED",
            expires_at: { gt: now },
          },
          select: {
            order_number: true,
            bill_items: {
              select: {
                id: true,
                bill: {
                  select: {
                    amount_due: true,
                    updated_at: true,
                  }
                }
              }
            }
          },
          skip,
          take,
          orderBy: { created_at: 'asc' },
        });
      },
      async (orders) => {
        for (const order of orders) {
          try {
            await prisma.$transaction(async (tx) => {
              let newTotal = 0;
              const itemUpdates = [];
              
              for (const item of order.bill_items) {
                newTotal += Number(item.bill.amount_due);
                // Update order_bill_items amount if needed
                itemUpdates.push(
                  tx.order_bill_items.update({
                    where: { id: item.id },
                    data: { amount: item.bill.amount_due },
                  })
                );
              }
              
              // Only update if there are bill items
              if (order.bill_items.length > 0) {
                await Promise.all([
                  ...itemUpdates,
                  tx.payment_orders.update({
                    where: { order_number: order.order_number },
                    data: {
                      current_calculated_total: newTotal,
                      last_recalculated_at: now,
                      updated_at: now,
                    },
                  })
                ]);
                recalculated++;
              }
            }, {
              isolationLevel: 'ReadCommitted',
              timeout: 10000,
            });
          } catch (error) {
            console.error(`Failed to recalculate order ${order.order_number}:`, error instanceof Error ? error.message : 'Unknown error');
            // Continue with other orders
          }
        }
      },
      batchSize,
      'order_recalculation'
    );

    return { 
      recalculated, 
      durationMs: Date.now() - startTime 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to recalculate order totals: ${errorMessage}`);
  }
}

// Main maintenance function
async function runDailyBillingMaintenance(): Promise<MaintenanceMetrics> {
  const startTime = new Date();
  const metrics: MaintenanceMetrics = {
    startTime,
    endTime: null,
    durationMs: null,
    tasks: {
      overdueUpdates: { updated: 0, durationMs: 0 },
      penaltyUpdates: { updated: 0, durationMs: 0 },
      orderExpirations: { expired: 0, durationMs: 0 },
      orderRecalculations: { recalculated: 0, durationMs: 0 },
    },
    errors: []
  };

  // Check if already running
  if (isMaintenanceRunning) {
    throw new Error('Maintenance is already running');
  }

  isMaintenanceRunning = true;
  let lockAcquired = false;
  let lockType: 'advisory' | 'file' | 'none' = 'none';

  try {
    console.log(`Starting daily billing maintenance at ${startTime.toISOString()}`);

    // Try advisory lock first
    try {
      lockAcquired = await acquireAdvisoryLock();
      if (lockAcquired) {
        lockType = 'advisory';
        console.log('✓ Acquired PostgreSQL advisory lock');
      }
    } catch (advisoryError) {
      console.warn('Advisory lock failed:', advisoryError instanceof Error ? advisoryError.message : 'Unknown error');
    }

    // Fall back to file lock if advisory lock fails
    if (!lockAcquired) {
      try {
        lockAcquired = await acquireFileLock();
        if (lockAcquired) {
          lockType = 'file';
          console.log('✓ Acquired file lock (advisory lock unavailable)');
        }
      } catch (fileLockError) {
        console.warn('File lock failed:', fileLockError instanceof Error ? fileLockError.message : 'Unknown error');
      }
    }

    // If still not acquired, check if we should proceed anyway
    if (!lockAcquired) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Could not acquire maintenance lock - another instance may be running');
      } else {
        console.warn('⚠ Could not acquire lock, but proceeding in development mode');
        lockType = 'none';
        lockAcquired = true; // Allow proceeding in dev mode
      }
    }

    // Task 1: Update overdue bills
    try {
      console.log('Task 1: Updating overdue bills...');
      const result = await updateOverdueBills(startTime);
      metrics.tasks.overdueUpdates = result;
      console.log(`✓ Updated ${result.updated} overdue bills in ${result.durationMs}ms`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      metrics.errors.push({ 
        task: 'overdue_updates', 
        error: errorMessage, 
        timestamp: new Date() 
      });
      console.error('✗ Failed to update overdue bills:', errorMessage);
      // Continue with other tasks
    }

    // Task 2: Update penalty amounts
    try {
      console.log('Task 2: Updating penalty amounts...');
      const result = await updatePenaltyAmounts(startTime);
      metrics.tasks.penaltyUpdates = result;
      console.log(`✓ Updated penalties for ${result.updated} bills in ${result.durationMs}ms`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      metrics.errors.push({ 
        task: 'penalty_updates', 
        error: errorMessage, 
        timestamp: new Date() 
      });
      console.error('✗ Failed to update penalty amounts:', errorMessage);
    }

    // Task 3: Expire old orders
    try {
      console.log('Task 3: Expiring old orders...');
      const result = await expireOldOrders(startTime);
      metrics.tasks.orderExpirations = result;
      console.log(`✓ Expired ${result.expired} old orders in ${result.durationMs}ms`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      metrics.errors.push({ 
        task: 'order_expirations', 
        error: errorMessage, 
        timestamp: new Date() 
      });
      console.error('✗ Failed to expire old orders:', errorMessage);
    }

    // Task 4: Recalculate order totals
    try {
      console.log('Task 4: Recalculating order totals...');
      const result = await recalculateOrderTotals(startTime);
      metrics.tasks.orderRecalculations = result;
      console.log(`✓ Recalculated ${result.recalculated} orders in ${result.durationMs}ms`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      metrics.errors.push({ 
        task: 'order_recalculations', 
        error: errorMessage, 
        timestamp: new Date() 
      });
      console.error('✗ Failed to recalculate order totals:', errorMessage);
    }

    // Record completion
    metrics.endTime = new Date();
    metrics.durationMs = metrics.endTime.getTime() - startTime.getTime();

    // Log final metrics
    // try {
    //   await prisma.audit_logs.create({
    //     data: {
    //       user_id: null,
    //       action_type: 'SYSTEM_MAINTENANCE',
    //       entity_type: 'system',
    //       entity_id: 'DAILY_BILLING_MAINTENANCE',
    //       changes: {
    //         summary: 'Daily maintenance completed',
    //         metrics: {
    //           total_duration_ms: metrics.durationMs,
    //           tasks_completed: {
    //             overdue_updates: metrics.tasks.overdueUpdates.updated,
    //             penalty_updates: metrics.tasks.penaltyUpdates.updated,
    //             order_expirations: metrics.tasks.orderExpirations.expired,
    //             order_recalculations: metrics.tasks.orderRecalculations.recalculated,
    //           },
    //           errors: metrics.errors.length,
    //           lock_type: lockType,
    //         }
    //       },
    //       timestamp: metrics.endTime,
    //       metadata: {
    //         start_time: metrics.startTime.toISOString(),
    //         end_time: metrics.endTime.toISOString(),
    //         version: '2.0',
    //         environment: process.env.NODE_ENV || 'development'
    //       }
    //     },
    //   });
    // } catch (logError) {
    //   console.error('Failed to log metrics:', logError instanceof Error ? logError.message : 'Unknown error');
    // }

    console.log(`\n✅ Daily billing maintenance completed in ${metrics.durationMs}ms`);
    console.log(`   Overdue bills updated: ${metrics.tasks.overdueUpdates.updated}`);
    console.log(`   Penalties updated: ${metrics.tasks.penaltyUpdates.updated}`);
    console.log(`   Orders expired: ${metrics.tasks.orderExpirations.expired}`);
    console.log(`   Orders recalculated: ${metrics.tasks.orderRecalculations.recalculated}`);
    console.log(`   Errors encountered: ${metrics.errors.length}`);
    console.log(`   Lock type: ${lockType}`);

    if (metrics.errors.length > 0) {
      console.warn('\n⚠  Errors during maintenance:');
      metrics.errors.forEach((error, index) => {
        console.warn(`   ${index + 1}. ${error.task}: ${error.error}`);
      });
    }

    return metrics;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Critical error in daily maintenance:', errorMessage);
    
    // Log critical failure
    // try {
    //   await prisma.audit_logs.create({
    //     data: {
    //       user_id: null,
    //       action_type: 'SYSTEM_ERROR',
    //       entity_type: 'system',
    //       entity_id: 'DAILY_BILLING_MAINTENANCE',
    //       changes: {
    //         error: errorMessage,
    //         state: 'FAILED'
    //       },
    //       timestamp: new Date(),
    //       metadata: {
    //         start_time: metrics.startTime.toISOString(),
    //         failed_at: new Date().toISOString()
    //       }
    //     },
    //   });
    // } catch (logError) {
    //   console.error('Failed to log error:', logError instanceof Error ? logError.message : 'Unknown error');
    // }
    
    throw error;
  } finally {
    // Always release locks and reset running state
    try {
      if (lockAcquired) {
        if (lockType === 'advisory') {
          await releaseAdvisoryLock();
        } else if (lockType === 'file') {
          await releaseFileLock();
        }
      }
    } catch (lockError) {
      console.error('Error releasing lock:', lockError instanceof Error ? lockError.message : 'Unknown error');
    }
    
    isMaintenanceRunning = false;
  }
}

// Health check function
async function canRunMaintenance(): Promise<{ canRun: boolean; reason?: string }> {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if within maintenance window (e.g., 00:00 - 04:00) - optional
    const hour = new Date().getHours();
    const maintenanceWindowStart = parseInt(process.env.MAINTENANCE_WINDOW_START || '0');
    const maintenanceWindowEnd = parseInt(process.env.MAINTENANCE_WINDOW_END || '4');
    
    if (hour < maintenanceWindowStart || hour > maintenanceWindowEnd) {
      return { 
        canRun: true, // Allow running outside window for flexibility
        reason: `Outside preferred maintenance window (${maintenanceWindowStart}:00-${maintenanceWindowEnd}:00)` 
      };
    }
    
    return { canRun: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { 
      canRun: false, 
      reason: `Database connection failed: ${errorMessage}` 
    };
  }
}

// Cron scheduler with enhanced error handling
import cron from 'node-cron';

cron.schedule('0 0 * * *', async () => {
  console.log('Cron triggered: Starting maintenance check...');
  
  const healthCheck = await canRunMaintenance();
  if (!healthCheck.canRun) {
    console.log(`Skipping maintenance: ${healthCheck.reason}`);
    return;
  }
  
  try {
    const metrics = await runDailyBillingMaintenance();
    
    // Optional: Send notification for successful run
    if (metrics.errors.length > 0) {
      console.warn('Maintenance completed with errors');
      // Here you could send an alert/notification
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Fatal error in scheduled maintenance:', errorMessage);
    
    // Optionally implement retry logic for certain errors
    if (errorMessage.includes('connection') || errorMessage.includes('timeout') || errorMessage.includes('lock')) {
      console.log('Retrying maintenance in 5 minutes...');
      setTimeout(async () => {
        try {
          console.log('Retrying maintenance...');
          await runDailyBillingMaintenance();
        } catch (retryError) {
          const retryErrorMessage = retryError instanceof Error ? retryError.message : 'Unknown error occurred';
          console.error('Retry also failed:', retryErrorMessage);
        }
      }, 5 * 60 * 1000);
    }
  }
}, { 
  timezone: process.env.TIMEZONE || 'Africa/Addis_Ababa',
//   scheduled: true
});

// For manual execution (e.g., from admin panel)
export async function triggerMaintenanceManually(): Promise<MaintenanceMetrics> {
  console.log('Manual maintenance trigger requested');
  const healthCheck = await canRunMaintenance();
  
  if (!healthCheck.canRun) {
    console.warn(`Proceeding despite: ${healthCheck.reason}`);
  }
  
  return await runDailyBillingMaintenance();
}

// Test function to verify the script works
export async function testMaintenance(): Promise<void> {
  console.log('=== TESTING DAILY MAINTENANCE ===');
  console.log('Time:', new Date().toISOString());
  console.log('Environment:', process.env.NODE_ENV || 'development');
  
  try {
    const result = await runDailyBillingMaintenance();
    console.log('\n=== MAINTENANCE COMPLETED ===');
    console.log('Duration:', result.durationMs, 'ms');
    console.log('Tasks completed successfully');
    
    if (result.errors.length > 0) {
      console.warn('Warnings:', result.errors.map(e => `${e.task}: ${e.error}`));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('=== MAINTENANCE FAILED ===');
    console.error(errorMessage);
    throw error;
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

export { runDailyBillingMaintenance };

// Start the cron job if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting maintenance scheduler...');
  console.log('Maintenance will run daily at midnight');
  console.log('Press Ctrl+C to exit');
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('Maintenance scheduler stopped.');
    process.exit(0);
  });
  
  // Keep the process alive
  setInterval(() => {}, 1000);
}