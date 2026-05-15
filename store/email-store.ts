'use client';

import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import type { EmailRow, EmailColumn, SectionType, SectionContent, EditorMode, DeviceMode, ThemeMode, ClientMode, EmailDetails, SavedDesign, BrandKit } from '@/lib/types';
import { getDefaultContent } from '@/lib/sections';
import { assembleEmailHTML, sectionsToRows } from '@/lib/email-utils';
import { hexToToken, COLOR_CONTENT_KEYS } from '@/lib/brand-tokens';
import { renameDesign as renameDesignInStorage } from '@/lib/storage';
import { countVariableUsage } from '@/lib/variable-utils';
import type { EmailTemplate } from '@/lib/templates';
import type { SectionTemplate } from '@/lib/section-templates';

export interface ColumnSelection {
  rowId: string;
  colIdx: number;
}

const DEFAULT_BRAND_KIT: BrandKit = {
  primaryColor: '#6366f1',
  secondaryColor: '#0f172a',
  backgroundColor: '#ffffff',
  textColor: '#111111',
  logoText: '',
  fontFamily: 'system',
};

const HISTORY_LIMIT = 60;

interface EmailStore {
  rows: EmailRow[];
  past: EmailRow[][];
  future: EmailRow[][];
  selected: ColumnSelection | null;
  mode: EditorMode;
  device: DeviceMode;
  theme: ThemeMode;
  client: ClientMode;
  htmlCode: string;
  emailDetails: EmailDetails;
  variables: Record<string, string>;
  variableUsage: Record<string, number>;
  currentDesignId: string | null;
  currentDesignName: string;
  currentDesignVersion: number | null;
  hasUnsavedChanges: boolean;
  brandKit: BrandKit;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Row actions
  addRow: (type: SectionType, afterRowId?: string) => void;
  addLayoutRow: (columnCount: 2 | 3 | 4, afterRowId?: string) => void;
  removeRow: (rowId: string) => void;
  duplicateRow: (rowId: string) => void;
  reorderRows: (oldIndex: number, newIndex: number) => void;
  updateRowSpacing: (rowId: string, spacing: Partial<Pick<EmailRow, 'columnGap' | 'outerPaddingX' | 'outerPaddingY' | 'outerPaddingTop' | 'outerPaddingRight' | 'outerPaddingBottom' | 'outerPaddingLeft'>>) => void;
  insertSectionTemplate: (template: SectionTemplate, afterRowId?: string) => void;

  // Column actions
  selectColumn: (rowId: string, colIdx: number) => void;
  clearSelection: () => void;
  updateColumnContent: (rowId: string, colIdx: number, content: Partial<SectionContent>) => void;
  setColumnType: (rowId: string, colIdx: number, type: SectionType) => void;
  addColumnToRow: (rowId: string, type?: SectionType) => void;
  removeColumnFromRow: (rowId: string, colIdx: number) => void;
  reorderColumnsInRow: (rowId: string, oldIndex: number, newIndex: number) => void;
  moveColumnBetweenRows: (fromRowId: string, colId: string, toRowId: string, toIndex: number) => void;
  updateColumnSpacing: (rowId: string, colIdx: number, spacing: Partial<Pick<EmailColumn, 'paddingTop' | 'paddingBottom' | 'paddingLeft' | 'paddingRight'>>) => void;
  setRowLayout: (rowId: string, widths: number[]) => void;

  // Brand kit
  updateBrandKit: (kit: Partial<BrandKit>) => void;
  applyBrandKitToAll: () => void;

