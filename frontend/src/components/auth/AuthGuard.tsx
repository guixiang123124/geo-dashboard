'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const PUBLIC_ROUTES = ['/auth/login', '/auth/register'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/auth/login');
    }

    if (isAuthenticated && isPublicRoute) {
      router.replace('/');
    }
  }, [isAuthenticated, loading, isPublicRoute, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-violet-600 mx-auto" />
          <div>
            <p className="text-lg font-semibold text-slate-900">GEO Insights</p>
            <p className="text-sm text-slate-500 mt-1">Verifying session...</p>
          </div>
        </div>
      </div>
    );
  }

  // On public routes, show content without sidebar
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // On protected routes, only show if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
