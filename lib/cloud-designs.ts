import type { BrandKit, EmailDetails, EmailRow, SavedDesign, ThemeMode } from '@/lib/types';

export interface CloudDesignPayload {
  id?: string;
  name: string;
  rows: EmailRow[];
  emailDetails: EmailDetails;
  theme: ThemeMode;
  variables?: Record<string, string>;
  brandKit?: BrandKit;
  version?: number;
}

export interface CloudDesign extends SavedDesign {
  version: number;
}

export async function listCloudDesigns(): Promise<CloudDesign[]> {
  const response = await fetch('/api/designs', { cache: 'no-store' });
  if (!response.ok) return [];
  const data = (await response.json()) as { designs: CloudDesign[] };
  return data.designs;
}

export async function saveCloudDesign(payload: CloudDesignPayload): Promise<CloudDesign | null> {
  const response = await fetch('/api/designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as { design: CloudDesign };
  return data.design;
}

export async function deleteCloudDesign(id: string): Promise<boolean> {
  const response = await fetch(`/api/designs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return response.ok;
}

export async function renameCloudDesign(id: string, name: string, version?: number): Promise<CloudDesign | null> {
  const response = await fetch(`/api/designs/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, version }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as { design: CloudDesign };
  return data.design;
}
