'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { HiOutlineLightningBolt, HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back, Hunter!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' } }} />
      
      {/* Background effects */}
      <div className="absolute inset-0">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card p-8" style={{ transform: 'none' }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)',
              }}
            >
              <HiOutlineLightningBolt className="text-white text-3xl" />
            </motion.div>
            <h1 className="text-2xl font-bold gradient-text">Welcome Back</h1>
            <p className="text-text-muted text-sm mt-1">Enter the system, Hunter</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">
                Email
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark pl-10"
                  placeholder="hunter@evolvex.com"
                  required
                  id="login-email"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">
                Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pl-10"
                  placeholder="••••••••"
                  required
                  id="login-password"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-6 disabled:opacity-50"
              id="login-submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <HiOutlineLightningBolt />
                  Enter System
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-text-muted text-sm mt-6">
            New Hunter?{' '}
            <Link href="/register" className="text-accent-blue hover:text-accent-purple transition-colors font-medium">
              Create Account
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-text-muted uppercase tracking-wider text-center mb-1">Demo Credentials</p>
            <p className="text-xs text-text-secondary text-center">
              hunter@evolvex.com / demo123
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
