'use client';

import { useState } from 'react';
import {
  ArrowLeft, Search, Layout, Sparkles, Zap, AlignLeft, Image as ImageIcon, Minus,
  Grid3X3, Quote, Share2, ChevronsDown, Code2, ArrowUpDown, MousePointerClick,
  List, Columns2, LayoutGrid, Megaphone, ShoppingBag, BarChart3, Layers, Newspaper,
} from 'lucide-react';
import { useEmailStore } from '@/store/email-store';
import { SECTION_TEMPLATES } from '@/lib/section-templates';
import type { SectionType } from '@/lib/types';
import type { SectionTemplate } from '@/lib/section-templates';

type Category = 'sections' | 'elements' | 'layouts';

interface SectionCard {
  type: SectionType;
  label: string;
  icon: React.ElementType;
}

interface LayoutCard {
  columns: 2 | 3 | 4;
  label: string;
  description: string;
  icon: React.ElementType;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Columns2, BarChart3, Layers, Newspaper, Megaphone, ShoppingBag,
};

const SECTION_CARDS: SectionCard[] = [
  { type: 'header',       label: 'Header',       icon: Layout },
  { type: 'hero',         label: 'Hero',          icon: Sparkles },
  { type: 'features',     label: 'Features',      icon: Grid3X3 },
  { type: 'testimonial',  label: 'Testimonial',   icon: Quote },
  { type: 'social',       label: 'Social Links',  icon: Share2 },
  { type: 'footer',       label: 'Footer',        icon: ChevronsDown },
  { type: 'html',         label: 'Custom HTML',   icon: Code2 },
  { type: 'announcement', label: 'Announcement',  icon: Megaphone },
  { type: 'product-card', label: 'Product Card',  icon: ShoppingBag },
];

const ELEMENT_CARDS: SectionCard[] = [
  { type: 'text',       label: 'Text Block',  icon: AlignLeft },
  { type: 'image',      label: 'Image',       icon: ImageIcon },
  { type: 'cta',        label: 'CTA',         icon: Zap },
  { type: 'button-row', label: 'Button',      icon: MousePointerClick },
  { type: 'divider',    label: 'Divider',     icon: Minus },
  { type: 'spacer',     label: 'Spacer',      icon: ArrowUpDown },
  { type: 'list',       label: 'List',        icon: List },
];

const LAYOUT_CARDS: LayoutCard[] = [
  { columns: 2, label: '2 Columns', description: 'Side-by-side equal columns',  icon: Columns2 },
  { columns: 3, label: '3 Columns', description: 'Three equal-width columns',   icon: LayoutGrid },
  { columns: 4, label: '4 Columns', description: 'Four narrow equal columns',   icon: LayoutGrid },
];

export type BrowserMode =
  | { kind: 'add-row' }
  | { kind: 'fill-slot'; rowId: string; colIdx: number }
  | { kind: 'add-column'; rowId: string };

interface Props {
  mode: BrowserMode;
  onClose: () => void;
}

