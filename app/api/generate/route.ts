import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface GenerateRequest {
  sectionType: string;
  field: 'headline' | 'body' | 'buttonText';
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

  if (!field || !['headline', 'body', 'buttonText'].includes(field)) {
    return NextResponse.json({ error: 'Invalid field — must be headline, body, or buttonText' }, { status: 400 });
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
  if (field === 'headline') {
    prompt = `Write a compelling headline for a ${sectionType} section of a marketing email.${context ? `\n\nContext:\n${context}` : ''}\n\nRespond with ONLY the headline text — no quotes, no explanation, no punctuation at the end unless it is a natural part of the headline.`;
  } else if (field === 'body') {
    prompt = `Write compelling body copy (2–3 sentences) for a ${sectionType} section of a marketing email.${context ? `\n\nContext:\n${context}` : ''}\n\nRespond with ONLY the body text — no quotes, no labels, no explanation.`;
  } else {
    prompt = `Write a high-converting CTA button label (2–5 words) for a ${sectionType} section of a marketing email.${context ? `\n\nContext:\n${context}` : ''}\n\nRespond with ONLY the button text — no quotes, no explanation.`;
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
