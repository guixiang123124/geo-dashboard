'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, User, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';

const routeNames: Record<string, string> = {
    '/': 'Dashboard',
    '/analytics': 'Analytics',
    '/trends': 'Trends',
    '/compare': 'Compare',
    '/brands': 'Brands',
    '/evaluations': 'Evaluations',
    '/prompts': 'Prompts',
    '/reports': 'Reports',
    '/settings': 'Settings',
};

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';
    const initials = displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const handleLogout = async () => {
        setMenuOpen(false);
        await logout();
        router.replace('/auth/login');
    };

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
                            {t('header.welcome')}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
                        </h2>
                        <p className="text-sm text-slate-500">{t('header.subtitle')}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <NotificationPanel />

                {user ? (
                    /* User Menu — logged in */
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(prev => !prev)}
                            className="flex items-center gap-3 pl-3 border-l border-slate-200 hover:opacity-80 transition-opacity"
                        >
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                                <p className="text-xs text-slate-500">{user?.email}</p>
                            </div>
                            <div className="flex items-center justify-center w-10 h-10 bg-violet-600 text-white rounded-full">
                                {initials ? (
                                    <span className="text-sm font-bold">{initials}</span>
                                ) : (
                                    <User className="w-5 h-5" />
                                )}
                            </div>
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-14 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                                <div className="px-4 py-3 border-b border-slate-100">
                                    <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                </div>
                                <Link
                                    href="/settings"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    {t('header.settings')}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    {t('header.signout')}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Guest — show Sign In / Sign Up */
                    <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                        <Link
                            href="/auth/login"
                            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                        >
                            {t('header.signin')}
                        </Link>
                        <Link
                            href="/auth/register"
                            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                        >
                            {t('header.signup')}
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}
