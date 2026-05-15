import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/preview — create a preview link for the current design
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json() as { html: string; designId: string; designName: string; password?: string };
  if (!body.html || !body.designId) {
    return NextResponse.json({ error: 'html and designId are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('preview_links')
    .insert({
      design_id: body.designId,
      user_id: userData.user.id,
      html: body.html,
      design_name: body.designName ?? '',
      password: body.password ?? null,
    })
    .select('token, expires_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ token: data.token, expiresAt: data.expires_at });
}

// GET /api/preview?token=xxx — fetch preview (no auth required for public viewing)
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });

  const { data, error } = await supabase
    .from('preview_links')
    .select('html, design_name, expires_at, password')
    .eq('token', token)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Preview not found' }, { status: 404 });

  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Preview link has expired' }, { status: 410 });
  }

  // Don't expose the hashed password — just flag whether one is set
  return NextResponse.json({
    html: data.html,
    designName: data.design_name,
    expiresAt: data.expires_at,
    hasPassword: !!data.password,
    password: data.password,
  });
}
