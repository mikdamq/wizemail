'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  DndContext, closestCenter, DragEndEvent,
  useSensor, useSensors, PointerSensor,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, rectSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, Trash2, Copy, Plus, X, Layout, Info, Palette, Bookmark,
} from 'lucide-react';
import { toast } from 'sonner';
import { useEmailStore } from '@/store/email-store';
import { getSectionLabel } from '@/lib/sections';
import { ComponentBrowser, type BrowserMode } from '@/components/builder/ComponentBrowser';
import { saveBlock, getSavedBlocks, deleteBlock } from '@/lib/storage';
import { listCloudBrandKits, saveCloudBrandKit, type SavedBrandKit } from '@/lib/cloud-brand-kits';
import type { EmailColumn, EmailRow, SectionType, SavedBlock } from '@/lib/types';

/* ─── Details Panel ─────────────────────────────────────── */

function DetailsPanel() {
  const { emailDetails, updateEmailDetails } = useEmailStore();

  const field = (label: string, key: keyof typeof emailDetails, placeholder: string, type = 'text') => (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-[#71717a] uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={emailDetails[key]}
        onChange={(e) => updateEmailDetails({ [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full bg-[#1c1c1f] border border-[#2a2a2e] rounded-md px-2.5 py-1.5 text-xs text-[#f4f4f5] placeholder-[#3a3a3e] focus:outline-none focus:border-[#6366f1]/60 transition-colors"
      />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      {field('Subject Line', 'subject', 'Enter email subject…')}
      {field('Preview Text', 'previewText', 'Brief preview shown in inbox…')}
      <div className="border-t border-[#2a2a2e] pt-3 space-y-3">
        <p className="text-[10px] font-medium text-[#71717a] uppercase tracking-wider">Sender Info</p>
        {field('Sender Name', 'senderName', 'Your Company')}
        {field('Sender Email', 'senderEmail', 'hello@company.com', 'email')}
        {field('Reply-To', 'replyTo', 'reply@company.com', 'email')}
      </div>
      <div className="rounded-lg bg-[#6366f1]/5 border border-[#6366f1]/15 px-3 py-2">
        <p className="text-[10px] text-[#818cf8] leading-relaxed">Subject, preview text, and sender details appear in email client headers and inbox previews.</p>
      </div>
    </div>
  );
}

/* ─── Brand Kit Panel ───────────────────────────────────── */

function BrandKitPanel() {
  const { brandKit, updateBrandKit } = useEmailStore();
  const [savedKits, setSavedKits] = useState<SavedBrandKit[]>([]);
  const [previewKit, setPreviewKit] = useState<SavedBrandKit | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listCloudBrandKits().then(setSavedKits).catch(() => undefined);
  }, []);

  const handleSaveKit = async () => {
    setSaving(true);
    const saved = await saveCloudBrandKit(brandKit.logoText || 'Brand kit', brandKit);
    setSaving(false);
    if (saved) {
      setSavedKits((kits) => [saved, ...kits.filter((kit) => kit.id !== saved.id)]);
    }
  };

  const colorField = (label: string, key: keyof typeof brandKit) => (
    <div className="flex items-center justify-between gap-3">
      <label className="text-[11px] text-[#71717a] flex-1">{label}</label>
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded border border-[#2a2a2e] overflow-hidden flex-shrink-0">
          <input
            type="color"
            value={typeof brandKit[key] === 'string' ? (brandKit[key] as string) : '#000000'}
            onChange={(e) => updateBrandKit({ [key]: e.target.value })}
            className="w-6 h-6 -translate-x-0.5 -translate-y-0.5 cursor-pointer border-0 p-0 bg-transparent"
          />
        </div>
        <input
          type="text"
          value={typeof brandKit[key] === 'string' ? (brandKit[key] as string) : ''}
          onChange={(e) => updateBrandKit({ [key]: e.target.value })}
          className="w-20 text-[11px] font-mono bg-[#0f0f11] border border-[#2a2a2e] rounded px-1.5 py-0.5 text-[#a1a1aa] focus:outline-none focus:border-[#6366f1] transition-colors"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  const FONT_OPTIONS = [
    { value: 'system', label: 'System UI' },
    { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet' },
    { value: "'Times New Roman', serif", label: 'Times New Roman' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      <div className="rounded-lg bg-[#6366f1]/5 border border-[#6366f1]/15 px-3 py-2 mb-3">
        <p className="text-[10px] text-[#818cf8] leading-relaxed">Brand kit colors auto-apply to new sections you add.</p>
      </div>
      <button
        onClick={handleSaveKit}
        disabled={saving}
        className="w-full rounded-lg bg-[#222226] border border-[#2a2a2e] px-3 py-2 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3a3a3e] disabled:opacity-60 transition-colors"
      >
        {saving ? 'Saving...' : 'Save brand kit to cloud'}
      </button>
      {savedKits.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-[#71717a] uppercase tracking-wider">Saved kits</p>
          {savedKits.slice(0, 4).map((kit) => (
            <div key={kit.id} className="rounded-lg border border-[#2a2a2e] bg-[#1c1c1f] p-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  onMouseEnter={() => setPreviewKit(kit)}
                  onMouseLeave={() => setPreviewKit(null)}
                  onFocus={() => setPreviewKit(kit)}
                  onBlur={() => setPreviewKit(null)}
                  onClick={() => updateBrandKit(kit.kit)}
                  className="flex-1 text-left"
                >
                  <p className="text-[11px] font-semibold text-[#f4f4f5] truncate">{kit.name}</p>
                  <div className="mt-1 flex gap-1">
                    {[kit.kit.primaryColor, kit.kit.secondaryColor, kit.kit.backgroundColor, kit.kit.textColor].map((color, index) => (
                      <span key={`${kit.id}-${index}`} className="h-3 w-5 rounded border border-[#2a2a2e]" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </button>
                <button
                  onClick={() => updateBrandKit(kit.kit)}
                  className="px-2 py-1 rounded bg-[#6366f1]/10 text-[#818cf8] text-[10px] hover:bg-[#6366f1]/20 transition-colors"
                >
                  Apply
                </button>
              </div>
              {previewKit?.id === kit.id && (
                <div className="mt-2 rounded-md border border-[#2a2a2e] p-2" style={{ backgroundColor: kit.kit.backgroundColor }}>
                  <p className="text-[10px] font-semibold" style={{ color: kit.kit.textColor }}>{kit.kit.logoText || kit.name}</p>
                  <span className="mt-1 inline-block rounded px-2 py-1 text-[9px]" style={{ backgroundColor: kit.kit.primaryColor, color: '#ffffff' }}>
                    Button style
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-[10px] font-medium text-[#71717a] uppercase tracking-wider">Colors</p>
      </div>
      <div className="space-y-3">
        {colorField('Primary (buttons)', 'primaryColor')}
        {colorField('Secondary (dark BG)', 'secondaryColor')}
        {colorField('Background', 'backgroundColor')}
        {colorField('Text', 'textColor')}
      </div>
      <div className="border-t border-[#2a2a2e] pt-3 space-y-3">
        <p className="text-[10px] font-medium text-[#71717a] uppercase tracking-wider">Identity</p>
        <div className="space-y-1">
          <label className="text-[11px] text-[#71717a]">Logo / company name</label>
          <input
            type="text"
            value={brandKit.logoText}
            onChange={(e) => updateBrandKit({ logoText: e.target.value })}
            placeholder="Acme Inc."
            className="w-full bg-[#1c1c1f] border border-[#2a2a2e] rounded-md px-2.5 py-1.5 text-xs text-[#f4f4f5] placeholder-[#3a3a3e] focus:outline-none focus:border-[#6366f1]/60 transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-[#71717a]">Default font</label>
          <select
            value={brandKit.fontFamily}
            onChange={(e) => updateBrandKit({ fontFamily: e.target.value })}
            className="w-full bg-[#1c1c1f] border border-[#2a2a2e] rounded-md px-2.5 py-1.5 text-xs text-[#f4f4f5] focus:outline-none focus:border-[#6366f1]/60 transition-colors"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

/* ─── Saved Blocks Panel ─────────────────────────────────── */

function SavedBlocksPanel({ onClose }: { onClose: () => void }) {
  const { insertSectionTemplate } = useEmailStore();
  const [blocks, setBlocks] = useState<SavedBlock[]>([]);

  useEffect(() => {
    setBlocks(getSavedBlocks());
  }, []);

  const handleInsert = (block: SavedBlock) => {
    insertSectionTemplate({ id: block.id, name: block.name, description: '', icon: 'Layers', rowCount: 1, rows: [{ columns: block.row.columns.map(c => ({ type: c.type, content: c.content })) }] });
    onClose();
    toast('Block inserted');
  };

  const handleDelete = (id: string) => {
    deleteBlock(id);
    setBlocks(getSavedBlocks());
    toast('Block deleted');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2a2a2e] flex-shrink-0">
        <button onClick={onClose} className="p-1 rounded text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-semibold text-[#f4f4f5]">Saved Blocks</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-center px-4">
            <Bookmark className="w-5 h-5 text-[#3a3a3e] mb-2" />
            <p className="text-xs text-[#71717a]">No saved blocks yet</p>
            <p className="text-[10px] text-[#3a3a3e] mt-1">Click the bookmark icon on any row to save it</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {blocks.map((block) => (
              <div key={block.id} className="group flex items-center gap-2 p-2.5 rounded-lg bg-[#1c1c1f] border border-[#2a2a2e] hover:border-[#3a3a3e] transition-colors">
                <button
                  onClick={() => handleInsert(block)}
                  className="flex-1 text-left"
                >
                  <p className="text-[11px] font-semibold text-[#f4f4f5] truncate">{block.name}</p>
                  <p className="text-[9px] text-[#71717a] mt-0.5">{block.row.columns.length} col{block.row.columns.length !== 1 ? 's' : ''}</p>
                </button>
                <button
                  onClick={() => handleDelete(block.id)}
                  className="p-1 rounded text-[#3a3a3e] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sortable Column Chip ──────────────────────────────── */

function SortableColumnChip({
  col,
  isSelected,
  canRemove,
  rowId,
  colIdx,
  onFill,
}: {
  col: EmailColumn;
  isSelected: boolean;
  canRemove: boolean;
  rowId: string;
  colIdx: number;
  onFill?: () => void;
}) {
  const { selectColumn, removeColumnFromRow } = useEmailStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: col.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  if (col.type === 'empty') {
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <button
          onClick={onFill}
          className="group flex items-center gap-1 px-1.5 py-1 rounded-md border border-dashed border-[#3a3a3e] text-[#3a3a3e] hover:border-[#6366f1]/50 hover:text-[#6366f1] hover:bg-[#6366f1]/5 transition-all text-[10px] min-w-[56px] justify-center"
        >
          <Plus className="w-2.5 h-2.5" />
          <span>empty</span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => { e.stopPropagation(); selectColumn(rowId, colIdx); }}
      className={`group relative flex items-center gap-1 px-1.5 py-1 rounded-md border cursor-grab active:cursor-grabbing touch-none transition-all text-[10px] min-w-[48px] max-w-[80px] ${
        isSelected
          ? 'bg-[#6366f1]/15 border-[#6366f1]/40 text-[#818cf8]'
          : 'bg-[#1c1c1f] border-[#2a2a2e] text-[#a1a1aa] hover:border-[#3a3a3e] hover:text-[#f4f4f5]'
      }`}
    >
      <span className="truncate font-medium leading-tight">{getSectionLabel(col.type)}</span>
      {canRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); removeColumnFromRow(rowId, colIdx); }}
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#2a2a2e] border border-[#3a3a3e] text-[#71717a] hover:text-red-400 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex"
        >
          <X className="w-2 h-2" />
        </button>
      )}
    </div>
  );
}

/* ─── Sortable Row Item ──────────────────────────────────── */

function SortableRowItem({
  row,
  onOpenBrowser,
  onSaveBlock,
}: {
  row: EmailRow;
  onOpenBrowser: (mode: BrowserMode) => void;
  onSaveBlock: (row: EmailRow) => void;
}) {
  const { selected, removeRow, duplicateRow, addColumnToRow, reorderColumnsInRow } = useEmailStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });

  const isSingleCol = row.columns.length === 1;

  // Inner sensors for column reordering — separate from row-level sensors
  const colSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleColDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = row.columns.findIndex((c) => c.id === active.id);
      const newIdx = row.columns.findIndex((c) => c.id === over.id);
      if (oldIdx !== -1 && newIdx !== -1) {
        reorderColumnsInRow(row.id, oldIdx, newIdx);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="group rounded-lg border border-[#2a2a2e] bg-[#1c1c1f] hover:border-[#3a3a3e] transition-colors"
    >
      <div className="flex items-center gap-1.5 px-1.5 py-1.5">
        {/* Row drag handle — only this element gets row-level listeners */}
        <div
          {...attributes}
          {...listeners}
          className="text-[#2a2a2e] hover:text-[#71717a] cursor-grab active:cursor-grabbing transition-colors flex-shrink-0 touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3 h-3" />
        </div>

        {/* Column chips with inner DnD for reordering */}
        <DndContext sensors={colSensors} collisionDetection={closestCenter} onDragEnd={handleColDragEnd}>
          <SortableContext items={row.columns.map((c) => c.id)} strategy={rectSortingStrategy}>
            <div className="flex items-center gap-1 flex-1 min-w-0 flex-wrap">
              {row.columns.map((col, colIdx) => {
                const isSelected = selected?.rowId === row.id && selected.colIdx === colIdx;
                return (
                  <SortableColumnChip
                    key={col.id}
                    col={col}
                    isSelected={isSelected}
                    canRemove={!isSingleCol}
                    rowId={row.id}
                    colIdx={colIdx}
                    onFill={() => onOpenBrowser({ kind: 'fill-slot', rowId: row.id, colIdx })}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {/* Row actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => addColumnToRow(row.id)}
            className="p-1 rounded text-[#3a3a3e] hover:text-[#6366f1] hover:bg-[#6366f1]/10 transition-colors"
            title="Add column"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              duplicateRow(row.id);
              toast('Row duplicated', { icon: '📋' });
            }}
            className="p-1 rounded text-[#3a3a3e] hover:text-[#f4f4f5] hover:bg-[#2a2a2e] transition-colors"
            title="Duplicate row"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={() => onSaveBlock(row)}
            className="p-1 rounded text-[#3a3a3e] hover:text-[#818cf8] hover:bg-[#2a2a2e] transition-colors"
            title="Save as reusable block"
          >
            <Bookmark className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              removeRow(row.id);
              toast('Row removed', { description: 'Section deleted from email', icon: '🗑️' });
            }}
            className="p-1 rounded text-[#3a3a3e] hover:text-red-400 hover:bg-[#2a2a2e] transition-colors"
            title="Delete row"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── LeftSidebar ────────────────────────────────────────── */

export function LeftSidebar() {
  const { rows, reorderRows } = useEmailStore();
  const [activeTab, setActiveTab] = useState<'structure' | 'details' | 'brand'>('structure');
  const [browserMode, setBrowserMode] = useState<BrowserMode | null>(null);
  const [showBlocks, setShowBlocks] = useState(false);
  const [saveBlockName, setSaveBlockName] = useState('');
  const [pendingBlock, setPendingBlock] = useState<EmailRow | null>(null);

  const handleSaveBlock = (row: EmailRow) => {
    const label = row.columns.map(c => getSectionLabel(c.type)).join(' + ');
    setSaveBlockName(label);
    setPendingBlock(row);
  };

  const confirmSaveBlock = () => {
    if (!pendingBlock) return;
    saveBlock(saveBlockName.trim() || 'My Block', pendingBlock);
    setPendingBlock(null);
    setSaveBlockName('');
    toast('Block saved', { description: 'Available in Saved Blocks', icon: '🔖' });
  };
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window === 'undefined') return 256;
    const saved = localStorage.getItem('wizemail_sidebar_width');
    return saved ? Math.min(400, Math.max(160, Number(saved))) : 256;
  });
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(256);

  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem('wizemail_sidebar_width', String(sidebarWidth));
    }, 300);
    return () => clearTimeout(t);
  }, [sidebarWidth]);

  const handleResizeStart = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = sidebarWidth;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleResizeMove = useCallback((e: PointerEvent) => {
    if (!dragging.current) return;
    const delta = e.clientX - startX.current;
    setSidebarWidth(Math.min(400, Math.max(160, startW.current + delta)));
  }, []);

  const handleResizeEnd = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handleResizeMove);
    window.addEventListener('pointerup', handleResizeEnd);
    return () => {
      window.removeEventListener('pointermove', handleResizeMove);
      window.removeEventListener('pointerup', handleResizeEnd);
    };
  }, [handleResizeMove, handleResizeEnd]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = rows.findIndex((r) => r.id === active.id);
      const newIndex = rows.findIndex((r) => r.id === over.id);
      reorderRows(oldIndex, newIndex);
      toast('Rows reordered', { icon: '↕️' });
    }
  };

  if (browserMode !== null) {
    return (
      <div className="flex-shrink-0 bg-[#161618] border-r border-[#2a2a2e] flex flex-col overflow-hidden relative" style={{ width: sidebarWidth }}>
        <ComponentBrowser
          mode={browserMode}
          onClose={() => setBrowserMode(null)}
        />
        <div
          onPointerDown={handleResizeStart}
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#6366f1]/40 transition-colors z-10"
        />
      </div>
    );
  }

  if (showBlocks) {
    return (
      <div className="flex-shrink-0 bg-[#161618] border-r border-[#2a2a2e] flex flex-col overflow-hidden relative" style={{ width: sidebarWidth }}>
        <SavedBlocksPanel onClose={() => setShowBlocks(false)} />
        <div onPointerDown={handleResizeStart} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#6366f1]/40 transition-colors z-10" />
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 bg-[#161618] border-r border-[#2a2a2e] flex flex-col overflow-hidden relative" style={{ width: sidebarWidth }}>
      {/* Tabs */}
      <div className="flex border-b border-[#2a2a2e] flex-shrink-0">
        {([
          { id: 'structure', icon: Layout, label: 'Structure' },
          { id: 'details', icon: Info, label: 'Details' },
          { id: 'brand', icon: Palette, label: 'Brand' },
        ] as { id: 'structure' | 'details' | 'brand'; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors ${
              activeTab === id ? 'text-[#f4f4f5] border-b-2 border-[#6366f1]' : 'text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Save block name dialog */}
      {pendingBlock && (
        <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1f] border border-[#2a2a2e] rounded-xl p-4 w-full shadow-2xl">
            <p className="text-xs font-semibold text-[#f4f4f5] mb-1">Save as block</p>
            <input
              autoFocus
              value={saveBlockName}
              onChange={(e) => setSaveBlockName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmSaveBlock(); if (e.key === 'Escape') setPendingBlock(null); }}
              placeholder="Block name…"
              className="w-full bg-[#0f0f11] border border-[#2a2a2e] rounded-lg px-2.5 py-1.5 text-xs text-[#f4f4f5] placeholder-[#3a3a3e] focus:outline-none focus:border-[#6366f1]/60 mb-3 transition-colors"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setPendingBlock(null)} className="px-3 py-1 rounded text-xs text-[#71717a] hover:text-[#f4f4f5] transition-colors">Cancel</button>
              <button onClick={confirmSaveBlock} className="px-3 py-1 rounded text-xs bg-[#6366f1] text-white hover:bg-[#818cf8] transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' ? (
        <DetailsPanel />
      ) : activeTab === 'brand' ? (
        <BrandKitPanel />
      ) : (
        <>
          {/* Row count + saved blocks */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2a2a2e] flex-shrink-0">
            <span className="text-[10px] text-[#71717a]">{rows.length} row{rows.length !== 1 ? 's' : ''}</span>
            <button
              onClick={() => setShowBlocks(true)}
              className="flex items-center gap-1 text-[10px] text-[#71717a] hover:text-[#818cf8] transition-colors"
              title="Saved blocks"
            >
              <Bookmark className="w-3 h-3" />
              Saved
            </button>
          </div>

          {/* Row list */}
          <div className="flex-1 overflow-y-auto p-2">
            {rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 text-center px-4">
                <p className="text-xs text-[#71717a]">No sections yet</p>
                <p className="text-[10px] text-[#3a3a3e] mt-1">Add a section to get started</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1">
                    {rows.map((row) => (
                      <SortableRowItem
                        key={row.id}
                        row={row}
                        onOpenBrowser={(mode) => setBrowserMode(mode)}
                        onSaveBlock={handleSaveBlock}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Add section button */}
          <div className="p-2 border-t border-[#2a2a2e] flex-shrink-0">
            <button
              data-tour="add-section"
              onClick={() => setBrowserMode({ kind: 'add-row' })}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-[#3a3a3e] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#6366f1]/40 hover:bg-[#6366f1]/5 transition-all text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add section
            </button>
          </div>
        </>
      )}

      {/* Resize drag handle */}
      <div
        onPointerDown={handleResizeStart}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#6366f1]/40 transition-colors z-10"
      />
    </div>
  );
}
