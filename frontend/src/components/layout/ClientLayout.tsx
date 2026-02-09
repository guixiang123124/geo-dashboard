'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { BottomTabBar } from '@/components/layout/BottomTabBar';

const BARE_ROUTES = ['/', '/audit', '/pricing', '/auth/login', '/auth/register'];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBarePage = BARE_ROUTES.includes(pathname);

  return (
    <LanguageProvider>
    <AuthProvider>
      <NotificationProvider>
        <AuthGuard>
          <TopBar />
          {isBarePage ? (
            <div className="pt-14">
              {children}
            </div>
          ) : (
            <div className="flex h-screen pt-14 bg-slate-50">
              <Sidebar />
              <div className="flex-1 flex flex-col lg:ml-64">
                <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-24 lg:pb-8 bg-slate-50">
                  {children}
                </main>
              </div>
              <BottomTabBar />
            </div>
          )}
        </AuthGuard>
      </NotificationProvider>
    </AuthProvider>
    </LanguageProvider>
  );
}
