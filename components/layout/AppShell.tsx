'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, LayoutDashboard, Layers, CreditCard, Settings, Palette } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { useEffect, useState } from 'react';

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
  const [email, setEmail] = useState<string | null>(null);
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

          {/* User chip */}
          <div
            className="mx-2 px-2 py-2 rounded-lg border flex items-center gap-2.5"
            style={{ background: 'var(--elevated)', borderColor: 'var(--border)' }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
              style={{ background: 'var(--accent)' }}
            >
              {initial}
            </div>
            {email && (
              <span className="hidden xl:block text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                {email}
              </span>
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
