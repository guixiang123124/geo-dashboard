'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Search,
  GitCompareArrows,
  TrendingUp,
  MoreHorizontal,
  X,
  Package,
  Lightbulb,
  BookOpen,
  Settings,
  Home,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const primaryTabs = [
  { nameKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { nameKey: 'nav.diagnosis', href: '/audit', icon: Search },
  { nameKey: 'nav.insights', href: '/insights', icon: Lightbulb },
  { nameKey: 'nav.trends', href: '/trends', icon: TrendingUp },
];

const moreTabs = [
  { nameKey: 'nav.home', href: '/', icon: Home },
  { nameKey: 'nav.brands', href: '/brands', icon: Package },
  { nameKey: 'nav.competitors', href: '/compete', icon: GitCompareArrows },
  { nameKey: 'nav.learn', href: '/learn', icon: BookOpen },
  { nameKey: 'nav.optimize', href: '/optimize', icon: Zap },
  { nameKey: 'nav.settings', href: '/settings', icon: Settings },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreTabs.some((tab) => pathname === tab.href);

  return (
    <>
      {/* More sheet overlay */}
      {moreOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMoreOpen(false)} />
      )}

      {/* More slide-up sheet */}
      {moreOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
          <div className="bg-white rounded-t-2xl shadow-2xl border-t border-slate-200 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-900">{t('nav.more')}</span>
              <button onClick={() => setMoreOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 p-3">
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-4 px-2 rounded-xl text-center transition-colors',
                      isActive ? 'bg-violet-50 text-violet-600' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-medium leading-tight">{t(tab.nameKey)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white border-t border-slate-200 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-0 transition-colors',
                  isActive ? 'text-violet-600' : 'text-slate-400'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium truncate">{t(tab.nameKey)}</span>
              </Link>
            );
          })}
          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-0 transition-colors',
              isMoreActive ? 'text-violet-600' : 'text-slate-400'
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t('nav.more')}</span>
          </button>
        </div>
      </div>
    </>
  );
}
