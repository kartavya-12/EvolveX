'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import XPGain from '@/components/effects/XPGain';
import LevelUp from '@/components/effects/LevelUp';
import { Toaster } from 'react-hot-toast';

const publicRoutes = ['/login', '/register'];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !publicRoutes.includes(pathname)) {
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Public routes (login, register)
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm">Loading system...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
        }}
      />
      <Sidebar />
      <Topbar />
      <XPGain />
      <LevelUp />
      <main className="ml-[240px] mt-16 p-8 min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
}
