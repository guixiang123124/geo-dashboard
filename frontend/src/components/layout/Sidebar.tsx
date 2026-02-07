'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  BarChart3,
  Settings,
  Sparkles,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  LineChart,
  GitCompareArrows,
  FileText,
  Lightbulb,
  BookOpen,
  Wand2,
  Heart,
  Globe,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage, type Locale } from '@/contexts/LanguageContext';

const navigation = [
    { nameKey: 'nav.dashboard', href: '/', icon: LayoutDashboard },
    { nameKey: 'nav.insights', href: '/insights', icon: Lightbulb },
    { nameKey: 'nav.learn', href: '/learn', icon: BookOpen },
    { nameKey: 'nav.optimize', href: '/optimize', icon: Wand2 },
    { nameKey: 'nav.analytics', href: '/analytics', icon: BarChart3 },
    { nameKey: 'nav.prompts', href: '/prompts', icon: MessageSquareText },
    { nameKey: 'nav.compete', href: '/compete', icon: GitCompareArrows },
    { nameKey: 'nav.trends', href: '/trends', icon: LineChart },
    { nameKey: 'nav.brands', href: '/brands', icon: Package },
    { nameKey: 'nav.evaluations', href: '/evaluations', icon: TrendingUp },
    { nameKey: 'nav.reports', href: '/reports', icon: FileText },
    { nameKey: 'nav.audit', href: '/audit', icon: Shield },
    { nameKey: 'nav.about', href: '/about', icon: Heart },
    { nameKey: 'nav.settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { locale, setLocale, t } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const toggleLocale = () => {
        setLocale(locale === 'en' ? 'zh' : 'en');
    };

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-colors"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <div
                className={cn(
                    'fixed inset-y-0 left-0 z-40 bg-slate-900 text-white border-r border-slate-800 transform transition-all duration-300 ease-in-out',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                    collapsed ? 'lg:w-20' : 'lg:w-64',
                    'w-64'
                )}
            >
                {/* Logo + Language Switcher */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    {!collapsed && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-white tracking-tight">GEO Insights</h1>
                                <p className="text-xs text-slate-400">AI Brand Analytics</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                    >
                        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                {/* Language Switcher */}
                {!collapsed && (
                    <div className="px-4 py-2">
                        <button
                            onClick={toggleLocale}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
                        >
                            <Globe className="w-4 h-4 text-violet-400" />
                            <span className="text-slate-300">
                                {locale === 'en' ? 'English' : '中文'}
                            </span>
                            <span className="ml-auto text-xs text-slate-500">
                                {locale === 'en' ? '切换中文' : 'Switch EN'}
                            </span>
                        </button>
                    </div>
                )}
                {collapsed && (
                    <div className="px-3 py-2 flex justify-center">
                        <button
                            onClick={toggleLocale}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                            title={locale === 'en' ? '切换中文' : 'Switch to English'}
                        >
                            <Globe className="w-5 h-5 text-violet-400" />
                        </button>
                    </div>
                )}

                {/* Navigation */}
                <nav className="px-3 py-4 space-y-1">
                    {navigation.map((item) => {
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
                    })}
                </nav>

                {/* Stats Card */}
                {!collapsed && (
                    <div className="absolute bottom-0 left-0 right-0 p-4">
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
