import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { authMiddleware } from '../middleware/auth';
import { awardXP } from '../services/xpEngine';

const router = Router();

// Get tasks
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params: any[] = [req.user!.userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY FIELD(priority, "legendary", "high", "medium", "low"), created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Add task
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, description, priority, xp_reward, category, due_date } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required.' });
      return;
    }

    const [result] = await pool.query(
      'INSERT INTO tasks (user_id, title, description, priority, xp_reward, category, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user!.userId, title, description || '', priority || 'medium', xp_reward || 50, category || 'side', due_date || null]
    );

    res.status(201).json({
      id: (result as any).insertId,
      title, description, priority: priority || 'medium',
      xp_reward: xp_reward || 50, category: category || 'side',
      status: 'pending'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Complete task
router.patch('/:id/complete', authMiddleware, async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);

    // Verify ownership and get task
    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, req.user!.userId]
    );
    const task = (rows as any[])[0];

    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    if (task.status === 'completed') {
      res.status(400).json({ error: 'Task already completed.' });
      return;
    }

    // Mark completed
    await pool.query(
      'UPDATE tasks SET status = "completed", completed_at = NOW() WHERE id = ?',
      [taskId]
    );

    // Award XP
    const xpResult = await awardXP(
      req.user!.userId,
      task.xp_reward,
      'task',
      taskId,
      `Quest completed: ${task.title}`
    );

    res.json({
      message: 'Quest completed!',
      task: { ...task, status: 'completed' },
      xp: { earned: task.xp_reward, ...xpResult }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Delete task
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await pool.query(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [parseInt(req.params.id), req.user!.userId]
    );
    res.json({ message: 'Task deleted.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
