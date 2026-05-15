import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { BrandKit } from '@/lib/types';
import type { Database } from '@/lib/supabase/database.types';

type BrandKitRow = Database['public']['Tables']['brand_kits']['Row'];

function toBrandKit(row: BrandKitRow) {
  return {
    id: row.id,
    name: row.name,
    kit: row.kit,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ brandKits: [], configured: false });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { data, error } = await supabase
    .from('brand_kits')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ brandKits: data.map(toBrandKit), configured: true });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = (await request.json()) as { id?: string; name?: string; kit?: BrandKit };
  if (!body.kit) return NextResponse.json({ error: 'Missing brand kit data' }, { status: 400 });
  if (typeof body.kit !== 'object' || body.kit === null) {
    return NextResponse.json({ error: 'kit must be an object' }, { status: 400 });
  }
  if (JSON.stringify(body.kit).length > 50_000) {
    return NextResponse.json({ error: 'Brand kit data too large' }, { status: 413 });
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('brand_kits')
    .upsert({
      id: body.id,
      user_id: userData.user.id,
      name: body.name?.trim() || 'Brand kit',
      kit: body.kit,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ brandKit: toBrandKit(data) });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabase
    .from('brand_kits')
    .delete()
    .eq('id', id)
    .eq('user_id', userData.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
