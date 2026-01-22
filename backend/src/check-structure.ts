// check-structure.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current directory:', __dirname);
console.log('Project root:', process.cwd());

// Check if the file exists
const possiblePaths = [
  path.join(__dirname, '../generated/prisma/client.ts'),
  path.join(__dirname, '../../generated/prisma/client.ts'),
  path.join(__dirname, '../../../generated/prisma/client.ts'),
  path.join(process.cwd(), 'src/generated/prisma/client.ts'),
  path.join(process.cwd(), 'generated/prisma/client.ts'),
];

console.log('\nChecking possible paths:');
for (const filePath of possiblePaths) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✓' : '✗'} ${filePath}`);
}