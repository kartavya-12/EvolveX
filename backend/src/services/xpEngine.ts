import pool from '../config/db';
import { MuscleGroup } from '../types';

// XP required for a given level: 100 * level^2
export function xpForLevel(level: number): number {
  return 100 * level * level;
}

// Total XP required to reach a given level (cumulative)
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

// Calculate current level from total XP
export function calculateLevel(totalXp: number): number {
  let level = 1;
  let xpNeeded = 0;
  while (true) {
    xpNeeded += xpForLevel(level);
    if (totalXp < xpNeeded) {
      return level;
    }
    level++;
  }
}

// Get XP progress within current level
export function getLevelProgress(totalXp: number): { level: number; currentXp: number; requiredXp: number; percentage: number } {
  const level = calculateLevel(totalXp);
  const xpForPreviousLevels = totalXpForLevel(level - 1);
  const currentXp = totalXp - xpForPreviousLevels;
  const requiredXp = xpForLevel(level);
  const percentage = Math.min((currentXp / requiredXp) * 100, 100);

  return { level, currentXp, requiredXp, percentage };
}

// Calculate workout XP
export function calculateWorkoutXP(sets: number, reps: number, weight: number): number {
  const weightFactor = Math.max(weight / 10, 1);
  const xp = Math.round(sets * reps * weightFactor);
  return Math.max(xp, 10); // Minimum 10 XP
}

// Get title based on level
export function getTitleForLevel(level: number): string {
  if (level >= 50) return 'Transcendent Being';
  if (level >= 40) return 'Shadow Monarch';
  if (level >= 30) return 'S-Rank Hunter';
  if (level >= 25) return 'A-Rank Hunter';
  if (level >= 20) return 'B-Rank Hunter';
  if (level >= 15) return 'C-Rank Hunter';
  if (level >= 10) return 'D-Rank Hunter';
  if (level >= 7) return 'E-Rank Hunter';
  if (level >= 5) return 'Awakened One';
  if (level >= 3) return 'Rising Fighter';
  return 'Novice Adventurer';
}

// Award XP to user (updates user total_xp, level, title + logs it)
export async function awardXP(
  userId: number,
  xpAmount: number,
  source: 'workout' | 'task' | 'habit' | 'note' | 'bonus',
  sourceId: number | null,
  description: string
): Promise<{ newTotalXp: number; newLevel: number; leveledUp: boolean; title: string }> {
  const conn = await pool.connect();
  try {
    await conn.query('BEGIN');

    // Get current user data
    const { rows } = await conn.query('SELECT total_xp, level FROM users WHERE id = $1', [userId]);
    const user = rows[0];
    if (!user) throw new Error('User not found');

    const oldLevel = user.level;
    const newTotalXp = user.total_xp + xpAmount;
    const newLevel = calculateLevel(newTotalXp);
    const title = getTitleForLevel(newLevel);
    const leveledUp = newLevel > oldLevel;

    // Update user
    await conn.query(
      'UPDATE users SET total_xp = $1, level = $2, title = $3 WHERE id = $4',
      [newTotalXp, newLevel, title, userId]
    );

    // Log XP
    await conn.query(
      'INSERT INTO xp_logs (user_id, source, source_id, xp_amount, description) VALUES ($1, $2, $3, $4, $5)',
      [userId, source, sourceId, xpAmount, description]
    );

    await conn.query('COMMIT');
    return { newTotalXp, newLevel, leveledUp, title };
  } catch (error) {
    await conn.query('ROLLBACK');
    throw error;
  } finally {
    conn.release();
  }
}

// Award muscle XP
export async function awardMuscleXP(userId: number, muscleGroup: MuscleGroup, xpAmount: number): Promise<{ level: number; xp: number }> {
  // Upsert muscle XP
  await pool.query(
    `INSERT INTO muscle_xp (user_id, muscle_group, xp, level) VALUES ($1, $2, $3, 1)
     ON CONFLICT (user_id, muscle_group) DO UPDATE SET xp = muscle_xp.xp + EXCLUDED.xp`,
    [userId, muscleGroup, xpAmount]
  );

  // Recalculate muscle level
  const { rows } = await pool.query(
    'SELECT xp FROM muscle_xp WHERE user_id = $1 AND muscle_group = $2',
    [userId, muscleGroup]
  );
  const muscleData = rows[0];
  const newLevel = calculateLevel(muscleData.xp);

  await pool.query(
    'UPDATE muscle_xp SET level = $1 WHERE user_id = $2 AND muscle_group = $3',
    [newLevel, userId, muscleGroup]
  );

  return { level: newLevel, xp: muscleData.xp };
}