  // Other actions
  updateEmailDetails: (details: Partial<EmailDetails>) => void;
  setMode: (mode: EditorMode) => void;
  setDevice: (device: DeviceMode) => void;
  setTheme: (theme: ThemeMode) => void;
  setClient: (client: ClientMode) => void;
  setHtmlCode: (code: string) => void;
  setCurrentDesign: (id: string, name: string, version?: number | null) => void;
  setCurrentDesignName: (name: string) => void;
  markSaved: () => void;
  setVariable: (key: string, value: string) => void;
  removeVariable: (key: string) => void;
  loadTemplate: (template: EmailTemplate) => void;
  loadSavedDesign: (design: SavedDesign) => void;
  loadHtml: (html: string) => void;
  getAssembledHTML: () => string;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function makeColumn(type: SectionType): EmailColumn {
  return { id: generateId(), type, content: getDefaultContent(type) };
}

function makeRow(type: SectionType): EmailRow {
  return { id: generateId(), columns: [makeColumn(type)] };
}

// Apply brand kit logo to newly-created section content (colors now use token defaults)
function applyBrandKit(content: SectionContent, kit: BrandKit): SectionContent {
  const result = { ...content };
  if (kit.logoText && result.logoText !== undefined) result.logoText = kit.logoText;
  return result;
}

function makeBrandedRow(type: SectionType, kit: BrandKit): EmailRow {
  const col = makeColumn(type);
  return { id: generateId(), columns: [{ ...col, content: applyBrandKit(col.content, kit) }] };
}

// Push current rows onto the past stack (capped at HISTORY_LIMIT)
function pushHistory(past: EmailRow[][], rows: EmailRow[]): EmailRow[][] {
  return [...past, rows].slice(-HISTORY_LIMIT);
}

// Debounce content-edit history pushes so rapid typing doesn't flood the undo stack
let lastContentHistoryTime = 0;
let lastContentHistoryRows: EmailRow[] | null = null;
function pushContentHistory(past: EmailRow[][], rows: EmailRow[]): EmailRow[][] {
  const now = Date.now();
  if (now - lastContentHistoryTime < 600 && lastContentHistoryRows !== null) {
    // Replace the last entry with the pre-edit state (already recorded), don't add a new one
    lastContentHistoryTime = now;
    return past;
  }
  lastContentHistoryTime = now;
  lastContentHistoryRows = rows;
  return pushHistory(past, rows);
}

// Update variable usage counts based on current HTML content
function updateVariableUsage(rows: EmailRow[], variables: Record<string, string>, brandKit?: BrandKit): Record<string, number> {
  const html = assembleEmailHTML(rows, 'light', '', variables, brandKit);
  return countVariableUsage(html);
}

const INITIAL_ROWS: EmailRow[] = [
  { id: generateId(), columns: [makeColumn('header')] },
  {
    id: generateId(),
    columns: [{
      id: generateId(),
      type: 'hero',
      content: {
        backgroundColor: '#0f172a',
        textColor: '#ffffff',
        headline: 'Welcome to something great',
        subheadline: 'A single, focused sentence that explains your value and invites action.',
        buttonText: 'Get Started',
        buttonColor: '#6366f1',
        buttonTextColor: '#ffffff',
        buttonUrl: '#',
      },
    }],
  },
  { id: generateId(), columns: [{ id: generateId(), type: 'footer', content: { backgroundColor: '#f3f4f6', textColor: '#9ca3af', companyName: 'Your Company', companyAddress: '123 Main Street, San Francisco, CA 94107', unsubscribeUrl: '#' } }] },
];

const DEFAULT_EMAIL_DETAILS: EmailDetails = {
  subject: '',
  previewText: '',
  senderName: '',
  senderEmail: '',
  replyTo: '',
};

export const useEmailStore = create<EmailStore>((set, get) => ({
  rows: INITIAL_ROWS,
  past: [],
  future: [],
  selected: null,
  mode: 'visual',
  device: 'desktop',
  theme: 'light',
  client: 'gmail',
  htmlCode: '',
  emailDetails: DEFAULT_EMAIL_DETAILS,
  variables: {},
  variableUsage: {},
  currentDesignId: null,
  currentDesignName: '',
  currentDesignVersion: null,
  hasUnsavedChanges: false,
  brandKit: DEFAULT_BRAND_KIT,

  // ── History ─────────────────────────────────────────────────────────────
  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        rows: previous,
        past: state.past.slice(0, -1),
        future: [state.rows, ...state.future].slice(0, HISTORY_LIMIT),
        hasUnsavedChanges: !!state.currentDesignId,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        rows: next,
        past: [...state.past, state.rows].slice(-HISTORY_LIMIT),
        future: state.future.slice(1),
        hasUnsavedChanges: !!state.currentDesignId,
      };
    }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  // ── Row actions ──────────────────────────────────────────────────────────
  addRow: (type, afterRowId) =>
    set((state) => {
      const newRow = makeBrandedRow(type, state.brandKit);
      const past = pushHistory(state.past, state.rows);
      if (!afterRowId) {
        return { rows: [...state.rows, newRow], past, future: [], hasUnsavedChanges: !!state.currentDesignId };
      }
      const idx = state.rows.findIndex((r) => r.id === afterRowId);
      const next = [...state.rows];
      next.splice(idx + 1, 0, newRow);
      return { rows: next, past, future: [], hasUnsavedChanges: !!state.currentDesignId };
    }),

  addLayoutRow: (columnCount, afterRowId) =>
    set((state) => {
      const newRow: EmailRow = {
        id: generateId(),
        columns: Array.from({ length: columnCount }, () => makeColumn('empty')),
      };
      const past = pushHistory(state.past, state.rows);
      if (!afterRowId) {
        return { rows: [...state.rows, newRow], past, future: [], hasUnsavedChanges: !!state.currentDesignId };
      }
      const idx = state.rows.findIndex((r) => r.id === afterRowId);
      const next = [...state.rows];
      next.splice(idx + 1, 0, newRow);
      return { rows: next, past, future: [], hasUnsavedChanges: !!state.currentDesignId };
    }),

  removeRow: (rowId) =>
    set((state) => ({
      rows: state.rows.filter((r) => r.id !== rowId),
      past: pushHistory(state.past, state.rows),
      future: [],
      selected: state.selected?.rowId === rowId ? null : state.selected,
      hasUnsavedChanges: !!state.currentDesignId,
    })),

  duplicateRow: (rowId) =>
    set((state) => {
      const idx = state.rows.findIndex((r) => r.id === rowId);
      if (idx === -1) return state;
      const original = state.rows[idx];
      const copy: EmailRow = {
        id: generateId(),
        columns: original.columns.map((c) => ({ ...c, id: generateId() })),
      };
      const next = [...state.rows];
      next.splice(idx + 1, 0, copy);
      return { rows: next, past: pushHistory(state.past, state.rows), future: [], hasUnsavedChanges: !!state.currentDesignId };
    }),

  reorderRows: (oldIndex, newIndex) =>
    set((state) => {
      const next = [...state.rows];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      return { rows: next, past: pushHistory(state.past, state.rows), future: [], hasUnsavedChanges: !!state.currentDesignId };
    }),

  // ── Column actions ────────────────────────────────────────────────────────
  selectColumn: (rowId, colIdx) => set({ selected: { rowId, colIdx } }),

  clearSelection: () => set({ selected: null }),

  updateColumnContent: (rowId, colIdx, content) =>
    set((state) => ({
      rows: state.rows.map((r) =>
        r.id !== rowId
          ? r
          : {
              ...r,
              columns: r.columns.map((c, i) =>
                i === colIdx ? { ...c, content: { ...c.content, ...content } } : c
              ),
            }
      ),
      past: pushContentHistory(state.past, state.rows),
      future: [],
      hasUnsavedChanges: !!state.currentDesignId,
    })),

  setColumnType: (rowId, colIdx, type) =>
    set((state) => ({
      rows: state.rows.map((r) =>
        r.id !== rowId
          ? r
          : {
              ...r,
              columns: r.columns.map((c, i) =>
                i === colIdx ? { ...c, type, content: getDefaultContent(type) } : c
              ),
            }
      ),
      selected: { rowId, colIdx },
      past: pushHistory(state.past, state.rows),
      future: [],
      hasUnsavedChanges: !!state.currentDesignId,
    })),

  addColumnToRow: (rowId, type = 'empty') =>
    set((state) => ({
      rows: state.rows.map((r) =>
        r.id !== rowId ? r : { ...r, columns: [...r.columns, makeColumn(type)] }
      ),
      past: pushHistory(state.past, state.rows),
      future: [],
      hasUnsavedChanges: !!state.currentDesignId,
    })),

  removeColumnFromRow: (rowId, colIdx) =>
    set((state) => {
      const row = state.rows.find((r) => r.id === rowId);
      if (!row || row.columns.length <= 1) return state;
      return {
        rows: state.rows.map((r) =>
          r.id !== rowId
            ? r
            : { ...r, columns: r.columns.filter((_, i) => i !== colIdx) }
        ),
        past: pushHistory(state.past, state.rows),
        future: [],
        selected:
          state.selected?.rowId === rowId && state.selected.colIdx === colIdx
            ? null
            : state.selected,
        hasUnsavedChanges: !!state.currentDesignId,
      };
    }),

  reorderColumnsInRow: (rowId, oldIndex, newIndex) =>
    set((state) => ({
      rows: state.rows.map((r) =>
        r.id !== rowId ? r : { ...r, columns: arrayMove(r.columns, oldIndex, newIndex) }
      ),
      past: pushHistory(state.past, state.rows),
      future: [],
      hasUnsavedChanges: !!state.currentDesignId,
    })),

  moveColumnBetweenRows: (fromRowId, colId, toRowId, toIndex) =>
    set((state) => {
      const fromRow = state.rows.find((r) => r.id === fromRowId);
      if (!fromRow) return {};
      const col = fromRow.columns.find((c) => c.id === colId);
      if (!col) return {};

      const newRows = state.rows.map((r) => {
        if (r.id === fromRowId) {
          const cols = r.columns.filter((c) => c.id !== colId);
          return cols.length > 0 ? { ...r, columns: cols } : null;
        }
        if (r.id === toRowId) {
          const cols = [...r.columns];
          cols.splice(toIndex, 0, col);
          return { ...r, columns: cols };
        }
        return r;
      }).filter(Boolean) as typeof state.rows;

      return {
        rows: newRows,
        past: pushHistory(state.past, state.rows),
        future: [],
        hasUnsavedChanges: !!state.currentDesignId,
      };
    }),

  updateColumnSpacing: (rowId, colIdx, spacing) =>
    set((state) => ({
      rows: state.rows.map((r) =>
        r.id !== rowId ? r : {
          ...r,
          columns: r.columns.map((c, i) => i === colIdx ? { ...c, ...spacing } : c),
        }
      ),
      past: pushHistory(state.past, state.rows),
      future: [],
      hasUnsavedChanges: !!state.currentDesignId,
    })),

  updateRowSpacing: (rowId, spacing) =>
    set((state) => ({
      rows: state.rows.map((r) => r.id !== rowId ? r : { ...r, ...spacing }),
      past: pushHistory(state.past, state.rows),
      future: [],
      hasUnsavedChanges: !!state.currentDesignId,
    })),

  setRowLayout: (rowId, widths) =>
    set((state) => {
      const row = state.rows.find((r) => r.id === rowId);
      if (!row) return state;
      const n = widths.length;
      const newCols: EmailColumn[] = widths.map((w, i) => {
        const existing = row.columns[i];
        const col: EmailColumn = existing
          ? { ...existing, width: n === 1 ? undefined : w }
          : { id: generateId(), type: 'empty', content: {}, width: n === 1 ? undefined : w };
        return col;
      });
      return {
        rows: state.rows.map((r) => r.id !== rowId ? r : { ...r, columns: newCols }),
        past: pushHistory(state.past, state.rows),
        future: [],
        hasUnsavedChanges: !!state.currentDesignId,
      };
    }),

  insertSectionTemplate: (template, afterRowId) =>
    set((state) => {
      const newRows: EmailRow[] = template.rows.map((rowDef) => ({
        id: generateId(),
        columns: rowDef.columns.map((colDef) => ({
          id: generateId(),
          type: colDef.type,
          content: applyBrandKit(
            { ...getDefaultContent(colDef.type), ...(colDef.content ?? {}) },
            state.brandKit
          ),
        })),
        ...(rowDef.columnGap !== undefined ? { columnGap: rowDef.columnGap } : {}),
        ...(rowDef.outerPaddingX !== undefined ? { outerPaddingX: rowDef.outerPaddingX } : {}),
        ...(rowDef.outerPaddingY !== undefined ? { outerPaddingY: rowDef.outerPaddingY } : {}),
      }));
      const past = pushHistory(state.past, state.rows);
      if (!afterRowId) {
        return { rows: [...state.rows, ...newRows], past, future: [], hasUnsavedChanges: !!state.currentDesignId };
      }
      const idx = state.rows.findIndex((r) => r.id === afterRowId);
      const next = [...state.rows];
      next.splice(idx + 1, 0, ...newRows);
      return { rows: next, past, future: [], hasUnsavedChanges: !!state.currentDesignId };
    }),

  // ── Brand kit ─────────────────────────────────────────────────────────────
  updateBrandKit: (kit) =>
    set((state) => ({ brandKit: { ...state.brandKit, ...kit } })),

  applyBrandKitToAll: () =>
    set((state) => {
      const kit = state.brandKit;
      const newRows = state.rows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => {
          const newContent = { ...col.content } as SectionContent;
          for (const key of COLOR_CONTENT_KEYS) {
            const currentValue = (newContent as Record<string, unknown>)[key];
            if (typeof currentValue === 'string' && currentValue.startsWith('#')) {
              const token = hexToToken(currentValue, kit);
              if (token) {
                (newContent as Record<string, unknown>)[key] = token;
              }
            }
          }
          return { ...col, content: newContent };
        }),
      }));
      return {
        rows: newRows,
        past: pushHistory(state.past, state.rows),
        future: [],
        hasUnsavedChanges: !!state.currentDesignId,
      };
    }),

  // ── Other ─────────────────────────────────────────────────────────────────
  updateEmailDetails: (details) =>
    set((state) => ({
      emailDetails: { ...state.emailDetails, ...details },
      hasUnsavedChanges: !!state.currentDesignId,
    })),

  setMode: (mode) => {
    const { rows, theme, emailDetails, brandKit } = get();
    const assembled = assembleEmailHTML(rows, theme, emailDetails.previewText, undefined, brandKit);
    set({ mode, htmlCode: assembled });
  },

  setDevice: (device) => set({ device }),
  setTheme: (theme) => set({ theme }),
  setClient: (client) => set({ client }),
  setHtmlCode: (code) => set({ htmlCode: code }),
  setCurrentDesign: (id, name, version = null) => set({ currentDesignId: id, currentDesignName: name, currentDesignVersion: version, hasUnsavedChanges: false }),
  markSaved: () => set({ hasUnsavedChanges: false }),

  setCurrentDesignName: (name) => {
    const { currentDesignId } = get();
    if (currentDesignId) renameDesignInStorage(currentDesignId, name);
    set({ currentDesignName: name });
  },

  setVariable: (key, value) =>
    set((state) => {
      const newVariables = { ...state.variables, [key]: value };
      return {
        variables: newVariables,
        variableUsage: updateVariableUsage(state.rows, newVariables, state.brandKit),
        hasUnsavedChanges: !!state.currentDesignId,
      };
    }),

  removeVariable: (key) =>
    set((state) => {
      const newVariables = { ...state.variables };
      delete newVariables[key];
      return {
        variables: newVariables,
        variableUsage: updateVariableUsage(state.rows, newVariables, state.brandKit),
        hasUnsavedChanges: !!state.currentDesignId,
      };
    }),

  loadTemplate: (template) =>
    set((state) => ({
      rows: sectionsToRows(template.sections),
      past: [],
      future: [],
      selected: null,
      mode: 'visual',
      variables: {},
      variableUsage: {},
      currentDesignId: null,
      currentDesignName: '',
      currentDesignVersion: null,
      hasUnsavedChanges: false,
      ...(template.direction != null
        ? { brandKit: { ...state.brandKit, direction: template.direction } }
        : {}),
    })),

  loadSavedDesign: (design) => {
    const variables = design.variables ?? {};
    set({
      rows: design.rows,
      past: [],
      future: [],
      emailDetails: design.emailDetails,
      theme: design.theme,
      variables,
      variableUsage: updateVariableUsage(design.rows, variables),
      brandKit: design.brandKit ?? DEFAULT_BRAND_KIT,
      selected: null,
      mode: 'visual',
      currentDesignId: design.id,
      currentDesignName: design.name,
      currentDesignVersion: design.version ?? null,
      hasUnsavedChanges: false,
    });
  },

  loadHtml: (html) => {
    const id = Math.random().toString(36).slice(2, 9);
    set({
      rows: [{ id, columns: [{ id: id + 'c', type: 'html', content: { customHtml: html } }] }],
      past: [],
      future: [],
      selected: null,
      mode: 'visual',
      currentDesignId: null,
      currentDesignName: 'Imported HTML',
      currentDesignVersion: null,
      hasUnsavedChanges: true,
    });
  },

  getAssembledHTML: () => {
    const { rows, theme, emailDetails, brandKit } = get();
    return assembleEmailHTML(rows, theme, emailDetails.previewText, undefined, brandKit);
  },
}));
