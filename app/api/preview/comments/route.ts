import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/preview/comments?token=xxx — list comments for a preview
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });

  const { data, error } = await supabase
    .from('preview_comments')
    .select('id, author_name, body, created_at')
    .eq('token', token)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data ?? [] });
}

// POST /api/preview/comments — add a comment
export async function POST(request: NextRequest) {
  const body = await request.json() as { token: string; authorName: string; body: string };
  if (!body.token || !body.authorName?.trim() || !body.body?.trim()) {
    return NextResponse.json({ error: 'token, authorName, and body are required' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });

  // Verify the preview token exists and is not expired
  const { data: preview } = await supabase
    .from('preview_links')
    .select('expires_at')
    .eq('token', body.token)
    .single();

  if (!preview || new Date(preview.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Preview not found or expired' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('preview_comments')
    .insert({ token: body.token, author_name: body.authorName.trim(), body: body.body.trim() })
    .select('id, author_name, body, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment: data });
}
