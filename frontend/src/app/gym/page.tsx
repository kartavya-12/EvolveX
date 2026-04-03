'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '@/components/layout/AuthLayout';
import PageTransition from '@/components/layout/PageTransition';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import api from '@/lib/api';
import { MUSCLE_COLORS } from '@/lib/constants';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { HiOutlinePlus, HiOutlineX } from 'react-icons/hi';
import { GiMuscleUp } from 'react-icons/gi';
import toast from 'react-hot-toast';

const MUSCLE_GROUPS = ['chest', 'arms', 'legs', 'back', 'shoulders', 'core'];

const EXERCISES: Record<string, string[]> = {
  chest: ['Bench Press', 'Push Ups', 'Chest Fly', 'Incline Press', 'Dumbbell Press'],
  arms: ['Bicep Curls', 'Tricep Dips', 'Hammer Curls', 'Skull Crushers', 'Cable Curls'],
  legs: ['Squats', 'Lunges', 'Leg Press', 'Deadlifts', 'Calf Raises'],
  back: ['Pull Ups', 'Rows', 'Lat Pulldown', 'Deadlifts', 'Face Pulls'],
  shoulders: ['Shoulder Press', 'Lateral Raises', 'Front Raises', 'Arnold Press', 'Shrugs'],
  core: ['Planks', 'Crunches', 'Leg Raises', 'Russian Twists', 'Ab Wheel'],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function GymPage() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [muscleXP, setMuscleXP] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { updateUser } = useAuthStore();
  const { addXPNotification, triggerLevelUp } = useGameStore();

  // Form state
  const [muscleGroup, setMuscleGroup] = useState('chest');
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workoutsRes, muscleRes] = await Promise.all([
        api.get('/workouts?limit=20'),
        api.get('/workouts/muscle-xp'),
      ]);
      setWorkouts(workoutsRes.data);
      setMuscleXP(muscleRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/workouts', {
        exercise: exercise || EXERCISES[muscleGroup][0],
        muscle_group: muscleGroup,
        sets_count: parseInt(sets),
        reps: parseInt(reps),
        weight: parseFloat(weight),
      });

      const { xp } = res.data;
      addXPNotification(xp.earned, exercise || EXERCISES[muscleGroup][0]);
      updateUser({ total_xp: xp.newTotalXp, level: xp.newLevel, title: xp.title });

      if (xp.leveledUp) triggerLevelUp(xp.newLevel);

      toast.success(`💪 +${xp.earned} XP from workout!`);
      setShowForm(false);
      setExercise('');
      setSets('3');
      setReps('10');
      setWeight('0');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to log workout');
    } finally {
      setSubmitting(false);
    }
  };

  const radarData = MUSCLE_GROUPS.map((mg) => {
    const data = muscleXP.find((m: any) => m.muscle_group === mg);
    return {
      muscle: mg.charAt(0).toUpperCase() + mg.slice(1),
      level: data?.level || 1,
      fullMark: 10,
    };
  });

  return (
    <AuthLayout>
      <PageTransition>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                <GiMuscleUp className="text-accent-red" />
                <span className="gradient-text">Gym Evolution</span>
              </h1>
              <p className="text-text-muted mt-1">Train your body. Level up muscles.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(!showForm)}
              className="btn-primary flex items-center gap-2"
            >
              {showForm ? <HiOutlineX /> : <HiOutlinePlus />}
              {showForm ? 'Cancel' : 'Log Workout'}
            </motion.button>
          </motion.div>

          {/* Workout Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="glass-card p-6" style={{ transform: 'none' }}>
                  <h3 className="text-lg font-semibold mb-4 text-text-primary">Log Workout</h3>
                  <form onSubmit={addWorkout} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Muscle Group</label>
                      <select
                        value={muscleGroup}
                        onChange={(e) => { setMuscleGroup(e.target.value); setExercise(''); }}
                        className="select-dark"
                      >
                        {MUSCLE_GROUPS.map((mg) => (
                          <option key={mg} value={mg} className="bg-bg-secondary">{mg.charAt(0).toUpperCase() + mg.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Exercise</label>
                      <select
                        value={exercise}
                        onChange={(e) => setExercise(e.target.value)}
                        className="select-dark"
                      >
                        {EXERCISES[muscleGroup].map((ex) => (
                          <option key={ex} value={ex} className="bg-bg-secondary">{ex}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Sets</label>
                      <input type="number" value={sets} onChange={(e) => setSets(e.target.value)} min="1" max="20" className="input-dark" />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Reps</label>
                      <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} min="1" max="100" className="input-dark" />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Weight (kg)</label>
                      <div className="flex gap-2">
                        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} min="0" step="0.5" className="input-dark" />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          disabled={submitting}
                          className="btn-primary whitespace-nowrap px-6"
                        >
                          {submitting ? '...' : '+ Add'}
                        </motion.button>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Muscle Radar Chart */}
            <motion.div variants={itemVariants} className="glass-card p-6" style={{ transform: 'none' }}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Muscle Radar</h2>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="muscle" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Radar name="Level" dataKey="level" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Muscle Group Cards */}
            <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6" style={{ transform: 'none' }}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Muscle Levels</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {MUSCLE_GROUPS.map((mg) => {
                  const data = muscleXP.find((m: any) => m.muscle_group === mg);
                  const level = data?.level || 1;
                  const xp = data?.xp || 0;
                  const maxXp = 100 * level * level;
                  const progress = Math.min((xp % maxXp) / maxXp * 100, 100);

                  return (
                    <motion.div
                      key={mg}
                      whileHover={{ scale: 1.03, y: -2 }}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold capitalize" style={{ color: MUSCLE_COLORS[mg] }}>
                          {mg}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${MUSCLE_COLORS[mg]}20`, color: MUSCLE_COLORS[mg] }}>
                          Lv.{level}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: MUSCLE_COLORS[mg] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                      <p className="text-[10px] text-text-muted mt-1">{xp} XP</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Workout Log */}
          <motion.div variants={itemVariants} className="glass-card p-6" style={{ transform: 'none' }}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Workout History</h2>
            {workouts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-muted text-xs uppercase tracking-wider border-b border-white/[0.05]">
                      <th className="pb-3 text-left font-medium">Exercise</th>
                      <th className="pb-3 text-left font-medium">Muscle</th>
                      <th className="pb-3 text-center font-medium">Sets</th>
                      <th className="pb-3 text-center font-medium">Reps</th>
                      <th className="pb-3 text-center font-medium">Weight</th>
                      <th className="pb-3 text-right font-medium">XP</th>
                      <th className="pb-3 text-right font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workouts.map((w: any, i: number) => (
                      <motion.tr
                        key={w.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 font-medium text-text-primary">{w.exercise}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs capitalize" style={{ background: `${MUSCLE_COLORS[w.muscle_group]}15`, color: MUSCLE_COLORS[w.muscle_group] }}>
                            {w.muscle_group}
                          </span>
                        </td>
                        <td className="py-3 text-center text-text-secondary">{w.sets_count}</td>
                        <td className="py-3 text-center text-text-secondary">{w.reps}</td>
                        <td className="py-3 text-center text-text-secondary">{w.weight}kg</td>
                        <td className="py-3 text-right font-semibold text-accent-blue">+{w.xp_earned}</td>
                        <td className="py-3 text-right text-text-muted text-xs">
                          {new Date(w.created_at).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-text-muted text-center py-8">No workouts logged yet. Start training!</p>
            )}
          </motion.div>
        </motion.div>
      </PageTransition>
    </AuthLayout>
  );
}
