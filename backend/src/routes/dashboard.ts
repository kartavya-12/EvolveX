import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { authMiddleware } from '../middleware/auth';
import { getLevelProgress } from '../services/xpEngine';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Get user
    const [userRows] = await pool.query(
      'SELECT id, username, level, total_xp, title FROM users WHERE id = ?',
      [userId]
    );
    const user = (userRows as any[])[0];
    const progress = getLevelProgress(user.total_xp);

    // Get today's tasks (quests)
    const [tasks] = await pool.query(
      `SELECT * FROM tasks WHERE user_id = ? AND (category = 'daily' OR DATE(created_at) = CURDATE()) ORDER BY status ASC, priority DESC LIMIT 10`,
      [userId]
    );

    // Recent workouts (last 7 days)
    const [recentWorkouts] = await pool.query(
      `SELECT * FROM workouts WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) ORDER BY created_at DESC LIMIT 5`,
      [userId]
    );

    // Workout count this week
    const [workoutCount] = await pool.query(
      `SELECT COUNT(*) as count, SUM(xp_earned) as total_xp FROM workouts WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId]
    );

    // Muscle XP
    const [muscleXP] = await pool.query(
      'SELECT * FROM muscle_xp WHERE user_id = ?',
      [userId]
    );

    // Tasks completed this week
    const [taskStats] = await pool.query(
      `SELECT COUNT(*) as completed FROM tasks WHERE user_id = ? AND status = 'completed' AND completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId]
    );

    // Active habits
    const [habits] = await pool.query(
      'SELECT * FROM habits WHERE user_id = ? ORDER BY streak DESC LIMIT 5',
      [userId]
    );

    // Recent XP logs
    const [xpLogs] = await pool.query(
      'SELECT * FROM xp_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    // Workout XP per day (last 7 days) for chart
    const [workoutChart] = await pool.query(
      `SELECT DATE(created_at) as date, SUM(xp_earned) as xp, COUNT(*) as count 
       FROM workouts WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [userId]
    );

    res.json({
      user: { ...user, ...progress },
      quests: tasks,
      recentWorkouts,
      workoutStats: (workoutCount as any[])[0],
      muscleXP,
      taskStats: (taskStats as any[])[0],
      habits,
      xpLogs,
      workoutChart
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
