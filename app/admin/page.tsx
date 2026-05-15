'use client';

import { useEffect, useState } from 'react';
import { Users, Mail, Download, TrendingUp, UserPlus, Activity } from 'lucide-react';
import { AdminStatCard } from '@/components/admin/AdminStatCard';

interface Stats {
  totalUsers: number;
  activeUsers30d: number;
  newSignups7d: number;
  totalDesigns: number;
  exports30d: number;
  paidUsers: number;
  recentSignups: Array<{ id: string; email: string | null; full_name: string | null; created_at: string; country: string | null }>;
  topTemplates: Array<{ id: string; count: number }>;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const mrr = stats ? stats.paidUsers * 19 : 0;

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}>
            Overview
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Product snapshot — last updated now
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl" style={{ background: 'var(--surface)' }} />
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <AdminStatCard
                label="Total users"
                value={stats.totalUsers}
                icon={<Users className="w-5 h-5" />}
              />
              <AdminStatCard
                label="Active (30d)"
                value={stats.activeUsers30d}
                icon={<Activity className="w-5 h-5" />}
                sub="Distinct users with any event"
              />
              <AdminStatCard
                label="New signups (7d)"
                value={stats.newSignups7d}
                icon={<UserPlus className="w-5 h-5" />}
              />
              <AdminStatCard
                label="Designs created"
                value={stats.totalDesigns}
                icon={<Mail className="w-5 h-5" />}
              />
              <AdminStatCard
                label="Exports (30d)"
                value={stats.exports30d}
                icon={<Download className="w-5 h-5" />}
              />
              <AdminStatCard
                label="Est. MRR"
                value={`$${mrr}`}
                icon={<TrendingUp className="w-5 h-5" />}
                sub={`${stats.paidUsers} paid users × $19`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent signups */}
              <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Recent signups</h2>
                <div className="space-y-2">
                  {stats.recentSignups.length === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>No signups yet.</p>
                  ) : stats.recentSignups.map((u) => (
                    <div key={u.id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
                          style={{ background: 'var(--accent)' }}
                        >
                          {(u.email ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs truncate" style={{ color: 'var(--text)' }}>{u.email}</p>
                          {u.country && (
                            <p className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>{u.country}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-subtle)' }}>
                        {timeAgo(u.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top templates */}
              <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Top templates (30d)</h2>
                {stats.topTemplates.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                    No template usage tracked yet. Analytics will populate once users start using templates.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {stats.topTemplates.map(({ id, count }) => (
                      <div key={id} className="flex items-center gap-3">
                        <p className="text-xs truncate flex-1" style={{ color: 'var(--text)' }}>{id}</p>
                        <span
                          className="text-[11px] px-1.5 py-0.5 rounded font-semibold"
                          style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                        >
                          {count}×
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Failed to load stats.</p>
        )}
      </div>
    </div>
  );
}
