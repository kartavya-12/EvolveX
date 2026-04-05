-- EvolveX Database Schema (PostgreSQL)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  level INT DEFAULT 1,
  total_xp INT DEFAULT 0,
  title VARCHAR(100) DEFAULT 'Novice Adventurer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise VARCHAR(100) NOT NULL,
  muscle_group VARCHAR(50) NOT NULL CHECK (muscle_group IN ('chest', 'arms', 'legs', 'back', 'shoulders', 'core')),
  sets_count INT NOT NULL,
  reps INT NOT NULL,
  weight DECIMAL(6,2) DEFAULT 0,
  xp_earned INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Muscle XP table
CREATE TABLE IF NOT EXISTS muscle_xp (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  muscle_group VARCHAR(50) NOT NULL CHECK (muscle_group IN ('chest', 'arms', 'legs', 'back', 'shoulders', 'core')),
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  UNIQUE (user_id, muscle_group)
);

-- Body Stats table
CREATE TABLE IF NOT EXISTS body_stats (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2),
  chest DECIMAL(5,2),
  arms DECIMAL(5,2),
  waist DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks (Quests) table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'legendary')),
  xp_reward INT DEFAULT 50,
  category VARCHAR(20) DEFAULT 'side' CHECK (category IN ('daily', 'weekly', 'side', 'main')),
  due_date DATE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  xp_earned INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) DEFAULT '⚡',
  streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  xp_per_completion INT DEFAULT 20,
  last_completed DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- XP Logs table
CREATE TABLE IF NOT EXISTS xp_logs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(50) NOT NULL CHECK (source IN ('workout', 'task', 'habit', 'note', 'bonus')),
  source_id INT,
  xp_amount INT NOT NULL,
  description VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workouts_user ON workouts(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_logs_user ON xp_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_body_stats_user ON body_stats(user_id, recorded_at);
