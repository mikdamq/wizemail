'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Mail, LayoutDashboard, Layers, CreditCard, Settings, Palette, LogOut, User } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { useEffect, useRef, useState } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/emails', icon: Mail, label: 'My Emails' },
  { href: '/templates', icon: Layers, label: 'Templates' },
  { href: '/brand-kits', icon: Palette, label: 'Brand Kits' },
] as const;

const NAV_BOTTOM = [
  { href: '/billing', icon: CreditCard, label: 'Billing' },
  { href: '/settings', icon: Settings, label: 'Settings' },
] as const;

type NavItem = { href: string; icon: React.ComponentType<{ className?: string }>; label: string };

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      title={item.label}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group"
      style={{
        background: active ? 'var(--accent-dim)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
      }}
    >
      <item.icon className="w-4 h-4 flex-shrink-0" />
      <span className="hidden xl:block truncate">{item.label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
    router.push('/');
  };

  const initial = email ? email.charAt(0).toUpperCase() : '?';

  return (
    <div className="h-full flex overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* ── Left sidebar nav ── */}
      <nav
        className="flex-shrink-0 flex flex-col justify-between py-4 w-14 xl:w-52 border-r"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Logo */}
        <div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 mb-6 group"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-opacity group-hover:opacity-80"
              style={{ background: 'var(--accent)' }}
            >
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span
              className="hidden xl:block text-sm font-semibold tracking-tight truncate"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}
            >
              Wizemail
            </span>
          </Link>

          {/* Primary nav */}
          <div className="px-2 space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href.split('?')[0]))}
              />
            ))}
          </div>
        </div>

        {/* Bottom nav + user */}
        <div>
          <div className="px-2 space-y-0.5 mb-4">
            {NAV_BOTTOM.map((item) => (
              <NavLink key={item.href} item={item} active={pathname === item.href} />
            ))}
          </div>

          {/* User chip + menu */}
          <div className="mx-2 relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="w-full px-2 py-2 rounded-lg border flex items-center gap-2.5 transition-colors"
              style={{
                background: menuOpen ? 'var(--overlay)' : 'var(--elevated)',
                borderColor: menuOpen ? 'var(--accent)' : 'var(--border)',
              }}
              onMouseEnter={(e) => { if (!menuOpen) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover, var(--accent))'; }}
              onMouseLeave={(e) => { if (!menuOpen) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
                style={{ background: 'var(--accent)' }}
              >
                {initial}
              </div>
              {email && (
                <span className="hidden xl:block text-[11px] truncate flex-1 text-left" style={{ color: 'var(--text-muted)' }}>
                  {email}
                </span>
              )}
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div
                className="absolute bottom-full left-0 right-0 mb-1 rounded-xl border overflow-hidden shadow-xl"
                style={{ background: 'var(--elevated)', borderColor: 'var(--border)', zIndex: 50 }}
              >
                {/* Email header */}
                <div className="px-3 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0"
                      style={{ background: 'var(--accent)' }}
                    >
                      {initial}
                    </div>
                    <span className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{email}</span>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1">
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--overlay)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                  >
                    <User className="w-3.5 h-3.5 flex-shrink-0" />
                    Account settings
                  </Link>
                  <Link
                    href="/billing"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--overlay)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                  >
                    <CreditCard className="w-3.5 h-3.5 flex-shrink-0" />
                    Billing &amp; plan
                  </Link>
                </div>

                <div className="p-1 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.06)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                  >
                    <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
