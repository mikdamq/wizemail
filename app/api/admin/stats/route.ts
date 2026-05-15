import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const supabase = createServiceSupabaseClient()!;

  const [
    totalUsersResult,
    activeUsersResult,
    newSignupsResult,
    totalDesignsResult,
    exportsResult,
    paidResult,
    recentSignupsResult,
    topTemplatesResult,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase
      .from('usage_events')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .not('user_id', 'is', null),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .is('deleted_at', null),
    supabase.from('designs').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase
      .from('usage_events')
      .select('id', { count: 'exact', head: true })
      .like('event_type', 'export.%')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('subscriptions')
      .select('plan', { count: 'exact', head: true })
      .neq('plan', 'free')
      .eq('status', 'active'),
    supabase
      .from('profiles')
      .select('id, email, full_name, created_at, country')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('usage_events')
      .select('metadata')
      .eq('event_type', 'template.used')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  // Tally template usage
  const templateCounts: Record<string, number> = {};
  for (const row of topTemplatesResult.data ?? []) {
    const id = (row.metadata as { templateId?: string })?.templateId;
    if (id) templateCounts[id] = (templateCounts[id] ?? 0) + 1;
  }
  const topTemplates = Object.entries(templateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ id, count }));

  return NextResponse.json({
    totalUsers: totalUsersResult.count ?? 0,
    activeUsers30d: activeUsersResult.count ?? 0,
    newSignups7d: newSignupsResult.count ?? 0,
    totalDesigns: totalDesignsResult.count ?? 0,
    exports30d: exportsResult.count ?? 0,
    paidUsers: paidResult.count ?? 0,
    recentSignups: recentSignupsResult.data ?? [],
    topTemplates,
  });
}
