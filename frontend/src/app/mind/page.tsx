'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '@/components/layout/AuthLayout';
import PageTransition from '@/components/layout/PageTransition';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import api from '@/lib/api';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/constants';
import { FaBrain } from 'react-icons/fa';
import {
  HiOutlinePlus, HiOutlineX, HiOutlineCheck, HiOutlineTrash,
  HiOutlineBookOpen, HiOutlineFire, HiOutlinePencil,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

type Tab = 'quests' | 'notes' | 'habits';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function MindPage() {
  const [tab, setTab] = useState<Tab>('quests');
  const [tasks, setTasks] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { updateUser } = useAuthStore();
  const { addXPNotification, triggerLevelUp } = useGameStore();

  // Quest form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskXP, setTaskXP] = useState('50');
  const [taskCategory, setTaskCategory] = useState('side');

  // Note form
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  // Habit form
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitIcon, setHabitIcon] = useState('⚡');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [t, n, h] = await Promise.all([
        api.get('/tasks'),
        api.get('/notes'),
        api.get('/habits'),
      ]);
      setTasks(t.data);
      setNotes(n.data);
      setHabits(h.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        xp_reward: parseInt(taskXP),
        category: taskCategory,
      });
      toast.success('🗡️ New quest created!');
      setShowTaskForm(false);
      setTaskTitle(''); setTaskDesc('');
      fetchAll();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed');
    }
  };

  const completeTask = async (id: number) => {
    try {
      const res = await api.patch(`/tasks/${id}/complete`);
      const { xp } = res.data;
      addXPNotification(xp.earned, 'Quest Complete');
      updateUser({ total_xp: xp.newTotalXp, level: xp.newLevel, title: xp.title });
      if (xp.leveledUp) triggerLevelUp(xp.newLevel);
      toast.success('⚔️ Quest Completed!');
      fetchAll();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed');
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);
      fetchAll();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const saveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNoteId) {
        await api.put(`/notes/${editingNoteId}`, { title: noteTitle, content: noteContent });
        toast.success('📝 Note updated!');
      } else {
        const res = await api.post('/notes', { title: noteTitle, content: noteContent });
        const { xp } = res.data;
        addXPNotification(xp.earned, 'New Note');
        updateUser({ total_xp: xp.newTotalXp, level: xp.newLevel, title: xp.title });
        if (xp.leveledUp) triggerLevelUp(xp.newLevel);
        toast.success('📝 Note created! +10 XP');
      }
      setShowNoteForm(false);
      setNoteTitle(''); setNoteContent(''); setEditingNoteId(null);
      fetchAll();
    } catch (error: any) {
      toast.error('Failed');
    }
  };

  const editNote = (note: any) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setShowNoteForm(true);
  };

  const deleteNote = async (id: number) => {
    try {
      await api.delete(`/notes/${id}`);
      fetchAll();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/habits', { name: habitName, icon: habitIcon });
      toast.success('🔥 New habit created!');
      setShowHabitForm(false);
      setHabitName('');
      fetchAll();
    } catch (error: any) {
      toast.error('Failed');
    }
  };

  const checkinHabit = async (id: number) => {
    try {
      const res = await api.post(`/habits/${id}/checkin`);
      const { xp } = res.data;
      addXPNotification(xp.earned, 'Habit Streak!');
      updateUser({ total_xp: xp.newTotalXp, level: xp.newLevel, title: xp.title });
      if (xp.leveledUp) triggerLevelUp(xp.newLevel);
      toast.success(res.data.message);
      fetchAll();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed');
    }
  };

  const deleteHabit = async (id: number) => {
    try {
      await api.delete(`/habits/${id}`);
      fetchAll();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'quests', label: 'Quests', icon: <HiOutlineBookOpen /> },
    { key: 'notes', label: 'Notes', icon: <HiOutlinePencil /> },
    { key: 'habits', label: 'Habits', icon: <HiOutlineFire /> },
  ];

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
              <FaBrain className="text-accent-purple" />
              <span className="gradient-text">Mind System</span>
            </h1>
            <p className="text-text-muted mt-1">Quests, notes, and habits — sharpen your mind.</p>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={itemVariants} className="flex gap-2">
            {tabs.map((t) => (
              <motion.button
                key={t.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === t.key
                    ? 'bg-accent-purple/15 text-accent-purple border border-accent-purple/30'
                    : 'text-text-muted hover:text-text-primary bg-white/[0.02] border border-white/[0.05]'
                }`}
              >
                {t.icon} {t.label}
              </motion.button>
            ))}
          </motion.div>

          {/* QUESTS TAB */}
          {tab === 'quests' && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              <motion.div variants={itemVariants} className="flex justify-end">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowTaskForm(!showTaskForm)} className="btn-primary flex items-center gap-2 text-sm">
                  {showTaskForm ? <HiOutlineX /> : <HiOutlinePlus />}
                  {showTaskForm ? 'Cancel' : 'New Quest'}
                </motion.button>
              </motion.div>

              <AnimatePresence>
                {showTaskForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="glass-card p-6" style={{ transform: 'none' }}>
                      <form onSubmit={addTask} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Quest Title</label>
                            <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="input-dark" placeholder="Complete 100 push ups..." required />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Rank</label>
                              <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} className="select-dark">
                                <option value="low" className="bg-bg-secondary">D Rank</option>
                                <option value="medium" className="bg-bg-secondary">C Rank</option>
                                <option value="high" className="bg-bg-secondary">B Rank</option>
                                <option value="legendary" className="bg-bg-secondary">S Rank</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">XP</label>
                              <input type="number" value={taskXP} onChange={(e) => setTaskXP(e.target.value)} className="input-dark" min="10" />
                            </div>
                            <div>
                              <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Type</label>
                              <select value={taskCategory} onChange={(e) => setTaskCategory(e.target.value)} className="select-dark">
                                <option value="daily" className="bg-bg-secondary">Daily</option>
                                <option value="weekly" className="bg-bg-secondary">Weekly</option>
                                <option value="side" className="bg-bg-secondary">Side</option>
                                <option value="main" className="bg-bg-secondary">Main</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Description</label>
                          <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} className="textarea-dark" rows={2} placeholder="Quest details..." />
                        </div>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn-primary">Create Quest</motion.button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Task list */}
              <div className="space-y-3">
                {tasks.length > 0 ? (
                  tasks.map((task: any, i: number) => (
                    <motion.div
                      key={task.id}
                      variants={itemVariants}
                      whileHover={{ x: 4 }}
                      className="glass-card p-4 flex items-center gap-4 group"
                      style={{ transform: 'none' }}
                    >
                      {task.status !== 'completed' ? (
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={() => completeTask(task.id)}
                          className="w-6 h-6 rounded-lg border-2 border-accent-green/30 hover:border-accent-green hover:bg-accent-green/10 transition-all flex items-center justify-center"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-accent-green flex items-center justify-center">
                          <HiOutlineCheck className="text-white text-xs" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-text-muted mt-0.5">{task.description}</p>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: `${PRIORITY_COLORS[task.priority]}15`, color: PRIORITY_COLORS[task.priority] }}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                      <span className="text-xs text-accent-blue font-semibold">{task.xp_reward} XP</span>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red transition-all"
                      >
                        <HiOutlineTrash className="text-sm" />
                      </motion.button>
                    </motion.div>
                  ))
                ) : (
                  <div className="glass-card p-12 text-center" style={{ transform: 'none' }}>
                    <p className="text-text-muted">No quests yet. Create your first quest!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* NOTES TAB */}
          {tab === 'notes' && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              <motion.div variants={itemVariants} className="flex justify-end">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setShowNoteForm(!showNoteForm); setEditingNoteId(null); setNoteTitle(''); setNoteContent(''); }} className="btn-primary flex items-center gap-2 text-sm">
                  {showNoteForm ? <HiOutlineX /> : <HiOutlinePlus />}
                  {showNoteForm ? 'Cancel' : 'New Note'}
                </motion.button>
              </motion.div>

              <AnimatePresence>
                {showNoteForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="glass-card p-6" style={{ transform: 'none' }}>
                      <form onSubmit={saveNote} className="space-y-4">
                        <div>
                          <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Title</label>
                          <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className="input-dark" placeholder="Note title..." required />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Content</label>
                          <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} className="textarea-dark" rows={6} placeholder="Write your thoughts..." />
                        </div>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn-primary">
                          {editingNoteId ? 'Update Note' : 'Save Note (+10 XP)'}
                        </motion.button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.length > 0 ? (
                  notes.map((note: any) => (
                    <motion.div
                      key={note.id}
                      variants={itemVariants}
                      whileHover={{ y: -4 }}
                      className="glass-card p-5 group cursor-pointer"
                      style={{ transform: 'none' }}
                      onClick={() => editNote(note)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-text-primary">{note.title}</h3>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                          className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red transition-all"
                        >
                          <HiOutlineTrash className="text-sm" />
                        </motion.button>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-3 whitespace-pre-line">{note.content}</p>
                      <p className="text-[10px] text-text-muted mt-3">
                        {new Date(note.updated_at).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 glass-card p-12 text-center" style={{ transform: 'none' }}>
                    <p className="text-text-muted">No notes yet. Capture your thoughts!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* HABITS TAB */}
          {tab === 'habits' && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              <motion.div variants={itemVariants} className="flex justify-end">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowHabitForm(!showHabitForm)} className="btn-primary flex items-center gap-2 text-sm">
                  {showHabitForm ? <HiOutlineX /> : <HiOutlinePlus />}
                  {showHabitForm ? 'Cancel' : 'New Habit'}
                </motion.button>
              </motion.div>

              <AnimatePresence>
                {showHabitForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="glass-card p-6" style={{ transform: 'none' }}>
                      <form onSubmit={addHabit} className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Habit Name</label>
                          <input value={habitName} onChange={(e) => setHabitName(e.target.value)} className="input-dark" placeholder="Morning workout..." required />
                        </div>
                        <div className="w-24">
                          <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Icon</label>
                          <select value={habitIcon} onChange={(e) => setHabitIcon(e.target.value)} className="select-dark">
                            {['⚡', '💪', '📚', '🧘', '🧊', '🏃', '💧', '🎯', '✍️', '🌅'].map((icon) => (
                              <option key={icon} value={icon} className="bg-bg-secondary">{icon}</option>
                            ))}
                          </select>
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="btn-primary">Create</motion.button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                {habits.length > 0 ? (
                  habits.map((habit: any) => {
                    const today = new Date().toISOString().split('T')[0];
                    const checkedToday = habit.last_completed &&
                      new Date(habit.last_completed).toISOString().split('T')[0] === today;

                    return (
                      <motion.div
                        key={habit.id}
                        variants={itemVariants}
                        whileHover={{ x: 4 }}
                        className="glass-card p-5 flex items-center gap-4 group"
                        style={{ transform: 'none' }}
                      >
                        <span className="text-2xl">{habit.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-text-primary">{habit.name}</p>
                          <p className="text-xs text-text-muted mt-0.5">
                            Best streak: {habit.best_streak} days • {habit.xp_per_completion} XP/day
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-accent-orange">{habit.streak}</p>
                            <p className="text-[10px] text-text-muted">streak</p>
                          </div>

                          {!checkedToday ? (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => checkinHabit(habit.id)}
                              className="px-4 py-2 rounded-xl bg-accent-green/10 text-accent-green hover:bg-accent-green/20 border border-accent-green/20 text-sm font-medium transition-all"
                            >
                              Check In
                            </motion.button>
                          ) : (
                            <span className="px-4 py-2 rounded-xl bg-accent-green/10 text-accent-green text-sm font-medium flex items-center gap-1">
                              <HiOutlineCheck /> Done
                            </span>
                          )}

                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            onClick={() => deleteHabit(habit.id)}
                            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red transition-all"
                          >
                            <HiOutlineTrash className="text-sm" />
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="glass-card p-12 text-center" style={{ transform: 'none' }}>
                    <p className="text-text-muted">No habits tracked yet. Build consistency!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </PageTransition>
    </AuthLayout>
  );
}
