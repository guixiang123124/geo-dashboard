'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const routeNames: Record<string, string> = {
    '/': 'Dashboard',
    '/analytics': 'Analytics',
    '/brands': 'Brands',
    '/evaluations': 'Evaluations',
};

export function Header() {
    const pathname = usePathname();

    // Generate breadcrumbs
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [
        { name: 'Home', href: '/' },
        ...pathSegments.map((segment, index) => {
            const href = '/' + pathSegments.slice(0, index + 1).join('/');
            const name = routeNames[href] || segment.charAt(0).toUpperCase() + segment.slice(1);
            return { name, href };
        }),
    ];

    // Don't show breadcrumbs on homepage
    const showBreadcrumbs = pathname !== '/';

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2">
                {showBreadcrumbs ? (
                    <nav className="flex items-center gap-2 text-sm">
                        {breadcrumbs.map((crumb, index) => (
                            <div key={crumb.href} className="flex items-center gap-2">
                                {index > 0 && <ChevronRight className="w-4 h-4 text-slate-300" />}
                                {index === breadcrumbs.length - 1 ? (
                                    <span className="font-semibold text-slate-900">
                                        {crumb.name}
                                    </span>
                                ) : (
                                    <Link
                                        href={crumb.href}
                                        className="text-slate-500 hover:text-slate-800 transition-colors font-medium"
                                    >
                                        {crumb.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>
                ) : (
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Welcome back
                        </h2>
                        <p className="text-sm text-slate-500">Track your brand performance in the AI era</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-600 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-slate-900">Demo User</p>
                        <p className="text-xs text-slate-500">Workspace Owner</p>
                    </div>
                    <button className="flex items-center justify-center w-10 h-10 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors">
                        <User className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
