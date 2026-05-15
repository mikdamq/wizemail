'use client';

import { useEffect, useState } from 'react';

interface DauBucket { bucket: string; active_users: number; }
interface AnalyticsData {
  dau: DauBucket[];
  exportBreakdown: Record<string, number>;
  editorModeBreakdown: Record<string, number>;
  clientPreviewBreakdown: Record<string, number>;
}

function BarChart({ data, label }: { data: Record<string, number>; label: string }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map((e) => e[1]), 1);

  if (entries.length === 0) {
    return <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>No data yet.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text)' }}>{label}</p>
      {entries.map(([key, count]) => (
        <div key={key} className="flex items-center gap-3">
          <span className="text-[11px] w-32 truncate flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            {key.replace('export.', '').replace('editor.mode.changed/', '').replace('client.preview.changed/', '')}
          </span>
          <div className="flex-1 rounded-full overflow-hidden h-2" style={{ background: 'var(--elevated)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${(count / max) * 100}%`, background: 'var(--accent)' }}
            />
          </div>
          <span className="text-[11px] w-8 text-right" style={{ color: 'var(--text-muted)' }}>{count}</span>
        </div>
      ))}
    </div>
  );
}

function DauChart({ data }: { data: DauBucket[] }) {
  if (data.length === 0) {
    return <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>No activity tracked yet.</p>;
  }

  const max = Math.max(...data.map((d) => d.active_users), 1);

  return (
    <div>
      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text)' }}>Daily active users (30d)</p>
      <div className="flex items-end gap-1 h-24">
        {data.slice(-30).map((d) => (
          <div
            key={d.bucket}
            className="flex-1 min-w-0 rounded-t"
            style={{
              height: `${Math.max(2, (d.active_users / max) * 96)}px`,
              background: 'var(--accent)',
              opacity: 0.8,
            }}
            title={`${new Date(d.bucket).toLocaleDateString()} — ${d.active_users} users`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>
          {data[0] ? new Date(data[0].bucket).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>Today</span>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then(setData)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}>Analytics</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Usage patterns from tracked events.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
            ))}
          </div>
        ) : !data ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Failed to load analytics.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <DauChart data={data.dau} />
            </div>
            <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <BarChart data={data.exportBreakdown} label="Exports by type (30d)" />
            </div>
            <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <BarChart data={data.editorModeBreakdown} label="Editor mode usage" />
            </div>
            <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <BarChart data={data.clientPreviewBreakdown} label="Email client preview usage" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
