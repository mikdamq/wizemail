'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { getTheme, setTheme, type Theme } from '@/lib/theme';

export default function SettingsPage() {
  const [theme, setLocalTheme] = useState<Theme>('dark');

  useEffect(() => {
    setLocalTheme(getTheme());
  }, []);

  const handleThemeChange = (value: Theme) => {
    setLocalTheme(value);
    setTheme(value);
  };

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-10">
          <div className="mb-10">
            <h1
              className="text-2xl font-semibold"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}
            >
              Settings
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Manage your preferences for Wizemail.
            </p>
          </div>

          {/* Appearance section */}
          <section
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="px-5 py-4 border-b"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Appearance</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Choose your interface theme. The email builder always stays in dark mode.
              </p>
            </div>

            <div className="p-5" style={{ background: 'var(--elevated)' }}>
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Theme</p>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <ThemeOption
                  value="dark"
                  label="Dark"
                  icon={Moon}
                  current={theme}
                  onSelect={handleThemeChange}
                />
                <ThemeOption
                  value="light"
                  label="Light"
                  icon={Sun}
                  current={theme}
                  onSelect={handleThemeChange}
                />
              </div>
            </div>
          </section>

          {/* Future settings placeholder */}
          <section
            className="mt-4 rounded-2xl border overflow-hidden"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="px-5 py-4"
              style={{ background: 'var(--surface)' }}
            >
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Account</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Account settings, plan management, and sign-out options are in the account menu (bottom of the sidebar).
              </p>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function ThemeOption({
  value,
  label,
  icon: Icon,
  current,
  onSelect,
}: {
  value: Theme;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  current: Theme;
  onSelect: (v: Theme) => void;
}) {
  const active = current === value;
  return (
    <button
      onClick={() => onSelect(value)}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150"
      style={{
        background: active ? 'var(--accent-dim)' : 'var(--surface)',
        borderColor: active ? 'var(--accent)' : 'var(--border)',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
      }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
      {active && (
        <span
          className="ml-auto w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: 'var(--accent)' }}
        />
      )}
    </button>
  );
}
