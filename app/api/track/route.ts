import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';

const ALLOWED_EVENTS = new Set([
  'editor.mode.changed',
  'client.preview.changed',
  'template.previewed',
]);

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { eventType?: string; metadata?: Record<string, unknown> };
  if (!body.eventType || !ALLOWED_EVENTS.has(body.eventType)) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createServerSupabaseClient();
  const userId = supabase ? (await supabase.auth.getUser()).data.user?.id ?? null : null;

  const service = createServiceSupabaseClient();
  if (service) {
    void service
      .from('usage_events')
      .insert({ user_id: userId, event_type: body.eventType, metadata: body.metadata ?? {} });
  }

  return NextResponse.json({ ok: true });
}
