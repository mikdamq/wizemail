'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronDown, ExternalLink } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string | null;
  full_name: string | null;
  country: string | null;
  created_at: string;
  suspended_at: string | null;
  plan: string;
  status: string;
  design_count: number;
  last_active: string | null;
}

const PLAN_OPTIONS = ['', 'free', 'pro', 'team', 'enterprise'];
const PLAN_LABELS: Record<string, string> = { free: 'Free', pro: 'Pro', team: 'Team', enterprise: 'Enterprise' };

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    free: '#6b7280',
    pro: '#10b981',
    team: '#6366f1',
    enterprise: '#f59e0b',
  };
  const c = colors[plan] ?? '#6b7280';
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
      style={{ color: c, background: `${c}20` }}
    >
      {PLAN_LABELS[plan] ?? plan}
    </span>
  );
}

function timeAgo(iso: string | null) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'today';
  if (d === 1) return '1d ago';
  return `${d}d ago`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [changePlanFor, setChangePlanFor] = useState<string | null>(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ search, plan });
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d: { users: AdminUser[] }) => setUsers(d.users ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [search, plan]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const doAction = async (userId: string, action: string, extra?: object) => {
    setActionLoading(userId);
    setOpenMenu(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: action === 'login_as' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json() as { loginUrl?: string; ok?: boolean };
      if (action === 'login_as' && data.loginUrl) {
        window.open(data.loginUrl, '_blank');
      } else if (data.ok) {
        fetchUsers();
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}>
              Users
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{users.length} users</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search email or name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none focus:ring-1"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                  width: 220,
                }}
              />
            </div>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="px-3 py-1.5 rounded-lg border text-xs outline-none"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              {PLAN_OPTIONS.map((p) => (
                <option key={p} value={p}>{p === '' ? 'All plans' : PLAN_LABELS[p]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-xs">
            <thead style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {['User', 'Country', 'Signed up', 'Last active', 'Plan', 'Designs', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-semibold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 rounded animate-pulse" style={{ background: 'var(--elevated)', width: j === 0 ? 160 : 60 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center" style={{ color: 'var(--text-subtle)' }}>
                    No users found.
                  </td>
                </tr>
              ) : users.map((u) => (
                <tr
                  key={u.id}
                  style={{ borderBottom: '1px solid var(--border)', background: u.suspended_at ? 'var(--overlay)' : undefined }}
                  className="hover:bg-[var(--elevated)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ background: u.suspended_at ? '#6b7280' : 'var(--accent)' }}
                      >
                        {(u.email ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ color: 'var(--text)' }}>{u.email}</p>
                        {u.full_name && <p style={{ color: 'var(--text-subtle)' }}>{u.full_name}</p>}
                        {u.suspended_at && (
                          <span className="text-[10px] text-red-400 font-medium">Suspended</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{u.country ?? '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{timeAgo(u.last_active)}</td>
                  <td className="px-4 py-3"><PlanBadge plan={u.plan} /></td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{u.design_count}</td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        className="flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] transition-colors"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}
                        onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                        disabled={actionLoading === u.id}
                      >
                        Actions <ChevronDown className="w-3 h-3" />
                      </button>
                      {openMenu === u.id && (
                        <div
                          className="absolute right-0 top-full mt-1 z-20 rounded-lg border shadow-xl overflow-hidden min-w-[160px]"
                          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                        >
                          {u.suspended_at ? (
                            <button className="w-full text-left px-4 py-2 text-xs hover:bg-[var(--elevated)]" style={{ color: 'var(--text)' }} onClick={() => doAction(u.id, 'unsuspend')}>
                              Unsuspend
                            </button>
                          ) : (
                            <button className="w-full text-left px-4 py-2 text-xs hover:bg-[var(--elevated)] text-yellow-400" onClick={() => doAction(u.id, 'suspend')}>
                              Suspend
                            </button>
                          )}
                          <button
                            className="w-full text-left px-4 py-2 text-xs hover:bg-[var(--elevated)]"
                            style={{ color: 'var(--text)' }}
                            onClick={() => { setChangePlanFor(u.id); setOpenMenu(null); }}
                          >
                            Change plan
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-xs hover:bg-[var(--elevated)] flex items-center gap-1.5"
                            style={{ color: 'var(--accent)' }}
                            onClick={() => doAction(u.id, 'login_as')}
                          >
                            Login as user <ExternalLink className="w-3 h-3" />
                          </button>
                          <div style={{ borderTop: '1px solid var(--border)' }} />
                          <button
                            className="w-full text-left px-4 py-2 text-xs hover:bg-[var(--elevated)] text-red-400"
                            onClick={() => { if (window.confirm('Soft-delete this user?')) doAction(u.id, 'delete'); setOpenMenu(null); }}
                          >
                            Delete user
                          </button>
                        </div>
                      )}
                      {/* Change plan inline selector */}
                      {changePlanFor === u.id && (
                        <div
                          className="absolute right-0 top-full mt-1 z-20 rounded-lg border shadow-xl p-3 min-w-[160px]"
                          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                        >
                          <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Select plan</p>
                          {(['free', 'pro', 'team', 'enterprise'] as const).map((p) => (
                            <button
                              key={p}
                              className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-[var(--elevated)]"
                              style={{ color: 'var(--text)' }}
                              onClick={() => { doAction(u.id, 'change_plan', { plan: p }); setChangePlanFor(null); }}
                            >
                              {PLAN_LABELS[p]}
                            </button>
                          ))}
                          <button
                            className="w-full text-center mt-1 text-[10px]"
                            style={{ color: 'var(--text-subtle)' }}
                            onClick={() => setChangePlanFor(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
