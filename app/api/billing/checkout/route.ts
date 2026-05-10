import { NextResponse } from 'next/server';
import { createStripeClient } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';

export async function POST() {
  const stripe = createStripeClient();
  if (!stripe) return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: subscription?.stripe_customer_id ?? undefined,
    customer_email: subscription?.stripe_customer_id ? undefined : userData.user.email,
    client_reference_id: userData.user.id,
    line_items: [{ price: env.stripeProPriceId, quantity: 1 }],
    success_url: `${env.appUrl}/billing?checkout=success`,
    cancel_url: `${env.appUrl}/billing?checkout=cancelled`,
    metadata: {
      user_id: userData.user.id,
      plan: 'pro',
    },
  });

  return NextResponse.json({ url: session.url });
}
