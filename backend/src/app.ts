import express from 'express';
import type { Request, Response, Application } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.ts';
import { authenticate } from './middlewares/authMiddleware.ts';


// Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);

app.use('/*splat', (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});
// app.use('*', (req: Request, res: Response) => {
//   res.status(404).json({ success: false, message: 'Route not found' });
// });

export default app;
