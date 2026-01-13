// src/controllers/rateController.ts
import type{ Request, Response } from 'express';
import prisma from '../config/prisma.ts';
import {type AuthRequest } from '../middlewares/authMiddleware.ts';

type RateType = 'LEASE_INTEREST_RATE' | 'PENALTY_RATE';

export const getCurrentRate = async (req: Request, res: Response) => {
  const { type } = req.params as { type: RateType };

  try {
    const rate = await prisma.system_rates.findUnique({
      where: { rate_type: type },
      select: { value: true, updated_at: true, description: true }
    });

    if (!rate) {
      return res.status(404).json({ message: 'Rate not configured yet' });
    }

    res.json({
      rate_type: type,
      value: rate.value,
      description: rate.description,
      last_updated: rate.updated_at
    });
  } catch (error) {
    console.error('Get rate error:', error);
    res.status(500).json({ message: 'Failed to fetch rate' });
  }
};

export const updateRate = async (req: AuthRequest, res: Response) => {
  const { type } = req.params as { type: RateType };
  const { value, description } = req.body as { value: number; description?: string };
  const userId = req.user!.user_id;

  if (typeof value !== 'number' || value < 0) {
    return res.status(400).json({ message: 'Value must be a non-negative number' });
  }

  try {
    const updated = await prisma.system_rates.upsert({
      where: { rate_type: type },
      update: {
        value,
        description: description?.trim() || null,
        updated_at: new Date(),
      
      },
      create: {
        rate_type: type,
        value,
        description: description?.trim() || null,
      
      },
    });

    res.json({
      message: 'Rate updated successfully',
      rate: {
        type: updated.rate_type,
        value: updated.value,
        description: updated.description,
      
      }
    });
  } catch (error) {
    console.error('Update rate error:', error);
    res.status(500).json({ message: 'Failed to update rate' });
  }
};