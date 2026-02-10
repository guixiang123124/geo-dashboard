'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { setAccessToken } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      // Store the token and redirect to dashboard
      setAccessToken(token);
      refreshUser().then(() => {
        router.replace('/dashboard');
      });
    } else if (error) {
      // Redirect to login with error message
      router.replace('/auth/login?error=' + encodeURIComponent(error));
    } else {
      // No token or error, redirect to login
      router.replace('/auth/login');
    }
  }, [searchParams, router, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg text-slate-600">Completing sign in...</p>
      </div>
    </div>
  );
}