import type { SubscriptionPlan } from '@/lib/supabase/database.types';

export const PLAN_LIMITS: Record<SubscriptionPlan, {
  exportsPerMonth: number | null;
  templates: 'basic' | 'premium';
  previews: 'basic' | 'advanced';
  brandKits: number | null;
  testEmailsPerMonth: number | null;
  exportPresets: boolean;
}> = {
  free: {
    exportsPerMonth: 5,
    templates: 'basic',
    previews: 'basic',
    brandKits: 1,
    testEmailsPerMonth: 0,
    exportPresets: false,
  },
  pro: {
    exportsPerMonth: null,
    templates: 'premium',
    previews: 'advanced',
    brandKits: null,
    testEmailsPerMonth: 100,
    exportPresets: true,
  },
  team: {
    exportsPerMonth: null,
    templates: 'premium',
    previews: 'advanced',
    brandKits: null,
    testEmailsPerMonth: null,
    exportPresets: true,
  },
  enterprise: {
    exportsPerMonth: null,
    templates: 'premium',
    previews: 'advanced',
    brandKits: null,
    testEmailsPerMonth: null,
    exportPresets: true,
  },
};

export function canUsePremiumTemplates(plan: SubscriptionPlan) {
  return PLAN_LIMITS[plan].templates === 'premium';
}

export function canUseAdvancedChecks(plan: SubscriptionPlan) {
  return PLAN_LIMITS[plan].previews === 'advanced';
}
