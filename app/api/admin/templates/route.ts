import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const supabase = createServiceSupabaseClient()!;
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ templates: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const body = await req.json() as Record<string, unknown>;
  const now = new Date().toISOString();

  const supabase = createServiceSupabaseClient()!;
  const { data, error } = await supabase
    .from('templates')
    .insert({
      ...body,
      use_count: 0,
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath('/api/templates');
  revalidatePath('/templates');
  return NextResponse.json({ template: data }, { status: 201 });
}
