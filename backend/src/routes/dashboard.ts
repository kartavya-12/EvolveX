import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { authMiddleware } from '../middleware/auth';
import { getLevelProgress } from '../services/xpEngine';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Get user
    const { rows: userRows } = await pool.query(
      'SELECT id, username, level, total_xp, title FROM users WHERE id = $1',
      [userId]
    );
    const user = userRows[0];
    const progress = getLevelProgress(user.total_xp);

    // Get today's tasks (quests)
    const { rows: tasks } = await pool.query(
      `SELECT * FROM tasks WHERE user_id = $1 AND (category = 'daily' OR DATE(created_at) = CURRENT_DATE) ORDER BY status ASC, priority DESC LIMIT 10`,
      [userId]
    );

    // Recent workouts (last 7 days)
    const { rows: recentWorkouts } = await pool.query(
      `SELECT * FROM workouts WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days' ORDER BY created_at DESC LIMIT 5`,
      [userId]
    );

    // Workout count this week
    const { rows: workoutCount } = await pool.query(
      `SELECT COUNT(*) as count, SUM(xp_earned) as total_xp FROM workouts WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
      [userId]
    );

    // Muscle XP
    const { rows: muscleXP } = await pool.query(
      'SELECT * FROM muscle_xp WHERE user_id = $1',
      [userId]
    );

    // Tasks completed this week
    const { rows: taskStats } = await pool.query(
      `SELECT COUNT(*) as completed FROM tasks WHERE user_id = $1 AND status = 'completed' AND completed_at >= NOW() - INTERVAL '7 days'`,
      [userId]
    );

    // Active habits
    const { rows: habits } = await pool.query(
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY streak DESC LIMIT 5',
      [userId]
    );

    // Recent XP logs
    const { rows: xpLogs } = await pool.query(
      'SELECT * FROM xp_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    // Workout XP per day (last 7 days) for chart
    const { rows: workoutChart } = await pool.query(
      `SELECT DATE(created_at) as date, SUM(xp_earned) as xp, COUNT(*) as count 
       FROM workouts WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days' 
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [userId]
    );

    res.json({
      user: { ...user, ...progress },
      quests: tasks,
      recentWorkouts,
      workoutStats: workoutCount[0],
      muscleXP,
      taskStats: taskStats[0],
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
