'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Pencil, Copy, Trash2, Eye, EyeOff, Star, Upload, Loader2 } from 'lucide-react';
import { MAIN_CATEGORY_DEFS } from '@/lib/templates';

interface AdminTemplate {
  id: string;
  name: string;
  description: string;
  main_category: string;
  sub_category: string;
  accent_color: string;
  access: 'free' | 'premium';
  featured: boolean;
  published: boolean;
  direction: 'ltr' | 'rtl';
  use_count: number;
  sections: unknown[];
  created_at: string;
}

function AccessBadge({ access }: { access: 'free' | 'premium' }) {
  return access === 'premium' ? (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-[#f59e0b] bg-[#f59e0b]/10">Premium</span>
  ) : (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ color: 'var(--text-muted)', background: 'var(--elevated)' }}>Free</span>
  );
}

function EditModal({
  template,
  onClose,
  onSave,
}: {
  template: Partial<AdminTemplate> | null;
  onClose: () => void;
  onSave: (data: Partial<AdminTemplate>) => Promise<void>;
}) {
  const isNew = !template?.id;
  const [form, setForm] = useState<Partial<AdminTemplate>>({
    name: '',
    description: '',
    main_category: 'marketing',
    sub_category: 'newsletter',
    accent_color: '#E85D26',
    access: 'free',
    featured: false,
    published: true,
    direction: 'ltr',
    sections: [],
    ...template,
  });
  const [sectionsJson, setSectionsJson] = useState(JSON.stringify(form.sections ?? [], null, 2));
  const [saving, setSaving] = useState(false);
  const [jsonError, setJsonError] = useState('');
  const [sectionsTab, setSectionsTab] = useState<'json' | 'html' | 'mjml'>('json');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const htmlFileRef = useRef<HTMLInputElement>(null);
  const mjmlFileRef = useRef<HTMLInputElement>(null);

  const handleFileImport = async (file: File, type: 'html' | 'mjml') => {
    setImporting(true);
    setImportError('');
    try {
      const content = await file.text();
      const res = await fetch('/api/admin/parse-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content }),
      });
      const data = await res.json() as { sections?: unknown[]; error?: string };
      if (!res.ok || !data.sections) {
        setImportError(data.error ?? 'Import failed');
        return;
      }
      setSectionsJson(JSON.stringify(data.sections, null, 2));
      setSectionsTab('json');
      setImportError('');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const save = async () => {
    let sections: unknown[];
    try {
      sections = JSON.parse(sectionsJson) as unknown[];
      setJsonError('');
    } catch {
      setJsonError('Invalid JSON in sections field');
      return;
    }
    setSaving(true);
    await onSave({ ...form, sections });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="rounded-2xl border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            {isNew ? 'New Template' : `Edit: ${template?.name}`}
          </h2>
          <button onClick={onClose} className="text-xs" style={{ color: 'var(--text-muted)' }}>Cancel</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {[
            { label: 'Name', key: 'name' as const, type: 'text' },
            { label: 'Description', key: 'description' as const, type: 'text' },
            { label: 'Accent color', key: 'accent_color' as const, type: 'color' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
              <input
                type={type}
                value={(form[key] as string) ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-xs outline-none"
                style={{ background: 'var(--elevated)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Category</label>
              <select
                value={form.main_category ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, main_category: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-xs outline-none"
                style={{ background: 'var(--elevated)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                {MAIN_CATEGORY_DEFS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Sub-category</label>
              <input
                type="text"
                value={form.sub_category ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, sub_category: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-xs outline-none"
                style={{ background: 'var(--elevated)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {[
              { label: 'Published', key: 'published' as const },
              { label: 'Featured', key: 'featured' as const },
            ].map(({ label, key }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                />
                <span className="text-xs" style={{ color: 'var(--text)' }}>{label}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 cursor-pointer">
              <select
                value={form.access ?? 'free'}
                onChange={(e) => setForm((f) => ({ ...f, access: e.target.value as 'free' | 'premium' }))}
                className="px-2 py-1 rounded border text-xs"
                style={{ background: 'var(--elevated)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <select
                value={form.direction ?? 'ltr'}
                onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value as 'ltr' | 'rtl' }))}
                className="px-2 py-1 rounded border text-xs"
                style={{ background: 'var(--elevated)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <option value="ltr">LTR</option>
                <option value="rtl">RTL</option>
              </select>
            </label>
          </div>

          {/* Sections — tabbed: JSON / Upload HTML / Upload MJML */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              {(['json', 'html', 'mjml'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSectionsTab(tab)}
                  className="px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
                  style={{
                    background: sectionsTab === tab ? 'var(--accent)' : 'var(--elevated)',
                    color: sectionsTab === tab ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {tab === 'json' ? 'JSON' : tab === 'html' ? 'Upload HTML' : 'Upload MJML'}
                </button>
              ))}
            </div>

            {sectionsTab === 'json' && (
              <>
                <textarea
                  value={sectionsJson}
                  onChange={(e) => setSectionsJson(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg border text-xs font-mono outline-none resize-y"
                  style={{ background: 'var(--elevated)', borderColor: jsonError ? '#ef4444' : 'var(--border)', color: 'var(--text)' }}
                />
                {jsonError && <p className="text-[11px] text-red-400 mt-1">{jsonError}</p>}
              </>
            )}

            {(sectionsTab === 'html' || sectionsTab === 'mjml') && (
              <div className="rounded-lg border border-dashed p-6 flex flex-col items-center gap-3" style={{ borderColor: 'var(--border)' }}>
                <Upload className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                  Upload a {sectionsTab === 'html' ? '.html / .htm' : '.mjml'} file to import sections
                </p>
                <button
                  onClick={() => (sectionsTab === 'html' ? htmlFileRef : mjmlFileRef).current?.click()}
                  disabled={importing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                  style={{ background: 'var(--accent)' }}
                >
                  {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {importing ? 'Importing…' : 'Choose file'}
                </button>
                {importError && <p className="text-[11px] text-red-400 text-center">{importError}</p>}
                <input
                  ref={htmlFileRef}
                  type="file"
                  accept=".html,.htm"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileImport(f, 'html'); e.target.value = ''; }}
                />
                <input
                  ref={mjmlFileRef}
                  type="file"
                  accept=".mjml"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileImport(f, 'mjml'); e.target.value = ''; }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 rounded-lg text-xs font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ background: 'var(--accent)' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Partial<AdminTemplate> | null | 'new'>('closed' as never);
  const [search, setSearch] = useState('');

  const fetchTemplates = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/templates')
      .then((r) => r.json())
      .then((d: { templates: AdminTemplate[] }) => setTemplates(d.templates ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const toggle = async (id: string, field: 'published' | 'featured' | 'access', current: unknown) => {
    const next = field === 'access' ? (current === 'free' ? 'premium' : 'free') : !current;
    await fetch(`/api/admin/templates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: next }),
    });
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this template?')) return;
    await fetch(`/api/admin/templates/${id}`, { method: 'DELETE' });
    fetchTemplates();
  };

  const handleDuplicate = async (id: string) => {
    await fetch(`/api/admin/templates/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'duplicate' }),
    });
    fetchTemplates();
  };

  const handleSave = async (data: Partial<AdminTemplate>) => {
    if (editTarget === 'new' || !data.id) {
      await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch(`/api/admin/templates/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    setEditTarget(null);
    fetchTemplates();
  };

  const filtered = templates.filter((t) =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}>Templates</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{templates.length} templates total</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 rounded-lg border text-xs outline-none"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)', width: 180 }}
            />
            <button
              onClick={() => setEditTarget('new')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: 'var(--accent)' }}
            >
              <Plus className="w-3.5 h-3.5" /> New template
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((t) => {
              const mainDef = MAIN_CATEGORY_DEFS.find((c) => c.id === t.main_category);
              return (
                <div
                  key={t.id}
                  className="rounded-xl border overflow-hidden flex flex-col"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    opacity: t.published ? 1 : 0.6,
                  }}
                >
                  {/* Color bar */}
                  <div className="h-1.5" style={{ background: t.accent_color }} />

                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text)' }}>{t.name}</p>
                      {t.featured && <Star className="w-3 h-3 flex-shrink-0 text-[#f59e0b]" fill="currentColor" />}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {mainDef && (
                        <span
                          className="text-[9px] font-semibold px-1 py-0.5 rounded"
                          style={{ color: mainDef.color, background: `${mainDef.color}18` }}
                        >
                          {mainDef.label}
                        </span>
                      )}
                      <AccessBadge access={t.access} />
                      {t.direction === 'rtl' && (
                        <span className="text-[9px] font-semibold px-1 py-0.5 rounded text-[#059669] bg-[#059669]/10">RTL</span>
                      )}
                    </div>

                    <p className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>
                      {t.use_count} uses · {Array.isArray(t.sections) ? t.sections.length : 0} sections
                    </p>

                    <div className="mt-auto flex items-center gap-1 flex-wrap">
                      <button
                        onClick={() => toggle(t.id, 'published', t.published)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border transition-colors"
                        style={{ borderColor: 'var(--border)', color: t.published ? '#10b981' : 'var(--text-muted)' }}
                        title={t.published ? 'Unpublish' : 'Publish'}
                      >
                        {t.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => toggle(t.id, 'access', t.access)}
                        className="px-2 py-1 rounded text-[10px] border transition-colors"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                        title="Toggle free/premium"
                      >
                        {t.access === 'premium' ? '→ Free' : '→ Pro'}
                      </button>
                      <button
                        onClick={() => setEditTarget(t)}
                        className="p-1 rounded border"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                        title="Edit"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(t.id)}
                        className="p-1 rounded border"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                        title="Duplicate"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1 rounded border text-red-400"
                        style={{ borderColor: 'var(--border)' }}
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(editTarget === 'new' || (editTarget && editTarget !== null)) && (
        <EditModal
          template={editTarget === 'new' ? {} : editTarget as Partial<AdminTemplate>}
          onClose={() => setEditTarget(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
