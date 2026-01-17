import 'dotenv/config';
// import http from 'http';
import http from 'http';
import app from './src/app.ts';
// import app from './src/app.ts';
import prisma from "./src/config/prisma.ts";
import { seedInitialAdmins } from './src/seed/initialAdmins.ts';
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  try {
    // Test DB connection
    await prisma.$connect();
    console.log('PostgreSQL connected successfully');
    await seedInitialAdmins();
// '0.0.0.0',
      server.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
