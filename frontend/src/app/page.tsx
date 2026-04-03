'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import AuthLayout from '@/components/layout/AuthLayout';
import PageTransition from '@/components/layout/PageTransition';
import api from '@/lib/api';
import { MUSCLE_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/constants';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineBookOpen,
  HiOutlineFire,
  HiOutlineCheck,
  HiOutlineTrendingUp,
} from 'react-icons/hi';
import { GiMuscleUp } from 'react-icons/gi';
import toast from 'react-hot-toast';

interface DashboardData {
  user: any;
  quests: any[];
  recentWorkouts: any[];
  workoutStats: { count: number; total_xp: number };
  muscleXP: any[];
  taskStats: { completed: number };
  habits: any[];
  xpLogs: any[];
  workoutChart: any[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, updateUser } = useAuthStore();
  const { addXPNotification, triggerLevelUp } = useGameStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
      if (res.data.user) {
        updateUser(res.data.user);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: number) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/complete`);
      const { xp } = res.data;

      addXPNotification(xp.earned, 'Quest Complete');
      updateUser({ total_xp: xp.newTotalXp, level: xp.newLevel, title: xp.title });

      if (xp.leveledUp) {
        triggerLevelUp(xp.newLevel);
      }

      toast.success('⚔️ Quest Completed!');
      fetchDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to complete quest');
    }
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-40 w-full" />
          ))}
        </div>
      </AuthLayout>
    );
  }

  const chartData = data?.workoutChart?.map((d: any) => ({
    date: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    xp: d.xp || 0,
    count: d.count || 0,
  })) || [];

  return (
    <AuthLayout>
      <PageTransition>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Welcome header */}
          <motion.div variants={itemVariants} className="mb-2">
            <h1 className="text-3xl font-bold text-text-primary">
              Welcome back, <span className="gradient-text">{user?.username}</span>
            </h1>
            <p className="text-text-muted mt-1">Your daily system status</p>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<HiOutlineLightningBolt className="text-xl" />}
              label="Total XP"
              value={(data?.user?.total_xp || 0).toLocaleString()}
              color="#3b82f6"
              subtext={`Level ${data?.user?.level || 1}`}
            />
            <StatCard
              icon={<GiMuscleUp className="text-xl" />}
              label="Workouts (7d)"
              value={data?.workoutStats?.count || 0}
              color="#10b981"
              subtext={`${data?.workoutStats?.total_xp || 0} XP earned`}
            />
            <StatCard
              icon={<HiOutlineCheck className="text-xl" />}
              label="Quests Done (7d)"
              value={data?.taskStats?.completed || 0}
              color="#8b5cf6"
              subtext="Quests completed"
            />
            <StatCard
              icon={<HiOutlineFire className="text-xl" />}
              label="Best Streak"
              value={data?.habits?.[0]?.streak || 0}
              color="#f59e0b"
              subtext={data?.habits?.[0]?.name || 'No habits yet'}
            />
          </motion.div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column — quests + chart */}
            <div className="lg:col-span-2 space-y-6">
              {/* XP Chart */}
              <motion.div variants={itemVariants} className="glass-card p-6" style={{ transform: 'none' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <HiOutlineChartBar className="text-accent-blue" />
                    Weekly XP Progress
                  </h2>
                  <span className="text-xs text-text-muted">Last 7 days</span>
                </div>

                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: '#1a1a2e',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#e2e8f0',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="xp"
                        stroke="#3b82f6"
                        fill="url(#xpGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-text-muted text-sm">
                    <p>No workout data yet. Start training!</p>
                  </div>
                )}
              </motion.div>

              {/* Daily Quests */}
              <motion.div variants={itemVariants} className="glass-card p-6" style={{ transform: 'none' }}>
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
                  <HiOutlineBookOpen className="text-accent-purple" />
                  Active Quests
                </h2>

                <div className="space-y-3">
                  {data?.quests && data.quests.length > 0 ? (
                    data.quests.slice(0, 5).map((task: any) => (
                      <motion.div
                        key={task.id}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: PRIORITY_COLORS[task.priority] || '#64748b' }}
                          />
                          <div>
                            <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                              {task.title}
                            </p>
                            <p className="text-xs text-text-muted">
                              {PRIORITY_LABELS[task.priority] || task.priority} • {task.xp_reward} XP
                            </p>
                          </div>
                        </div>
                        {task.status !== 'completed' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => completeTask(task.id)}
                            className="p-2 rounded-lg bg-accent-green/10 text-accent-green hover:bg-accent-green/20 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <HiOutlineCheck className="text-lg" />
                          </motion.button>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-text-muted text-sm text-center py-4">
                      No quests yet. Create some in the Mind section!
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Muscle Groups */}
              <motion.div variants={itemVariants} className="glass-card p-6" style={{ transform: 'none' }}>
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
                  <GiMuscleUp className="text-accent-red" />
                  Muscle Levels
                </h2>

                <div className="space-y-3">
                  {data?.muscleXP && data.muscleXP.length > 0 ? (
                    data.muscleXP.map((muscle: any) => (
                      <div key={muscle.muscle_group}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-text-secondary capitalize">{muscle.muscle_group}</span>
                          <span className="text-xs text-text-muted">Lv.{muscle.level}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: MUSCLE_COLORS[muscle.muscle_group] || '#3b82f6' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((muscle.xp % (100 * muscle.level * muscle.level)) / (100 * muscle.level * muscle.level) * 100, 100)}%` }}
                            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-muted text-sm text-center py-4">
                      Start working out to level up muscles!
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Habits */}
              <motion.div variants={itemVariants} className="glass-card p-6" style={{ transform: 'none' }}>
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
                  <HiOutlineFire className="text-accent-orange" />
                  Habit Streaks
                </h2>

                <div className="space-y-3">
                  {data?.habits && data.habits.length > 0 ? (
                    data.habits.map((habit: any) => (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{habit.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{habit.name}</p>
                            <p className="text-xs text-text-muted">Best: {habit.best_streak} days</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-accent-orange">{habit.streak}</p>
                          <p className="text-[10px] text-text-muted">days</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-muted text-sm text-center py-4">
                      No habits tracked yet.
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div variants={itemVariants} className="glass-card p-6" style={{ transform: 'none' }}>
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
                  <HiOutlineTrendingUp className="text-accent-cyan" />
                  Recent XP
                </h2>

                <div className="space-y-2">
                  {data?.xpLogs && data.xpLogs.length > 0 ? (
                    data.xpLogs.slice(0, 6).map((log: any, i: number) => (
                      <div key={log.id || i} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                        <p className="text-xs text-text-secondary truncate flex-1 mr-2">{log.description}</p>
                        <span className="text-xs font-semibold text-accent-blue whitespace-nowrap">
                          +{log.xp_amount} XP
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-muted text-sm text-center py-4">No activity yet.</p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </PageTransition>
    </AuthLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  subtext: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: `0 8px 30px ${color}20` }}
      className="glass-card p-5 relative overflow-hidden"
      style={{ transform: 'none' }}
    >
      {/* Glow accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-10"
        style={{ background: color }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          <p className="text-xs text-text-muted mt-1">{subtext}</p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
