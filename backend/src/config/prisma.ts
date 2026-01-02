import "dotenv/config";
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
// import { PrismaClient } from '../../generated/prisma/index.js'; 
import { PrismaClient } from "../generated/prisma/client.ts";

// 2. You must create a new pg Pool instance first
const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });

// 3. Pass the pool into the adapter
const adapter = new PrismaPg(pool);

// 4. Initialize Prisma with the adapter
const prisma = new PrismaClient({ adapter });

export default prisma; // Consistent with your server.ts import
