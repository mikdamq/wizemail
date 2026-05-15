import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { trackEvent } from '@/lib/track';
import { checkUserAccess } from '@/lib/guards';

interface ResendPayload {
  transport: 'resend';
  to: string;
  subject: string;
  html: string;
  resendApiKey: string;
  fromEmail: string;
  fromName: string;
}

interface SmtpPayload {
  transport: 'smtp';
  to: string;
  subject: string;
  html: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
    fromName: string;
  };
}

type Payload = ResendPayload | SmtpPayload;

export async function POST(req: NextRequest) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const accessError = await checkUserAccess(userData.user.id);
  if (accessError) return accessError;

  const { to, subject, html } = body;
  if (!to || !subject || !html) {
    return NextResponse.json({ error: 'Missing required fields: to, subject, html' }, { status: 400 });
  }

  try {
    if (body.transport === 'resend') {
      if (!body.resendApiKey) {
        return NextResponse.json({ error: 'Resend API key is required' }, { status: 400 });
      }
      const { Resend } = await import('resend');
      const resend = new Resend(body.resendApiKey);
      const from = body.fromName
        ? `${body.fromName} <${body.fromEmail || 'onboarding@resend.dev'}>`
        : (body.fromEmail || 'onboarding@resend.dev');
      const result = await resend.emails.send({ from, to: [to], subject, html });
      if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 422 });
      }
      return NextResponse.json({ success: true, id: result.data?.id });
    }

    if (body.transport === 'smtp') {
      const { smtp } = body;
      if (!smtp?.host || !smtp?.from) {
        return NextResponse.json({ error: 'SMTP host and from address are required' }, { status: 400 });
      }
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port || 587,
        secure: smtp.secure ?? smtp.port === 465,
        auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
      });
      await transporter.sendMail({
        from: smtp.fromName ? `"${smtp.fromName}" <${smtp.from}>` : smtp.from,
        to,
        subject,
        html,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid transport' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send email';
    const userId = (await (await createServerSupabaseClient())?.auth.getUser())?.data.user?.id ?? null;
    trackEvent('error.smtp', userId, { error: message, transport: body.transport });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
