import 'server-only';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export type TrackEventType =
  | 'user.signup'
  | 'user.login'
  | 'design.created'
  | 'design.saved'
  | 'design.deleted'
  | 'export.html'
  | 'export.mjml'
  | 'export.image'
  | 'template.used'
  | 'template.previewed'
  | 'editor.mode.changed'
  | 'client.preview.changed'
  | 'error.export.html'
  | 'error.export.mjml'
  | 'error.smtp'
  | 'error.render'
  | 'error.ai_generation';

export function trackEvent(
  eventType: TrackEventType,
  userId: string | null,
  metadata: Record<string, unknown> = {}
): void {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return;

  void supabase
    .from('usage_events')
    .insert({ user_id: userId, event_type: eventType, metadata });
}
