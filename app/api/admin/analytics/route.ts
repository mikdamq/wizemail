import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const supabase = createServiceSupabaseClient()!;

  const [dauResult, exportResult, modeResult, clientResult] = await Promise.all([
    supabase.rpc('admin_get_active_users', { p_days: 30 }),
    supabase
      .from('usage_events')
      .select('event_type')
      .like('event_type', 'export.%')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('usage_events')
      .select('metadata')
      .eq('event_type', 'editor.mode.changed'),
    supabase
      .from('usage_events')
      .select('metadata')
      .eq('event_type', 'client.preview.changed'),
  ]);

  // Export breakdown
  const exportCounts: Record<string, number> = {};
  for (const row of exportResult.data ?? []) {
    exportCounts[row.event_type] = (exportCounts[row.event_type] ?? 0) + 1;
  }

  // Editor mode breakdown
  const modeCounts: Record<string, number> = {};
  for (const row of modeResult.data ?? []) {
    const mode = (row.metadata as { mode?: string })?.mode ?? 'unknown';
    modeCounts[mode] = (modeCounts[mode] ?? 0) + 1;
  }

  // Client preview breakdown
  const clientCounts: Record<string, number> = {};
  for (const row of clientResult.data ?? []) {
    const client = (row.metadata as { client?: string })?.client ?? 'unknown';
    clientCounts[client] = (clientCounts[client] ?? 0) + 1;
  }

  return NextResponse.json({
    dau: dauResult.data ?? [],
    exportBreakdown: exportCounts,
    editorModeBreakdown: modeCounts,
    clientPreviewBreakdown: clientCounts,
  });
}
