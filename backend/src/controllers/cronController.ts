import type{ Request, Response } from 'express';
import { cronScheduler } from '../cron/scheduler.ts';

export class CronController {
  // Get status of all cron tasks
  static async getStatus(req: Request, res: Response) {
    try {
      const status = cronScheduler.getTaskStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Error getting cron status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cron status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Manually run a specific cron task
  static async runTask(req: Request, res: Response) {
    try {
      const taskName = req.params.taskName as string;
      
      // Validate task name
      const validTasks = ['billStatusUpdate', 'penaltyCalculation', 'interestCalculation', 'leaseStatusUpdate'];
      if (!validTasks.includes(taskName)) {
        return res.status(400).json({
          success: false,
          message: `Invalid task name. Valid tasks: ${validTasks.join(', ')}`
        });
      }

      const result = await cronScheduler.runTaskNow(taskName);
      
      res.json({
        success: true,
        message: `Task ${taskName} executed successfully`,
        data: result
      });
    } catch (error) {
      console.error(`Error running cron task:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to run cron task',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Stop all cron tasks
  static async stopAll(req: Request, res: Response) {
    try {
      cronScheduler.stopAllTasks();
      res.json({
        success: true,
        message: 'All cron tasks stopped'
      });
    } catch (error) {
      console.error('Error stopping cron tasks:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to stop cron tasks',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Start all cron tasks
  static async startAll(req: Request, res: Response) {
    try {
      await cronScheduler.startAllTasks();
      res.json({
        success: true,
        message: 'All cron tasks started'
      });
    } catch (error) {
      console.error('Error starting cron tasks:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start cron tasks',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}