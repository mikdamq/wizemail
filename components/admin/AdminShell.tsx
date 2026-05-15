'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Layers, BarChart2, AlertTriangle,
  Settings, ArrowLeft, Mail, ShieldCheck,
} from 'lucide-react';

interface NavItemDef {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  exact?: boolean;
}

const NAV_ITEMS: NavItemDef[] = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview', exact: true },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/templates', icon: Layers, label: 'Templates' },
  { href: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/admin/monitoring', icon: AlertTriangle, label: 'Monitoring' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

function AdminNavLink({ item, active }: { item: NavItemDef; active: boolean }) {
  return (
    <Link
      href={item.href}
      title={item.label}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150"
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

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="h-full flex overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Left nav */}
      <nav
        className="flex-shrink-0 flex flex-col justify-between py-4 w-14 xl:w-52 border-r"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div>
          {/* Logo + Admin badge */}
          <div className="px-3 mb-6">
            <Link href="/admin" className="flex items-center gap-2.5 group mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
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
            <div
              className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-md w-fit"
              style={{ background: 'var(--accent-dim)' }}
            >
              <ShieldCheck className="w-3 h-3" style={{ color: 'var(--accent)' }} />
              <span className="text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>
                Admin Panel
              </span>
            </div>
          </div>

          {/* Nav items */}
          <div className="px-2 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + '/');
              return <AdminNavLink key={item.href} item={item} active={active} />;
            })}
          </div>
        </div>

        {/* Back to app */}
        <div className="px-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150"
            style={{ color: 'var(--text-subtle)' }}
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span className="hidden xl:block truncate">Back to app</span>
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
