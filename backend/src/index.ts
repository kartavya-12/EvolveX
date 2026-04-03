import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import workoutRoutes from './routes/workouts';
import bodyStatsRoutes from './routes/bodyStats';
import taskRoutes from './routes/tasks';
import noteRoutes from './routes/notes';
import habitRoutes from './routes/habits';
import dashboardRoutes from './routes/dashboard';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/body-stats', bodyStatsRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'EvolveX API is running.' });
});

app.listen(PORT, () => {
  console.log(`⚡ EvolveX API running on http://localhost:${PORT}`);
});

export default app;
