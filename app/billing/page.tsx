'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import type { SubscriptionPlan, SubscriptionStatus } from '@/lib/supabase/database.types';
import { PLAN_LIMITS } from '@/lib/plans';

export default function BillingPage() {
  const [plan, setPlan] = useState<SubscriptionPlan>('free');
  const [status, setStatus] = useState<SubscriptionStatus>('inactive');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/subscription')
      .then((response) => response.json())
      .then((data: { plan?: SubscriptionPlan; status?: SubscriptionStatus }) => {
        setPlan(data.plan ?? 'free');
        setStatus(data.status ?? 'inactive');
      })
      .catch(() => undefined);
  }, []);

  const openCheckout = async () => {
    setLoading(true);
    setMessage(null);
    const response = await fetch('/api/billing/checkout', { method: 'POST' });
    const data = (await response.json()) as { url?: string; error?: string };
    setLoading(false);
    if (data.url) window.location.href = data.url;
    else setMessage(data.error ?? 'Unable to open checkout.');
  };

  const openPortal = async () => {
    setLoading(true);
    setMessage(null);
    const response = await fetch('/api/billing/portal', { method: 'POST' });
    const data = (await response.json()) as { url?: string; error?: string };
    setLoading(false);
    if (data.url) window.location.href = data.url;
    else setMessage(data.error ?? 'Unable to open billing portal.');
  };

  return (
    <main className="min-h-[100dvh] bg-[#0f0f11] px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/builder" className="inline-flex items-center gap-2 text-xs text-[#71717a] hover:text-[#a1a1aa] mb-8">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to builder
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[#f4f4f5]">Plans</h1>
          <p className="text-sm text-[#71717a] mt-2">Current plan: <span className="text-[#f4f4f5]">{plan}</span> ({status})</p>
        </div>

        <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-4">
          <PlanCard
            name="Free"
            price="$0"
            active={plan === 'free'}
            features={[
              `${PLAN_LIMITS.free.exportsPerMonth} exports per month`,
              'Basic templates',
              'Basic previews',
              '1 brand kit',
            ]}
          />
          <PlanCard
            name="Pro"
            price="$19/mo"
            active={plan === 'pro'}
            emphasized
            features={[
              'Unlimited exports',
              'Premium templates',
              'Advanced accessibility checks',
              'Brand kits',
              'Test emails',
              'Export presets',
            ]}
            action={plan === 'pro' ? 'Manage billing' : 'Upgrade to Pro'}
            onAction={plan === 'pro' ? openPortal : openCheckout}
            loading={loading}
          />
        </div>

        {message && <p className="text-xs text-[#f59e0b] mt-4">{message}</p>}
      </div>
    </main>
  );
}

function PlanCard({
  name,
  price,
  features,
  active,
  emphasized = false,
  action,
  onAction,
  loading,
}: {
  name: string;
  price: string;
  features: string[];
  active: boolean;
  emphasized?: boolean;
  action?: string;
  onAction?: () => void;
  loading?: boolean;
}) {
  return (
    <section className={`rounded-2xl border p-5 ${emphasized ? 'border-[#6366f1]/40 bg-[#6366f1]/8' : 'border-[#2a2a2e] bg-[#161618]'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#f4f4f5]">{name}</h2>
          <p className="text-2xl font-semibold text-[#f4f4f5] mt-2">{price}</p>
        </div>
        {active && <span className="rounded-full bg-[#10b981]/10 text-[#10b981] text-[10px] px-2 py-1">Active</span>}
      </div>
      <ul className="mt-5 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-[#a1a1aa]">
            <Check className="w-3.5 h-3.5 text-[#10b981]" />
            {feature}
          </li>
        ))}
      </ul>
      {action && (
        <button
          onClick={onAction}
          disabled={loading}
          className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-[#6366f1] px-3 py-2 text-sm font-medium text-white hover:bg-[#818cf8] disabled:opacity-60 transition-colors"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {action}
        </button>
      )}
    </section>
  );
}
