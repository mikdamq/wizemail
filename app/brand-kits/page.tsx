'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Palette, MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { listCloudBrandKits, saveCloudBrandKit, deleteCloudBrandKit } from '@/lib/cloud-brand-kits';
import type { SavedBrandKit } from '@/lib/cloud-brand-kits';

const DEFAULT_KIT = {
  primaryColor: '#E85D26',
  secondaryColor: '#F07A4A',
  backgroundColor: '#FFFFFF',
  textColor: '#111111',
  logoText: '',
  fontFamily: 'system',
  customColors: [],
  direction: 'ltr' as const,
};

export default function BrandKitsPage() {
  const router = useRouter();
  const [kits, setKits] = useState<SavedBrandKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listCloudBrandKits().then((list) => {
      setKits(list);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const createKit = async () => {
    setCreating(true);
    const saved = await saveCloudBrandKit('New brand kit', DEFAULT_KIT);
    setCreating(false);
    if (saved) router.push(`/brand-kits/${saved.id}`);
  };

  const startRename = (kit: SavedBrandKit) => {
    setRenamingId(kit.id);
    setRenameValue(kit.name);
    setMenuOpenId(null);
  };

  const commitRename = async (kit: SavedBrandKit) => {
    const name = renameValue.trim();
    if (!name || name === kit.name) { setRenamingId(null); return; }
    const updated = await saveCloudBrandKit(name, kit.kit, kit.id);
    if (updated) setKits((prev) => prev.map((k) => k.id === kit.id ? { ...k, name } : k));
    setRenamingId(null);
  };

  const deleteKit = async (id: string) => {
    setMenuOpenId(null);
    const ok = await deleteCloudBrandKit(id);
    if (ok) setKits((prev) => prev.filter((k) => k.id !== id));
  };

  const swatchColors = (kit: SavedBrandKit) => [
    kit.kit.primaryColor,
    kit.kit.secondaryColor,
    kit.kit.backgroundColor,
    kit.kit.textColor,
    ...(kit.kit.customColors ?? []),
  ].slice(0, 6);

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1
                className="text-2xl font-semibold"
                style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}
              >
                Brand Kits
              </h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Build your design system. Apply a kit in the email builder to use its colors and fonts.
              </p>
            </div>
            <button
              onClick={createKit}
              disabled={creating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              New kit
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl animate-pulse"
                  style={{ background: 'var(--surface)' }}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && kits.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'var(--surface)' }}
              >
                <Palette className="w-6 h-6" style={{ color: 'var(--text-subtle)' }} />
              </div>
              <p
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}
              >
                No brand kits yet.
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Create a kit to define your colors, fonts, and design tokens.
              </p>
              <button
                onClick={createKit}
                disabled={creating}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
              >
                <Plus className="w-4 h-4" />
                Create your first kit
              </button>
            </div>
          )}

          {/* Kit grid */}
          {!loading && kits.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {kits.map((kit) => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  swatches={swatchColors(kit)}
                  isRenaming={renamingId === kit.id}
                  renameValue={renameValue}
                  menuOpen={menuOpenId === kit.id}
                  menuRef={menuOpenId === kit.id ? menuRef : undefined}
                  onRenameChange={setRenameValue}
                  onRenameCommit={() => commitRename(kit)}
                  onRenameCancel={() => setRenamingId(null)}
                  onMenuToggle={() => setMenuOpenId(menuOpenId === kit.id ? null : kit.id)}
                  onStartRename={() => startRename(kit)}
                  onDelete={() => deleteKit(kit.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function KitCard({
  kit,
  swatches,
  isRenaming,
  renameValue,
  menuOpen,
  menuRef,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
  onMenuToggle,
  onStartRename,
  onDelete,
}: {
  kit: SavedBrandKit;
  swatches: string[];
  isRenaming: boolean;
  renameValue: string;
  menuOpen: boolean;
  menuRef?: React.RefObject<HTMLDivElement | null>;
  onRenameChange: (v: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onMenuToggle: () => void;
  onStartRename: () => void;
  onDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) inputRef.current?.focus();
  }, [isRenaming]);

  return (
    <div
      className="group relative rounded-2xl border overflow-hidden transition-all duration-150"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      {/* Color swatch strip */}
      <Link href={`/brand-kits/${kit.id}`} className="block">
        <div className="h-20 flex">
          {swatches.length > 0 ? swatches.map((color, i) => (
            <div key={i} className="flex-1" style={{ background: color }} />
          )) : (
            <div className="flex-1" style={{ background: 'var(--elevated)' }} />
          )}
        </div>
      </Link>

      {/* Card footer */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          {isRenaming ? (
            <div className="flex items-center gap-1">
              <input
                ref={inputRef}
                value={renameValue}
                onChange={(e) => onRenameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onRenameCommit();
                  if (e.key === 'Escape') onRenameCancel();
                }}
                className="text-sm font-medium rounded-md px-2 py-0.5 outline-none w-full"
                style={{
                  background: 'var(--elevated)',
                  border: '1px solid var(--accent)',
                  color: 'var(--text)',
                }}
              />
              <button onClick={onRenameCommit} className="p-1 rounded" style={{ color: 'var(--success)' }}>
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={onRenameCancel} className="p-1 rounded" style={{ color: 'var(--text-subtle)' }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link href={`/brand-kits/${kit.id}`} className="block">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{kit.name}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>
                {new Date(kit.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </Link>
          )}
        </div>

        {/* Three-dot menu */}
        {!isRenaming && (
          <div className="relative ml-2 flex-shrink-0" ref={menuRef}>
            <button
              onClick={(e) => { e.preventDefault(); onMenuToggle(); }}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-subtle)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--overlay)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-subtle)'; }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-36 rounded-xl shadow-2xl z-50 overflow-hidden py-1"
                style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}
              >
                <button
                  onClick={onStartRename}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'var(--overlay)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <Pencil className="w-3.5 h-3.5 flex-shrink-0" />
                  Rename
                </button>
                <button
                  onClick={onDelete}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.06)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
