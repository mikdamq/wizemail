import 'server-only';
import { createServiceSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function checkUserAccess(userId: string): Promise<NextResponse | null> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from('profiles')
    .select('suspended_at, deleted_at')
    .eq('id', userId)
    .single();
  if (data?.deleted_at) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  if (data?.suspended_at) return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
  return null;
}
