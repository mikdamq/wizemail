'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MousePointerClick, Upload, ShieldCheck, Pencil, CheckCircle2, AlertCircle, AlertTriangle, Minus, LayoutTemplate, ChevronDown, X, Plus, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEmailStore } from '@/store/email-store';
import { runA11yChecks } from '@/lib/accessibility';
import { runCompatibilityChecks } from '@/lib/email-utils';
import type { SectionType, SectionContent } from '@/lib/types';
import type { A11yCheck } from '@/lib/accessibility';
import type { CompatibilityIssue } from '@/lib/types';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type Tab = 'edit' | 'a11y' | 'compatibility';

/* ─── small field components ──────────────────────────────── */

function ColorField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-[11px] text-[#71717a] flex-1">{label}</label>
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded border border-[#2a2a2e] overflow-hidden flex-shrink-0">
          <input
            type="color"
            value={value ?? '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            className="w-6 h-6 -translate-x-0.5 -translate-y-0.5 cursor-pointer border-0 p-0 bg-transparent"
          />
        </div>
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 text-[11px] font-mono bg-[#0f0f11] border border-[#2a2a2e] rounded px-1.5 py-0.5 text-[#a1a1aa] focus:outline-none focus:border-[#6366f1] transition-colors"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, multiline = false, placeholder, aiButton }: {
  label: string; value?: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string;
  aiButton?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-[#71717a]">{label}</label>
        {aiButton}
      </div>
      {multiline ? (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="text-xs bg-[#0f0f11] border border-[#2a2a2e] rounded-md px-2.5 py-1.5 text-[#f4f4f5] focus:outline-none focus:border-[#6366f1] transition-colors resize-none leading-relaxed placeholder:text-[#3a3a3e]"
          placeholder={placeholder ?? label}
        />
      ) : (
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs bg-[#0f0f11] border border-[#2a2a2e] rounded-md px-2.5 py-1.5 text-[#f4f4f5] focus:outline-none focus:border-[#6366f1] transition-colors placeholder:text-[#3a3a3e]"
          placeholder={placeholder ?? label}
        />
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#2a2a2e] last:border-0">
      <div className="px-3 py-2 bg-[#0f0f11]">
        <p className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">{title}</p>
      </div>
      <div className="px-3 py-3 space-y-3">{children}</div>
    </div>
  );
}

function CollapsibleGroup({ title, children, defaultOpen = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#2a2a2e] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-[#0f0f11] hover:bg-[#111113] transition-colors"
      >
        <p className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">{title}</p>
        <ChevronDown className={`w-3 h-3 text-[#71717a] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-3 py-3 space-y-2">{children}</div>}
    </div>
  );
}

function NumberField({ label, value, onChange, min = 0, max = 120 }: {
  label: string; value?: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-[11px] text-[#71717a] flex-shrink-0">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder="auto"
        className="w-16 text-[11px] font-mono bg-[#0f0f11] border border-[#2a2a2e] rounded px-1.5 py-0.5 text-[#a1a1aa] focus:outline-none focus:border-[#6366f1] transition-colors text-right"
      />
    </div>
  );
}

function SliderField({ label, value, defaultValue, onChange, min, max, step = 1, unit = '' }: {
  label: string; value?: number; defaultValue: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string;
}) {
  const current = value ?? defaultValue;
  const display = step < 1 ? current.toFixed(2) : current;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-[#71717a]">{label}</label>
        <span className="text-[11px] font-mono text-[#a1a1aa]">{display}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#6366f1]"
      />
      <div className="flex justify-between text-[9px] text-[#3a3a3e]">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

/* ─── image upload field ───────────────────────────────────── */

function ImageUploadField({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-[#71717a]">Image URL or upload</label>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs bg-[#0f0f11] border border-[#2a2a2e] rounded-md px-2.5 py-1.5 text-[#f4f4f5] focus:outline-none focus:border-[#6366f1] transition-colors placeholder:text-[#3a3a3e]"
        placeholder="https://… or upload below"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-dashed border-[#3a3a3e] text-[11px] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 transition-all"
      >
        <Upload className="w-3 h-3" />
        Upload from computer
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value?.startsWith('data:') && (
        <div className="mt-1 rounded-md overflow-hidden border border-[#2a2a2e]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="w-full h-20 object-cover" />
          <p className="text-[9px] text-[#71717a] px-2 py-1 bg-[#0f0f11] text-center">Local file — won't work in exported HTML</p>
        </div>
      )}
    </div>
  );
}

/* ─── section-specific controls ───────────────────────────── */

function ControlsForType({ type, content, onUpdate }: { type: SectionType; content: SectionContent; onUpdate: (c: SectionContent) => void }) {
  const u = (key: keyof SectionContent) => (v: any) => onUpdate({ ...content, [key]: v });

  // AI button component
  function AiBtn({ field, updateKey }: { field: string; updateKey: keyof SectionContent }) {
    const [loading, setLoading] = useState(false);

    const generate = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field, type, content }),
        });
        const data = await res.json();
        if (!res.ok || !data.text) {
          toast.error(data.error ?? 'AI generation failed — check your API key');
          return;
        }
        onUpdate({ ...content, [updateKey]: data.text });
        toast.success('Generated');
      } catch (err) {
        toast.error('AI generation failed — network error');
      } finally {
        setLoading(false);
      }
    };

    return (
      <button
        onClick={generate}
        disabled={loading}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
        AI
      </button>
    );
  }

  return (
    <>
      {type === 'hero' && (
        <>
          <Group title="Colors">
            <ColorField label="Background" value={content.backgroundColor} onChange={u('backgroundColor')} />
            <ColorField label="Text color" value={content.textColor} onChange={u('textColor')} />
          </Group>
          <Group title="Content">
            <TextField label="Headline" value={content.headline} onChange={u('headline')} aiButton={<AiBtn field="headline" updateKey="headline" />} />
            <TextField label="Subheadline" value={content.subheadline} onChange={u('subheadline')} aiButton={<AiBtn field="subheadline" updateKey="subheadline" />} />
            <TextField label="Button text" value={content.buttonText} onChange={u('buttonText')} aiButton={<AiBtn field="buttonText" updateKey="buttonText" />} />
            <TextField label="Button URL" value={content.buttonUrl} onChange={u('buttonUrl')} />
            <ColorField label="Button color" value={content.buttonColor} onChange={u('buttonColor')} />
            <ColorField label="Text color" value={content.buttonTextColor} onChange={u('buttonTextColor')} />
          </Group>
          <Group title="Background image">
            <ImageUploadField value={content.backgroundImageUrl} onChange={u('backgroundImageUrl')} />
            <div className="flex gap-1">
              {(['cover', 'contain', 'auto'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => onUpdate({ backgroundImageSize: size })}
                  className={`flex-1 py-1 rounded text-[10px] transition-colors ${
                    (content.backgroundImageSize ?? 'cover') === size
                      ? 'bg-[#6366f1] text-white'
                      : 'bg-[#0f0f11] text-[#71717a] hover:text-[#a1a1aa] border border-[#2a2a2e]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </Group>
        </>
      )}

      {type === 'cta' && (
        <>
          <Group title="Colors">
            <ColorField label="Background" value={content.backgroundColor} onChange={u('backgroundColor')} />
            <ColorField label="Text color" value={content.textColor} onChange={u('textColor')} />
          </Group>
          <Group title="Content">
            <TextField label="Headline" value={content.headline} onChange={u('headline')} aiButton={<AiBtn field="headline" updateKey="headline" />} />
            <TextField label="Body text" value={content.bodyText} onChange={u('bodyText')} multiline aiButton={<AiBtn field="body" updateKey="bodyText" />} />
            <TextField label="Button text" value={content.buttonText} onChange={u('buttonText')} aiButton={<AiBtn field="buttonText" updateKey="buttonText" />} />
            <TextField label="Button URL" value={content.buttonUrl} onChange={u('buttonUrl')} />
            <ColorField label="Button color" value={content.buttonColor} onChange={u('buttonColor')} />
            <ColorField label="Text color" value={content.buttonTextColor} onChange={u('buttonTextColor')} />
          </Group>
        </>
      )}

      {type === 'text' && (
        <Group title="Content">
          <TextField label="Headline" value={content.headline} onChange={u('headline')} aiButton={<AiBtn field="headline" updateKey="headline" />} />
          <TextField label="Body text" value={content.bodyText} onChange={u('bodyText')} multiline aiButton={<AiBtn field="body" updateKey="bodyText" />} />
        </Group>
      )}

      {type === 'image' && (
        <Group title="Image">
          <ImageUploadField value={content.imageUrl} onChange={u('imageUrl')} />
          <TextField label="Alt text" value={content.imageAlt} onChange={u('imageAlt')} placeholder="Describe the image" />
        </Group>
      )}

      {type === 'features' && (() => {
        const featureItems = content.featureItems ?? [
          ...(content.feature1Title || content.feature1Text ? [{ title: content.feature1Title ?? '', text: content.feature1Text ?? '' }] : []),
          ...(content.feature2Title || content.feature2Text ? [{ title: content.feature2Title ?? '', text: content.feature2Text ?? '' }] : []),
          ...(content.feature3Title || content.feature3Text ? [{ title: content.feature3Title ?? '', text: content.feature3Text ?? '' }] : []),
        ];
        const addFeatureItem = () => onUpdate({ featureItems: [...featureItems, { title: 'New feature', text: '' }] });
        const removeFeatureItem = (i: number) => onUpdate({ featureItems: featureItems.filter((_, idx) => idx !== i) });
        const updateFeatureItem = (i: number, key: 'title' | 'text', v: string) =>
          onUpdate({ featureItems: featureItems.map((item, idx) => idx === i ? { ...item, [key]: v } : item) });
        return (
          <>
            <Group title="Headline">
              <TextField label="Section title" value={content.headline} onChange={u('headline')} />
            </Group>
            <Group title="Items">
              <div className="space-y-2">
                {featureItems.map((item, i) => (
                  <div key={i} className="rounded-lg border border-[#2a2a2e] p-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-[#71717a]">Feature {i + 1}</span>
                      <button
                        onClick={() => removeFeatureItem(i)}
                        className="p-0.5 rounded text-[#3a3a3e] hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <TextField label="Title" value={item.title} onChange={(v) => updateFeatureItem(i, 'title', v)} />
                    <TextField label="Description" value={item.text} onChange={(v) => updateFeatureItem(i, 'text', v)} multiline />
                  </div>
                ))}
                <button
                  onClick={addFeatureItem}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-dashed border-[#3a3a3e] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#6366f1]/40 hover:bg-[#6366f1]/5 transition-all text-[10px]"
                >
                  <Plus className="w-3 h-3" />
                  Add feature
                </button>
              </div>
            </Group>
          </>
        );
      })()}

      {type === 'testimonial' && (
        <Group title="Quote">
          <TextField label="Quote" value={content.quoteText} onChange={u('quoteText')} multiline />
          <TextField label="Author name" value={content.authorName} onChange={u('authorName')} />
          <TextField label="Author title" value={content.authorTitle} onChange={u('authorTitle')} />
        </Group>
      )}

      {type === 'social' && (() => {
        const socialLinks = content.socialLinks ?? [
          { label: 'Twitter', url: content.twitterUrl ?? '#' },
          { label: 'LinkedIn', url: content.linkedinUrl ?? '#' },
          { label: 'Instagram', url: content.instagramUrl ?? '#' },
        ];
        const addSocialLink = () => onUpdate({ socialLinks: [...socialLinks, { label: 'New link', url: '#' }] });
        const removeSocialLink = (i: number) => onUpdate({ socialLinks: socialLinks.filter((_, idx) => idx !== i) });
        const updateSocialLink = (i: number, key: 'label' | 'url', v: string) =>
          onUpdate({ socialLinks: socialLinks.map((link, idx) => idx === i ? { ...link, [key]: v } : link) });
        return (
          <Group title="Links">
            <div className="space-y-2">
              {socialLinks.map((link, i) => (
                <div key={i} className="rounded-lg border border-[#2a2a2e] p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#71717a]">Link {i + 1}</span>
                    <button
                      onClick={() => removeSocialLink(i)}
                      className="p-0.5 rounded text-[#3a3a3e] hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <TextField label="Label" value={link.label} onChange={(v) => updateSocialLink(i, 'label', v)} />
                  <TextField label="URL" value={link.url} onChange={(v) => updateSocialLink(i, 'url', v)} />
                </div>
              ))}
              <button
                onClick={addSocialLink}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-dashed border-[#3a3a3e] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#6366f1]/40 hover:bg-[#6366f1]/5 transition-all text-[10px]"
              >
                <Plus className="w-3 h-3" />
                Add link
              </button>
            </div>
          </Group>
        );
      })()}

      {type === 'list' && (
        <>
          <Group title="Colors">
            <ColorField label="Background" value={content.backgroundColor} onChange={u('backgroundColor')} />
            <ColorField label="Text color" value={content.textColor} onChange={u('textColor')} />
          </Group>
          <Group title="List items">
            <TextField
              label="Items (one per line)"
              value={content.listItems}
              onChange={u('listItems')}
              multiline
              placeholder={"First item\nSecond item\nThird item"}
            />
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#71717a]">Style</label>
              <div className="flex gap-1">
                {([
                  { value: 'bullet', label: '• Bullet' },
                  { value: 'numbered', label: '1. Numbered' },
                  { value: 'none', label: 'Plain' },
                ] as const).map(({ value: v, label: l }) => (
                  <button
                    key={v}
                    onClick={() => onUpdate({ listStyle: v })}
                    className={`flex-1 py-1 rounded text-[10px] transition-colors ${
                      (content.listStyle ?? 'bullet') === v
                        ? 'bg-[#6366f1] text-white'
                        : 'bg-[#0f0f11] text-[#71717a] hover:text-[#a1a1aa] border border-[#2a2a2e]'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </Group>
        </>
      )}

      {type === 'announcement' && (
        <>
          <Group title="Colors">
            <ColorField label="Background" value={content.backgroundColor} onChange={u('backgroundColor')} />
            <ColorField label="Text color" value={content.textColor} onChange={u('textColor')} />
          </Group>
          <Group title="Content">
            <TextField label="Headline" value={content.headline} onChange={u('headline')} aiButton={<AiBtn field="headline" updateKey="headline" />} />
            <TextField label="Body text" value={content.bodyText} onChange={u('bodyText')} multiline aiButton={<AiBtn field="body" updateKey="bodyText" />} />
          </Group>
          <Group title="Button">
            <TextField label="Button text" value={content.buttonText} onChange={u('buttonText')} aiButton={<AiBtn field="buttonText" updateKey="buttonText" />} />
            <TextField label="Button URL" value={content.buttonUrl} onChange={u('buttonUrl')} />
            <ColorField label="Button color" value={content.buttonColor} onChange={u('buttonColor')} />
            <ColorField label="Text color" value={content.buttonTextColor} onChange={u('buttonTextColor')} />
          </Group>
        </>
      )}

      {type === 'product-card' && (
        <>
          <Group title="Colors">
            <ColorField label="Background" value={content.backgroundColor} onChange={u('backgroundColor')} />
            <ColorField label="Text color" value={content.textColor} onChange={u('textColor')} />
          </Group>
          <Group title="Product">
            <TextField label="Name" value={content.headline} onChange={u('headline')} />
            <TextField label="Description" value={content.bodyText} onChange={u('bodyText')} multiline />
            <TextField label="Price" value={content.productPrice} onChange={u('productPrice')} placeholder="$99.00" />
          </Group>
          <Group title="Image">
            <ImageUploadField value={content.imageUrl} onChange={u('imageUrl')} />
            <TextField label="Alt text" value={content.imageAlt} onChange={u('imageAlt')} placeholder="Describe the image" />
          </Group>
          <Group title="Button">
            <TextField label="Button text" value={content.buttonText} onChange={u('buttonText')} />
            <TextField label="Button URL" value={content.buttonUrl} onChange={u('buttonUrl')} />
            <ColorField label="Button color" value={content.buttonColor} onChange={u('buttonColor')} />
            <ColorField label="Text color" value={content.buttonTextColor} onChange={u('buttonTextColor')} />
          </Group>
        </>
      )}

      {type === 'header' && (
        <>
          <Group title="Brand">
            <TextField label="Logo text" value={content.logoText} onChange={u('logoText')} placeholder="Your Brand" />
            <ColorField label="Background" value={content.backgroundColor} onChange={u('backgroundColor')} />
            <ColorField label="Text color" value={content.textColor} onChange={u('textColor')} />
          </Group>
        </>
      )}

      {type === 'footer' && (
        <>
          <Group title="Company">
            <TextField label="Company name" value={content.companyName} onChange={u('companyName')} placeholder="Your Company" />
            <TextField label="Address" value={content.companyAddress} onChange={u('companyAddress')} multiline placeholder="123 Main St, City, Country" />
            <TextField label="Unsubscribe URL" value={content.unsubscribeUrl} onChange={u('unsubscribeUrl')} placeholder="https://…/unsubscribe" />
          </Group>
          <Group title="Colors">
            <ColorField label="Background" value={content.backgroundColor} onChange={u('backgroundColor')} />
            <ColorField label="Text color" value={content.textColor} onChange={u('textColor')} />
          </Group>
        </>
      )}

      {type === 'button-row' && (
        <>
          <Group title="Button">
            <TextField label="Button text" value={content.buttonText} onChange={u('buttonText')} placeholder="Click here" />
            <TextField label="Button URL" value={content.buttonUrl} onChange={u('buttonUrl')} placeholder="https://…" />
          </Group>
          <Group title="Colors">
            <ColorField label="Button color" value={content.buttonColor} onChange={u('buttonColor')} />
            <ColorField label="Text color" value={content.buttonTextColor} onChange={u('buttonTextColor')} />
            <ColorField label="Background" value={content.backgroundColor} onChange={u('backgroundColor')} />
          </Group>
          <Group title="Align">
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => onUpdate({ buttonAlign: align })}
                  className={`flex-1 py-1 rounded text-[10px] capitalize transition-colors ${
                    (content.buttonAlign ?? 'center') === align
                      ? 'bg-[#6366f1] text-white'
                      : 'bg-[#0f0f11] text-[#71717a] hover:text-[#a1a1aa] border border-[#2a2a2e]'
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </Group>
        </>
      )}

      {type === 'divider' && (
        <Group title="Colors">
          <ColorField label="Divider color" value={content.dividerColor} onChange={u('dividerColor')} />
          <ColorField label="Background" value={content.backgroundColor} onChange={u('backgroundColor')} />
        </Group>
      )}

      {type === 'spacer' && (
        <Group title="Size">
          <NumberField label="Height (px)" value={content.spacerHeight} onChange={u('spacerHeight')} min={4} max={200} />
          <ColorField label="Background" value={content.backgroundColor} onChange={u('backgroundColor')} />
        </Group>
      )}

      {type === 'html' && (
        <Group title="HTML">
          <div className="rounded-md overflow-hidden border border-[#2a2a2e]">
            <MonacoEditor
              height={220}
              language="html"
              theme="vs-dark"
              value={content.customHtml ?? ''}
              onChange={(v) => onUpdate({ ...content, customHtml: v ?? '' })}
              options={{
                minimap: { enabled: false },
                fontSize: 11,
                lineNumbers: 'off',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 8, bottom: 8 },
              }}
            />
          </div>
        </Group>
      )}

      {/* ── Typography controls ── */}
      {['hero', 'text', 'cta', 'announcement', 'testimonial', 'header', 'features'].includes(type) && (
        <CollapsibleGroup title="Typography">
          {['hero', 'text', 'cta', 'announcement', 'features', 'header'].includes(type) && (
            <>
              <SliderField
                label="Headline size"
                value={content.headlineFontSize}
                defaultValue={type === 'hero' ? 36 : type === 'cta' ? 28 : type === 'announcement' ? 28 : type === 'header' ? 20 : 22}
                onChange={(v) => onUpdate({ headlineFontSize: v })}
                min={12}
                max={48}
                unit="px"
              />
              <SliderField
                label="Body size"
                value={content.bodyFontSize}
                defaultValue={16}
                onChange={(v) => onUpdate({ bodyFontSize: v })}
                min={12}
                max={24}
                unit="px"
              />
            </>
          )}
          {['hero', 'text', 'cta', 'announcement', 'testimonial'].includes(type) && (
            <SliderField
              label="Line height"
              value={content.bodyLineHeight}
              defaultValue={1.5}
              onChange={(v) => onUpdate({ bodyLineHeight: v })}
              min={1}
              max={2}
              step={0.1}
            />
          )}
        </CollapsibleGroup>
      )}
    </>
  );
}

/* ─── Status icon ─────────────────────────────────────────── */

function StatusIcon({ status }: { status: A11yCheck['status'] }) {
  if (status === 'pass') return <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] flex-shrink-0" />;
  if (status === 'fail') return <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />;
  if (status === 'warn') return <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0" />;
  return <Minus className="w-3.5 h-3.5 text-[#3a3a3e] flex-shrink-0" />;
}

/* ─── A11y tab ─────────────────────────────────────────────── */

function A11yTab() {
  const { rows, emailDetails } = useEmailStore();
  const report = runA11yChecks(rows, emailDetails);

  const scorable = report.total - report.na;
  const scoreColor = report.isEmpty
    ? '#3a3a3e'
    : report.score >= 80
    ? '#10b981'
    : report.score >= 60
    ? '#f59e0b'
    : '#ef4444';
  const scoreLabel = report.isEmpty
    ? 'Empty'
    : report.score >= 80
    ? 'Good'
    : report.score >= 60
    ? 'Needs work'
    : 'Poor';

  const activeChecks = report.checks.filter((c) => c.status !== 'na');
  const naChecks = report.checks.filter((c) => c.status === 'na');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Score summary */}
      <div className="px-3 py-3 border-b border-[#2a2a2e] flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-[#f4f4f5]">Accessibility Score</p>
            <p className="text-[10px] text-[#71717a] mt-0.5">
              {report.isEmpty
                ? 'Add sections to start'
                : `${report.passing}/${scorable} checks passing`}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold" style={{ color: scoreColor }}>
              {report.isEmpty ? '—' : report.score}
            </span>
            <span className="text-[9px] font-medium" style={{ color: scoreColor }}>{scoreLabel}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-[#222226] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: report.isEmpty ? '0%' : `${report.score}%`, backgroundColor: scoreColor }}
          />
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 mt-2.5">
          {!report.isEmpty && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span className="text-[10px] text-[#71717a]">{report.passing} pass</span>
            </div>
          )}
          {report.warnings > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              <span className="text-[10px] text-[#71717a]">{report.warnings} warn</span>
            </div>
          )}
          {report.failing > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-[10px] text-[#71717a]">{report.failing} fail</span>
            </div>
          )}
          {report.na > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3a3a3e]" />
              <span className="text-[10px] text-[#71717a]">{report.na} n/a</span>
            </div>
          )}
        </div>
      </div>

      {/* Empty state banner */}
      {report.isEmpty && (
        <div className="mx-3 mt-3 flex-shrink-0 rounded-lg border border-dashed border-[#2a2a2e] bg-[#0f0f11] px-3 py-3 flex items-start gap-2.5">
          <LayoutTemplate className="w-3.5 h-3.5 text-[#3a3a3e] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold text-[#71717a] leading-tight">Email is empty</p>
            <p className="text-[10px] text-[#3a3a3e] mt-0.5 leading-relaxed">
              Add sections to get a full accessibility report. Checks marked N/A below need content to evaluate.
            </p>
          </div>
        </div>
      )}

      {/* Check list */}
      <div className="flex-1 overflow-y-auto mt-1">
        {(['fail', 'warn', 'pass'] as A11yCheck['status'][]).map((status) => {
          const filtered = activeChecks.filter((c) => c.status === status);
          if (filtered.length === 0) return null;
          return filtered.map((check) => (
            <div key={check.id} className="px-3 py-2.5 border-b border-[#1a1a1d] last:border-0">
              <div className="flex items-start gap-2 mb-1">
                <div className="mt-0.5">
                  <StatusIcon status={check.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-[11px] font-semibold text-[#f4f4f5] leading-tight">{check.label}</p>
                    {check.wcag && (
                      <span className="text-[9px] text-[#71717a] bg-[#222226] px-1.5 py-0.5 rounded border border-[#2a2a2e]">{check.wcag}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#71717a] leading-relaxed mt-0.5">{check.description}</p>
                  {check.detail && (
                    <p className={`text-[10px] mt-1 font-medium ${
                      check.status === 'fail' ? 'text-red-400' :
                      check.status === 'warn' ? 'text-[#f59e0b]' : 'text-[#10b981]'
                    }`}>
                      {check.detail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ));
        })}

        {/* N/A checks — dimmed, at the bottom */}
        {naChecks.length > 0 && (
          <>
            {activeChecks.length > 0 && (
              <div className="px-3 py-1.5 border-b border-[#1a1a1d]">
                <p className="text-[9px] font-semibold text-[#3a3a3e] uppercase tracking-wider">Not applicable</p>
              </div>
            )}
            {naChecks.map((check) => (
              <div key={check.id} className="px-3 py-2.5 border-b border-[#1a1a1d] last:border-0 opacity-40">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <StatusIcon status="na" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-[11px] font-semibold text-[#71717a] leading-tight">{check.label}</p>
                      {check.wcag && (
                        <span className="text-[9px] text-[#3a3a3e] bg-[#1a1a1d] px-1.5 py-0.5 rounded border border-[#222226]">{check.wcag}</span>
                      )}
                    </div>
                    {check.detail && (
                      <p className="text-[10px] mt-0.5 text-[#3a3a3e]">{check.detail}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Compatibility tab ─────────────────────────────────────────────── */

function CompatibilityTab() {
  const { rows, client } = useEmailStore();
  const report = runCompatibilityChecks(rows, client);

  const scoreColor = report.score >= 80
    ? '#10b981'
    : report.score >= 60
    ? '#f59e0b'
    : '#ef4444';
  const scoreLabel = report.score >= 80
    ? 'Good'
    : report.score >= 60
    ? 'Needs work'
    : 'Poor';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Score summary */}
      <div className="px-3 py-3 border-b border-[#2a2a2e] flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-[#f4f4f5]">Compatibility Score</p>
            <p className="text-[10px] text-[#71717a] mt-0.5">
              {report.issues.length === 0
                ? 'No issues detected'
                : `${report.issues.length} issue${report.issues.length > 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold" style={{ color: scoreColor }}>
              {report.score}
            </span>
            <span className="text-[9px] font-medium" style={{ color: scoreColor }}>{scoreLabel}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-[#222226] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${report.score}%`, backgroundColor: scoreColor }}
          />
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 mt-2.5">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span className="text-[10px] text-[#71717a]">Score: {report.score}/100</span>
          </div>
          {report.gmailClippingRisk !== 'low' && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              <span className="text-[10px] text-[#71717a]">Gmail: {report.gmailClippingRisk}</span>
            </div>
          )}
          {report.outlookNestingDepth > 3 && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-[10px] text-[#71717a]">Outlook: {report.outlookNestingDepth} deep</span>
            </div>
          )}
        </div>
      </div>

      {/* Issues list */}
      <div className="flex-1 overflow-y-auto">
        {report.issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
            <div className="w-9 h-9 rounded-xl bg-[#1c1c1f] border border-[#2a2a2e] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-[#71717a]">No compatibility issues</p>
              <p className="text-[10px] text-[#3a3a3e] mt-1 leading-relaxed">Your email should render well<br />across most clients</p>
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {report.issues.map((issue) => (
              <div key={issue.id} className="rounded-lg border border-[#2a2a2e] p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <StatusIcon status={issue.severity === 'high' ? 'fail' : issue.severity === 'medium' ? 'warn' : 'pass'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#f4f4f5] leading-tight">{issue.title}</p>
                    <p className="text-[10px] text-[#71717a] mt-0.5 leading-relaxed">{issue.description}</p>
                    <p className="text-[10px] text-[#a1a1aa] mt-1 leading-relaxed">{issue.suggestion}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-medium text-[#3a3a3e] uppercase tracking-wider">{issue.client}</span>
                      <span className="text-[9px] text-[#71717a]">{issue.confidence}% confidence</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── main export ───────────────────────────────────────────── */

export function RightSidebar() {
  const { rows, selected, updateColumnContent, updateRowSpacing, updateColumnSpacing } = useEmailStore();
  const [tab, setTab] = useState<Tab>('edit');
  const [editSubTab, setEditSubTab] = useState<'content' | 'spacing'>('content');

  const selectedRow = selected ? rows.find((r) => r.id === selected.rowId) : undefined;
  const selectedColumn = selectedRow?.columns[selected?.colIdx ?? 0];

  useEffect(() => { setEditSubTab('content'); }, [selected?.rowId, selected?.colIdx]);

  const sectionTypeLabel = selectedColumn
    ? selectedColumn.type === 'button-row' ? 'Button'
    : selectedColumn.type === 'html' ? 'Custom HTML'
    : selectedColumn.type.charAt(0).toUpperCase() + selectedColumn.type.slice(1)
    : '';

  return (
    <div data-tour="inspector" className="w-64 flex-shrink-0 bg-[#161618] border-l border-[#2a2a2e] flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="px-2 py-2 border-b border-[#2a2a2e] flex-shrink-0">
        <div className="flex items-center gap-0.5 bg-[#0f0f11] rounded-lg p-0.5">
          <button
            onClick={() => setTab('edit')}
            className={`flex items-center gap-1.5 flex-1 justify-center py-1 rounded-md text-xs font-medium transition-all duration-100 ${
              tab === 'edit' ? 'bg-[#222226] text-[#f4f4f5] shadow-sm' : 'text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={() => setTab('a11y')}
            className={`flex items-center gap-1.5 flex-1 justify-center py-1 rounded-md text-xs font-medium transition-all duration-100 ${
              tab === 'a11y' ? 'bg-[#222226] text-[#f4f4f5] shadow-sm' : 'text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            A11y
          </button>
          <button
            onClick={() => setTab('compatibility')}
            className={`flex items-center gap-1.5 flex-1 justify-center py-1 rounded-md text-xs font-medium transition-all duration-100 ${
              tab === 'compatibility' ? 'bg-[#222226] text-[#f4f4f5] shadow-sm' : 'text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            <LayoutTemplate className="w-3 h-3" />
            Compat
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'edit' && (!selectedColumn || selectedColumn.type === 'empty') && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1c1c1f] border border-[#2a2a2e] flex items-center justify-center">
              <MousePointerClick className="w-4 h-4 text-[#3a3a3e]" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-[#71717a]">No section selected</p>
              <p className="text-[10px] text-[#3a3a3e] mt-1 leading-relaxed">Click a section in the preview<br />or the structure panel</p>
            </div>
          </div>
        )}

        {tab === 'edit' && selectedColumn && selectedColumn.type !== 'empty' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Section header */}
            <div className="px-3 py-2 border-b border-[#2a2a2e] flex-shrink-0 bg-[#0f0f11]">
              <p className="text-xs font-semibold text-[#f4f4f5]">{sectionTypeLabel}</p>
            </div>
            {/* Content / Spacing sub-tabs */}
            <div className="flex border-b border-[#2a2a2e] flex-shrink-0">
              <button
                onClick={() => setEditSubTab('content')}
                className={`flex-1 py-1.5 text-[10px] font-semibold transition-colors ${editSubTab === 'content' ? 'text-[#f4f4f5] border-b-2 border-[#6366f1]' : 'text-[#71717a] hover:text-[#a1a1aa]'}`}
              >
                Content
              </button>
              <button
                onClick={() => setEditSubTab('spacing')}
                className={`flex-1 py-1.5 text-[10px] font-semibold transition-colors ${editSubTab === 'spacing' ? 'text-[#f4f4f5] border-b-2 border-[#6366f1]' : 'text-[#71717a] hover:text-[#a1a1aa]'}`}
              >
                Spacing
              </button>
            </div>

            {/* Content tab */}
            {editSubTab === 'content' && (
              <div className="flex-1 overflow-y-auto">
                <ControlsForType
                  type={selectedColumn.type}
                  content={selectedColumn.content}
                  onUpdate={(c) => selected && updateColumnContent(selected.rowId, selected.colIdx, c)}
                />
              </div>
            )}

            {/* Spacing tab */}
            {editSubTab === 'spacing' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Section padding — all non-spacer types */}
                {selectedColumn.type !== 'spacer' && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-semibold text-[#71717a] uppercase tracking-wider">Section padding</p>
                    <NumberField label="Top" value={selectedColumn.content.sectionPaddingTop} onChange={(v) => selected && updateColumnContent(selected.rowId, selected.colIdx, { sectionPaddingTop: v })} max={200} />
                    <NumberField label="Right" value={selectedColumn.content.sectionPaddingRight} onChange={(v) => selected && updateColumnContent(selected.rowId, selected.colIdx, { sectionPaddingRight: v })} max={200} />
                    <NumberField label="Bottom" value={selectedColumn.content.sectionPaddingBottom} onChange={(v) => selected && updateColumnContent(selected.rowId, selected.colIdx, { sectionPaddingBottom: v })} max={200} />
                    <NumberField label="Left" value={selectedColumn.content.sectionPaddingLeft} onChange={(v) => selected && updateColumnContent(selected.rowId, selected.colIdx, { sectionPaddingLeft: v })} max={200} />
                  </div>
                )}
                {/* Column padding — only for multi-col rows */}
                {selectedRow && selectedRow.columns.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-semibold text-[#71717a] uppercase tracking-wider">Column padding</p>
                    <NumberField label="Top" value={selectedColumn.paddingTop} onChange={(v) => selected && updateColumnSpacing(selected.rowId, selected.colIdx, { paddingTop: v })} />
                    <NumberField label="Right" value={selectedColumn.paddingRight} onChange={(v) => selected && updateColumnSpacing(selected.rowId, selected.colIdx, { paddingRight: v })} />
                    <NumberField label="Bottom" value={selectedColumn.paddingBottom} onChange={(v) => selected && updateColumnSpacing(selected.rowId, selected.colIdx, { paddingBottom: v })} />
                    <NumberField label="Left" value={selectedColumn.paddingLeft} onChange={(v) => selected && updateColumnSpacing(selected.rowId, selected.colIdx, { paddingLeft: v })} />
                  </div>
                )}
                {/* Row spacing */}
                {selectedRow && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-semibold text-[#71717a] uppercase tracking-wider">Row spacing</p>
                    <NumberField label="Outer X" value={selectedRow.outerPaddingX} onChange={(v) => selected && updateRowSpacing(selected.rowId, { outerPaddingX: v })} max={200} />
                    <NumberField label="Outer Y" value={selectedRow.outerPaddingY} onChange={(v) => selected && updateRowSpacing(selected.rowId, { outerPaddingY: v })} max={200} />
                    {selectedRow.columns.length > 1 && (
                      <NumberField label="Col gap" value={selectedRow.columnGap} onChange={(v) => selected && updateRowSpacing(selected.rowId, { columnGap: v })} max={60} />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'a11y' && <A11yTab />}

        {tab === 'compatibility' && <CompatibilityTab />}
      </div>
    </div>
  );
}
