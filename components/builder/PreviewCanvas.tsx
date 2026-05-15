'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { LayoutTemplate, Trash2, Copy, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { useEmailStore } from '@/store/email-store';
import { ClientFrame } from '@/components/preview/ClientFrame';
import { applyVariables } from '@/lib/email-utils';
import type { DeviceMode } from '@/lib/types';

const DEVICE_WIDTHS: Record<DeviceMode, number> = {
  desktop: 600,
  tablet: 480,
  mobile: 375,
};

interface RowOverlayState {
  rowId: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

export function PreviewCanvas() {
  const {
    rows, theme, device, client, mode, htmlCode, variables,
    clearSelection, getAssembledHTML,
    selectColumn, selected: storeSelected,
    removeRow, duplicateRow, reorderRows,
  } = useEmailStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hovered, setHovered] = useState<RowOverlayState | null>(null);
  const [selected, setSelected] = useState<RowOverlayState | null>(null);
  const [dragState, setDragState] = useState<{
    rowId: string;
    startY: number;
    currentIndex: number;
    targetIndex: number | null;
  } | null>(null);

  // Compute overlay rect for a row element inside the iframe
  const getOverlayRect = useCallback((rowEl: Element): RowOverlayState | null => {
    const frame = iframeRef.current;
    const container = containerRef.current;
    if (!frame || !container) return null;
    const frameRect = frame.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const rowRect = rowEl.getBoundingClientRect();
    const rowId = rowEl.getAttribute('data-row-id') ?? '';
    return {
      rowId,
      top: frameRect.top - containerRect.top + rowRect.top,
      left: frameRect.left - containerRect.left + rowRect.left,
      width: rowRect.width,
      height: rowRect.height,
    };
  }, []);

