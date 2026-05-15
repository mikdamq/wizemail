import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';
import { trackEvent } from '@/lib/track';
import { checkUserAccess } from '@/lib/guards';

interface GenerateRequest {
  sectionType: string;
  field: string;
  headline?: string;
  bodyText?: string;
  buttonText?: string;
  emailSubject?: string;
}

export async function POST(req: NextRequest) {
  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { sectionType, field, headline, bodyText, buttonText, emailSubject } = body;

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const accessError = await checkUserAccess(userData.user.id);
  if (accessError) return accessError;

  // Check feature flag
  const serviceClient = createServiceSupabaseClient();
  if (serviceClient) {
    const { data: appSettings } = await serviceClient.from('app_settings').select('data').eq('id', 1).single();
    const flags = ((appSettings?.data as Record<string, unknown>)?.featureFlags ?? {}) as Record<string, boolean>;
    if (flags.aiGeneration === false) {
      return NextResponse.json({ error: 'AI generation is currently disabled' }, { status: 403 });
    }
  }

  if (!field) {
    return NextResponse.json({ error: 'field is required' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured on the server' }, { status: 500 });
  }

  const context = [
    emailSubject && `Email subject: "${emailSubject}"`,
    headline && `Current headline: "${headline}"`,
    bodyText && `Current body: "${bodyText}"`,
    buttonText && `Current CTA: "${buttonText}"`,
  ].filter(Boolean).join('\n');

  let prompt: string;
  const fieldLower = field.toLowerCase();
  if (fieldLower.includes('headline') || fieldLower.includes('title') || fieldLower.includes('subject')) {
    prompt = `Write a compelling headline for a ${sectionType} section of a marketing email.${context ? `\n\nContext:\n${context}` : ''}\n\nRespond with ONLY the headline text — no quotes, no explanation, no punctuation at the end unless it is a natural part of the headline.`;
  } else if (fieldLower.includes('button') || fieldLower.includes('cta') || fieldLower.includes('action')) {
    prompt = `Write a high-converting CTA button label (2–5 words) for a ${sectionType} section of a marketing email.${context ? `\n\nContext:\n${context}` : ''}\n\nRespond with ONLY the button text — no quotes, no explanation.`;
  } else {
    prompt = `Write compelling copy (1–3 sentences) for the "${field}" field in a ${sectionType} section of a marketing email.${context ? `\n\nContext:\n${context}` : ''}\n\nRespond with ONLY the text — no quotes, no labels, no explanation.`;
  }

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });

    const text =
      message.content[0]?.type === 'text' ? message.content[0].text.trim() : '';

    return NextResponse.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI generation failed';
    trackEvent('error.ai_generation', userData.user.id, { error: message, field, sectionType });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
