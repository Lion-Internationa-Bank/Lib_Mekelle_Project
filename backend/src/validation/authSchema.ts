// src/validation/authSchema.ts
import { z } from 'zod';
import { UserRole } from '../generated/prisma/enums.ts';

export const loginSchema = z.object({
  body: z.object({
    username: z
      .string()
      .trim()
      .min(1, { message: 'Username is required and cannot be empty' }),
    password: z
      .string()
      .trim()
      .min(6, { message: 'Password must be at least 6 characters' }),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .trim()
      .min(6, { message: 'Current password must be at least 6 characters' }),
    newPassword: z
      .string()
      .trim()
      .min(6, { message: 'New password must be at least 6 characters' }),
  }),
});

// NEW: Create User Validation
export const createUserSchema = z.object({
  body: z.object({
    username: z
      .string()
      .trim()
      .min(3, { message: 'Username must be at least 3 characters' })
      .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' }),

    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
    //   .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    //   .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    //   .regex(/[0-9]/, { message: 'Password must contain at least one number' }),

    full_name: z
      .string()
      .trim()
      .min(2, { message: 'Full name must be at least 2 characters' }),

    role: z.nativeEnum(UserRole, { message: 'Invalid role' }),

    // sub_city_id: z
    //   .string()
    //   .uuid({ message: 'sub_city_id must be a valid UUID' })
    //   .nullable()
    //   .optional(),
  }),
});

// NEW: Param validation for /users/:id routes
export const userIdParamSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid({ message: 'User ID must be a valid UUID' }),
  }),
});

// NEW: Suspend user body validation
export const suspendUserSchema = z.object({
  body: z.object({
    suspend: z.boolean({ message: 'suspend field must be true or false' }),
  }),
  params: z.object({
    id: z
      .string()
      .uuid({ message: 'User ID must be a valid UUID' }),
  }),
});