import Stripe from 'stripe';
import { env, isStripeConfigured } from '@/lib/env';

export function createStripeClient() {
  if (!isStripeConfigured()) return null;
  return new Stripe(env.stripeSecretKey, {
    apiVersion: '2026-04-22.dahlia',
  });
}
