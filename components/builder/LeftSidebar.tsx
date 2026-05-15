'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  DndContext, closestCenter, DragEndEvent, DragOverEvent, DragStartEvent,
  useSensor, useSensors, PointerSensor, DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, rectSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, Trash2, Copy, Plus, X, Layout, Info, Palette, Bookmark, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useEmailStore } from '@/store/email-store';
import { getSectionLabel } from '@/lib/sections';
import { ComponentBrowser, type BrowserMode } from '@/components/builder/ComponentBrowser';
import { saveBlock, getSavedBlocks, deleteBlock } from '@/lib/storage';
import { listCloudBrandKits, type SavedBrandKit } from '@/lib/cloud-brand-kits';
import Link from 'next/link';
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
  const { updateBrandKit, applyBrandKitToAll } = useEmailStore();
  const [kits, setKits] = useState<SavedBrandKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    listCloudBrandKits().then((list) => { setKits(list); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const selectedKit = kits.find((k) => k.id === selectedId) ?? null;

  const handleApply = () => {
    if (!selectedKit) return;
    updateBrandKit(selectedKit.kit);
    toast.success(`"${selectedKit.name}" applied`);
  };

  const handleApplyToAll = () => {
    if (!selectedKit) return;
    updateBrandKit(selectedKit.kit);
    applyBrandKitToAll();
    toast.success('Brand applied to all sections');
  };

  if (loading) {
    return (
      <div className="flex-1 p-3 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg animate-pulse bg-[#1c1c1f]" />
        ))}
      </div>
    );
  }

  if (kits.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-5 text-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1c1c1f] border border-[#2a2a2e] flex items-center justify-center">
          <Palette className="w-5 h-5 text-[#52525b]" />
        </div>
        <div>
          <p className="text-xs font-medium text-[#a1a1aa]">No brand kits yet</p>
          <p className="text-[10px] text-[#52525b] mt-1 leading-relaxed">Create a kit to define your colors, fonts, and design tokens.</p>
        </div>
        <Link
          href="/brand-kits"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20 text-xs text-[#818cf8] hover:bg-[#6366f1]/20 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Create a kit
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
      {/* Info hint */}
      <div className="rounded-lg bg-[#6366f1]/5 border border-[#6366f1]/15 px-3 py-2">
        <p className="text-[10px] text-[#818cf8] leading-relaxed">Pick a kit and apply it. New sections use brand tokens automatically.</p>
      </div>

      {/* Kit list */}
      <div className="space-y-1.5">
        {kits.map((kit) => {
          const swatches = [kit.kit.primaryColor, kit.kit.secondaryColor, kit.kit.backgroundColor, kit.kit.textColor, ...(kit.kit.customColors ?? [])].slice(0, 5);
          const isSelected = selectedId === kit.id;
          return (
            <button
              key={kit.id}
              onClick={() => setSelectedId(isSelected ? null : kit.id)}
              className={`w-full text-left rounded-lg border p-2.5 transition-all ${
                isSelected
                  ? 'bg-[#6366f1]/10 border-[#6366f1]/40'
                  : 'bg-[#1c1c1f] border-[#2a2a2e] hover:border-[#3a3a3e]'
              }`}
            >
              <p className={`text-[11px] font-semibold truncate ${isSelected ? 'text-[#818cf8]' : 'text-[#f4f4f5]'}`}>{kit.name}</p>
              <div className="mt-1.5 flex gap-1">
                {swatches.map((color, i) => (
                  <span key={i} className="h-3 w-5 rounded-sm border border-white/10 flex-shrink-0" style={{ backgroundColor: color }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      {selectedKit && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleApply}
            className="flex-1 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20 px-3 py-2 text-xs text-[#818cf8] hover:bg-[#6366f1]/20 transition-colors font-medium"
          >
            Apply kit
          </button>
          <button
            onClick={handleApplyToAll}
            className="flex items-center gap-1.5 rounded-lg bg-[#222226] border border-[#2a2a2e] px-3 py-2 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3a3a3e] transition-colors flex-shrink-0"
            title="Apply kit and convert existing sections to brand tokens"
          >
            <RefreshCw className="w-3 h-3" />
            Apply to all
          </button>
        </div>
      )}

      {/* Manage link */}
      <div className="pt-1 border-t border-[#2a2a2e]">
        <Link
          href="/brand-kits"
          target="_blank"
          className="text-[10px] text-[#52525b] hover:text-[#818cf8] transition-colors"
        >
          Manage brand kits →
        </Link>
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

/* ─── Layout Presets ────────────────────────────────────── */

const LAYOUT_PRESETS: Array<{ label: string; widths: number[] }> = [
  { label: '1 col', widths: [1] },
  { label: '½ ½', widths: [0.5, 0.5] },
  { label: '⅔ ⅓', widths: [2 / 3, 1 / 3] },
  { label: '⅓ ⅔', widths: [1 / 3, 2 / 3] },
  { label: '⅓ ⅓ ⅓', widths: [1 / 3, 1 / 3, 1 / 3] },
  { label: '¼ ¾', widths: [0.25, 0.75] },
];

function LayoutPicker({ rowId, onClose }: { rowId: string; onClose: () => void }) {
  const { setRowLayout } = useEmailStore();
  return (
    <div className="absolute bottom-full left-0 mb-1 z-50 bg-[#18181b] border border-[#2a2a2e] rounded-lg shadow-xl p-2 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
      <p className="text-[9px] font-semibold text-[#52525b] uppercase tracking-wider px-1 pb-1.5">Column layout</p>
      <div className="space-y-0.5">
        {LAYOUT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => { setRowLayout(rowId, preset.widths); onClose(); }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#2a2a2e] transition-colors group"
          >
            <div className="flex gap-0.5 h-4 flex-shrink-0">
              {preset.widths.map((w, i) => (
                <div
                  key={i}
                  className="h-full rounded-sm bg-[#3a3a3e] group-hover:bg-[#6366f1]/60 transition-colors"
                  style={{ width: `${Math.round(w * 48)}px` }}
                />
              ))}
            </div>
            <span className="text-[10px] text-[#71717a] group-hover:text-[#a1a1aa] transition-colors">{preset.label}</span>
          </button>
        ))}
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
  isColDragActive,
}: {
  row: EmailRow;
  onOpenBrowser: (mode: BrowserMode) => void;
  onSaveBlock: (row: EmailRow) => void;
  isColDragActive?: boolean;
}) {
  const { selected, removeRow, duplicateRow } = useEmailStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const layoutBtnRef = useRef<HTMLButtonElement>(null);

  const isSingleCol = row.columns.length === 1;
  const isRowSelected = selected?.rowId === row.id;

  const layoutContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showLayoutPicker) return;
    const handler = (e: MouseEvent) => {
      if (layoutContainerRef.current && !layoutContainerRef.current.contains(e.target as Node)) {
        setShowLayoutPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLayoutPicker]);

  const stateClasses = isColDragActive
    ? 'border-[#6366f1]/40 bg-[#6366f1]/5'
    : isRowSelected
      ? 'border-[#6366f1]/30 bg-[#6366f1]/[0.04]'
      : 'border-[#2a2a2e] hover:border-[#3a3a3e]';

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={`group rounded-lg border bg-[#1c1c1f] transition-colors duration-150 ${stateClasses}`}
    >
      <div className="flex items-center gap-1.5 px-1.5 py-1.5">
        {/* Row drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="text-[#52525b] hover:text-[#a1a1aa] cursor-grab active:cursor-grabbing transition-colors flex-shrink-0 touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Column chips — sortable within this row (handled by outer DndContext) */}
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

        {/* Row actions */}
        <div ref={layoutContainerRef} className="relative flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {showLayoutPicker && (
            <LayoutPicker rowId={row.id} onClose={() => setShowLayoutPicker(false)} />
          )}
          <button
            ref={layoutBtnRef}
            onClick={(e) => { e.stopPropagation(); setShowLayoutPicker((v) => !v); }}
            aria-label="Change column layout"
            aria-expanded={showLayoutPicker}
            className="p-1 rounded text-[#3a3a3e] hover:text-[#6366f1] hover:bg-[#6366f1]/10 transition-colors"
            title="Change column layout"
          >
            <Layout className="w-3 h-3" aria-hidden="true" />
          </button>
          <button
            onClick={() => {
              duplicateRow(row.id);
              toast('Row duplicated', { icon: '📋' });
            }}
            aria-label="Duplicate row"
            className="p-1 rounded text-[#3a3a3e] hover:text-[#f4f4f5] hover:bg-[#2a2a2e] transition-colors"
            title="Duplicate row"
          >
            <Copy className="w-3 h-3" aria-hidden="true" />
          </button>
          <button
            onClick={() => onSaveBlock(row)}
            aria-label="Save row as reusable block"
            className="p-1 rounded text-[#3a3a3e] hover:text-[#818cf8] hover:bg-[#2a2a2e] transition-colors"
            title="Save as reusable block"
          >
            <Bookmark className="w-3 h-3" aria-hidden="true" />
          </button>
          <button
            onClick={() => {
              removeRow(row.id);
              toast('Row removed', { description: 'Section deleted from email', icon: '🗑️' });
            }}
            aria-label="Delete row"
            className="p-1 rounded text-[#3a3a3e] hover:text-red-400 hover:bg-[#2a2a2e] transition-colors"
            title="Delete row"
          >
            <Trash2 className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── LeftSidebar ────────────────────────────────────────── */

export function LeftSidebar() {
  const { rows, reorderRows, reorderColumnsInRow, moveColumnBetweenRows } = useEmailStore();
  const [activeColDragRowId, setActiveColDragRowId] = useState<string | null>(null);
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

  // Build lookup maps for fast ID resolution
  const rowIds = rows.map((r) => r.id);
  const colToRow: Record<string, string> = {};
  for (const r of rows) for (const c of r.columns) colToRow[c.id] = r.id;

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    // If dragging a column chip, highlight its row
    if (colToRow[activeId]) setActiveColDragRowId(colToRow[activeId]);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    if (!colToRow[activeId] || !overId) return;
    // highlight the row being hovered
    const targetRowId = colToRow[overId] ?? (rowIds.includes(overId) ? overId : null);
    if (targetRowId) setActiveColDragRowId(targetRowId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveColDragRowId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const isActiveRow = rowIds.includes(activeId);
    const isActiveCol = !!colToRow[activeId];

    if (isActiveRow) {
      // Row reorder
      const oldIndex = rows.findIndex((r) => r.id === activeId);
      const newIndex = rows.findIndex((r) => r.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderRows(oldIndex, newIndex);
        toast('Rows reordered', { icon: '↕️' });
      }
    } else if (isActiveCol) {
      const fromRowId = colToRow[activeId];
      const overRowId = colToRow[overId] ?? (rowIds.includes(overId) ? overId : null);
      if (!overRowId) return;

      if (fromRowId === overRowId) {
        // Same-row reorder
        const row = rows.find((r) => r.id === fromRowId)!;
        const oldIdx = row.columns.findIndex((c) => c.id === activeId);
        const newIdx = row.columns.findIndex((c) => c.id === overId);
        if (oldIdx !== -1 && newIdx !== -1) reorderColumnsInRow(fromRowId, oldIdx, newIdx);
      } else {
        // Cross-row move
        const toRow = rows.find((r) => r.id === overRowId)!;
        const toIndex = colToRow[overId]
          ? toRow.columns.findIndex((c) => c.id === overId)
          : toRow.columns.length;
        moveColumnBetweenRows(fromRowId, activeId, overRowId, toIndex < 0 ? 0 : toIndex);
        toast('Section moved to row', { icon: '↔️' });
      }
    }
  };

  if (browserMode !== null) {
    return (
      <div className="flex-shrink-0 bg-[#161618] flex flex-col overflow-hidden relative" style={{ width: sidebarWidth }}>
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
      <div className="flex-shrink-0 bg-[#161618] flex flex-col overflow-hidden relative" style={{ width: sidebarWidth }}>
        <SavedBlocksPanel onClose={() => setShowBlocks(false)} />
        <div onPointerDown={handleResizeStart} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#6366f1]/40 transition-colors z-10" />
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 bg-[#161618] flex flex-col overflow-hidden relative" style={{ width: sidebarWidth }}>
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
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors duration-150 ${
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
              <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-3 py-8">
                <div className="w-8 h-8 rounded-xl bg-[#1c1c1f] border border-[#2a2a2e] flex items-center justify-center">
                  <Layout className="w-4 h-4 text-[#52525b]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#71717a]">No sections yet</p>
                  <p className="text-[10px] text-[#3a3a3e] mt-1 leading-relaxed">Click below to add your first section</p>
                </div>
                <button
                  onClick={() => setBrowserMode({ kind: 'add-row' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20 text-xs text-[#818cf8] hover:bg-[#6366f1]/20 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add first section
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1">
                    {rows.map((row) => (
                      <SortableRowItem
                        key={row.id}
                        row={row}
                        onOpenBrowser={(mode) => setBrowserMode(mode)}
                        onSaveBlock={handleSaveBlock}
                        isColDragActive={activeColDragRowId !== null && row.id !== activeColDragRowId}
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
