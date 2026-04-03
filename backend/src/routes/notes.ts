import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { authMiddleware } from '../middleware/auth';
import { awardXP } from '../services/xpEngine';

const router = Router();

// Get notes
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
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
    const [rows] = await pool.query(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [parseInt(req.params.id), req.user!.userId]
    );
    const note = (rows as any[])[0];
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

    const [result] = await pool.query(
      'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
      [req.user!.userId, title, content || '']
    );

    const noteId = (result as any).insertId;

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
      'UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?',
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
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      [parseInt(req.params.id), req.user!.userId]
    );
    res.json({ message: 'Note deleted.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
