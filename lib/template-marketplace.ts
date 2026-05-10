import type { EmailTemplate } from '@/lib/templates';

const FEATURED_IDS = new Set([
  'saas-welcome-onboarding',
  'marketing-product-launch',
  'ecommerce-abandoned-cart',
  'seasonal-holiday-sale',
]);

const PREMIUM_CATEGORIES = new Set(['seasonal', 'interactive', 'industry']);

export function getTemplateAccess(template: EmailTemplate): 'free' | 'premium' {
  return template.access ?? (PREMIUM_CATEGORIES.has(template.mainCategory) ? 'premium' : 'free');
}

export function isFeaturedTemplate(template: EmailTemplate) {
  return template.featured ?? FEATURED_IDS.has(template.id);
}

export function getTemplateCollection(template: EmailTemplate): string | null {
  if (template.collection) return template.collection;
  if (template.mainCategory === 'seasonal') return 'Seasonal';
  if (template.subCategory.includes('launch')) return 'Launch';
  if (template.subCategory.includes('welcome') || template.subCategory.includes('trial')) return 'Lifecycle';
  return null;
}
