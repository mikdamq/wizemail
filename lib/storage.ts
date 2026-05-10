import type { SavedDesign, SavedBlock, EmailRow, EmailDetails, ThemeMode, BrandKit } from './types';
import { sectionsToRows } from './email-utils';

const STORAGE_KEY = 'wizemail_designs';
const BLOCKS_KEY = 'wizemail_blocks';

function genId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function migrateDesign(raw: SavedDesign): SavedDesign {
  // Auto-migrate legacy designs that have sections[] but no rows[]
  if (!raw.rows && raw.sections) {
    return { ...raw, rows: sectionsToRows(raw.sections) };
  }
  // Ensure rows is always defined
  if (!raw.rows) {
    return { ...raw, rows: [] };
  }
  return raw;
}

export function getSavedDesigns(): SavedDesign[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedDesign[];
    return parsed.map(migrateDesign);
  } catch {
    return [];
  }
}

export function saveDesign(
  data: { name: string; rows: EmailRow[]; emailDetails: EmailDetails; theme: ThemeMode; variables?: Record<string, string>; brandKit?: BrandKit },
  existingId?: string
): SavedDesign {
  const designs = getSavedDesigns();
  const now = new Date().toISOString();

  if (existingId) {
    const idx = designs.findIndex((d) => d.id === existingId);
    if (idx !== -1) {
      const updated: SavedDesign = { ...designs[idx], ...data, updatedAt: now };
      designs[idx] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
      return updated;
    }
  }

  const newDesign: SavedDesign = { id: genId(), createdAt: now, updatedAt: now, ...data };
  designs.unshift(newDesign);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  return newDesign;
}

export function renameDesign(id: string, name: string): void {
  const designs = getSavedDesigns();
  const idx = designs.findIndex((d) => d.id === id);
  if (idx === -1) return;
  designs[idx] = { ...designs[idx], name, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
}

export function deleteDesign(id: string): void {
  const designs = getSavedDesigns().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
}

export function duplicateDesign(id: string): SavedDesign | null {
  const designs = getSavedDesigns();
  const original = designs.find((d) => d.id === id);
  if (!original) return null;
  const now = new Date().toISOString();
  const copy: SavedDesign = { ...original, id: genId(), name: `${original.name} (copy)`, createdAt: now, updatedAt: now };
  designs.unshift(copy);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  return copy;
}

// ── Saved blocks ─────────────────────────────────────────────────────────────

export function getSavedBlocks(): SavedBlock[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BLOCKS_KEY);
    return raw ? (JSON.parse(raw) as SavedBlock[]) : [];
  } catch {
    return [];
  }
}

export function saveBlock(name: string, row: EmailRow): SavedBlock {
  const blocks = getSavedBlocks();
  const block: SavedBlock = { id: genId(), name, createdAt: new Date().toISOString(), row };
  blocks.unshift(block);
  localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
  return block;
}

export function deleteBlock(id: string): void {
  const blocks = getSavedBlocks().filter((b) => b.id !== id);
  localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
}