  const findRowEl = useCallback((rowId: string): Element | null => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return null;
    return doc.querySelector(`[data-row-id="${rowId}"]`);
  }, []);

  const refreshSelected = useCallback(() => {
    if (!selected) return;
    const el = findRowEl(selected.rowId);
    if (el) setSelected(getOverlayRect(el));
  }, [selected, findRowEl, getOverlayRect]);

  const injectHTML = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    const raw = (mode === 'split' && htmlCode) ? htmlCode : getAssembledHTML();
    const html = Object.keys(variables).length > 0 ? applyVariables(raw, variables) : raw;
    const doc = frame.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [getAssembledHTML, mode, htmlCode, variables]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Attach iframe interaction listeners after HTML is injected
  const attachListeners = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    const doc = frame.contentDocument;
    if (!doc) return;

    const getRowEl = (target: EventTarget | null): Element | null => {
      if (!(target instanceof Element)) return null;
      return target.closest('[data-row-id]');
    };

    const onMouseMove = (e: MouseEvent) => {
      const rowEl = getRowEl(e.target);
      if (!rowEl) { setHovered(null); return; }
      setHovered(getOverlayRect(rowEl));
    };

    const onMouseLeave = () => setHovered(null);

    const onClick = (e: MouseEvent) => {
      e.stopPropagation();
      const rowEl = getRowEl(e.target);
      if (!rowEl) { setSelected(null); clearSelection(); return; }
      const overlay = getOverlayRect(rowEl);
      setSelected(overlay);
      if (overlay) selectColumn(overlay.rowId, 0);
    };

    doc.addEventListener('mousemove', onMouseMove);
    doc.addEventListener('mouseleave', onMouseLeave);
    doc.addEventListener('click', onClick);

    return () => {
      doc.removeEventListener('mousemove', onMouseMove);
      doc.removeEventListener('mouseleave', onMouseLeave);
      doc.removeEventListener('click', onClick);
    };
  }, [getOverlayRect, clearSelection, selectColumn]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      injectHTML();
      // Wait a tick for the iframe to render before attaching
      requestAnimationFrame(() => {
        // Re-read stored selection if any
        setSelected(null);
        setHovered(null);
        attachListeners();
      });
    }, 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, theme, client, htmlCode, mode, variables]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'wizemail-height') {
        if (iframeRef.current) {
          iframeRef.current.style.height = `${event.data.height}px`;
          // Refresh overlay positions after height change
          setTimeout(refreshSelected, 50);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refreshSelected]);

  // Sync selected overlay when store selection changes (e.g. from left sidebar)
  useEffect(() => {
    if (!storeSelected?.rowId) { setSelected(null); return; }
    requestAnimationFrame(() => {
      const el = findRowEl(storeSelected.rowId);
      if (el) setSelected(getOverlayRect(el));
    });
  }, [storeSelected?.rowId, findRowEl, getOverlayRect]);

  // Drag-to-reorder from overlay grip
  const handleDragStart = useCallback((e: React.MouseEvent, rowId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const rowIndex = rows.findIndex(r => r.id === rowId);
    if (rowIndex === -1) return;
    setDragState({ rowId, startY: e.clientY, currentIndex: rowIndex, targetIndex: rowIndex });

    const onMouseMove = (me: MouseEvent) => {
      const rowEls = iframeRef.current?.contentDocument?.querySelectorAll('[data-row-id]');
      if (!rowEls) return;
      let target = rowIndex;
      rowEls.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        // same-origin iframe: getBoundingClientRect() already returns viewport coords
        const midY = rect.top + rect.height / 2;
        if (me.clientY > midY) target = i + 1;
      });
      target = Math.max(0, Math.min(rows.length, target));
      setDragState(d => d ? { ...d, currentIndex: rowIndex, targetIndex: target } : null);
    };

    const onMouseUp = (me: MouseEvent) => {
      setDragState(d => {
        if (d && d.targetIndex !== null && d.targetIndex !== rowIndex) {
          reorderRows(rowIndex, d.targetIndex);
        }
        return null;
      });
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [rows, reorderRows]);

  const handleDelete = useCallback((rowId: string) => {
    removeRow(rowId);
    setSelected(null);
    setHovered(null);
  }, [removeRow]);

  const handleDuplicate = useCallback((rowId: string) => {
    duplicateRow(rowId);
    setSelected(null);
    setHovered(null);
  }, [duplicateRow]);

  const handleMoveUp = useCallback((rowId: string) => {
    const idx = rows.findIndex(r => r.id === rowId);
    if (idx > 0) reorderRows(idx, idx - 1);
  }, [rows, reorderRows]);

  const handleMoveDown = useCallback((rowId: string) => {
    const idx = rows.findIndex(r => r.id === rowId);
    if (idx < rows.length - 1) reorderRows(idx, idx + 1);
  }, [rows, reorderRows]);

  const width = DEVICE_WIDTHS[device];
  const canvasBg = theme === 'dark' ? '#060609' : '#e8eaf0';

  // Active overlay: prefer selected, fall back to hovered (only if different row)
  const activeOverlay = selected ?? null;
  const hoverOverlay = hovered && hovered.rowId !== selected?.rowId ? hovered : null;

  const selectedRowIndex = selected ? rows.findIndex(r => r.id === selected.rowId) : -1;

  return (
    <div
      data-tour="preview"
      className="h-full overflow-auto flex items-start justify-center py-8 px-6 transition-colors duration-300"
      style={{ background: canvasBg }}
      onClick={() => { clearSelection(); setSelected(null); setHovered(null); }}
    >
      <div
        className="transition-all duration-300 ease-out relative flex flex-col w-full"
        style={{ maxWidth: width + 80 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Width badge */}
        <div className="flex items-center justify-center mb-3">
          <span className="text-[10px] text-[#71717a] font-mono bg-[#161618] px-2 py-0.5 rounded border border-[#2a2a2e]">{width}px</span>
        </div>

        {rows.length === 0 ? (
          <div
            className="rounded-xl border-2 border-dashed border-[#2a2a2e] flex flex-col items-center justify-center gap-3 py-24"
            style={{ background: theme === 'dark' ? '#0f0f11' : '#ffffff' }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#222226] flex items-center justify-center">
              <LayoutTemplate className="w-5 h-5 text-[#52525b]" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#71717a]">Your canvas is empty</p>
              <p className="text-xs text-[#3a3a3e] mt-1">Add a section from the left panel to get started</p>
            </div>
          </div>
        ) : (
          <div className="shadow-2xl shadow-black/50 relative" ref={containerRef}>
            <ClientFrame>
              <iframe
                ref={iframeRef}
                title="Email Preview"
                sandbox="allow-same-origin allow-scripts"
                style={{
                  width: '100%',
                  display: 'block',
                  border: 'none',
                  minHeight: 200,
                }}
              />
            </ClientFrame>

            {/* Hover highlight */}
            {hoverOverlay && (
              <div
                className="absolute pointer-events-none"
                style={{
                  top: hoverOverlay.top,
                  left: hoverOverlay.left,
                  width: hoverOverlay.width,
                  height: hoverOverlay.height,
                  outline: '2px dashed rgba(232,93,38,0.5)',
                  outlineOffset: -1,
                  borderRadius: 2,
                  zIndex: 10,
                }}
              />
            )}

            {/* Selection highlight + toolbar */}
            {activeOverlay && (
              <>
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: activeOverlay.top,
                    left: activeOverlay.left,
                    width: activeOverlay.width,
                    height: activeOverlay.height,
                    outline: '2px solid #E85D26',
                    outlineOffset: -1,
                    borderRadius: 2,
                    zIndex: 11,
                  }}
                />
                {/* Toolbar */}
                <div
                  className="absolute flex items-center gap-0.5 bg-[#1a1814] border border-[#E85D26] rounded-md shadow-lg overflow-hidden"
                  style={{
                    top: Math.max(0, activeOverlay.top - 34),
                    left: activeOverlay.left + activeOverlay.width - 4,
                    transform: 'translateX(-100%)',
                    zIndex: 20,
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Drag grip */}
                  <button
                    className="flex items-center justify-center w-7 h-7 text-[#9C9488] hover:text-white hover:bg-[#2a2620] cursor-grab active:cursor-grabbing"
                    onMouseDown={e => handleDragStart(e, activeOverlay.rowId)}
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-px h-4 bg-[#2E2B26]" />

                  {/* Move up */}
                  <button
                    className="flex items-center justify-center w-7 h-7 text-[#9C9488] hover:text-white hover:bg-[#2a2620] disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => handleMoveUp(activeOverlay.rowId)}
                    disabled={selectedRowIndex === 0}
                    title="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move down */}
                  <button
                    className="flex items-center justify-center w-7 h-7 text-[#9C9488] hover:text-white hover:bg-[#2a2620] disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => handleMoveDown(activeOverlay.rowId)}
                    disabled={selectedRowIndex === rows.length - 1}
                    title="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-px h-4 bg-[#2E2B26]" />

                  {/* Duplicate */}
                  <button
                    className="flex items-center justify-center w-7 h-7 text-[#9C9488] hover:text-white hover:bg-[#2a2620]"
                    onClick={() => handleDuplicate(activeOverlay.rowId)}
                    title="Duplicate row"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    className="flex items-center justify-center w-7 h-7 text-[#9C9488] hover:text-red-400 hover:bg-red-900/30"
                    onClick={() => handleDelete(activeOverlay.rowId)}
                    title="Delete row"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {/* Drag target indicator */}
            {dragState && dragState.targetIndex !== null && (
              <div
                className="absolute left-0 right-0 h-0.5 bg-[#E85D26] rounded-full pointer-events-none"
                style={{
                  top: (() => {
                    const doc = iframeRef.current?.contentDocument;
                    const frameRect = iframeRef.current?.getBoundingClientRect();
                    const containerRect = containerRef.current?.getBoundingClientRect();
                    if (!doc || !frameRect || !containerRect) return 0;
                    const rowEls = doc.querySelectorAll('[data-row-id]');
                    const targetEl = rowEls[dragState.targetIndex!];
                    if (!targetEl) return 0;
                    const r = targetEl.getBoundingClientRect();
                    return frameRect.top - containerRect.top + r.top;
                  })(),
                  zIndex: 30,
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
