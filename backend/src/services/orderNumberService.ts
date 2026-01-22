// src/services/orderNumberService.ts
import prisma from '../config/prisma.ts';
import { Prisma } from '@prisma/client';

export class OrderNumberService {
  private static instance: OrderNumberService;
  
  static getInstance(): OrderNumberService {
    if (!OrderNumberService.instance) {
      OrderNumberService.instance = new OrderNumberService();
    }
    return OrderNumberService.instance;
  }

  /**
   * Generate unique order number
   */
  async generateOrderNumber(): Promise<string> {
    // Get format configuration
    const config = await this.getOrderNumberConfig();
    const format = config.format || 'ORD-{YYYY}-{SEQ:6}';
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Start building order number
    let orderNumber = format;
    
    // Replace date placeholders
    orderNumber = orderNumber
      .replace('{YYYY}', year.toString())
      .replace('{YY}', year.toString().slice(-2))
      .replace('{MM}', month)
      .replace('{DD}', day);
    
    // Handle sequence
    if (orderNumber.includes('{SEQ')) {
      const seqMatch = orderNumber.match(/\{SEQ:(\d+)\}/);
      if (seqMatch) {
        const length = parseInt(seqMatch[1], 10);
        const sequence = await this.getNextSequence(config);
        orderNumber = orderNumber.replace(
          `{SEQ:${length}}`,
          String(sequence).padStart(length, '0')
        );
      }
    }
    
    // Validate uniqueness
    await this.validateUniqueness(orderNumber);
    
    return orderNumber;
  }

  /**
   * Get order number configuration
   */
  private async getOrderNumberConfig(): Promise<any> {
    const config = await prisma.configurations.findFirst({
      where: {
        key: 'ORDER_NUMBER_FORMAT',
        category: 'ORDER_NUMBER_FORMAT',
        is_active: true
      }
    });

    if (!config) {
      // Default configuration
      return {
        format: 'ORD-{YYYY}-{SEQ:6}',
        prefix: 'ORD',
        include_date: true,
        sequence_length: 6,
        reset_frequency: 'YEARLY',
        separator: '-'
      };
    }

    return config.value as any;
  }

  /**
   * Get next sequence number based on reset frequency
   */
  private async getNextSequence(config: any): Promise<number> {
    const resetFrequency = config.reset_frequency || 'YEARLY';
    const now = new Date();
    
    let periodKey: string;
    let startDate: Date;
    let endDate: Date;

    switch (resetFrequency.toUpperCase()) {
      case 'DAILY':
        periodKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        break;
      
      case 'MONTHLY':
        periodKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
        break;
      
      case 'YEARLY':
      default:
        periodKey = `${now.getFullYear()}`;
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
        endDate = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
        break;
    }

    // Count existing orders in this period
    const count = await prisma.payment_orders.count({
      where: {
        generated_at: {
          gte: startDate,
          lt: endDate
        },
        is_deleted: false
      }
    });

    return count + 1;
  }

  /**
   * Validate order number uniqueness
   */
  private async validateUniqueness(orderNumber: string): Promise<void> {
    const existingOrder = await prisma.payment_orders.findUnique({
      where: { order_number: orderNumber }
    });

    if (existingOrder) {
      throw new Error(`Order number ${orderNumber} already exists`);
    }
  }

  /**
   * Generate order number with retry logic
   */
  async generateOrderNumberWithRetry(maxRetries: number = 3): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const orderNumber = await this.generateOrderNumber();
        console.log(`Order number generated successfully: ${orderNumber}`);
        return orderNumber;
      } catch (error: any) {
        console.warn(`Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to generate unique order number after ${maxRetries} attempts`);
        }
        
        // Wait before retry (exponential backoff)
        await this.sleep(100 * Math.pow(2, attempt));
      }
    }
    
    throw new Error('Unexpected error in order number generation');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}