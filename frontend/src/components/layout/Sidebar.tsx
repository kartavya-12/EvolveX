'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  HiOutlineHome,
  HiOutlineLightningBolt,
  HiOutlineBookOpen,
  HiOutlineUser,
} from 'react-icons/hi';
import { GiMuscleUp } from 'react-icons/gi';
import { FaBrain } from 'react-icons/fa';

const navItems = [
  { href: '/', label: 'Dashboard', icon: HiOutlineHome },
  { href: '/gym', label: 'Gym', icon: GiMuscleUp },
  { href: '/mind', label: 'Mind', icon: FaBrain },
  { href: '/profile', label: 'Profile', icon: HiOutlineUser },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-bg-secondary border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
            }}
          >
            <HiOutlineLightningBolt className="text-white text-xl" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold gradient-text">EvolveX</h1>
            <p className="text-[10px] text-text-muted uppercase tracking-[3px]">Level Up</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'text-white'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`text-lg relative z-10 ${isActive ? 'text-accent-blue' : ''}`} />
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-accent-blue"
                    layoutId="sidebar-indicator"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom info */}
      <div className="p-4 border-t border-border">
        <div className="glass-card p-3 text-center" style={{ transform: 'none' }}>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">System</p>
          <p className="text-xs text-accent-purple font-semibold">Player HUD v1.0</p>
        </div>
      </div>
    </aside>
  );
}
