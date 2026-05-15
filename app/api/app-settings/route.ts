import { NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export const revalidate = 60;

export async function GET() {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return NextResponse.json({
      featureFlags: { aiGeneration: true, templateMarketplace: true, clientPreviews: true },
      maintenanceMode: false,
      allowNewSignups: true,
    });
  }

  const { data } = await supabase.from('app_settings').select('data').eq('id', 1).single();
  const settings = (data?.data ?? {}) as Record<string, unknown>;
  const featureFlags = (settings.featureFlags ?? {
    aiGeneration: true,
    templateMarketplace: true,
    clientPreviews: true,
  }) as Record<string, boolean>;

  return NextResponse.json({
    featureFlags,
    maintenanceMode: (settings.maintenanceMode as boolean) ?? false,
    allowNewSignups: (settings.allowNewSignups as boolean) ?? true,
  });
}
