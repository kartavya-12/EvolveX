import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { authMiddleware } from '../middleware/auth';
import { getLevelProgress } from '../services/xpEngine';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, email, and password are required.' });
      return;
    }

    // Check if user exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if ((existing as any[]).length > 0) {
      res.status(409).json({ error: 'Username or email already exists.' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password_hash]
    );

    const userId = (result as any).insertId;

    // Initialize muscle XP entries
    const muscleGroups = ['chest', 'arms', 'legs', 'back', 'shoulders', 'core'];
    for (const mg of muscleGroups) {
      await pool.query(
        'INSERT INTO muscle_xp (user_id, muscle_group, level, xp) VALUES (?, ?, 1, 0)',
        [userId, mg]
      );
    }

    const token = jwt.sign(
      { userId, username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: 604800 }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: userId, username, email, level: 1, total_xp: 0, title: 'Novice Adventurer' }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = (rows as any[])[0];

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: 604800 }
    );

    const progress = getLevelProgress(user.total_xp);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        total_xp: user.total_xp,
        title: user.title,
        ...progress,
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, level, total_xp, title, created_at FROM users WHERE id = ?',
      [req.user!.userId]
    );
    const user = (rows as any[])[0];

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const progress = getLevelProgress(user.total_xp);

    res.json({ ...user, ...progress });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
