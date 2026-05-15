'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

const SEVERITY: Record<string, { label: string; color: string }> = {
  'error.render':        { label: 'High',   color: '#ef4444' },
  'error.export.html':   { label: 'Medium', color: '#f59e0b' },
  'error.export.mjml':   { label: 'Medium', color: '#f59e0b' },
  'error.smtp':          { label: 'Low',    color: '#6366f1' },
  'error.ai_generation': { label: 'Low',    color: '#6b7280' },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AdminMonitoringPage() {
  const [events, setEvents] = useState<ErrorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = () => {
    setLoading(true);
    const params = new URLSearchParams(filterType ? { type: filterType } : {});
    fetch(`/api/admin/monitoring?${params}`)
      .then((r) => r.json())
      .then((d: { events: ErrorEvent[] }) => setEvents(d.events ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, [filterType]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => {
    setRefreshing(true);
    const params = new URLSearchParams(filterType ? { type: filterType } : {});
    fetch(`/api/admin/monitoring?${params}`)
      .then((r) => r.json())
      .then((d: { events: ErrorEvent[] }) => setEvents(d.events ?? []))
      .catch(() => undefined)
      .finally(() => setRefreshing(false));
  };

  const filtered = filterType
    ? events.filter((e) => e.event_type === filterType)
    : events;

  const errorTypes = [...new Set(events.map((e) => e.event_type))].sort();

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}>Monitoring</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Last 200 error events</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-lg border text-xs outline-none"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <option value="">All error types</option>
              {errorTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button
              onClick={refresh}
              className="p-1.5 rounded-lg border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'var(--surface)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3" style={{ color: 'var(--text-subtle)' }}>
            <AlertTriangle className="w-8 h-8" />
            <p className="text-sm">No errors logged yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-xs">
              <thead style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  {['Time', 'Type', 'Severity', 'User', 'Details'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const sev = SEVERITY[e.event_type] ?? { label: 'Info', color: '#6b7280' };
                  return (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-subtle)' }}>
                        {timeAgo(e.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono" style={{ color: 'var(--text)' }}>{e.event_type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ color: sev.color, background: `${sev.color}20` }}
                        >
                          {sev.label}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                        {e.user_id ? (
                          <a
                            href={`/admin/users?search=${e.user_id}`}
                            className="underline hover:opacity-80"
                            style={{ color: 'var(--accent)' }}
                          >
                            {e.user_id.slice(0, 8)}…
                          </a>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <pre
                          className="text-[10px] truncate"
                          style={{ color: 'var(--text-muted)' }}
                          title={JSON.stringify(e.metadata, null, 2)}
                        >
                          {JSON.stringify(e.metadata).slice(0, 80)}
                        </pre>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
