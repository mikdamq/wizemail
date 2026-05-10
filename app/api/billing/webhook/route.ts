import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/lib/env';
import { createStripeClient } from '@/lib/stripe';
import { createServiceSupabaseClient } from '@/lib/supabase/server';
import type { SubscriptionStatus } from '@/lib/supabase/database.types';

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  if (status === 'active' || status === 'trialing' || status === 'past_due' || status === 'canceled') return status;
  return 'inactive';
}

export async function POST(request: NextRequest) {
  const stripe = createStripeClient();
  const supabase = createServiceSupabaseClient();
  if (!stripe || !supabase || !env.stripeWebhookSecret) {
    return NextResponse.json({ error: 'Billing webhook is not configured' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.stripeWebhookSecret);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Invalid webhook signature' }, { status: 400 });
  }

  // Idempotency: skip if this event was already processed
  const { error: dupeError } = await supabase.from('stripe_events').insert({ id: event.id });
  if (dupeError?.code === '23505') {
    return NextResponse.json({ received: true });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id ?? session.metadata?.user_id;
    if (userId && session.customer) {
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan: 'pro',
        status: 'active',
        stripe_customer_id: String(session.customer),
        stripe_subscription_id: session.subscription ? String(session.subscription) : null,
        updated_at: new Date().toISOString(),
      });
    }
  }

  if (
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

    const periodEnd = 'current_period_end' in subscription && typeof subscription.current_period_end === 'number'
      ? subscription.current_period_end
      : subscription.items.data[0]?.current_period_end;

    await supabase
      .from('subscriptions')
      .update({
        plan: subscription.status === 'active' || subscription.status === 'trialing' ? 'pro' : 'free',
        status: mapStripeStatus(subscription.status),
        stripe_subscription_id: subscription.id,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId);
  }

  return NextResponse.json({ received: true });
}
