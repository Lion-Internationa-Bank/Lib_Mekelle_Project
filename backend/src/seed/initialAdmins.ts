// src/seed/initialAdmins.ts
import prisma from '../config/prisma.ts';
import bcrypt from 'bcrypt';
import { UserRole } from '../generated/prisma/enums.ts';

const saltRounds = 12;

interface AdminConfig {
  username: string;
  passwordEnv: string;
  fallbackPassword: string;
  full_name: string;
  role: UserRole;
}

const adminsToSeed: AdminConfig[] = [
  {
    username: 'cityadmin',
    passwordEnv: 'CITY_ADMIN_PASSWORD',
    fallbackPassword: 'CityAdmin123!',
    full_name: 'City Administrator',
    role: 'CITY_ADMIN',
  },
  {
    username: 'revenueadmin',
    passwordEnv: 'REVENUE_ADMIN_PASSWORD',
    fallbackPassword: 'RevenueAdmin123!',
    full_name: 'Revenue Administrator',
    role: 'REVENUE_ADMIN',
  },
];

export async function seedInitialAdmins() {
  console.log('Running initial admin seed...');

  for (const admin of adminsToSeed) {
    const password = process.env[admin.passwordEnv] || admin.fallbackPassword;

    if (!process.env[admin.passwordEnv]) {
      console.warn(
        `Warning: ${admin.passwordEnv} not set in .env. Using fallback password for ${admin.username} (development only!)`
      );
    }

    const existingUser = await prisma.users.findUnique({
      where: { username: admin.username },
    });

    if (existingUser) {
      console.log(`User already exists: ${admin.username} (${admin.role})`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await prisma.users.create({
      data: {
        username: admin.username,
        password_hash: hashedPassword,
        full_name: admin.full_name,
        role: admin.role,
        sub_city_id: null,
        is_active: true,
        is_deleted: false,
      },
    });

    console.log(`Created initial admin: ${admin.username} (${admin.role})`);
  }

  console.log('Initial admin seed completed.');
}