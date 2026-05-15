import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { trackEvent } from '@/lib/track';
import { checkUserAccess } from '@/lib/guards';
import type { CloudDesignPayload } from '@/lib/cloud-designs';
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

export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ designs: [], configured: false });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const accessError = await checkUserAccess(userData.user.id);
  if (accessError) return accessError;

  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .eq('user_id', userData.user.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ designs: data.map(toSavedDesign), configured: true });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const accessError = await checkUserAccess(userData.user.id);
  if (accessError) return accessError;

  let body: CloudDesignPayload;
  try {
    body = (await request.json()) as CloudDesignPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.name || !Array.isArray(body.rows)) {
    return NextResponse.json({ error: 'Missing required design fields' }, { status: 400 });
  }

  const now = new Date().toISOString();

  if (body.id) {
    const { data: existing, error: fetchError } = await supabase
      .from('designs')
      .select('*')
      .eq('id', body.id)
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

    if (existing) {
      if (body.version !== undefined && body.version !== existing.version) {
        return NextResponse.json({
          error: 'Design changed in another session',
          design: toSavedDesign(existing),
        }, { status: 409 });
      }

      const { data, error } = await supabase
        .from('designs')
        .update({
          name: body.name,
          rows: body.rows,
          email_details: body.emailDetails,
          theme: body.theme,
          variables: body.variables ?? {},
          brand_kit: body.brandKit ?? null,
          version: existing.version + 1,
          updated_at: now,
          deleted_at: null,
        })
        .eq('id', body.id)
        .eq('user_id', userData.user.id)
        .select('*')
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      trackEvent('design.saved', userData.user.id, { designId: body.id });
      return NextResponse.json({ design: toSavedDesign(data) });
    }
  }

  const { data, error } = await supabase
    .from('designs')
    .insert({
      id: body.id,
      user_id: userData.user.id,
      name: body.name,
      rows: body.rows,
      email_details: body.emailDetails,
      theme: body.theme,
      variables: body.variables ?? {},
      brand_kit: body.brandKit ?? null,
      version: 1,
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  trackEvent('design.created', userData.user.id, { designId: data.id });
  return NextResponse.json({ design: toSavedDesign(data) }, { status: 201 });
}
