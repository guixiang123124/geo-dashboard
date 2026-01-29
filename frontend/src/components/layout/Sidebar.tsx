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
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Trends', href: '/trends', icon: LineChart },
    { name: 'Compare', href: '/compare', icon: GitCompareArrows },
    { name: 'Brands', href: '/brands', icon: Package },
    { name: 'Evaluations', href: '/evaluations', icon: TrendingUp },
    { name: 'Prompts', href: '/prompts', icon: MessageSquareText },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-colors"
                >
                    {mobileMenuOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
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
                {/* Logo/Brand */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    {!collapsed && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-white tracking-tight">
                                    GEO Insights
                                </h1>
                                <p className="text-xs text-slate-400">AI Brand Analytics</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                    >
                        {collapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <ChevronLeft className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="px-3 py-6 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
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
                                {!collapsed && <span>{item.name}</span>}
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
                                <span className="text-xs text-slate-300 font-medium">System Status</span>
                            </div>
                            <p className="text-sm font-semibold text-white">All Systems Operational</p>
                            <p className="text-xs text-slate-400 mt-1">Last updated: just now</p>
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
