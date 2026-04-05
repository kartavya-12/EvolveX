import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get body stats
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM body_stats WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 30',
      [req.user!.userId]
    );

    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Add body stats
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { weight, chest, arms, waist } = req.body;

    const { rows: result } = await pool.query(
      'INSERT INTO body_stats (user_id, weight, chest, arms, waist) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.user!.userId, weight || null, chest || null, arms || null, waist || null]
    );

    res.status(201).json({
      id: result[0].id,
      weight, chest, arms, waist
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
