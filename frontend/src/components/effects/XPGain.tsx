'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';

export default function XPGain() {
  const { xpNotifications } = useGameStore();

  return (
    <div className="fixed top-24 right-8 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {xpNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.6 }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="flex items-center gap-2"
          >
            <div
              className="text-xl font-bold tracking-wide drop-shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))',
              }}
            >
              +{notification.amount} XP
            </div>
            <span className="text-sm text-text-secondary">
              {notification.source}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
