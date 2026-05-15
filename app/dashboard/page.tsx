'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Layers, Upload, Mail, Sparkles } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { EmailsList } from '@/components/emails/EmailsList';
import { ImportHtmlModal } from '@/components/builder/ImportHtmlModal';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const CTA_CARDS = [
  {
    href: '/builder',
    icon: Plus,
    label: 'New Email',
    description: 'Start from a blank canvas',
    accent: '#E85D26',
  },
  {
    href: '/templates',
    icon: Layers,
    label: 'From Template',
    description: 'Browse 50+ ready-made designs',
    accent: '#10b981',
  },
] as const;

export default function DashboardPage() {
  const [importOpen, setImportOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserName(data.user.email.split('@')[0]);
      }
    });
    // Update country on first visit (fire-and-forget)
    fetch('/api/profile/touch', { method: 'POST' }).catch(() => undefined);
  }, [supabase]);

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">
          {/* ── Header ── */}
          <div className="mb-10 animate-fade-in-up">
            <h1
              className="text-3xl font-semibold leading-tight mb-1.5"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}
            >
              {getGreeting()}{userName ? `, ${userName}` : ''}.
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Here&apos;s your workspace. Pick up where you left off or start something new.
            </p>
          </div>

          {/* ── CTA strip ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {CTA_CARDS.map(({ href, icon: Icon, label, description, accent }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 hover:shadow-lg"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = accent + '60';
                  (e.currentTarget as HTMLElement).style.background = 'var(--elevated)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: accent + '18' }}
                >
                  <Icon className="w-5 h-5" style={{ color: accent }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{label}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{description}</p>
                </div>
              </Link>
            ))}

            <button
              onClick={() => setImportOpen(true)}
              className="group flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-150 hover:shadow-lg"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#f59e0b60';
                (e.currentTarget as HTMLElement).style.background = 'var(--elevated)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.1)' }}
              >
                <Upload className="w-5 h-5" style={{ color: '#f59e0b' }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>Import HTML</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>Paste or upload an existing email</p>
              </div>
            </button>
          </div>

          {/* ── Recent designs ── */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold" style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}>
                Recent designs
              </h2>
              <Link
                href="/emails"
                className="text-xs transition-colors"
                style={{ color: 'var(--accent)' }}
              >
                View all →
              </Link>
            </div>

            <DashboardDesignsList />
          </div>
        </div>
      </div>

      {importOpen && <ImportHtmlModal onClose={() => setImportOpen(false)} />}
    </AppShell>
  );
}

function DashboardDesignsList() {
  return (
    <div>
      {/* EmailsList handles its own empty state and data fetching */}
      <EmailsList />

      {/* Tip strip below the grid */}
      <div
        className="mt-8 flex items-center gap-3 px-4 py-3 rounded-xl border text-xs"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
        <span>
          <strong style={{ color: 'var(--text)' }}>Tip:</strong>{' '}
          Open the builder and click <strong style={{ color: 'var(--text)' }}>Save as…</strong> in the top bar to save your designs here.
        </span>
        <Link href="/builder" className="ml-auto flex-shrink-0 font-medium transition-colors hover:underline" style={{ color: 'var(--accent)' }}>
          Open builder <Mail className="inline w-3 h-3 ml-0.5" />
        </Link>
      </div>
    </div>
  );
}
