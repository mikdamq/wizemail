'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
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
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-10">
          <div className="mb-8">
            <h1
              className="text-2xl font-semibold"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}
            >
              Plans & Billing
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Current plan: <span style={{ color: 'var(--text)' }}>{plan}</span>{' '}
              <span style={{ color: 'var(--text-subtle)' }}>({status})</span>
            </p>
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

          {message && (
            <p className="text-xs mt-4" style={{ color: 'var(--warning)' }}>{message}</p>
          )}
        </div>
      </div>
    </AppShell>
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
    <section
      className="rounded-2xl border p-5"
      style={{
        background: emphasized ? 'var(--accent-dim)' : 'var(--surface)',
        borderColor: emphasized ? 'rgba(232,93,38,0.35)' : 'var(--border)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}>{name}</h2>
          <p className="text-2xl font-semibold mt-2" style={{ color: 'var(--text)' }}>{price}</p>
        </div>
        {active && (
          <span
            className="rounded-full text-[10px] px-2 py-1"
            style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}
          >
            Active
          </span>
        )}
      </div>
      <ul className="mt-5 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--success)' }} />
            {feature}
          </li>
        ))}
      </ul>
      {action && (
        <button
          onClick={onAction}
          disabled={loading}
          className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {action}
        </button>
      )}
    </section>
  );
}
