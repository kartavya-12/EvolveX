# ⚡ EvolveX — Level Up Your Life

A gamified self-improvement platform inspired by Solo Leveling. Train your body and mind, earn XP, level up.

## 🎮 Features

- **Gym Evolution System** — Log workouts, track muscle group XP and levels, view radar charts
- **Mind System** — Quests (tasks), notes, and habit tracking with streaks
- **XP & Leveling** — Non-linear progression, rank titles, animated level-up effects
- **Premium UI** — Dark theme, glassmorphism, neon accents, Framer Motion animations
- **Dashboard** — XP charts, daily quests, muscle levels, habit streaks, recent activity

## 🧱 Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Recharts, Zustand
- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL
- **Auth**: JWT-based authentication

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL Server running locally

### 1. Database Setup
```bash
# Login to MySQL and run the schema
mysql -u root -p < backend/schema.sql
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment (edit .env if needed)
# Default: root user, no password, database 'evolvex'

# Seed sample data
npm run seed

# Start development server
npm run dev
```
Backend runs on **http://localhost:5000**

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend runs on **http://localhost:3000**

### 4. Demo Login
```
Email: hunter@evolvex.com
Password: demo123
```

## 📁 Project Structure

```
solo/
├── backend/
│   ├── schema.sql              # MySQL database schema
│   ├── .env                    # Environment config
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts            # Express server entry
│       ├── seed.ts             # Sample data seeder
│       ├── config/db.ts        # MySQL connection pool
│       ├── middleware/auth.ts   # JWT auth middleware
│       ├── services/xpEngine.ts # XP calculations & leveling
│       ├── routes/
│       │   ├── auth.ts         # Register, login, me
│       │   ├── workouts.ts     # Workout CRUD + muscle XP
│       │   ├── bodyStats.ts    # Body measurements
│       │   ├── tasks.ts        # Quest CRUD + completion
│       │   ├── notes.ts        # Notes CRUD
│       │   ├── habits.ts       # Habits + streak check-in
│       │   └── dashboard.ts    # Aggregated dashboard data
│       └── types/index.ts      # TypeScript interfaces
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── layout.tsx       # Root layout
        │   ├── page.tsx         # Dashboard
        │   ├── login/page.tsx   # Login
        │   ├── register/page.tsx# Register
        │   ├── gym/page.tsx     # Gym system
        │   ├── mind/page.tsx    # Mind system
        │   └── profile/page.tsx # Player profile
        ├── components/
        │   ├── layout/          # Sidebar, Topbar, AuthLayout
        │   └── effects/         # XPGain, LevelUp animations
        ├── stores/              # Zustand state management
        └── lib/                 # API client, constants, helpers
```

## 🎨 Design System

- **Dark Theme**: `#0a0a0f` background, `#12121a` cards
- **Neon Accents**: Blue `#3b82f6`, Purple `#8b5cf6`, Cyan `#06b6d4`
- **Glassmorphism**: `backdrop-blur + bg-white/5 + border-white/8`
- **Animations**: Page transitions, XP gain floaters, level-up effects, card hovers

## 📊 Level Progression

| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | Novice Adventurer | 100 |
| 3 | Rising Fighter | 900 |
| 5 | Awakened One | 2,500 |
| 10 | D-Rank Hunter | 10,000 |
| 20 | B-Rank Hunter | 40,000 |
| 30 | S-Rank Hunter | 90,000 |
| 40 | Shadow Monarch | 160,000 |
| 50 | Transcendent Being | 250,000 |
