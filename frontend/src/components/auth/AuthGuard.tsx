'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const AUTH_ROUTES = ['/auth/login', '/auth/register'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    // If already logged in and on auth page, redirect to home
    if (!loading && isAuthenticated && isAuthRoute) {
      router.replace('/');
    }
  }, [isAuthenticated, loading, isAuthRoute, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-violet-600 mx-auto" />
          <div>
            <p className="text-lg font-semibold text-slate-900">GEO Insights</p>
            <p className="text-sm text-slate-500 mt-1">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // All routes are accessible — auth is optional
  return <>{children}</>;
}
