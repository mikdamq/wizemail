import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? '';
  const since = searchParams.get('since') ?? '';

  const supabase = createServiceSupabaseClient()!;

  let query = supabase
    .from('usage_events')
    .select('id, user_id, event_type, metadata, created_at')
    .like('event_type', type ? type : 'error.%')
    .order('created_at', { ascending: false })
    .limit(200);

  if (since) {
    query = query.gte('created_at', since);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ events: data ?? [] });
}
