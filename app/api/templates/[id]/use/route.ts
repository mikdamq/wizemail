import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const service = createServiceSupabaseClient();
  if (!service) return NextResponse.json({ ok: true });

  // Increment use_count
  void service
    .from('templates')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', id);

  // Track event (userId optional)
  const supabase = await createServerSupabaseClient();
  const userId = supabase ? (await supabase.auth.getUser()).data.user?.id ?? null : null;

  void service
    .from('usage_events')
    .insert({ user_id: userId, event_type: 'template.used', metadata: { templateId: id } });

  return NextResponse.json({ ok: true });
}
