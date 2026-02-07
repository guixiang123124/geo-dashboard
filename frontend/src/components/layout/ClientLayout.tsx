'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

const BARE_ROUTES = ['/auth/login', '/auth/register', '/landing'];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = BARE_ROUTES.includes(pathname);

  return (
    <LanguageProvider>
    <AuthProvider>
      <NotificationProvider>
        <AuthGuard>
          {isAuthRoute ? (
            // Auth pages render full-screen (no sidebar/header)
            children
          ) : (
            // App pages render with sidebar + header
            <div className="flex h-screen bg-slate-50">
              <Sidebar />
              <div className="flex-1 flex flex-col lg:ml-64">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
                  {children}
                </main>
              </div>
            </div>
          )}
        </AuthGuard>
      </NotificationProvider>
    </AuthProvider>
    </LanguageProvider>
  );
}
