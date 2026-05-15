'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2, Plus, Trash2, Pencil, X, Type } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { listCloudBrandKits, saveCloudBrandKit, deleteCloudBrandKit } from '@/lib/cloud-brand-kits';
import type { SavedBrandKit } from '@/lib/cloud-brand-kits';
import type { BrandKit } from '@/lib/types';
import { getTokenLabel } from '@/lib/brand-tokens';

const CORE_TOKENS = ['$primary', '$secondary', '$background', '$text'] as const;
const CUSTOM_TOKENS = ['$custom1', '$custom2', '$custom3', '$custom4', '$custom5', '$custom6', '$custom7', '$custom8'] as const;

const FONT_OPTIONS = [
  { value: 'system', label: 'System default' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: "'Times New Roman', Times, serif", label: 'Times New Roman' },
  { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
  { value: "'Courier New', Courier, monospace", label: 'Courier New' },
];

function getTokenValue(token: string, kit: BrandKit): string {
  if (token === '$primary') return kit.primaryColor;
  if (token === '$secondary') return kit.secondaryColor;
  if (token === '$background') return kit.backgroundColor;
  if (token === '$text') return kit.textColor;
  const m = token.match(/^\$custom(\d+)$/);
  if (m) return kit.customColors?.[parseInt(m[1], 10) - 1] ?? '#cccccc';
  return '#cccccc';
}

function setTokenValue(token: string, value: string, kit: BrandKit): BrandKit {
  if (token === '$primary') return { ...kit, primaryColor: value };
  if (token === '$secondary') return { ...kit, secondaryColor: value };
  if (token === '$background') return { ...kit, backgroundColor: value };
  if (token === '$text') return { ...kit, textColor: value };
  const m = token.match(/^\$custom(\d+)$/);
  if (m) {
    const idx = parseInt(m[1], 10) - 1;
    const colors = [...(kit.customColors ?? [])];
    colors[idx] = value;
    return { ...kit, customColors: colors };
  }
  return kit;
}

function activeCustomCount(kit: BrandKit): number {
  return kit.customColors?.length ?? 0;
}

export default function BrandKitEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [savedKit, setSavedKit] = useState<SavedBrandKit | null>(null);
  const [kit, setKit] = useState<BrandKit | null>(null);
  const [kitName, setKitName] = useState('');
  const [isRenamingKit, setIsRenamingKit] = useState(false);
  const [kitNameDraft, setKitNameDraft] = useState('');
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const kitNameInputRef = useRef<HTMLInputElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listCloudBrandKits().then((list) => {
      const found = list.find((k) => k.id === id);
      if (!found) { setNotFound(true); return; }
      setSavedKit(found);
      setKit(found.kit);
      setKitName(found.name);
    });
  }, [id]);

  useEffect(() => {
    if (isRenamingKit) kitNameInputRef.current?.focus();
  }, [isRenamingKit]);

  useEffect(() => {
    if (editingLabel) labelInputRef.current?.focus();
  }, [editingLabel]);

  const markDirty = (updatedKit: BrandKit) => {
    setKit(updatedKit);
    setDirty(true);
    setSaved(false);
  };

  const updateColor = (token: string, value: string) => {
    if (!kit) return;
    markDirty(setTokenValue(token, value, kit));
  };

  const updateLabel = (token: string, label: string) => {
    if (!kit) return;
    const labels = { ...(kit.labels ?? {}), [token]: label };
    markDirty({ ...kit, labels });
  };

  const commitLabel = () => {
    if (!editingLabel) return;
    const trimmed = labelDraft.trim();
    if (trimmed && trimmed !== getTokenLabel(editingLabel, kit!)) {
      updateLabel(editingLabel, trimmed);
    }
    setEditingLabel(null);
  };

  const addCustomColor = () => {
    if (!kit) return;
    const count = activeCustomCount(kit);
    if (count >= 8) return;
    const colors = [...(kit.customColors ?? []), '#cccccc'];
    markDirty({ ...kit, customColors: colors });
  };

  const removeCustomColor = (idx: number) => {
    if (!kit) return;
    const colors = [...(kit.customColors ?? [])];
    colors.splice(idx, 1);
    // Shift labels for custom tokens above the removed index
    const newLabels = { ...(kit.labels ?? {}) };
    for (let i = idx; i < 7; i++) {
      const current = newLabels[`$custom${i + 2}`];
      if (current !== undefined) newLabels[`$custom${i + 1}`] = current;
      else delete newLabels[`$custom${i + 1}`];
    }
    delete newLabels[`$custom${colors.length + 1}`];
    markDirty({ ...kit, customColors: colors, labels: newLabels });
  };

  const saveKit = async () => {
    if (!kit || !savedKit) return;
    setSaving(true);
    const updated = await saveCloudBrandKit(kitName, kit, savedKit.id);
    setSaving(false);
    if (updated) {
      setSavedKit(updated);
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const commitKitRename = async () => {
    const name = kitNameDraft.trim();
    setIsRenamingKit(false);
    if (!name || name === kitName) return;
    setKitName(name);
    setDirty(true);
    setSaved(false);
  };

  const handleDelete = async () => {
    if (!savedKit) return;
    const ok = await deleteCloudBrandKit(savedKit.id);
    if (ok) router.push('/brand-kits');
  };

  if (notFound) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}>
              Kit not found.
            </p>
            <button
              onClick={() => router.push('/brand-kits')}
              className="text-xs"
              style={{ color: 'var(--accent)' }}
            >
              Back to Brand Kits
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!kit) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-subtle)' }} />
        </div>
      </AppShell>
    );
  }

  const customCount = activeCustomCount(kit);

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-10">

          {/* Back + header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <button
                onClick={() => router.push('/brand-kits')}
                className="flex items-center gap-1.5 text-xs mb-3 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Brand Kits
              </button>

              {/* Kit name — inline rename */}
              {isRenamingKit ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={kitNameInputRef}
                    value={kitNameDraft}
                    onChange={(e) => setKitNameDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitKitRename();
                      if (e.key === 'Escape') setIsRenamingKit(false);
                    }}
                    className="text-2xl font-semibold rounded-lg px-2 py-0.5 outline-none"
                    style={{
                      color: 'var(--text)',
                      fontFamily: 'var(--font-fraunces)',
                      background: 'var(--surface)',
                      border: '1px solid var(--accent)',
                    }}
                  />
                  <button onClick={commitKitRename} className="p-1 rounded" style={{ color: 'var(--success)' }}>
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsRenamingKit(false)} className="p-1 rounded" style={{ color: 'var(--text-subtle)' }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1
                    className="text-2xl font-semibold"
                    style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}
                  >
                    {kitName}
                  </h1>
                  <button
                    onClick={() => { setKitNameDraft(kitName); setIsRenamingKit(true); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity"
                    style={{ color: 'var(--text-subtle)' }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Save / delete actions */}
            <div className="flex items-center gap-2 mt-8">
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-subtle)' }}
                title="Delete kit"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.06)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-subtle)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={saveKit}
                disabled={saving || !dirty}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all disabled:opacity-40"
                style={{ background: saved ? 'var(--success)' : 'var(--accent)' }}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : null}
                {saving ? 'Saving…' : saved ? 'Saved' : 'Save kit'}
              </button>
            </div>
          </div>

          {/* ── Colors section ── */}
          <Section title="Colors" subtitle="Define the color tokens for your design system.">
            <div className="space-y-2">
              {CORE_TOKENS.map((token) => (
                <ColorRow
                  key={token}
                  token={token}
                  value={getTokenValue(token, kit)}
                  label={getTokenLabel(token, kit)}
                  isEditingLabel={editingLabel === token}
                  labelDraft={labelDraft}
                  labelInputRef={editingLabel === token ? labelInputRef : undefined}
                  onColorChange={(v) => updateColor(token, v)}
                  onStartEditLabel={() => { setEditingLabel(token); setLabelDraft(getTokenLabel(token, kit)); }}
                  onLabelChange={setLabelDraft}
                  onLabelCommit={commitLabel}
                  onLabelCancel={() => setEditingLabel(null)}
                />
              ))}
            </div>

            {/* Custom colors */}
            {customCount > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-subtle)' }}>
                  Custom colors
                </p>
                {CUSTOM_TOKENS.slice(0, customCount).map((token, i) => (
                  <ColorRow
                    key={token}
                    token={token}
                    value={getTokenValue(token, kit)}
                    label={getTokenLabel(token, kit)}
                    isEditingLabel={editingLabel === token}
                    labelDraft={labelDraft}
                    labelInputRef={editingLabel === token ? labelInputRef : undefined}
                    onColorChange={(v) => updateColor(token, v)}
                    onStartEditLabel={() => { setEditingLabel(token); setLabelDraft(getTokenLabel(token, kit)); }}
                    onLabelChange={setLabelDraft}
                    onLabelCommit={commitLabel}
                    onLabelCancel={() => setEditingLabel(null)}
                    onRemove={() => removeCustomColor(i)}
                  />
                ))}
              </div>
            )}

            {customCount < 8 && (
              <button
                onClick={addCustomColor}
                className="mt-3 flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add custom color
              </button>
            )}
          </Section>

          {/* ── Typography section ── */}
          <Section title="Typography" subtitle="Set the brand font used in email sections.">
            <div
              className="rounded-xl p-4 flex items-center gap-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--overlay)' }}
              >
                <Type className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Brand font</p>
                <select
                  value={kit.fontFamily ?? 'system'}
                  onChange={(e) => markDirty({ ...kit, fontFamily: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    background: 'var(--elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </Section>

          {/* ── Identity section ── */}
          <Section title="Identity" subtitle="Brand name used in the email header and footer.">
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Brand name / Logo text
              </label>
              <input
                type="text"
                value={kit.logoText ?? ''}
                onChange={(e) => markDirty({ ...kit, logoText: e.target.value })}
                placeholder="e.g. Acme Corp"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
                style={{
                  background: 'var(--elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
                onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
                onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
              />
            </div>
          </Section>

          {/* ── Direction section ── */}
          <Section title="Text direction" subtitle="Controls reading direction for all sections using this kit.">
            <div className="flex gap-3">
              {(['ltr', 'rtl'] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => markDirty({ ...kit, direction: dir })}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    background: kit.direction === dir ? 'var(--accent-dim)' : 'var(--surface)',
                    borderColor: kit.direction === dir ? 'var(--accent)' : 'var(--border)',
                    color: kit.direction === dir ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  {dir === 'ltr' ? 'Left to right' : 'Right to left'}
                </button>
              ))}
            </div>
          </Section>

          {/* Unsaved indicator */}
          {dirty && (
            <div className="fixed bottom-6 right-8 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm"
              style={{ background: 'var(--elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              Unsaved changes
              <button
                onClick={saveKit}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section
      className="mb-8 rounded-2xl border overflow-hidden"
      style={{ borderColor: 'var(--border)' }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      </div>
      <div className="p-5" style={{ background: 'var(--elevated)' }}>
        {children}
      </div>
    </section>
  );
}

function ColorRow({
  token,
  value,
  label,
  isEditingLabel,
  labelDraft,
  labelInputRef,
  onColorChange,
  onStartEditLabel,
  onLabelChange,
  onLabelCommit,
  onLabelCancel,
  onRemove,
}: {
  token: string;
  value: string;
  label: string;
  isEditingLabel: boolean;
  labelDraft: string;
  labelInputRef?: React.RefObject<HTMLInputElement | null>;
  onColorChange: (v: string) => void;
  onStartEditLabel: () => void;
  onLabelChange: (v: string) => void;
  onLabelCommit: () => void;
  onLabelCancel: () => void;
  onRemove?: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-xl group"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Color swatch + native picker trigger */}
      <label className="cursor-pointer flex-shrink-0">
        <div
          className="w-8 h-8 rounded-lg border-2 transition-all"
          style={{ background: value, borderColor: 'var(--border)' }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onColorChange(e.target.value)}
          className="sr-only"
        />
      </label>

      {/* Label */}
      <div className="flex-1 min-w-0">
        {isEditingLabel ? (
          <div className="flex items-center gap-1">
            <input
              ref={labelInputRef}
              value={labelDraft}
              onChange={(e) => onLabelChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onLabelCommit();
                if (e.key === 'Escape') onLabelCancel();
              }}
              className="text-xs font-medium rounded px-1.5 py-0.5 outline-none"
              style={{
                background: 'var(--elevated)',
                border: '1px solid var(--accent)',
                color: 'var(--text)',
                width: '120px',
              }}
            />
            <button onClick={onLabelCommit} className="p-0.5" style={{ color: 'var(--success)' }}>
              <Check className="w-3 h-3" />
            </button>
            <button onClick={onLabelCancel} className="p-0.5" style={{ color: 'var(--text-subtle)' }}>
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{label}</span>
            <button
              onClick={onStartEditLabel}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text-subtle)' }}
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        )}
        <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-subtle)' }}>
          {value.toUpperCase()}
        </p>
      </div>

      {/* Remove button (custom colors only) */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all"
          style={{ color: 'var(--text-subtle)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-subtle)'; }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
