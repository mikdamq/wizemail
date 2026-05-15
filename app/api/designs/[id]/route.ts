import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkUserAccess } from '@/lib/guards';
import type { Database } from '@/lib/supabase/database.types';

type DesignRow = Database['public']['Tables']['designs']['Row'];

function toSavedDesign(row: DesignRow) {
  return {
    id: row.id,
    name: row.name,
    rows: row.rows,
    emailDetails: row.email_details,
    theme: row.theme,
    variables: row.variables,
    brandKit: row.brand_kit ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
  };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const accessError = await checkUserAccess(userData.user.id);
  if (accessError) return accessError;

  const { id } = await params;
  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .eq('id', id)
    .eq('user_id', userData.user.id)
    .is('deleted_at', null)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ design: toSavedDesign(data) });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const accessErrorPatch = await checkUserAccess(userData.user.id);
  if (accessErrorPatch) return accessErrorPatch;

  const { id } = await params;
  const body = (await request.json()) as { name?: string; version?: number };

  const { data: existing } = await supabase
    .from('designs')
    .select('*')
    .eq('id', id)
    .eq('user_id', userData.user.id)
    .single();

  if (!existing) return NextResponse.json({ error: 'Design not found' }, { status: 404 });
  if (body.version !== undefined && body.version !== existing.version) {
    return NextResponse.json({ error: 'Design changed in another session', design: toSavedDesign(existing) }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('designs')
    .update({
      name: body.name ?? existing.name,
      version: existing.version + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userData.user.id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ design: toSavedDesign(data) });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const accessErrorDelete = await checkUserAccess(userData.user.id);
  if (accessErrorDelete) return accessErrorDelete;

  const { id } = await params;
  const { error } = await supabase
    .from('designs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userData.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
