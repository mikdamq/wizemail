interface AdminStatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  sub?: string;
}

export function AdminStatCard({ label, value, icon, sub }: AdminStatCardProps) {
  return (
    <div
      className="rounded-xl border p-5 flex items-start gap-4"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text)' }}>
          {value}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
        {sub && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>{sub}</p>}
      </div>
    </div>
  );
}
