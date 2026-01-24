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
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Brands', href: '/brands', icon: Package },
    { name: 'Evaluations', href: '/evaluations', icon: TrendingUp },
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
                    className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
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
                    'fixed inset-y-0 left-0 z-40 bg-gradient-to-b from-slate-900 to-slate-800 text-white border-r border-slate-700 transform transition-all duration-300 ease-in-out',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                    collapsed ? 'lg:w-20' : 'lg:w-64',
                    'w-64'
                )}
            >
                {/* Logo/Brand */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                                    GEO Insights
                                </h1>
                                <p className="text-xs text-slate-400">AI Era Optimization</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
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
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30'
                                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white',
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
                        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                                <span className="text-xs text-slate-400 font-medium">System Status</span>
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
