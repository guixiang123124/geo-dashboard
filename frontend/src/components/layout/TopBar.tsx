'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  Eye, ChevronDown, Menu, X, Globe,
  Crosshair, LayoutDashboard, GitCompare, TrendingUp, Search,
  GraduationCap, Lightbulb, BookMarked, User, LogOut, Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  {
    label: 'Product',
    labelKey: 'topbar.product',
    items: [
      { name: 'AI Brand Diagnosis', href: '/audit', icon: Crosshair },
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Brands', href: '/brands', icon: Package },
      { name: 'Competitors', href: '/compete', icon: GitCompare },
    ],
  },
  {
    label: 'Intelligence',
    labelKey: 'topbar.intelligence',
    items: [
      { name: 'Industry Insights', href: '/insights', icon: Lightbulb },
      { name: 'Trends', href: '/trends', icon: TrendingUp },
    ],
  },
  { label: 'Pricing', labelKey: 'topbar.pricing', href: '/pricing' },
  {
    label: 'Resources',
    labelKey: 'topbar.resources',
    items: [
      { name: 'GEO Learning Center', href: '/learn', icon: GraduationCap },
      { name: 'Optimization Guide', href: '/optimize', icon: BookMarked },
    ],
  },
] as const;

type DropdownItem = { label: string; labelKey: string; items: readonly { name: string; href: string; icon: React.ElementType }[] };

function NavDropdown({ item, open, onToggle, onClose }: { item: DropdownItem; open: boolean; onToggle: () => void; onClose: () => void }) {
  const timeout = useRef<NodeJS.Timeout>(undefined);
  return (
    <div
      className="relative"
      onMouseEnter={() => { clearTimeout(timeout.current); onToggle(); }}
      onMouseLeave={() => { timeout.current = setTimeout(onClose, 150); }}
    >
      <button onClick={onToggle} className="flex items-center gap-1 text-sm text-slate-600 hover:text-violet-600 transition">
        {item.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 p-2 min-w-[240px]">
            {item.items.map((sub) => (
              <Link
                key={sub.name}
                href={sub.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-violet-50 transition group"
              >
                <sub.icon className="w-5 h-5 text-slate-400 group-hover:text-violet-600 shrink-0" />
                <span className="text-sm font-medium text-slate-900">{sub.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const { locale, setLocale } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleLocale = () => setLocale(locale === 'en' ? 'zh' : 'en');

  return (
    <nav ref={navRef} className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">Luminos</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className={`text-sm transition ${pathname === '/' ? 'text-violet-600 font-medium' : 'text-slate-600 hover:text-violet-600'}`}>
            Home
          </Link>
          {NAV_ITEMS.map((item) =>
            'items' in item ? (
              <NavDropdown
                key={item.label}
                item={item as DropdownItem}
                open={openDropdown === item.label}
                onToggle={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                onClose={() => setOpenDropdown(null)}
              />
            ) : (
              <Link key={item.label} href={item.href} className={`text-sm transition ${pathname === item.href ? 'text-violet-600 font-medium' : 'text-slate-600 hover:text-violet-600'}`}>
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={toggleLocale}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition text-sm text-slate-600"
            title={locale === 'en' ? '切换中文' : 'Switch to English'}
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs">{locale === 'en' ? 'EN' : '中文'}</span>
          </button>

          <Link href="/audit">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs md:text-sm">
              Free Brand Audit
            </Button>
          </Link>

          {/* Auth buttons */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-sm text-slate-700">
                <User className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{user?.full_name || user?.email}</span>
              </div>
              <button
                onClick={() => logout()}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500 hover:text-slate-700"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" size="sm" className="text-xs md:text-sm">
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="md:hidden p-1.5" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <Link href="/" className="block py-3 text-sm font-medium text-slate-900 border-b border-slate-100">
            Home
          </Link>
          {NAV_ITEMS.map((item) =>
            'items' in item ? (
              <div key={item.label} className="border-b border-slate-100 last:border-0">
                <button
                  className="flex items-center justify-between w-full py-3 text-sm font-medium text-slate-900"
                  onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                >
                  {item.label}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mobileExpanded === item.label ? 'rotate-180' : ''}`} />
                </button>
                {mobileExpanded === item.label && (
                  <div className="pb-3 pl-2 space-y-1">
                    {(item as DropdownItem).items.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-violet-50"
                      >
                        <sub.icon className="w-4 h-4 text-slate-400" />
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="block py-3 text-sm font-medium text-slate-900 border-b border-slate-100"
              >
                {item.label}
              </Link>
            )
          )}
          {/* Auth mobile */}
          {isAuthenticated ? (
            <div className="border-b border-slate-100 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <User className="w-4 h-4" />
                  <span>{user?.full_name || user?.email}</span>
                </div>
                <button onClick={() => logout()} className="text-sm text-red-600 hover:text-red-700">
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 border-b border-slate-100 py-3">
              <Link href="/auth/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-sm">Sign in</Button>
              </Link>
              <Link href="/auth/register" className="flex-1">
                <Button size="sm" className="w-full bg-violet-600 hover:bg-violet-700 text-sm">Register</Button>
              </Link>
            </div>
          )}
          {/* Language toggle mobile */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-2 w-full py-3 text-sm text-slate-600"
          >
            <Globe className="w-4 h-4" />
            {locale === 'en' ? 'Switch to 中文' : 'Switch to English'}
          </button>
        </div>
      )}
    </nav>
  );
}
