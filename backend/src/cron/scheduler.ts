import cron from 'node-cron';
import { cronConfig, cronOptions } from '../config/cron.ts';
import { updateBillStatusToOverdue } from './tasks/billStatusUpdate.ts';
import { calculateAndUpdatePenalty } from './tasks/penaltyCalculation.ts';
import { calculateAndUpdateInterest } from './tasks/interestCalculation.ts';
import { updateLeaseStatus } from './tasks/leaseStatusUpdate.ts';

class CronScheduler {
  private static instance: CronScheduler;
  private isRunning: boolean = false;
  private tasks: Map<string, cron.ScheduledTask> = new Map();
  private taskConfigs: Map<string, { name: string, schedule: string }> = new Map();

  private constructor() {
    // Initialize task configurations for logging
    this.taskConfigs.set('billStatusUpdate', { 
      name: 'Bill Status Update', 
      schedule: cronConfig.billStatusUpdate 
    });
    this.taskConfigs.set('penaltyCalculation', { 
      name: 'Penalty Calculation', 
      schedule: cronConfig.penaltyCalculation 
    });
    this.taskConfigs.set('interestCalculation', { 
      name: 'Interest Calculation', 
      schedule: cronConfig.interestCalculation 
    });
    this.taskConfigs.set('leaseStatusUpdate', { 
      name: 'Lease Status Update', 
      schedule: cronConfig.leaseStatusUpdate 
    });
  }

  static getInstance(): CronScheduler {
    if (!CronScheduler.instance) {
      CronScheduler.instance = new CronScheduler();
    }
    return CronScheduler.instance;
  }

  async startAllTasks() {
    if (this.isRunning) {
      console.log('Cron scheduler is already running');
      return;
    }

    console.log('🚀 Starting cron scheduler...');
    this.isRunning = true;

    // Schedule bill status update task
    const billStatusTask = cron.schedule(
      cronConfig.billStatusUpdate,
      async () => {
        console.log('⏰ Running bill status update task...');
        const startTime = Date.now();
        try {
          const result = await updateBillStatusToOverdue();
          const duration = Date.now() - startTime;
          console.log(`✅ Bill status update completed in ${duration}ms:`, result);
        } catch (error) {
          console.error('❌ Bill status update failed:', error);
        }
      },
      cronOptions
    );
    this.tasks.set('billStatusUpdate', billStatusTask);

    // Schedule penalty calculation task
    const penaltyTask = cron.schedule(
      cronConfig.penaltyCalculation,
      async () => {
        console.log('⏰ Running penalty calculation task...');
        const startTime = Date.now();
        try {
          const result = await calculateAndUpdatePenalty();
          const duration = Date.now() - startTime;
          console.log(`✅ Penalty calculation completed in ${duration}ms:`, result);
        } catch (error) {
          console.error('❌ Penalty calculation failed:', error);
        }
      },
      cronOptions
    );
    this.tasks.set('penaltyCalculation', penaltyTask);

    // Schedule interest calculation task
    const interestTask = cron.schedule(
      cronConfig.interestCalculation,
      async () => {
        console.log('⏰ Running interest calculation task...');
        const startTime = Date.now();
        try {
          const result = await calculateAndUpdateInterest();
          const duration = Date.now() - startTime;
          console.log(`✅ Interest calculation completed in ${duration}ms:`, result);
        } catch (error) {
          console.error('❌ Interest calculation failed:', error);
        }
      },
      cronOptions
    );
    this.tasks.set('interestCalculation', interestTask);

    // Schedule lease status update task
    const leaseStatusTask = cron.schedule(
      cronConfig.leaseStatusUpdate,
      async () => {
        console.log('⏰ Running lease status update task...');
        const startTime = Date.now();
        try {
          const result = await updateLeaseStatus();
          const duration = Date.now() - startTime;
          console.log(`✅ Lease status update completed in ${duration}ms:`, result);
        } catch (error) {
          console.error('❌ Lease status update failed:', error);
        }
      },
      cronOptions
    );
    this.tasks.set('leaseStatusUpdate', leaseStatusTask);

    console.log('✅ All cron tasks scheduled successfully');
    this.logScheduleInfo();
  }

  stopAllTasks() {
    console.log('🛑 Stopping all cron tasks...');
    this.tasks.forEach((task, name) => {
      task.stop();
      const config = this.taskConfigs.get(name);
      console.log(`✅ ${config?.name || name} stopped`);
    });
    this.tasks.clear();
    this.isRunning = false;
    console.log('✅ All cron tasks stopped');
  }

  getTaskStatus(): { name: string, isRunning: boolean, schedule: string }[] {
    const status: { name: string, isRunning: boolean, schedule: string }[] = [];
    this.taskConfigs.forEach((config, key) => {
      status.push({
        name: config.name,
        isRunning: this.tasks.has(key),
        schedule: config.schedule
      });
    });
    return status;
  }

  private logScheduleInfo() {
    console.log('\n📅 Scheduled cron tasks:');
    this.taskConfigs.forEach((config, key) => {
      const isActive = this.tasks.has(key);
      console.log(`  ${config.name}:`);
      console.log(`    Schedule: ${config.schedule}`);
      console.log(`    Status: ${isActive ? '✅ Active' : '❌ Inactive'}`);
    });
    console.log('');
  }

  // Optional: Method to manually run a specific task (useful for testing)
  async runTaskNow(taskName: string): Promise<any> {
    const taskMap: Record<string, () => Promise<any>> = {
      'billStatusUpdate': updateBillStatusToOverdue,
      'penaltyCalculation': calculateAndUpdatePenalty,
      'interestCalculation': calculateAndUpdateInterest,
      'leaseStatusUpdate': updateLeaseStatus
    };

    const task = taskMap[taskName];
    if (!task) {
      throw new Error(`Task '${taskName}' not found`);
    }

    console.log(`⏰ Manually running ${taskName}...`);
    const startTime = Date.now();
    try {
      const result = await task();
      const duration = Date.now() - startTime;
      console.log(`✅ ${taskName} completed in ${duration}ms:`, result);
      return result;
    } catch (error) {
      console.error(`❌ ${taskName} failed:`, error);
      throw error;
    }
  }
}

export const cronScheduler = CronScheduler.getInstance();