// src/check-env.ts
import "dotenv/config";

console.log('=== Environment Check ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('TIMEZONE:', process.env.TIMEZONE || 'Not set');
console.log('Current directory:', process.cwd());
console.log('=========================');

// Check .env file location
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
console.log('.env file exists:', fs.existsSync(envPath) ? '✓ Yes' : '✗ No');
if (fs.existsSync(envPath)) {
  console.log('.env file content (first few lines):');
  const content = fs.readFileSync(envPath, 'utf8').split('\n').slice(0, 5);
  content.forEach(line => console.log('  ', line));
}