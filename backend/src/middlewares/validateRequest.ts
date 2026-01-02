import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { ZodObject } from 'zod';

export const validateRequest = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = await schema.safeParseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: parseResult.error.format(),
        });
      }

      // Cast to any to attach the validated data property
      (req as any).validated = parseResult.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};
