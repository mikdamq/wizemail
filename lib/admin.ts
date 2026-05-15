import 'server-only';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.toLowerCase());
}

export async function requireAdmin(): Promise<
  | { user: { id: string; email: string }; errorResponse: null }
  | { user: null; errorResponse: NextResponse }
> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Supabase not configured' }, { status: 503 }),
    };
  }
  const { data } = await supabase.auth.getUser();
  if (!data.user || !isAdminEmail(data.user.email)) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }
  return { user: { id: data.user.id, email: data.user.email! }, errorResponse: null };
}
