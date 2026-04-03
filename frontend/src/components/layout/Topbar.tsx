'use client';

import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { HiOutlineLogout } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

export default function Topbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-[240px] right-0 h-16 bg-bg-secondary/80 backdrop-blur-xl border-b border-border z-30 flex items-center justify-between px-8">
      {/* Left: Level badge + XP bar */}
      <div className="flex items-center gap-4 flex-1">
        {/* Level badge */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="pulse-glow flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          }}
        >
          {user.level}
        </motion.div>

        {/* XP bar container */}
        <div className="flex-1 max-w-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted font-medium">
              {user.title}
            </span>
            <span className="text-xs text-text-muted">
              {user.currentXp || 0} / {user.requiredXp || 100} XP
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full xp-bar-gradient"
              initial={{ width: 0 }}
              animate={{ width: `${user.percentage || 0}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Total XP */}
        <div className="text-right hidden md:block">
          <p className="text-xs text-text-muted">Total XP</p>
          <p className="text-sm font-bold gradient-text">{(user.total_xp || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Right: User info + logout */}
      <div className="flex items-center gap-4 ml-8">
        <div className="text-right">
          <p className="text-sm font-semibold text-text-primary">{user.username}</p>
          <p className="text-xs text-text-muted">Lv. {user.level} {user.title}</p>
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          }}
        >
          {user.username?.[0]?.toUpperCase()}
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="p-2 text-text-muted hover:text-accent-red transition-colors"
          title="Logout"
        >
          <HiOutlineLogout className="text-lg" />
        </motion.button>
      </div>
    </header>
  );
}