export function ComponentBrowser({ mode, onClose }: Props) {
  const { addRow, addLayoutRow, setColumnType, addColumnToRow, insertSectionTemplate } = useEmailStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('sections');

  const showLayouts = mode.kind === 'add-row';

  const handleSection = (type: SectionType) => {
    if (mode.kind === 'add-row') {
      addRow(type);
    } else if (mode.kind === 'fill-slot') {
      setColumnType(mode.rowId, mode.colIdx, type);
    } else if (mode.kind === 'add-column') {
      addColumnToRow(mode.rowId, type);
    }
    onClose();
  };

  const handleLayout = (columns: 2 | 3 | 4) => {
    addLayoutRow(columns);
    onClose();
  };

  const handleTemplate = (template: SectionTemplate) => {
    insertSectionTemplate(template);
    onClose();
  };

  const q = search.toLowerCase();
  const filteredSections = SECTION_CARDS.filter((c) => !q || c.label.toLowerCase().includes(q));
  const filteredElements = ELEMENT_CARDS.filter((c) => !q || c.label.toLowerCase().includes(q));
  const filteredLayouts = LAYOUT_CARDS.filter((c) => !q || c.label.toLowerCase().includes(q));
  const filteredTemplates = showLayouts
    ? SECTION_TEMPLATES.filter((t) => !q || t.name.toLowerCase().includes(q))
    : [];

  const categoryTabs: { id: Category; label: string }[] = [
    { id: 'sections', label: 'Sections' },
    { id: 'elements', label: 'Elements' },
    ...(showLayouts ? [{ id: 'layouts' as Category, label: 'Layouts' }] : []),
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2a2a2e] flex-shrink-0">
        <button
          onClick={onClose}
          className="p-1 rounded text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-semibold text-[#f4f4f5]">
          {mode.kind === 'add-row' ? 'Add Section' : mode.kind === 'fill-slot' ? 'Choose Content' : 'Add Column'}
        </span>
      </div>

      {/* Search */}
      <div className="px-2 py-2 border-b border-[#2a2a2e] flex-shrink-0">
        <div className="flex items-center gap-1.5 bg-[#0f0f11] border border-[#2a2a2e] rounded-lg px-2 py-1.5">
          <Search className="w-3 h-3 text-[#3a3a3e] flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="flex-1 text-xs bg-transparent text-[#f4f4f5] focus:outline-none placeholder:text-[#3a3a3e]"
            autoFocus
          />
        </div>
      </div>

      {/* Category tabs — only when not searching */}
      {!search && (
        <div className="flex border-b border-[#2a2a2e] flex-shrink-0">
          {categoryTabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className={`flex-1 py-1.5 text-[10px] font-semibold transition-colors ${
                category === id
                  ? 'text-[#f4f4f5] border-b-2 border-[#6366f1]'
                  : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Card grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {search ? (
          <div className="space-y-3">
            {filteredSections.length > 0 && (
              <>
                <p className="text-[9px] font-semibold text-[#3a3a3e] uppercase tracking-wider px-1">Sections</p>
                <CardGrid cards={filteredSections} onSelect={handleSection} />
              </>
            )}
            {filteredElements.length > 0 && (
              <>
                <p className="text-[9px] font-semibold text-[#3a3a3e] uppercase tracking-wider px-1 mt-2">Elements</p>
                <CardGrid cards={filteredElements} onSelect={handleSection} />
              </>
            )}
            {showLayouts && filteredLayouts.length > 0 && (
              <>
                <p className="text-[9px] font-semibold text-[#3a3a3e] uppercase tracking-wider px-1 mt-2">Layouts</p>
                <div className="space-y-1.5">
                  {filteredLayouts.map((l) => (
                    <LayoutCardItem key={l.columns} card={l} onSelect={handleLayout} />
                  ))}
                </div>
              </>
            )}
            {showLayouts && filteredTemplates.length > 0 && (
              <>
                <p className="text-[9px] font-semibold text-[#3a3a3e] uppercase tracking-wider px-1 mt-2">Templates</p>
                <div className="space-y-1.5">
                  {filteredTemplates.map((t) => (
                    <TemplateCardItem key={t.id} template={t} onSelect={handleTemplate} />
                  ))}
                </div>
              </>
            )}
            {filteredSections.length === 0 && filteredElements.length === 0 && filteredLayouts.length === 0 && filteredTemplates.length === 0 && (
              <p className="text-xs text-[#71717a] text-center py-6">No results for &ldquo;{search}&rdquo;</p>
            )}
          </div>
        ) : category === 'sections' ? (
          <>
            <CardGrid cards={SECTION_CARDS} onSelect={handleSection} />
            {showLayouts && SECTION_TEMPLATES.length > 0 && (
              <>
                <p className="text-[9px] font-semibold text-[#3a3a3e] uppercase tracking-wider px-1 mt-4 mb-2">Templates</p>
                <div className="space-y-1.5">
                  {SECTION_TEMPLATES.map((t) => (
                    <TemplateCardItem key={t.id} template={t} onSelect={handleTemplate} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : category === 'elements' ? (
          <CardGrid cards={ELEMENT_CARDS} onSelect={handleSection} />
        ) : (
          <div className="space-y-1.5">
            {LAYOUT_CARDS.map((l) => (
              <LayoutCardItem key={l.columns} card={l} onSelect={handleLayout} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CardGrid({ cards, onSelect }: { cards: SectionCard[]; onSelect: (type: SectionType) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.type}
            onClick={() => onSelect(card.type)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#1c1c1f] border border-[#2a2a2e] hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 transition-all group text-center"
          >
            <div className="w-8 h-8 rounded-lg bg-[#161618] border border-[#2a2a2e] group-hover:border-[#6366f1]/30 flex items-center justify-center transition-colors">
              <Icon className="w-4 h-4 text-[#6366f1]" />
            </div>
            <span className="text-[10px] font-medium text-[#a1a1aa] group-hover:text-[#f4f4f5] leading-tight transition-colors">{card.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function LayoutCardItem({ card, onSelect }: { card: LayoutCard; onSelect: (columns: 2 | 3 | 4) => void }) {
  const Icon = card.icon;
  return (
    <button
      onClick={() => onSelect(card.columns)}
      className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#1c1c1f] border border-[#2a2a2e] hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 transition-all group text-left"
    >
      <div className="w-8 h-8 rounded-lg bg-[#161618] border border-[#2a2a2e] group-hover:border-[#6366f1]/30 flex items-center justify-center flex-shrink-0 transition-colors">
        <Icon className="w-4 h-4 text-[#6366f1]" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-[#f4f4f5] leading-tight">{card.label}</p>
        <p className="text-[9px] text-[#71717a] leading-tight mt-0.5">{card.description}</p>
      </div>
    </button>
  );
}

function TemplateCardItem({ template, onSelect }: { template: SectionTemplate; onSelect: (t: SectionTemplate) => void }) {
  const Icon = ICON_MAP[template.icon] ?? Sparkles;
  return (
    <button
      onClick={() => onSelect(template)}
      className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#1c1c1f] border border-[#2a2a2e] hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 transition-all group text-left"
    >
      <div className="w-8 h-8 rounded-lg bg-[#161618] border border-[#2a2a2e] group-hover:border-[#6366f1]/30 flex items-center justify-center flex-shrink-0 transition-colors">
        <Icon className="w-4 h-4 text-[#6366f1]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-[11px] font-semibold text-[#f4f4f5] leading-tight truncate">{template.name}</p>
          <span className="text-[9px] bg-[#6366f1]/15 text-[#818cf8] px-1.5 py-0.5 rounded border border-[#6366f1]/20 flex-shrink-0">
            {template.rowCount}r
          </span>
        </div>
        <p className="text-[9px] text-[#71717a] leading-tight truncate">{template.description}</p>
      </div>
    </button>
  );
}
