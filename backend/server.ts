import 'dotenv/config';
import https from 'https';
import app from './src/app.ts';
import prisma from "./src/config/prisma.ts";
import { seedInitialAdmins, seedOnlyConfigs } from './src/seed/initialAdmins.ts';
import { cronScheduler } from './src/cron/index.ts';
import fs from 'fs'

const PORT = process.env.PORT || 5000;
const SKIP_ADMIN_SEED = process.env.SKIP_ADMIN_SEED === 'true';
const SKIP_CONFIG_SEED = process.env.SKIP_CONFIG_SEED === 'true';
const ENABLE_CRON_JOBS = process.env.ENABLE_CRON_JOBS !== 'false'; // Enabled by default


const sslOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
};

const server = https.createServer(sslOptions,app);
console.log("working direc", process.cwd());

const startServer = async () => {
  try {
    // Test DB connection
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully');
    
    // Run seeds based on environment variables
    if (!SKIP_CONFIG_SEED) {
      console.log('📦 Running configuration seed...');
      await seedOnlyConfigs();
    } else {
      console.log('⏭️ Skipping configuration seed (SKIP_CONFIG_SEED=true)');
    }
    
    if (!SKIP_ADMIN_SEED) {
      console.log('👤 Running admin seed...');
      await seedInitialAdmins();
    } else {
      console.log('⏭️ Skipping admin seed (SKIP_ADMIN_SEED=true)');
    }
    
    // Start cron jobs if enabled
    if (ENABLE_CRON_JOBS) {
      console.log('⏰ Starting cron scheduler...');
      await cronScheduler.startAllTasks();
    } else {
      console.log('⏭️ Cron jobs disabled (ENABLE_CRON_JOBS=false)');
    }
    
    // Start server
    server.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n📴 Shutting down gracefully...');
  
  try {
    // Stop cron jobs
    cronScheduler.stopAllTasks();
    
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
    
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n📴 Received SIGTERM, shutting down...');
  
  try {
    // Stop cron jobs
    cronScheduler.stopAllTasks();
    
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
    
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
});

startServer();