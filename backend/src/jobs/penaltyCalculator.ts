import prisma from '../config/prisma.ts';

/**
 * Calculates the penalty amount for a bill based on the principal (base payment + interest),
 * due date, and current date. Fetches the active penalty rate and grace days from the
 * rate_configurations table. Assumes the penalty rate is an annual rate applied as simple
 * interest on a daily basis after the grace period.
 *
 * @param principal The base payment + interest amount (the principal for penalty calculation).
 * @param dueDate The due date of the bill.
 * @returns An object containing the calculated penalty amount (rounded to 2 decimal places) and the rate used.
 */
export async function calculatePenaltyAmount(principal: number, dueDate: Date): Promise<{ penalty: number; rateUsed: number }> {
  const now = new Date();

  // Check if the bill is overdue; if not, return 0
  if (now <= dueDate) {
    return { penalty: 0, rateUsed: 0 };
  }

  // Fetch the latest active late payment grace days
  const graceConfig = await prisma.rate_configurations.findFirst({
    where: {
      rate_type: 'LATE_PAYMENT_GRACE_DAYS',
      effective_from: { lte: now },
      OR: [
        { effective_until: null },
        { effective_until: { gte: now } },
      ],
      is_active: true,
    },
    orderBy: { effective_from: 'desc' },
  });

  const graceDays = graceConfig ? Number(graceConfig.value) : 0;

  // Fetch the latest active penalty rate (assumed annual rate, e.g., 0.05 for 5%)
  const penaltyConfig = await prisma.rate_configurations.findFirst({
    where: {
      rate_type: 'PENALTY_RATE',
      effective_from: { lte: now },
      OR: [
        { effective_until: null },
        { effective_until: { gte: now } },
      ],
      is_active: true,
    },
    orderBy: { effective_from: 'desc' },
  });

  const penaltyRate = penaltyConfig ? Number(penaltyConfig.value) : 0;

  // Calculate days overdue, accounting for grace period
  const timeDiff = now.getTime() - dueDate.getTime();
  const daysOverdue = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const effectiveOverdueDays = Math.max(0, daysOverdue - graceDays);

  // Calculate penalty as simple interest: principal * rate * days / 365
  const penalty = (principal * penaltyRate * effectiveOverdueDays) / 365;

  // Round to 2 decimal places for currency precision
  const roundedPenalty = Math.round(penalty * 100) / 100;

  return { penalty: roundedPenalty, rateUsed: penaltyRate };
}