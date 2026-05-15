import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const supabase = createServiceSupabaseClient()!;

  const [profileResult, subscriptionResult, designsResult, eventsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', id).single(),
    supabase.from('designs').select('id, name, created_at, updated_at').eq('user_id', id).is('deleted_at', null).order('updated_at', { ascending: false }).limit(20),
    supabase.from('usage_events').select('event_type, created_at, metadata').eq('user_id', id).order('created_at', { ascending: false }).limit(50),
  ]);

  return NextResponse.json({
    profile: profileResult.data,
    subscription: subscriptionResult.data,
    designs: designsResult.data ?? [],
    recentEvents: eventsResult.data ?? [],
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const body = (await req.json()) as {
    action: 'suspend' | 'unsuspend' | 'change_plan' | 'delete';
    plan?: string;
  };

  const supabase = createServiceSupabaseClient()!;

  if (body.action === 'suspend') {
    const { error } = await supabase
      .from('profiles')
      .update({ suspended_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (body.action === 'unsuspend') {
    const { error } = await supabase
      .from('profiles')
      .update({ suspended_at: null })
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (body.action === 'change_plan' && body.plan) {
    const { error } = await supabase
      .from('subscriptions')
      .update({ plan: body.plan, status: body.plan === 'free' ? 'inactive' : 'active', updated_at: new Date().toISOString() })
      .eq('user_id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (body.action === 'delete') {
    const { error } = await supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

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

  if (body.action === 'login_as') {
    const supabase = createServiceSupabaseClient()!;
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', id)
      .single();

    if (!profile?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    try {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: profile.email,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ loginUrl: data.properties?.action_link ?? null });
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
