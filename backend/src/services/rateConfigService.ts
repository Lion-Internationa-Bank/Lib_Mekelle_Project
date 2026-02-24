import prisma from '../config/prisma.ts';
import { RateType } from '../generated/prisma/enums.ts';

export class RateConfigService {
  static async getCurrentRate(rateType: RateType): Promise<number> {
    try {
      const config = await prisma.rate_configurations.findFirst({
        where: {
          rate_type: rateType,
          is_active: true,
          effective_from: {
            lte: new Date()
          },
          OR: [
            {
              effective_until: {
                gte: new Date()
              }
            },
            {
              effective_until: null
            }
          ]
        },
        orderBy: {
          effective_from: 'desc'
        }
      });

      if (!config) {
        throw new Error(`No active rate configuration found for ${rateType}`);
      }

      return Number(config.value);
    } catch (error) {
      console.error(`Error fetching rate for ${rateType}:`, error);
      throw error;
    }
  }

  static async getPenaltyRate(): Promise<number> {
    return this.getCurrentRate('PENALTY_RATE');
  }

  static async getLeaseInterestRate(): Promise<number> {
    return this.getCurrentRate('LEASE_INTEREST_RATE');
  }

  static async getLatePaymentGraceDays(): Promise<number> {
    try {
      const config = await prisma.rate_configurations.findFirst({
        where: {
          rate_type: 'LATE_PAYMENT_GRACE_DAYS',
          is_active: true
        }
      });
      return config ? Number(config.value) : 30; // Default 30 days grace period
    } catch (error) {
      console.error('Error fetching grace days:', error);
      return 0; // Default fallback
    }
  }
}