import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ plan: 'free', status: 'inactive', configured: false });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ plan: 'free', status: 'inactive', configured: true });
  }

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  return NextResponse.json({
    plan: data?.plan ?? 'free',
    status: data?.status ?? 'inactive',
    currentPeriodEnd: data?.current_period_end ?? null,
    configured: true,
  });
}
