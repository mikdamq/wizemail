import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;
  const supabase = createServiceSupabaseClient()!;

  const { data, error } = await supabase
    .from('templates')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath('/api/templates');
  revalidatePath('/templates');
  return NextResponse.json({ template: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const supabase = createServiceSupabaseClient()!;

  const { error } = await supabase.from('templates').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath('/api/templates');
  revalidatePath('/templates');
  return NextResponse.json({ ok: true });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const body = (await req.json()) as { action: string };

  if (body.action === 'duplicate') {
    const supabase = createServiceSupabaseClient()!;
    const { data: source } = await supabase.from('templates').select('*').eq('id', id).single();
    if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const now = new Date().toISOString();
    const newId = `${source.id}-copy-${Date.now()}`;
    const { data, error } = await supabase
      .from('templates')
      .insert({ ...source, id: newId, name: `${source.name} (copy)`, use_count: 0, created_at: now, updated_at: now })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath('/api/templates');
    revalidatePath('/templates');
    return NextResponse.json({ template: data }, { status: 201 });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
