-- EvolveX Database Schema
CREATE DATABASE IF NOT EXISTS evolvex;
USE evolvex;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  level INT DEFAULT 1,
  total_xp INT DEFAULT 0,
  title VARCHAR(100) DEFAULT 'Novice Adventurer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exercise VARCHAR(100) NOT NULL,
  muscle_group ENUM('chest', 'arms', 'legs', 'back', 'shoulders', 'core') NOT NULL,
  sets_count INT NOT NULL,
  reps INT NOT NULL,
  weight DECIMAL(6,2) DEFAULT 0,
  xp_earned INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Muscle XP table
CREATE TABLE IF NOT EXISTS muscle_xp (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  muscle_group ENUM('chest', 'arms', 'legs', 'back', 'shoulders', 'core') NOT NULL,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  UNIQUE KEY unique_user_muscle (user_id, muscle_group),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Body Stats table
CREATE TABLE IF NOT EXISTS body_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  weight DECIMAL(5,2),
  chest DECIMAL(5,2),
  arms DECIMAL(5,2),
  waist DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tasks (Quests) table
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'legendary') DEFAULT 'medium',
  xp_reward INT DEFAULT 50,
  category ENUM('daily', 'weekly', 'side', 'main') DEFAULT 'side',
  due_date DATE,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  xp_earned INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) DEFAULT '⚡',
  streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  xp_per_completion INT DEFAULT 20,
  last_completed DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- XP Logs table
CREATE TABLE IF NOT EXISTS xp_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  source ENUM('workout', 'task', 'habit', 'note', 'bonus') NOT NULL,
  source_id INT,
  xp_amount INT NOT NULL,
  description VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_workouts_user ON workouts(user_id, created_at);
CREATE INDEX idx_tasks_user ON tasks(user_id, status);
CREATE INDEX idx_notes_user ON notes(user_id, created_at);
CREATE INDEX idx_habits_user ON habits(user_id);
CREATE INDEX idx_xp_logs_user ON xp_logs(user_id, created_at);
CREATE INDEX idx_body_stats_user ON body_stats(user_id, recorded_at);
