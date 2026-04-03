import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { authMiddleware } from '../middleware/auth';
import { awardXP } from '../services/xpEngine';

const router = Router();

// Get habits
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM habits WHERE user_id = ? ORDER BY created_at ASC',
      [req.user!.userId]
    );
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Create habit
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, icon, xp_per_completion } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required.' });
      return;
    }

    const [result] = await pool.query(
      'INSERT INTO habits (user_id, name, icon, xp_per_completion) VALUES (?, ?, ?, ?)',
      [req.user!.userId, name, icon || '⚡', xp_per_completion || 20]
    );

    res.status(201).json({
      id: (result as any).insertId,
      name, icon: icon || '⚡',
      streak: 0, best_streak: 0,
      xp_per_completion: xp_per_completion || 20
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Check in habit (daily)
router.post('/:id/checkin', authMiddleware, async (req: Request, res: Response) => {
  try {
    const habitId = parseInt(req.params.id);

    const [rows] = await pool.query(
      'SELECT * FROM habits WHERE id = ? AND user_id = ?',
      [habitId, req.user!.userId]
    );
    const habit = (rows as any[])[0];

    if (!habit) {
      res.status(404).json({ error: 'Habit not found.' });
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    if (habit.last_completed && habit.last_completed.toISOString().split('T')[0] === today) {
      res.status(400).json({ error: 'Already checked in today.' });
      return;
    }

    // Calculate streak
    let newStreak = 1;
    if (habit.last_completed) {
      const lastDate = new Date(habit.last_completed);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        newStreak = habit.streak + 1;
      }
    }

    const bestStreak = Math.max(newStreak, habit.best_streak);

    await pool.query(
      'UPDATE habits SET streak = ?, best_streak = ?, last_completed = CURDATE() WHERE id = ?',
      [newStreak, bestStreak, habitId]
    );

    // Calculate XP: base + streak bonus
    const streakBonus = Math.min(newStreak * 5, 100);
    const totalXP = habit.xp_per_completion + streakBonus;

    const xpResult = await awardXP(
      req.user!.userId, totalXP, 'habit', habitId,
      `Habit: ${habit.name} (${newStreak} day streak!)`
    );

    res.json({
      message: `${habit.name} checked in! ${newStreak} day streak!`,
      habit: { ...habit, streak: newStreak, best_streak: bestStreak },
      xp: { earned: totalXP, streakBonus, ...xpResult }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Delete habit
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await pool.query(
      'DELETE FROM habits WHERE id = ? AND user_id = ?',
      [parseInt(req.params.id), req.user!.userId]
    );
    res.json({ message: 'Habit deleted.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
