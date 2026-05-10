'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, Layers, X, ChevronRight } from 'lucide-react';
import { TEMPLATES, MAIN_CATEGORY_DEFS, getSubCategoryLabel } from '@/lib/templates';
import { getTemplateAccess, getTemplateCollection, isFeaturedTemplate } from '@/lib/template-marketplace';
import { assembleCleanHTML, sectionsToRows } from '@/lib/email-utils';
import { useEmailStore } from '@/store/email-store';
import { canUsePremiumTemplates } from '@/lib/plans';
import type { MainCategory, EmailTemplate } from '@/lib/templates';
import type { SubscriptionPlan } from '@/lib/supabase/database.types';

function TemplatePreview({ template }: { template: EmailTemplate }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    const html = assembleCleanHTML(sectionsToRows(template.sections), 'light');
    const doc = frame.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [template]);

  return (
    <div className="relative w-full overflow-hidden rounded-t-lg" style={{ height: 200 }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ transformOrigin: 'top left', transform: 'scale(0.333)', width: '300%', height: '300%' }}
      >
        <iframe
          ref={iframeRef}
          title={`Preview: ${template.name}`}
          sandbox="allow-same-origin"
          style={{ width: '100%', height: '600px', border: 'none', display: 'block' }}
        />
      </div>
    </div>
  );
}

function TemplateLargePreview({ template }: { template: EmailTemplate }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    const html = assembleCleanHTML(sectionsToRows(template.sections), 'light');
    const doc = frame.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [template]);

  return (
    <iframe
      ref={iframeRef}
      title={`Full preview: ${template.name}`}
      sandbox="allow-same-origin"
      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
    />
  );
}

function PreviewModal({ template, onClose, onUse }: {
  template: EmailTemplate;
  onClose: () => void;
  onUse: () => void;
}) {
  const mainDef = MAIN_CATEGORY_DEFS.find((c) => c.id === template.mainCategory);
  const subLabel = getSubCategoryLabel(template.mainCategory, template.subCategory);
  const access = getTemplateAccess(template);
  const collection = getTemplateCollection(template);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <div
        className="relative bg-[#161618] border border-[#2a2a2e] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: 680, height: '88vh', maxHeight: 800 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2a2a2e] flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-semibold text-[#f4f4f5]">{template.name}</p>
              {mainDef && (
                <span
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ color: mainDef.color, backgroundColor: `${mainDef.color}18` }}
                >
                  {subLabel}
                </span>
              )}
              {access === 'premium' && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded text-[#f59e0b] bg-[#f59e0b]/10">
                  Premium
                </span>
              )}
              {collection && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded text-[#10b981] bg-[#10b981]/10">
                  {collection}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#71717a]">{template.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onUse}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6366f1] text-xs text-white font-semibold hover:bg-[#818cf8] transition-colors"
            >
              Use template
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#e8eaf0]">
          <TemplateLargePreview template={template} />
        </div>
      </div>
    </div>
  );
}

