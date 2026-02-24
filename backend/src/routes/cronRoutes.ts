import express from 'express';
import { CronController } from '../controllers/cronController.ts';
import { authenticate } from '../middlewares/authMiddleware.ts';
import { authorize } from '../middlewares/roleMiddleware.ts';

const router = express.Router();

// Protect all cron routes with authentication and admin role
router.use(authenticate);
router.use(authorize(['CITY_ADMIN', 'SUBCITY_ADMIN']));

// Get status of all cron tasks
router.get('/status', CronController.getStatus);

// Manually run a specific task
router.post('/run/:taskName', CronController.runTask);

// Stop all cron tasks
router.post('/stop', CronController.stopAll);

// Start all cron tasks
router.post('/start', CronController.startAll);

export default router;