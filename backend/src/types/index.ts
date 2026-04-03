export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  level: number;
  total_xp: number;
  title: string;
  created_at: Date;
  updated_at: Date;
}

export interface Workout {
  id: number;
  user_id: number;
  exercise: string;
  muscle_group: MuscleGroup;
  sets_count: number;
  reps: number;
  weight: number;
  xp_earned: number;
  created_at: Date;
}

export type MuscleGroup = 'chest' | 'arms' | 'legs' | 'back' | 'shoulders' | 'core';

export interface MuscleXP {
  id: number;
  user_id: number;
  muscle_group: MuscleGroup;
  level: number;
  xp: number;
}

export interface BodyStat {
  id: number;
  user_id: number;
  weight: number;
  chest: number;
  arms: number;
  waist: number;
  recorded_at: Date;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'legendary';
  xp_reward: number;
  category: 'daily' | 'weekly' | 'side' | 'main';
  due_date: Date | null;
  completed_at: Date | null;
  created_at: Date;
}

export interface Note {
  id: number;
  user_id: number;
  title: string;
  content: string;
  xp_earned: number;
  created_at: Date;
  updated_at: Date;
}

export interface Habit {
  id: number;
  user_id: number;
  name: string;
  icon: string;
  streak: number;
  best_streak: number;
  xp_per_completion: number;
  last_completed: Date | null;
  created_at: Date;
}

export interface XPLog {
  id: number;
  user_id: number;
  source: 'workout' | 'task' | 'habit' | 'note' | 'bonus';
  source_id: number | null;
  xp_amount: number;
  description: string;
  created_at: Date;
}

export interface JWTPayload {
  userId: number;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