export function TemplateGallery() {
  const router = useRouter();
  const { loadTemplate } = useEmailStore();
  const [activeMain, setActiveMain] = useState<MainCategory | 'all'>('all');
  const [activeSub, setActiveSub] = useState<string>('all');
  const [activeShelf, setActiveShelf] = useState<'all' | 'featured' | 'premium'>('all');
  const [plan, setPlan] = useState<SubscriptionPlan>('free');
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    fetch('/api/subscription')
      .then((response) => response.json())
      .then((data: { plan?: SubscriptionPlan }) => setPlan(data.plan ?? 'free'))
      .catch(() => undefined);
  }, []);

  const handleSetMain = (cat: MainCategory | 'all') => {
    setActiveMain(cat);
    setActiveSub('all');
  };

  const activeDef = activeMain !== 'all'
    ? MAIN_CATEGORY_DEFS.find((c) => c.id === activeMain)
    : null;

  const filtered = TEMPLATES.filter((t) => {
    const mainMatch = activeMain === 'all' || t.mainCategory === activeMain;
    const subMatch = activeSub === 'all' || t.subCategory === activeSub;
    const shelfMatch =
      activeShelf === 'all' ||
      (activeShelf === 'featured' && isFeaturedTemplate(t)) ||
      (activeShelf === 'premium' && getTemplateAccess(t) === 'premium');
    return mainMatch && subMatch && shelfMatch;
  });

  const handleUseTemplate = (template: EmailTemplate) => {
    if (getTemplateAccess(template) === 'premium' && !canUsePremiumTemplates(plan)) {
      router.push('/billing');
      return;
    }
    loadTemplate(template);
    router.push('/builder');
  };

  return (
    <div className="h-full bg-[#0f0f11] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#2a2a2e] px-8 h-14 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-[#71717a] hover:text-[#a1a1aa] transition-colors text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <div className="w-px h-4 bg-[#2a2a2e]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#6366f1] flex items-center justify-center">
              <Mail className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[#f4f4f5] tracking-tight text-sm">Wizemail</span>
          </div>
          <div className="w-px h-4 bg-[#2a2a2e]" />
          <div className="flex items-center gap-1.5 text-sm text-[#a1a1aa]">
            <Layers className="w-3.5 h-3.5" />
            Templates
          </div>
        </div>
        <Link
          href="/builder"
          className="px-3 py-1.5 rounded-lg bg-[#161618] border border-[#2a2a2e] text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3a3a3e] transition-colors"
        >
          Open builder →
        </Link>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#f4f4f5] tracking-tight mb-1">Email Templates</h1>
            <p className="text-[#71717a] text-sm">
              {TEMPLATES.length} templates across {MAIN_CATEGORY_DEFS.length} categories. Click any template to preview it, then use it as a starting point.
            </p>
          </div>

          {/* Main category tabs — wrap naturally */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {([
              { id: 'all', label: 'All curated' },
              { id: 'featured', label: 'Featured' },
              { id: 'premium', label: 'Premium' },
            ] as const).map((shelf) => (
              <button
                key={shelf.id}
                onClick={() => setActiveShelf(shelf.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeShelf === shelf.id
                    ? 'bg-[#222226] text-[#f4f4f5] border border-[#3a3a3e]'
                    : 'bg-[#161618] border border-[#2a2a2e] text-[#71717a] hover:text-[#a1a1aa]'
                }`}
              >
                {shelf.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              onClick={() => handleSetMain('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeMain === 'all'
                  ? 'bg-[#6366f1] text-white'
                  : 'bg-[#161618] border border-[#2a2a2e] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#3a3a3e]'
              }`}
            >
              All templates
              <span className="ml-1.5 text-[10px] opacity-60">{TEMPLATES.length}</span>
            </button>
            {MAIN_CATEGORY_DEFS.map((cat) => {
              const count = TEMPLATES.filter((t) => t.mainCategory === cat.id).length;
              const isActive = activeMain === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSetMain(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    isActive
                      ? 'text-white border-transparent'
                      : 'bg-[#161618] border-[#2a2a2e] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#3a3a3e]'
                  }`}
                  style={isActive ? { backgroundColor: cat.color, borderColor: cat.color } : undefined}
                >
                  {cat.label}
                  <span className="ml-1.5 text-[10px] opacity-60">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Subcategory pills — wrap naturally */}
          {activeDef ? (
            <div className="flex flex-wrap items-center gap-1.5 mb-6">
              <button
                onClick={() => setActiveSub('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  activeSub === 'all' ? '' : 'bg-[#161618] text-[#71717a] hover:text-[#a1a1aa]'
                }`}
                style={
                  activeSub === 'all'
                    ? { backgroundColor: `${activeDef.color}18`, color: activeDef.color, outline: `1px solid ${activeDef.color}35` }
                    : { outline: '1px solid #2a2a2e' }
                }
              >
                All
              </button>
              {activeDef.subCategories.map((sub) => {
                const isActive = activeSub === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSub(sub.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      isActive ? '' : 'bg-[#161618] text-[#71717a] hover:text-[#a1a1aa]'
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: `${activeDef.color}18`, color: activeDef.color, outline: `1px solid ${activeDef.color}35` }
                        : { outline: '1px solid #2a2a2e' }
                    }
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mb-6" />
          )}

          {/* Template grid */}
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center py-24 text-center">
              <p className="text-sm text-[#3a3a3e]">No templates found for this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map((template) => {
                const mainDef = MAIN_CATEGORY_DEFS.find((c) => c.id === template.mainCategory);
                const subLabel = getSubCategoryLabel(template.mainCategory, template.subCategory);
                const access = getTemplateAccess(template);
                const locked = access === 'premium' && !canUsePremiumTemplates(plan);
                return (
                  <div
                    key={template.id}
                    onClick={() => setPreviewTemplate(template)}
                    className="group flex flex-col rounded-xl bg-[#161618] border border-[#2a2a2e] hover:border-[#6366f1]/40 overflow-hidden transition-all duration-150 hover:shadow-xl hover:shadow-black/30 cursor-pointer"
                  >
                    {/* Preview thumbnail */}
                    <div className="relative overflow-hidden bg-[#e8eaf0] border-b border-[#2a2a2e]">
                      <TemplatePreview template={template} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-150 flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-3 py-1.5 rounded-lg bg-white text-[#111111] text-xs font-semibold shadow-lg">
                          Preview
                        </span>
                      </div>
                    </div>

                    {/* Card info */}
                    <div className="p-3.5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold text-[#f4f4f5] leading-tight">{template.name}</p>
                        {mainDef && (
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 whitespace-nowrap"
                            style={{ color: mainDef.color, backgroundColor: `${mainDef.color}18` }}
                          >
                            {subLabel}
                          </span>
                        )}
                        {access === 'premium' && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 text-[#f59e0b] bg-[#f59e0b]/10">
                            {locked ? 'Pro' : 'Premium'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#71717a] leading-relaxed flex-1">{template.description}</p>
                      <p className="text-[10px] text-[#3a3a3e] mt-2 group-hover:text-[#6366f1]/60 transition-colors">
                        {template.sections.length} sections · click to preview
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Full preview modal */}
      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={() => handleUseTemplate(previewTemplate)}
        />
      )}
    </div>
  );
}
