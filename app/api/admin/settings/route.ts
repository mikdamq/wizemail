import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const supabase = createServiceSupabaseClient()!;
  const { data, error } = await supabase.from('app_settings').select('data').eq('id', 1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ settings: data.data });
}

export async function PATCH(req: NextRequest) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const patch = await req.json() as Record<string, unknown>;
  const supabase = createServiceSupabaseClient()!;

  // Merge patch into existing JSONB using Postgres || operator via rpc
  // Fallback: fetch + merge in JS
  const { data: current } = await supabase.from('app_settings').select('data').eq('id', 1).single();
  const merged = { ...(current?.data as Record<string, unknown> ?? {}), ...patch };

  const { error } = await supabase
    .from('app_settings')
    .update({ data: merged, updated_at: new Date().toISOString() })
    .eq('id', 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath('/api/app-settings');
  return NextResponse.json({ settings: merged });
}
