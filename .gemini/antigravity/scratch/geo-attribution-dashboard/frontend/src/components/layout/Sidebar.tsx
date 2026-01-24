'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Package, PlayCircle, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Brands', href: '/brands', icon: Package },
    { name: 'Evaluations', href: '/evaluations', icon: PlayCircle },
];

export function Sidebar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
                >
                    {mobileMenuOpen ? (
                        <X className="w-6 h-6 text-gray-900" />
                    ) : (
                        <Menu className="w-6 h-6 text-gray-900" />
                    )}
                </button>
            </div>

            {/* Sidebar */}
            <div
                className={cn(
                    'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Logo/Brand */}
                <div className="flex items-center gap-3 h-16 px-6 border-b border-gray-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-600">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">GEO Dashboard</h1>
                        <p className="text-xs text-gray-500">AI Attribution</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                )}
                            >
                                <item.icon className={cn('w-5 h-5', isActive ? 'text-indigo-600' : 'text-gray-400')} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-4 py-4 border-t border-gray-200">
                    <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-900">Kids Fashion Brands</p>
                        <p className="text-xs text-gray-500 mt-1">Tracking 3 brands across 4 AI platforms</p>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </>
    );
}
