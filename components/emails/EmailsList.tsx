'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Clock, Pencil, Check, X, Mail, Copy, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getSavedDesigns, deleteDesign, renameDesign, duplicateDesign } from '@/lib/storage';
import { deleteCloudDesign, listCloudDesigns, renameCloudDesign } from '@/lib/cloud-designs';
import { assembleCleanHTML } from '@/lib/email-utils';
import { useEmailStore } from '@/store/email-store';
import type { SavedDesign } from '@/lib/types';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function DesignPreview({ design }: { design: SavedDesign }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    const html = assembleCleanHTML(design.rows, design.theme, design.brandKit);
    const doc = frame.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [design]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 160 }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ transformOrigin: 'top left', transform: 'scale(0.333)', width: '300%', height: '300%' }}
      >
        <iframe
          ref={iframeRef}
          title={`Preview: ${design.name}`}
          sandbox="allow-same-origin"
          style={{ width: 600, height: '480px', border: 'none', display: 'block' }}
        />
      </div>
    </div>
  );
}

function DeleteConfirmDialog({ design, onConfirm, onCancel }: {
  design: SavedDesign;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-[#1c1c1f] border border-[#2a2a2e] rounded-xl p-5 w-80 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#f4f4f5] mb-1">Delete design?</p>
            <p className="text-xs text-[#71717a] leading-relaxed">
              <span className="text-[#a1a1aa] font-medium">{design.name}</span> will be permanently removed from local storage. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-xs text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
          >
            Cancel
          </button>
          <button
            autoFocus
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-lg text-xs bg-red-500 text-white font-medium hover:bg-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function DesignCard({ design, isCurrentDesign, onDelete, onRename, onDuplicate, onOpen }: {
  design: SavedDesign;
  isCurrentDesign: boolean;
  onDelete: (design: SavedDesign) => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onOpen: (design: SavedDesign) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(design.name);

  const commitRename = () => {
    const name = draftName.trim() || design.name;
    setDraftName(name);
    onRename(design.id, name);
    setEditing(false);
  };

  const cancelRename = () => {
    setDraftName(design.name);
    setEditing(false);
  };

  return (
    <div className={`group flex flex-col bg-[#161618] border rounded-xl overflow-hidden transition-all duration-150 hover:shadow-xl hover:shadow-black/30 ${
      isCurrentDesign ? 'border-[#6366f1]/40' : 'border-[#2a2a2e] hover:border-[#3a3a3e]'
    }`}>
      {/* Current design indicator */}
      {isCurrentDesign && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366f1]/10 border-b border-[#6366f1]/20 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse" />
          <span className="text-[10px] text-[#818cf8] font-medium">Currently open</span>
        </div>
      )}

      {/* Preview */}
      <div
        className="relative overflow-hidden bg-[#e8eaf0] border-b border-[#2a2a2e] cursor-pointer"
        onClick={() => onOpen(design)}
      >
        <DesignPreview design={design} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-150 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-3 py-1.5 rounded-lg bg-white text-[#111111] text-xs font-semibold shadow-lg">
            Open in builder
          </span>
        </div>
      </div>

      {/* Card info */}
      <div className="p-3 flex flex-col gap-1.5">
        {/* Name */}
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') cancelRename(); }}
              className="flex-1 min-w-0 bg-[#0f0f11] border border-[#6366f1]/60 rounded px-1.5 py-1 text-xs text-[#f4f4f5] focus:outline-none"
            />
            <button onClick={commitRename} className="text-[#10b981] hover:text-[#10b981]/80 flex-shrink-0 p-0.5"><Check className="w-3 h-3" /></button>
            <button onClick={cancelRename} className="text-[#71717a] hover:text-[#a1a1aa] flex-shrink-0 p-0.5"><X className="w-3 h-3" /></button>
          </div>
        ) : (
          <span className="text-xs font-semibold text-[#f4f4f5] truncate">{design.name}</span>
        )}

        {/* Subject */}
        {design.emailDetails.subject ? (
          <p className="text-[10px] text-[#71717a] truncate">{design.emailDetails.subject}</p>
        ) : (
          <p className="text-[10px] text-[#3a3a3e] italic">No subject</p>
        )}

        {/* Footer: meta + actions */}
        <div className="flex items-center justify-between pt-0.5 border-t border-[#2a2a2e]">
          <div className="flex items-center gap-1 text-[#3a3a3e]">
            <Clock className="w-2.5 h-2.5" />
            <span className="text-[9px]">{formatDate(design.updatedAt)}</span>
            <span className="text-[9px] ml-1">· {design.rows.length}r</span>
          </div>

          {/* Always-visible actions */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => { e.stopPropagation(); setDraftName(design.name); setEditing(true); }}
              className="p-1 rounded text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
              title="Rename"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(design.id); }}
              className="p-1 rounded text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#222226] transition-colors"
              title="Duplicate"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(design); }}
              className="p-1 rounded text-[#71717a] hover:text-red-400 hover:bg-[#222226] transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmailsList() {
  const router = useRouter();
  const { loadSavedDesign, currentDesignId } = useEmailStore();
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [confirmTarget, setConfirmTarget] = useState<SavedDesign | null>(null);

  const refresh = useCallback(async () => {
    const local = getSavedDesigns();
    const cloud = await listCloudDesigns();
    const merged = new Map<string, SavedDesign>();

    [...local, ...cloud].forEach((design) => {
      const existing = merged.get(design.id);
      if (!existing || new Date(design.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
        merged.set(design.id, design);
      }
    });

    setDesigns(Array.from(merged.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const handleOpen = (design: SavedDesign) => {
    loadSavedDesign(design);
    router.push('/builder');
  };

  const handleDelete = (design: SavedDesign) => setConfirmTarget(design);

  const handleConfirmDelete = () => {
    if (!confirmTarget) return;
    deleteDesign(confirmTarget.id);
    deleteCloudDesign(confirmTarget.id).catch(() => undefined);
    setConfirmTarget(null);
    void refresh();
    toast('Design deleted', { description: confirmTarget.name });
  };

  const handleRename = (id: string, name: string) => {
    renameDesign(id, name);
    const design = designs.find((item) => item.id === id);
    renameCloudDesign(id, name, design?.version).catch(() => undefined);
    void refresh();
    toast.success('Renamed', { description: name });
  };

  const handleDuplicate = (id: string) => {
    const copy = duplicateDesign(id);
    if (copy) {
      void refresh();
      toast.success('Duplicated', { description: copy.name });
    }
  };

  if (designs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#161618] border border-[#2a2a2e] flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-[#3a3a3e]" />
        </div>
        <p className="text-sm font-medium text-[#71717a] mb-1">No saved designs yet</p>
        <p className="text-xs text-[#3a3a3e]">Open the builder and click "Save as…" to save your first design.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {designs.map((design) => (
          <DesignCard
            key={design.id}
            design={design}
            isCurrentDesign={design.id === currentDesignId}
            onDelete={handleDelete}
            onRename={handleRename}
            onDuplicate={handleDuplicate}
            onOpen={handleOpen}
          />
        ))}
      </div>

      {confirmTarget && (
        <DeleteConfirmDialog
          design={confirmTarget}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </>
  );
}
