import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ ok: true });

  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ ok: true });

  const country =
    req.headers.get('x-vercel-ip-country') ??
    req.headers.get('cf-ipcountry') ??
    null;

  const service = createServiceSupabaseClient();
  if (service && country) {
    await service
      .from('profiles')
      .update({ country, updated_at: new Date().toISOString() })
      .eq('id', data.user.id)
      .is('country', null);
  }

  return NextResponse.json({ ok: true });
}
