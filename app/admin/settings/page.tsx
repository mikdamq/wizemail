'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface AppSettings {
  maintenanceMode: boolean;
  allowNewSignups: boolean;
  pricingProMonthly: string;
  pricingProAnnual: string;
  featureFlags: {
    aiGeneration: boolean;
    templateMarketplace: boolean;
    clientPreviews: boolean;
  };
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ background: checked ? 'var(--accent)' : 'var(--elevated)' }}
    >
      <span
        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
        style={{ left: checked ? '22px' : '4px' }}
      />
    </button>
  );
}

function SettingRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d: { settings: AppSettings }) => setSettings(d.settings))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (patch: Partial<AppSettings>) => {
    setSettings((s) => s ? { ...s, ...patch } : s);
  };

  const updateFlag = (key: keyof AppSettings['featureFlags'], value: boolean) => {
    setSettings((s) => s ? { ...s, featureFlags: { ...s.featureFlags, [key]: value } } : s);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}>Settings</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Global app configuration</p>
          </div>
          <button
            onClick={save}
            disabled={saving || !settings}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ background: saved ? '#10b981' : 'var(--accent)' }}
          >
            {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>

        {loading || !settings ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="px-6 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</p>
            </div>
            <div className="px-6">
              <SettingRow
                label="Maintenance mode"
                sub="Hides the app from all users while you make changes."
              >
                <Toggle checked={settings.maintenanceMode} onChange={(v) => update({ maintenanceMode: v })} />
              </SettingRow>
              <SettingRow
                label="Allow new signups"
                sub="Disable to pause registrations during beta."
              >
                <Toggle checked={settings.allowNewSignups} onChange={(v) => update({ allowNewSignups: v })} />
              </SettingRow>
            </div>

            <div className="px-6 py-3 border-t border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Pricing display</p>
            </div>
            <div className="px-6">
              <SettingRow label="Pro monthly price" sub="Shown on the billing page">
                <input
                  type="text"
                  value={settings.pricingProMonthly}
                  onChange={(e) => update({ pricingProMonthly: e.target.value })}
                  className="px-3 py-1.5 rounded-lg border text-xs outline-none w-28 text-right"
                  style={{ background: 'var(--elevated)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </SettingRow>
              <SettingRow label="Pro annual price" sub="Shown on the billing page">
                <input
                  type="text"
                  value={settings.pricingProAnnual}
                  onChange={(e) => update({ pricingProAnnual: e.target.value })}
                  className="px-3 py-1.5 rounded-lg border text-xs outline-none w-28 text-right"
                  style={{ background: 'var(--elevated)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </SettingRow>
            </div>

            <div className="px-6 py-3 border-t border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Feature flags</p>
            </div>
            <div className="px-6">
              <SettingRow label="AI generation" sub="Enable AI copy suggestions in the builder">
                <Toggle
                  checked={settings.featureFlags.aiGeneration}
                  onChange={(v) => updateFlag('aiGeneration', v)}
                />
              </SettingRow>
              <SettingRow label="Template marketplace" sub="Show templates gallery to users">
                <Toggle
                  checked={settings.featureFlags.templateMarketplace}
                  onChange={(v) => updateFlag('templateMarketplace', v)}
                />
              </SettingRow>
              <SettingRow label="Email client previews" sub="Gmail / Outlook / Apple / Mobile chrome">
                <Toggle
                  checked={settings.featureFlags.clientPreviews}
                  onChange={(v) => updateFlag('clientPreviews', v)}
                />
              </SettingRow>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
