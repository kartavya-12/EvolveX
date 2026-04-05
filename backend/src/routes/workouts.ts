import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { authMiddleware } from '../middleware/auth';
import { calculateWorkoutXP, awardXP, awardMuscleXP } from '../services/xpEngine';

const router = Router();

// Get workouts
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const [rows] = await pool.query(
      'SELECT * FROM workouts WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [req.user!.userId, limit, offset]
    );

    res.json(rows);
  } catch (error: any) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Add workout
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { exercise, muscle_group, sets_count, reps, weight } = req.body;

    if (!exercise || !muscle_group || !sets_count || !reps) {
      res.status(400).json({ error: 'Exercise, muscle group, sets, and reps are required.' });
      return;
    }

    const xpEarned = calculateWorkoutXP(sets_count, reps, weight || 0);

    const [result] = await pool.query(
      'INSERT INTO workouts (user_id, exercise, muscle_group, sets_count, reps, weight, xp_earned) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user!.userId, exercise, muscle_group, sets_count, reps, weight || 0, xpEarned]
    );

    const workoutId = (result as any).insertId;

    // Award global XP
    const xpResult = await awardXP(
      req.user!.userId,
      xpEarned,
      'workout',
      workoutId,
      `Workout: ${exercise} (${sets_count}x${reps} @ ${weight}kg)`
    );

    // Award muscle-specific XP
    const muscleResult = await awardMuscleXP(req.user!.userId, muscle_group, xpEarned);

    res.status(201).json({
      workout: { id: workoutId, exercise, muscle_group, sets_count, reps, weight, xp_earned: xpEarned },
      xp: {
        earned: xpEarned,
        ...xpResult
      },
      muscle: muscleResult
    });
  } catch (error: any) {
    console.error('Add workout error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get muscle XP stats
router.get('/muscle-xp', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM muscle_xp WHERE user_id = ?',
      [req.user!.userId]
    );

    res.json(rows);
  } catch (error: any) {
    console.error('Get muscle XP error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
