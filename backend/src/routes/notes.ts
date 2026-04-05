import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { authMiddleware } from '../middleware/auth';
import { awardXP } from '../services/xpEngine';

const router = Router();

// Get notes
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user!.userId]
    );
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get single note
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
      [parseInt(req.params.id), req.user!.userId]
    );
    const note = rows[0];
    if (!note) {
      res.status(404).json({ error: 'Note not found.' });
      return;
    }
    res.json(note);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Create note
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required.' });
      return;
    }

    const { rows: result } = await pool.query(
      'INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING id',
      [req.user!.userId, title, content || '']
    );

    const noteId = result[0].id;

    // Award XP for creating a note
    const xpResult = await awardXP(
      req.user!.userId, 10, 'note', noteId,
      `New note: ${title}`
    );

    res.status(201).json({
      note: { id: noteId, title, content: content || '' },
      xp: { earned: 10, ...xpResult }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Update note
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    await pool.query(
      'UPDATE notes SET title = $1, content = $2 WHERE id = $3 AND user_id = $4',
      [title, content, parseInt(req.params.id), req.user!.userId]
    );
    res.json({ message: 'Note updated.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Delete note
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await pool.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2',
      [parseInt(req.params.id), req.user!.userId]
    );
    res.json({ message: 'Note deleted.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
