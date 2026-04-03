'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '@/components/layout/AuthLayout';
import PageTransition from '@/components/layout/PageTransition';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { MUSCLE_COLORS, RANK_COLORS } from '@/lib/constants';
import { getLevelProgress, xpForLevel } from '@/lib/constants';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  HiOutlineUser, HiOutlinePlus, HiOutlineTrendingUp,
} from 'react-icons/hi';
import { GiMuscleUp } from 'react-icons/gi';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [bodyStats, setBodyStats] = useState<any[]>([]);
  const [muscleXP, setMuscleXP] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Body stats form
  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [arms, setArms] = useState('');
  const [waist, setWaist] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, muscleRes] = await Promise.all([
        api.get('/body-stats'),
        api.get('/workouts/muscle-xp'),
      ]);
      setBodyStats(statsRes.data);
      setMuscleXP(muscleRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addStats = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/body-stats', {
        weight: weight ? parseFloat(weight) : null,
        chest: chest ? parseFloat(chest) : null,
        arms: arms ? parseFloat(arms) : null,
        waist: waist ? parseFloat(waist) : null,
      });
      toast.success('📊 Body stats recorded!');
      setShowForm(false);
      setWeight(''); setChest(''); setArms(''); setWaist('');
      fetchData();
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const progress = user ? getLevelProgress(user.total_xp) : { level: 1, currentXp: 0, requiredXp: 100, percentage: 0 };

  const chartData = [...bodyStats].reverse().map((stat: any) => ({
    date: new Date(stat.recorded_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    weight: stat.weight,
    chest: stat.chest,
    arms: stat.arms,
    waist: stat.waist,
  }));

  const totalMuscleLevel = muscleXP.reduce((sum: number, m: any) => sum + (m.level || 1), 0);

  return (
    <AuthLayout>
      <PageTransition>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
              <HiOutlineUser className="text-accent-cyan" />
              <span className="gradient-text">Player Profile</span>
            </h1>
          </motion.div>

          {/* Player card */}
          <motion.div variants={itemVariants} className="glass-card p-8 relative overflow-hidden" style={{ transform: 'none' }}>
            {/* Background glow */}
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-10"
              style={{ background: RANK_COLORS[user?.title || ''] || '#8b5cf6' }}
            />

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-28 h-28 rounded-2xl flex items-center justify-center text-4xl font-black relative"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)',
                }}
              >
                {user?.username?.[0]?.toUpperCase()}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-bg-secondary border-2 border-accent-purple flex items-center justify-center text-sm font-bold">
                  {user?.level}
                </div>
              </motion.div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-text-primary">{user?.username}</h2>
                <p className="text-sm mt-1" style={{ color: RANK_COLORS[user?.title || ''] || '#8b5cf6' }}>
                  {user?.title}
                </p>
                <p className="text-xs text-text-muted mt-1">{user?.email}</p>

                {/* XP Progress */}
                <div className="mt-4 max-w-sm">
                  <div className="flex justify-between text-xs text-text-muted mb-1">
                    <span>Level {progress.level}</span>
                    <span>{progress.currentXp} / {progress.requiredXp} XP</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full xp-bar-gradient"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.percentage}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold gradient-text">{(user?.total_xp || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">Total XP</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent-purple">{user?.level || 1}</p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">Level</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent-cyan">{totalMuscleLevel}</p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">Total MLv</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Body Stats */}
          <motion.div variants={itemVariants} className="glass-card p-6" style={{ transform: 'none' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <HiOutlineTrendingUp className="text-accent-green" />
                Body Stats Tracking
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(!showForm)}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <HiOutlinePlus /> Record Stats
              </motion.button>
            </div>

            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 overflow-hidden"
              >
                <form onSubmit={addStats} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Weight (kg)</label>
                    <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="input-dark" step="0.1" placeholder="75.0" />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Chest (cm)</label>
                    <input type="number" value={chest} onChange={(e) => setChest(e.target.value)} className="input-dark" step="0.1" placeholder="95" />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Arms (cm)</label>
                    <input type="number" value={arms} onChange={(e) => setArms(e.target.value)} className="input-dark" step="0.1" placeholder="35" />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Waist (cm)</label>
                    <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className="input-dark" step="0.1" placeholder="80" />
                  </div>
                </form>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addStats} className="btn-primary text-sm">
                  Save Measurements
                </motion.button>
              </motion.div>
            )}

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
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
                  <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }} />
                  <Line type="monotone" dataKey="chest" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }} />
                  <Line type="monotone" dataKey="arms" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }} />
                  <Line type="monotone" dataKey="waist" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">
                <p>No body stats recorded yet. Track your progress!</p>
              </div>
            )}

            {chartData.length > 0 && (
              <div className="flex gap-6 mt-4 justify-center">
                {[
                  { label: 'Weight', color: '#3b82f6' },
                  { label: 'Chest', color: '#10b981' },
                  { label: 'Arms', color: '#8b5cf6' },
                  { label: 'Waist', color: '#f59e0b' },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                    <span className="text-xs text-text-muted">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Muscle breakdown */}
          <motion.div variants={itemVariants} className="glass-card p-6" style={{ transform: 'none' }}>
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
              <GiMuscleUp className="text-accent-red" />
              Muscle Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {muscleXP.map((muscle: any) => (
                <motion.div
                  key={muscle.muscle_group}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                >
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl font-bold"
                    style={{
                      background: `${MUSCLE_COLORS[muscle.muscle_group]}15`,
                      color: MUSCLE_COLORS[muscle.muscle_group],
                      boxShadow: `0 0 20px ${MUSCLE_COLORS[muscle.muscle_group]}20`,
                    }}
                  >
                    {muscle.level}
                  </div>
                  <p className="text-sm font-semibold capitalize text-text-primary">{muscle.muscle_group}</p>
                  <p className="text-xs text-text-muted">{muscle.xp} XP</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Account info */}
          <motion.div variants={itemVariants} className="glass-card p-6" style={{ transform: 'none' }}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Account Info</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Username</p>
                <p className="text-sm text-text-primary font-medium">{user?.username}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm text-text-primary font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Rank</p>
                <p className="text-sm font-medium" style={{ color: RANK_COLORS[user?.title || ''] || '#8b5cf6' }}>{user?.title}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Member Since</p>
                <p className="text-sm text-text-primary font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </PageTransition>
    </AuthLayout>
  );
}
