'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CreditCard, LogOut, UserCircle, ChevronDown, Settings } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

export function AccountMenu() {
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setEmail(data.user?.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const signOut = async () => {
    await supabase?.auth.signOut();
    setEmail(null);
    setOpen(false);
  };

  if (!supabase) {
    return (
      <span
        className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px]"
        style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.25)', color: 'var(--warning)' }}
      >
        Auth env missing
      </span>
    );
  }

  if (!email) {
    return (
      <Link
        href="/auth"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        <UserCircle className="w-3.5 h-3.5" />
        Sign in
      </Link>
    );
  }

  const initial = email.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg transition-colors group"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--overlay)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
          style={{ background: 'var(--accent)' }}
        >
          {initial}
        </div>
        <span className="hidden md:block text-[11px] max-w-[120px] truncate" style={{ color: 'var(--text-muted)' }}>
          {email}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-subtle)' }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1.5 w-52 rounded-xl shadow-2xl z-50 overflow-hidden"
          style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}
        >
          {/* User info */}
          <div className="px-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                style={{ background: 'var(--accent)' }}
              >
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium truncate" style={{ color: 'var(--text)' }}>{email}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Free plan</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text)';
                (e.currentTarget as HTMLElement).style.background = 'var(--overlay)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <Settings className="w-3.5 h-3.5 flex-shrink-0" />
              Settings
            </Link>
            <Link
              href="/billing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text)';
                (e.currentTarget as HTMLElement).style.background = 'var(--overlay)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <CreditCard className="w-3.5 h-3.5 flex-shrink-0" />
              Billing & plan
            </Link>
          </div>

          <div className="py-1" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#f87171';
                (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.06)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
