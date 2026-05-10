import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';

function safeRedirectPath(raw: string, base: string): string {
  try {
    const resolved = new URL(raw, base);
    if (resolved.origin !== new URL(base).origin) return '/builder';
    return resolved.pathname + resolved.search + resolved.hash;
  } catch {
    return '/builder';
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const rawNext = requestUrl.searchParams.get('next') ?? '/builder';

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase?.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(safeRedirectPath(rawNext, env.appUrl), env.appUrl));
}
