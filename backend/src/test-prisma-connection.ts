// test-prisma-connection.ts
import prisma from './config/prisma.ts';

async function testConnection() {
  try {
    console.log('Testing Prisma connection...');
    
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful:', result);
    
    // Test a model query
    const userCount = await prisma.users.count();
    console.log('✅ Users count:', userCount);
    
    await prisma.$disconnect();
    console.log('✅ Test completed successfully');
    
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testConnection();