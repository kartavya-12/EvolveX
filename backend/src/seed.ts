import pool from './config/db';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding EvolveX database...');

  try {
    // Create demo user
    const passwordHash = await bcrypt.hash('demo123', 12);
    const { rows: userResult } = await pool.query(
      `INSERT INTO users (username, email, password_hash, level, total_xp, title) 
       VALUES ($1, $2, $3, 5, 2800, 'Awakened One')
       ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
       RETURNING id`,
      ['hunter', 'hunter@evolvex.com', passwordHash]
    );
    const userId = userResult[0]?.id || 1;

    // Muscle XP
    const muscles = [
      { group: 'chest', level: 3, xp: 450 },
      { group: 'arms', level: 4, xp: 800 },
      { group: 'legs', level: 2, xp: 250 },
      { group: 'back', level: 3, xp: 500 },
      { group: 'shoulders', level: 2, xp: 200 },
      { group: 'core', level: 2, xp: 180 },
    ];

    for (const m of muscles) {
      await pool.query(
        `INSERT INTO muscle_xp (user_id, muscle_group, level, xp) VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, muscle_group) DO UPDATE SET level = EXCLUDED.level, xp = EXCLUDED.xp`,
        [userId, m.group, m.level, m.xp]
      );
    }

    // Workouts
    const workouts = [
      { exercise: 'Bench Press', muscle_group: 'chest', sets_count: 4, reps: 10, weight: 60, xp_earned: 240 },
      { exercise: 'Bicep Curls', muscle_group: 'arms', sets_count: 3, reps: 12, weight: 15, xp_earned: 54 },
      { exercise: 'Squats', muscle_group: 'legs', sets_count: 4, reps: 8, weight: 80, xp_earned: 256 },
      { exercise: 'Deadlifts', muscle_group: 'back', sets_count: 3, reps: 6, weight: 100, xp_earned: 180 },
      { exercise: 'Shoulder Press', muscle_group: 'shoulders', sets_count: 3, reps: 10, weight: 25, xp_earned: 75 },
      { exercise: 'Push Ups', muscle_group: 'chest', sets_count: 3, reps: 20, weight: 0, xp_earned: 60 },
    ];

    for (const w of workouts) {
      await pool.query(
        'INSERT INTO workouts (user_id, exercise, muscle_group, sets_count, reps, weight, xp_earned) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [userId, w.exercise, w.muscle_group, w.sets_count, w.reps, w.weight, w.xp_earned]
      );
    }

    // Tasks
    const tasks = [
      { title: 'Complete 100 Push Ups', description: 'Daily push-up challenge', priority: 'high', xp_reward: 100, category: 'daily' },
      { title: 'Read for 30 minutes', description: 'Read a book or article', priority: 'medium', xp_reward: 50, category: 'daily' },
      { title: 'Meditate 10 minutes', description: 'Morning meditation session', priority: 'medium', xp_reward: 30, category: 'daily' },
      { title: 'Study Data Structures', description: 'Review trees and graphs', priority: 'high', xp_reward: 80, category: 'main' },
      { title: 'Write Journal Entry', description: 'Reflect on the day', priority: 'low', xp_reward: 20, category: 'side' },
    ];

    for (const t of tasks) {
      await pool.query(
        'INSERT INTO tasks (user_id, title, description, priority, xp_reward, category) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, t.title, t.description, t.priority, t.xp_reward, t.category]
      );
    }

    // Notes
    const notes = [
      { title: 'Training Philosophy', content: 'Progressive overload is key. Increase weight or reps each session. Rest 48h between muscle groups.' },
      { title: 'Weekly Goals', content: '1. Hit gym 4 times\n2. Complete all daily quests\n3. Read 2 chapters\n4. Maintain meditation streak' },
      { title: 'Nutrition Plan', content: 'Protein: 2g per kg bodyweight\nCalories: maintenance + 300\nMeals: 4-5 per day\nHydration: 3L water daily' },
    ];

    for (const n of notes) {
      await pool.query(
        'INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3)',
        [userId, n.title, n.content]
      );
    }

    // Habits
    const habits = [
      { name: 'Morning Workout', icon: '💪', streak: 5, best_streak: 12, xp_per_completion: 30 },
      { name: 'Read 30 Minutes', icon: '📚', streak: 8, best_streak: 15, xp_per_completion: 20 },
      { name: 'Meditate', icon: '🧘', streak: 3, best_streak: 7, xp_per_completion: 15 },
      { name: 'Cold Shower', icon: '🧊', streak: 2, best_streak: 10, xp_per_completion: 25 },
    ];

    for (const h of habits) {
      await pool.query(
        'INSERT INTO habits (user_id, name, icon, streak, best_streak, xp_per_completion) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, h.name, h.icon, h.streak, h.best_streak, h.xp_per_completion]
      );
    }

    // Body Stats
    const bodyStats = [
      { weight: 75.0, chest: 95, arms: 35, waist: 80 },
      { weight: 75.5, chest: 96, arms: 35.5, waist: 79 },
      { weight: 76.0, chest: 97, arms: 36, waist: 79 },
    ];

    for (const bs of bodyStats) {
      await pool.query(
        'INSERT INTO body_stats (user_id, weight, chest, arms, waist) VALUES ($1, $2, $3, $4, $5)',
        [userId, bs.weight, bs.chest, bs.arms, bs.waist]
      );
    }

    // XP Logs
    const xpLogs = [
      { source: 'workout', xp_amount: 240, description: 'Workout: Bench Press (4x10 @ 60kg)' },
      { source: 'task', xp_amount: 100, description: 'Quest completed: Complete 100 Push Ups' },
      { source: 'habit', xp_amount: 55, description: 'Habit: Morning Workout (5 day streak!)' },
      { source: 'workout', xp_amount: 256, description: 'Workout: Squats (4x8 @ 80kg)' },
      { source: 'note', xp_amount: 10, description: 'New note: Training Philosophy' },
    ];

    for (const log of xpLogs) {
      await pool.query(
        'INSERT INTO xp_logs (user_id, source, xp_amount, description) VALUES ($1, $2, $3, $4)',
        [userId, log.source, log.xp_amount, log.description]
      );
    }

    console.log('✅ Seed data inserted successfully!');
    console.log('📧 Demo login: hunter@evolvex.com / demo123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
