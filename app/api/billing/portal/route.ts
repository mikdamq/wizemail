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
  if (userError || !userData.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${env.appUrl}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
