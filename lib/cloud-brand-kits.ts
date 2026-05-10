import type { BrandKit } from '@/lib/types';

export interface SavedBrandKit {
  id: string;
  name: string;
  kit: BrandKit;
  createdAt: string;
  updatedAt: string;
}

export async function listCloudBrandKits(): Promise<SavedBrandKit[]> {
  const response = await fetch('/api/brand-kits', { cache: 'no-store' });
  if (!response.ok) return [];
  const data = (await response.json()) as { brandKits: SavedBrandKit[] };
  return data.brandKits;
}

export async function saveCloudBrandKit(name: string, kit: BrandKit, id?: string): Promise<SavedBrandKit | null> {
  const response = await fetch('/api/brand-kits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, kit }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { brandKit: SavedBrandKit };
  return data.brandKit;
}
