import { NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export const revalidate = 30;

export async function GET() {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ templates: [] });
  }

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('published', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ templates: [] });
  }

  return NextResponse.json({ templates: data ?? [] });
}
