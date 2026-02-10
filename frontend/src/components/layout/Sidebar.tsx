'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  GitCompareArrows,
  Lightbulb,
  BookOpen,
  Search,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const navigation = [
  { nameKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { nameKey: 'nav.diagnosis', href: '/audit', icon: Search },
  { nameKey: 'nav.brands', href: '/brands', icon: Package },
  { nameKey: 'nav.competitors', href: '/compete', icon: GitCompareArrows },
  { nameKey: 'nav.insights', href: '/insights', icon: Lightbulb },
  { nameKey: 'nav.trends', href: '/trends', icon: TrendingUp },
  { nameKey: 'nav.optimize', href: '/optimize', icon: Zap },
  { nameKey: 'nav.learn', href: '/learn', icon: BookOpen },
];

const bottomNav = [
  { nameKey: 'nav.settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const renderNavItem = (item: { nameKey: string; href: string; icon: React.ComponentType<{ className?: string }> }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-violet-600 text-white'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white',
          collapsed && 'lg:justify-center'
        )}
      >
        <Icon className={cn('w-5 h-5 flex-shrink-0', collapsed && 'lg:w-6 lg:h-6')} />
        {!collapsed && <span>{t(item.nameKey)}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-14 bottom-0 left-0 z-40 bg-slate-900 text-white border-r border-slate-800 transform transition-all duration-300 ease-in-out',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'lg:w-20' : 'lg:w-64',
          'w-64'
        )}
      >
        {/* Collapse toggle */}
        <div className="flex items-center justify-end p-3 border-b border-slate-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {navigation.map(renderNavItem)}
        </nav>

        {/* Bottom Nav (Settings) */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="px-3 py-2 space-y-1 border-t border-slate-800">
            {bottomNav.map(renderNavItem)}
          </div>
          {/* Status */}
          {!collapsed && (
            <div className="p-4 pt-0">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-slate-300 font-medium">{t('system.status')}</span>
                </div>
                <p className="text-sm font-semibold text-white">{t('system.operational')}</p>
                <p className="text-xs text-slate-400 mt-1">{t('system.updated')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
