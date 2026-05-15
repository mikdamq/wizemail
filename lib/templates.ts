import type { SectionType, SectionContent } from './types';

export type MainCategory =
  | 'marketing' | 'ecommerce' | 'transactional' | 'saas'
  | 'engagement' | 'event' | 'survey' | 'lead'
  | 'corporate' | 'industry' | 'seasonal' | 'interactive' | 'arabic';

export interface SubCategoryDef {
  id: string;
  label: string;
}

export interface MainCategoryDef {
  id: MainCategory;
  label: string;
  color: string;
  subCategories: SubCategoryDef[];
}

export interface TemplateSectionDef {
  type: SectionType;
  content: SectionContent;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  mainCategory: MainCategory;
  subCategory: string;
  accentColor: string;
  access?: 'free' | 'premium';
  featured?: boolean;
  collection?: 'seasonal' | 'launch' | 'sales' | 'lifecycle';
  direction?: 'ltr' | 'rtl';
  sections: TemplateSectionDef[];
}

export const MAIN_CATEGORY_DEFS: MainCategoryDef[] = [
  {
    id: 'marketing',
    label: 'Marketing',
    color: '#10b981',
    subCategories: [
      { id: 'newsletter', label: 'Newsletter' },
      { id: 'launch', label: 'Product Launch' },
      { id: 'promotion', label: 'Promotion' },
    ],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    color: '#f59e0b',
    subCategories: [
      { id: 'abandoned-cart', label: 'Abandoned Cart' },
      { id: 'order-confirmation', label: 'Order Confirmation' },
      { id: 'back-in-stock', label: 'Back in Stock' },
    ],
  },
  {
    id: 'transactional',
    label: 'Transactional',
    color: '#6366f1',
    subCategories: [
      { id: 'otp', label: 'OTP / Verification' },
      { id: 'password-reset', label: 'Password Reset' },
      { id: 'payment-receipt', label: 'Payment Receipt' },
    ],
  },
  {
    id: 'saas',
    label: 'SaaS',
    color: '#0ea5e9',
    subCategories: [
      { id: 'welcome-onboarding', label: 'Welcome / Onboarding' },
      { id: 'trial-ending', label: 'Trial Ending' },
      { id: 'feature-announcement', label: 'Feature Announcement' },
    ],
  },
  {
    id: 'engagement',
    label: 'Engagement',
    color: '#ec4899',
    subCategories: [
      { id: 're-engagement', label: 'Re-engagement' },
      { id: 'birthday', label: 'Birthday' },
      { id: 'thank-you', label: 'Thank You' },
    ],
  },
  {
    id: 'event',
    label: 'Event',
    color: '#8b5cf6',
    subCategories: [
      { id: 'webinar-invite', label: 'Webinar Invite' },
      { id: 'event-reminder', label: 'Event Reminder' },
      { id: 'rsvp-confirmation', label: 'RSVP Confirmation' },
    ],
  },
  {
    id: 'survey',
    label: 'Survey & Feedback',
    color: '#14b8a6',
    subCategories: [
      { id: 'nps-survey', label: 'NPS Survey' },
      { id: 'product-feedback', label: 'Product Feedback' },
      { id: 'review-collection', label: 'Review Request' },
    ],
  },
  {
    id: 'lead',
    label: 'Lead Generation',
    color: '#f97316',
    subCategories: [
      { id: 'lead-magnet', label: 'Lead Magnet' },
      { id: 'sales-followup', label: 'Sales Follow-up' },
      { id: 'demo-request', label: 'Demo Request' },
    ],
  },
  {
    id: 'corporate',
    label: 'Corporate',
    color: '#64748b',
    subCategories: [
      { id: 'company-announcement', label: 'Company Announcement' },
      { id: 'hr-communication', label: 'HR Communication' },
      { id: 'partnership-outreach', label: 'Partnership Outreach' },
    ],
  },
  {
    id: 'industry',
    label: 'Industry-Specific',
    color: '#a855f7',
    subCategories: [
      { id: 'real-estate', label: 'Real Estate' },
      { id: 'restaurant', label: 'Restaurant' },
      { id: 'healthcare', label: 'Healthcare' },
    ],
  },
  {
    id: 'seasonal',
    label: 'Holiday & Seasonal',
    color: '#ef4444',
    subCategories: [
      { id: 'black-friday', label: 'Black Friday' },
      { id: 'christmas', label: 'Christmas' },
      { id: 'new-year', label: 'New Year' },
    ],
  },
  {
    id: 'interactive',
    label: 'Interactive',
    color: '#06b6d4',
    subCategories: [
      { id: 'poll-email', label: 'Poll Email' },
      { id: 'quiz-email', label: 'Quiz Email' },
      { id: 'interactive-survey', label: 'Interactive Survey' },
    ],
  },
  {
    id: 'arabic',
    label: 'عربي · Arabic',
    color: '#059669',
    subCategories: [
      { id: 'ramadan', label: 'Ramadan / رمضان' },
      { id: 'eid', label: 'Eid / عيد' },
      { id: 'arabic-ecommerce', label: 'E-commerce / تجارة' },
      { id: 'arabic-saas', label: 'SaaS / برمجيات' },
      { id: 'arabic-welcome', label: 'Welcome / ترحيب' },
    ],
  },
];

export function getMainCategoryDef(id: MainCategory): MainCategoryDef | undefined {
  return MAIN_CATEGORY_DEFS.find((c) => c.id === id);
}

export function getSubCategoryLabel(mainId: MainCategory, subId: string): string {
  const main = getMainCategoryDef(mainId);
  const sub = main?.subCategories.find((s) => s.id === subId);
  return sub?.label ?? subId;
}

const STD_FOOTER = (company = 'Acme Inc.', address = '123 Main Street, San Francisco, CA 94107'): TemplateSectionDef => ({
  type: 'footer',
  content: { backgroundColor: '#111111', textColor: '#6b7280', companyName: company, companyAddress: address, unsubscribeUrl: '#' },
});

const hdr = (logoText: string, bg = '#ffffff', tc = '#111111'): TemplateSectionDef => ({
  type: 'header',
  content: { logoText, backgroundColor: bg, textColor: tc },
});

const div = (bg = '#ffffff', color = '#e5e7eb'): TemplateSectionDef => ({
  type: 'divider',
  content: { backgroundColor: bg, dividerColor: color },
});

const sp = (h = 24, bg = '#ffffff'): TemplateSectionDef => ({
  type: 'spacer',
  content: { backgroundColor: bg, spacerHeight: h },
});

export const TEMPLATES: EmailTemplate[] = [

  // ── MARKETING ────────────────────────────────────────────────────────────────

  {
    id: 'marketing-newsletter',
    name: 'Monthly Newsletter',
    description: 'Curated updates, stories, and links for your subscriber base.',
    mainCategory: 'marketing',
    subCategory: 'newsletter',
    accentColor: '#7c3aed',
    featured: true,
    sections: [
      hdr('Agency', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#7c3aed',
          textColor: '#ffffff',
          headline: 'Let Us Help You Achieve Your Goals.',
          subheadline: 'Expert digital solutions for businesses ready to grow. Real results, measurable impact, every month.',
          buttonText: 'Get Started',
          buttonColor: '#ffffff',
          buttonTextColor: '#7c3aed',
          buttonUrl: '#',
          headlineFontSize: 38,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          headline: 'This Month in Numbers',
          buttonColor: '#7c3aed',
          statItems: [
            { value: '82', label: 'Projects' },
            { value: '36', label: 'Clients' },
            { value: '99%', label: 'Satisfaction' },
          ],
        },
      },
      div(),
      {
        type: 'features',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          headline: 'Why Choose Us',
          featureItems: [
            { title: 'Development', text: 'Modern web apps built for performance, scale, and long-term maintainability.' },
            { title: 'Marketing', text: 'Data-driven campaigns that reach the right audience and convert.' },
            { title: 'eCommerce', text: 'End-to-end store solutions from design through post-purchase flows.' },
            { title: 'Design', text: 'Brand identities and digital experiences that leave a lasting impression.' },
          ],
        },
      },
      div(),
      {
        type: 'articles',
        content: {
          backgroundColor: '#f9fafb',
          textColor: '#111111',
          headline: 'Recent Articles · Daily Updated',
          buttonColor: '#7c3aed',
          articleItems: [
            { title: 'Teamwork as a team is the best way to do', date: '12 May, 2025', excerpt: 'Discover how modern collaboration tools are transforming the way agencies deliver results.', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&q=80', url: '#' },
            { title: 'How to survive on the great industry age', date: '17 May, 2025', excerpt: 'Staying competitive means adapting fast. Here is what the top agencies are doing differently.', imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=300&q=80', url: '#' },
          ],
        },
      },
      sp(8, '#f9fafb'),
      {
        type: 'cta',
        content: {
          backgroundColor: '#7c3aed',
          textColor: '#ffffff',
          headline: 'Contact Me to Get Your Work Done',
          buttonText: 'Get In Touch',
          buttonColor: '#ffffff',
          buttonTextColor: '#7c3aed',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'marketing-launch',
    name: 'Product Launch',
    description: 'Build anticipation and drive conversions for a new release.',
    mainCategory: 'marketing',
    subCategory: 'launch',
    accentColor: '#10b981',
    sections: [
      hdr('Agency', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#064e3b',
          textColor: '#ffffff',
          headline: 'We Care About Your Business',
          subheadline: 'A complete growth partnership — strategy, execution, and measurable results from day one.',
          buttonText: 'Read More',
          buttonColor: '#10b981',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 36,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          headline: 'What We Can',
          featureItems: [
            { title: 'Digital Marketing', text: 'SEO, paid ads, and social strategies that drive qualified traffic and leads.' },
            { title: 'Web Design Development', text: 'Beautiful, fast websites that turn visitors into loyal customers.' },
            { title: 'Research', text: 'Deep market analysis to uncover opportunities your competitors have missed.' },
            { title: 'Data', text: 'Analytics and reporting so every decision is backed by real numbers.' },
            { title: 'Marketing', text: 'Full-funnel campaigns from awareness to conversion and retention.' },
          ],
        },
      },
      div(),
      {
        type: 'stats',
        content: {
          backgroundColor: '#f0fdf4',
          textColor: '#064e3b',
          headline: 'To Have the Perfect Control',
          buttonColor: '#10b981',
          statItems: [
            { value: '82', label: 'Projects' },
            { value: '36', label: 'Clients' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#10b981',
          textColor: '#ffffff',
          headline: "Let's Make Something Great",
          buttonText: 'Get In Touch',
          buttonColor: '#ffffff',
          buttonTextColor: '#10b981',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'marketing-promotion',
    name: 'Promotional Offer',
    description: 'Time-limited discount or offer to drive immediate action.',
    mainCategory: 'marketing',
    subCategory: 'promotion',
    accentColor: '#f97316',
    sections: [
      hdr('Agency', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#1c1917',
          textColor: '#ffffff',
          headline: 'Design Makes Anything Possible',
          subheadline: 'For a limited time, get our complete service package at an exclusive rate. No compromises, just results.',
          buttonText: 'Get In Touch',
          buttonColor: '#f97316',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 38,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          headline: 'Provide Solution by Our Expert',
          featureItems: [
            { title: 'All SEO and Online Marketing Needs', text: 'Talk more about your project and how we help businesses grow faster.' },
            { title: 'Features Contact Me to Get Your Work Done', text: 'Read more about our services and see how we deliver results.' },
          ],
        },
      },
      div(),
      {
        type: 'pricing',
        content: {
          backgroundColor: '#f9fafb',
          textColor: '#111111',
          headline: 'Choose From Our Most Affordable Pricing Plans',
          buttonColor: '#f97316',
          pricingPlans: [
            { name: 'Starter', price: 'Free', period: '', features: ['5 Projects', '10 GB Storage', 'Email Support', 'Basic Analytics'], buttonText: 'Get Started', buttonUrl: '#', highlight: false },
            { name: 'Pro', price: '$29', period: '/mo', features: ['Unlimited Projects', '100 GB Storage', 'Priority Support', 'Advanced Analytics', 'Team Access'], buttonText: 'Buy Now', buttonUrl: '#', highlight: true },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#f97316',
          textColor: '#ffffff',
          headline: 'Contact Me to Get Your Work Done',
          buttonText: 'Get My Discount',
          buttonColor: '#ffffff',
          buttonTextColor: '#f97316',
          buttonUrl: '#',
        },
      },
      STD_FOOTER('Agency Inc.', '789 Commerce Blvd, Austin, TX 78701'),
    ],
  },

  // ── ECOMMERCE ─────────────────────────────────────────────────────────────────

  {
    id: 'ecommerce-abandoned-cart',
    name: 'Abandoned Cart',
    description: 'Recover lost sales by reminding customers of items left behind.',
    mainCategory: 'ecommerce',
    subCategory: 'abandoned-cart',
    accentColor: '#f59e0b',
    sections: [
      hdr('Shop', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#111111',
          textColor: '#ffffff',
          headline: 'You Left Something Behind',
          subheadline: 'Your cart is saved and items are going fast. Come back and complete your order before they sell out.',
          buttonText: 'Return to Cart',
          buttonColor: '#f59e0b',
          buttonTextColor: '#111111',
          buttonUrl: '#',
          headlineFontSize: 34,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          headline: 'Still in Your Cart',
          featureItems: [
            { title: 'Premium Wireless Headphones', text: 'Color: Midnight Black · Qty: 1\n$199.00' },
            { title: 'Leather Phone Case', text: 'Color: Cognac Brown · Qty: 1\n$49.00' },
            { title: 'Cable Organizer Kit', text: 'Qty: 1\n$29.00' },
          ],
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#fffbeb',
          textColor: '#78350f',
          headline: 'Why Shop With Us',
          buttonColor: '#f59e0b',
          statItems: [
            { value: 'Free', label: 'Returns' },
            { value: '24h', label: 'Support' },
            { value: '4.9★', label: 'Rating' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#f59e0b',
          textColor: '#111111',
          headline: 'Free shipping on orders over $50. Easy returns.',
          buttonText: 'Complete My Purchase',
          buttonColor: '#111111',
          buttonTextColor: '#f59e0b',
          buttonUrl: '#',
        },
      },
      STD_FOOTER('Shop Inc.', '789 Commerce Blvd, Austin, TX 78701'),
    ],
  },

  {
    id: 'ecommerce-order-confirmation',
    name: 'Order Confirmation',
    description: 'Clean transactional receipt with order details and delivery info.',
    mainCategory: 'ecommerce',
    subCategory: 'order-confirmation',
    accentColor: '#10b981',
    sections: [
      hdr('Shop', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#064e3b',
          textColor: '#ffffff',
          headline: 'Order Confirmed',
          subheadline: 'Order #ACM-2847 is being processed. You will get a shipping notification within 24 hours.',
          buttonText: 'Track Your Order',
          buttonColor: '#10b981',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 36,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#f9fafb',
          textColor: '#111111',
          headline: 'Order Summary',
          featureItems: [
            { title: 'Premium Headphones', text: 'Color: Midnight Black · Qty: 1 · $199.00' },
            { title: 'Shipping', text: 'Expedited 2-day · $14.99\nEstimated delivery: Dec 18–20' },
            { title: 'Total Charged', text: 'Subtotal $199.00 + Shipping $14.99 + Tax $17.58\n= $231.57' },
          ],
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#ecfdf5',
          textColor: '#064e3b',
          headline: 'Our Promise',
          buttonColor: '#10b981',
          statItems: [
            { value: '2-day', label: 'Delivery' },
            { value: '30-day', label: 'Returns' },
            { value: '24/7', label: 'Support' },
          ],
        },
      },
      {
        type: 'text',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#6b7280',
          bodyText: 'Ship to: 456 Oak Avenue, Portland, OR 97201\n\nQuestions? Reply to this email or visit our Help Center.',
        },
      },
      STD_FOOTER('Shop Inc.', '789 Commerce Blvd, Austin, TX 78701'),
    ],
  },

  {
    id: 'ecommerce-back-in-stock',
    name: 'Back in Stock',
    description: 'Alert subscribers when a sold-out item is available again.',
    mainCategory: 'ecommerce',
    subCategory: 'back-in-stock',
    accentColor: '#0ea5e9',
    sections: [
      hdr('Shop', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#0c4a6e',
          textColor: '#ffffff',
          headline: "It's Back — Grab It Before It Sells Out",
          subheadline: 'The Pro Wireless Headphones you were watching are back. Only 24 units available.',
          buttonText: 'Shop Now',
          buttonColor: '#0ea5e9',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 34,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#f0f9ff',
          textColor: '#0c4a6e',
          headline: 'Why It Sold Out Last Time',
          buttonColor: '#0ea5e9',
          statItems: [
            { value: '24', label: 'Units Left' },
            { value: '2hrs', label: 'Sold Out Before' },
            { value: '4.8★', label: 'Rating' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#0ea5e9',
          textColor: '#ffffff',
          headline: 'Only 24 units left — they went in 2 hours last time',
          buttonText: 'Add to Cart →',
          buttonColor: '#ffffff',
          buttonTextColor: '#0ea5e9',
          buttonUrl: '#',
        },
      },
      STD_FOOTER('Shop Inc.', '789 Commerce Blvd, Austin, TX 78701'),
    ],
  },

  // ── TRANSACTIONAL ─────────────────────────────────────────────────────────────

  {
    id: 'transactional-otp',
    name: 'OTP / Verification Code',
    description: 'Secure one-time password for login or email verification.',
    mainCategory: 'transactional',
    subCategory: 'otp',
    accentColor: '#6366f1',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#1e1b4b',
          textColor: '#ffffff',
          headline: 'Verify Your Email Address',
          subheadline: 'Enter the 6-digit code below in the app to confirm your identity. This code expires in 10 minutes.',
          headlineFontSize: 32,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'announcement',
        content: {
          backgroundColor: '#f5f5ff',
          textColor: '#1e1b4b',
          headline: '748 291',
          bodyText: 'Your one-time verification code — expires in 10 minutes',
          headlineFontSize: 48,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'text',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#6b7280',
          bodyText: "If you didn't request this code, you can safely ignore this email. Your account is secure.\n\nNever share this code with anyone — Acme will never ask for it.",
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'transactional-password-reset',
    name: 'Password Reset',
    description: 'Clear, reassuring password reset with expiry warning.',
    mainCategory: 'transactional',
    subCategory: 'password-reset',
    accentColor: '#ef4444',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#111111',
          textColor: '#ffffff',
          headline: 'Reset Your Password',
          subheadline: 'We received a request to reset the password for your account. Click the button below to create a new one.',
          buttonText: 'Reset My Password',
          buttonColor: '#ef4444',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 34,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#fef2f2',
          textColor: '#111111',
          headline: 'Security Reminder',
          featureItems: [
            { title: 'Link expires in 1 hour', text: 'For your security, this reset link is only valid for 60 minutes.' },
            { title: 'Did not request this?', text: 'Ignore this email safely — your password will not change without your action.' },
            { title: 'Account concerns?', text: 'Contact us immediately at security@acme.com if you suspect unauthorized access.' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#ef4444',
          textColor: '#ffffff',
          headline: 'Ready to set your new password?',
          buttonText: 'Reset My Password',
          buttonColor: '#ffffff',
          buttonTextColor: '#ef4444',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'transactional-payment-receipt',
    name: 'Payment Receipt',
    description: 'Professional payment confirmation with itemised invoice.',
    mainCategory: 'transactional',
    subCategory: 'payment-receipt',
    accentColor: '#6366f1',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#1e1b4b',
          textColor: '#ffffff',
          headline: 'Payment Received — Thank You',
          subheadline: 'Invoice #INV-0094 for $299.00 has been successfully processed. Your receipt is below.',
          buttonText: 'Download PDF Receipt',
          buttonColor: '#6366f1',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 34,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#f5f5ff',
          textColor: '#1e1b4b',
          headline: 'Payment Summary',
          buttonColor: '#6366f1',
          statItems: [
            { value: '$299', label: 'Amount Paid' },
            { value: 'Visa', label: 'Card Type' },
            { value: 'Annual', label: 'Billing Cycle' },
          ],
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          headline: 'Invoice Details',
          featureItems: [
            { title: 'Acme Pro — Annual', text: 'Plan: Pro · Billing: Annual · Period: Jan 1 – Dec 31, 2025\n$299.00' },
            { title: 'Payment Method', text: 'Visa ending in 4242 · Charged Jan 1, 2025\nTransaction ID: txn_3Qq9bB2eZvKYlo2' },
            { title: 'Need a VAT Invoice?', text: 'Add your VAT number in Billing settings and we will include it on future invoices.' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#6366f1',
          textColor: '#ffffff',
          headline: 'Manage your billing and payment methods',
          buttonText: 'Go to Billing →',
          buttonColor: '#ffffff',
          buttonTextColor: '#6366f1',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  // ── SAAS ──────────────────────────────────────────────────────────────────────

  {
    id: 'saas-welcome-onboarding',
    name: 'Welcome & Onboarding',
    description: 'Onboard new users with a warm welcome and key next steps.',
    mainCategory: 'saas',
    subCategory: 'welcome-onboarding',
    accentColor: '#6366f1',
    featured: true,
    sections: [
      hdr('Acme App', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#1e1b4b',
          textColor: '#ffffff',
          headline: 'Welcome to Acme, Sarah',
          subheadline: 'Your account is ready. Here is everything you need to get started in the next 10 minutes.',
          buttonText: 'Open Your Dashboard',
          buttonColor: '#6366f1',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 36,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#f5f5ff',
          textColor: '#1e1b4b',
          headline: 'You Are in Good Company',
          buttonColor: '#6366f1',
          statItems: [
            { value: '12k+', label: 'Teams' },
            { value: '78', label: 'Countries' },
            { value: '4.9★', label: 'Rating' },
          ],
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          headline: 'Get Up and Running Fast',
          featureItems: [
            { title: '1. Import Your Data', text: 'Connect your existing tools in minutes — Notion, Airtable, CSV, and 40+ sources.' },
            { title: '2. Invite Your Team', text: 'Add teammates with one click. Granular permissions so everyone sees exactly what they should.' },
            { title: '3. Set Up Automations', text: 'Save hours every week with our no-code automation builder. Templates for every workflow.' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#6366f1',
          textColor: '#ffffff',
          headline: 'Need a hand getting started?',
          buttonText: 'Schedule a 15-min Onboarding Call',
          buttonColor: '#ffffff',
          buttonTextColor: '#6366f1',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'saas-trial-ending',
    name: 'Trial Ending Soon',
    description: 'Nudge free trial users to convert before their trial expires.',
    mainCategory: 'saas',
    subCategory: 'trial-ending',
    accentColor: '#f97316',
    sections: [
      hdr('Acme App', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#111111',
          textColor: '#ffffff',
          headline: 'Your Trial Ends in 3 Days',
          subheadline: "Don't lose your work. Upgrade now to keep everything you've built and unlock the full Acme experience.",
          buttonText: 'Upgrade My Account',
          buttonColor: '#f97316',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 36,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#fff7ed',
          textColor: '#111111',
          headline: "What You Will Keep When You Upgrade",
          featureItems: [
            { title: 'All Your Projects', text: 'Your 4 active projects, 127 tasks, and all team comments stay exactly as you left them.' },
            { title: 'Automation Runs', text: 'Your automations continue running without interruption — no re-setup needed.' },
            { title: 'Team Access', text: 'Your 3 invited teammates keep their access immediately upon upgrade.' },
          ],
        },
      },
      {
        type: 'pricing',
        content: {
          backgroundColor: '#f9fafb',
          textColor: '#111111',
          headline: 'Simple, Transparent Pricing',
          buttonColor: '#f97316',
          pricingPlans: [
            { name: 'Starter', price: 'Free', period: '', features: ['5 Projects', 'Basic automations', 'Email support'], buttonText: 'Keep Free', buttonUrl: '#', highlight: false },
            { name: 'Pro', price: '$29', period: '/mo', features: ['Unlimited Projects', 'Advanced automations', 'Priority support', 'Team access', 'Analytics'], buttonText: 'Upgrade Now', buttonUrl: '#', highlight: true },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#f97316',
          textColor: '#ffffff',
          headline: 'Start at $29/month. Cancel anytime.',
          buttonText: 'Upgrade Now →',
          buttonColor: '#ffffff',
          buttonTextColor: '#f97316',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'saas-feature-announcement',
    name: 'Feature Announcement',
    description: 'Announce a new feature or changelog update to your user base.',
    mainCategory: 'saas',
    subCategory: 'feature-announcement',
    accentColor: '#0ea5e9',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#0c4a6e',
          textColor: '#ffffff',
          headline: 'New: Advanced Analytics Dashboard',
          subheadline: 'Your team now has access to a completely redesigned analytics experience. Here is what changed.',
          buttonText: 'Explore the New Dashboard',
          buttonColor: '#0ea5e9',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 34,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#f0f9ff',
          textColor: '#111111',
          headline: "What's Changed",
          featureItems: [
            { title: 'Real-time Data', text: 'All metrics update every 30 seconds. No more manual refreshes.' },
            { title: 'Custom Date Ranges', text: 'Analyze any time period with flexible date pickers and comparison views.' },
            { title: 'Export Reports', text: 'Download your data as CSV or PDF with one click from the dashboard.' },
            { title: 'Team Sharing', text: 'Share specific report views with colleagues via a permanent link.' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#0ea5e9',
          textColor: '#ffffff',
          headline: 'Available on all plans, starting today',
          buttonText: 'Check It Out →',
          buttonColor: '#ffffff',
          buttonTextColor: '#0ea5e9',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  // ── ENGAGEMENT ────────────────────────────────────────────────────────────────

  {
    id: 'engagement-reengagement',
    name: 'Re-engagement',
    description: "Win back inactive users who haven't logged in recently.",
    mainCategory: 'engagement',
    subCategory: 're-engagement',
    accentColor: '#8b5cf6',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#111111',
          textColor: '#ffffff',
          headline: 'We Miss You, Marcus',
          subheadline: "It's been 30 days since your last visit. A lot has changed — and we think you'll like what's new.",
          buttonText: 'See What You Missed',
          buttonColor: '#8b5cf6',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 36,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#f5f3ff',
          textColor: '#111111',
          headline: 'Since You Were Last Here',
          featureItems: [
            { title: 'Real-time Collaboration', text: 'Work with your team simultaneously in the same project. See cursors and edits live.' },
            { title: 'AI Writing Assistant', text: 'New AI tools that help you draft, summarize, and edit content 3x faster.' },
            { title: 'Redesigned Analytics', text: 'A completely new dashboard with real-time data, custom ranges, and one-click exports.' },
          ],
        },
      },
      {
        type: 'testimonial',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          quoteText: '"Coming back to Acme after a month away — the new analytics alone made the upgrade worth it. Everything is faster and cleaner."',
          authorName: 'Oliver Charlotte',
          authorTitle: 'Founder & CEO',
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#8b5cf6',
          textColor: '#ffffff',
          headline: 'Come back — your projects are waiting',
          buttonText: 'Log Back In →',
          buttonColor: '#ffffff',
          buttonTextColor: '#8b5cf6',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'engagement-birthday',
    name: 'Birthday Email',
    description: 'Delight users on their birthday with a personal message or offer.',
    mainCategory: 'engagement',
    subCategory: 'birthday',
    accentColor: '#ec4899',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#500724',
          textColor: '#ffffff',
          headline: 'Happy Birthday, Jamie!',
          subheadline: "On your special day, we wanted to say thank you for being part of the Acme family. Here's a little gift from us.",
          buttonText: 'Claim Your Birthday Gift',
          buttonColor: '#ec4899',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 38,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#fdf2f8',
          textColor: '#500724',
          headline: 'You Have Been With Us',
          buttonColor: '#ec4899',
          statItems: [
            { value: '2', label: 'Years' },
            { value: '147', label: 'Projects' },
            { value: '30%', label: 'Birthday Discount' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#ec4899',
          textColor: '#ffffff',
          headline: '30% off your next month — code BDAY30',
          buttonText: 'Apply Discount →',
          buttonColor: '#ffffff',
          buttonTextColor: '#ec4899',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'engagement-thank-you',
    name: 'Thank You',
    description: 'Express genuine gratitude to loyal customers or long-term users.',
    mainCategory: 'engagement',
    subCategory: 'thank-you',
    accentColor: '#10b981',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#064e3b',
          textColor: '#ffffff',
          headline: 'Thank You for Being With Us',
          subheadline: "You've been an Acme customer for 2 years. We don't take that for granted — and we wanted to say thank you personally.",
          buttonText: 'See Your Impact',
          buttonColor: '#10b981',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 36,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#ecfdf5',
          textColor: '#064e3b',
          headline: 'Your 2 Years With Acme',
          buttonColor: '#10b981',
          statItems: [
            { value: '147', label: 'Projects' },
            { value: '2304', label: 'Tasks Done' },
            { value: '89hrs', label: 'Time Saved' },
          ],
        },
      },
      {
        type: 'text',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#374151',
          bodyText: "Because of users like you, we've been able to grow our team from 5 to 42 people, ship 3 major product versions, and keep Acme profitable without outside funding.\n\nThank you, genuinely.",
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#10b981',
          textColor: '#ffffff',
          headline: 'A small gift — 3 months free on annual',
          buttonText: 'Claim Your Reward →',
          buttonColor: '#ffffff',
          buttonTextColor: '#10b981',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  // ── EVENT ─────────────────────────────────────────────────────────────────────

  {
    id: 'event-webinar-invite',
    name: 'Webinar Invite',
    description: 'Drive registrations for an online webinar or live session.',
    mainCategory: 'event',
    subCategory: 'webinar-invite',
    accentColor: '#8b5cf6',
    sections: [
      hdr('Acme Events', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#1e1b4b',
          textColor: '#ffffff',
          headline: 'Live Webinar: The Future of SaaS in 2025',
          subheadline: 'January 24, 2025 · 2:00 PM EST · 60 minutes · Free to attend\nJoin 500+ founders for an in-depth discussion on what is coming next.',
          buttonText: 'Reserve My Free Spot',
          buttonColor: '#8b5cf6',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 32,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#f5f3ff',
          textColor: '#1e1b4b',
          headline: 'The Event at a Glance',
          buttonColor: '#8b5cf6',
          statItems: [
            { value: '500+', label: 'Attendees' },
            { value: '60min', label: 'Duration' },
            { value: 'Free', label: 'Admission' },
          ],
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          headline: "What We'll Cover",
          featureItems: [
            { title: 'AI-driven Growth', text: 'How leading SaaS companies are using AI to reduce churn and increase expansion revenue.' },
            { title: 'Pricing Strategy', text: 'Real-world examples of pricing changes that increased ARR by 40%+ without losing customers.' },
            { title: 'Product-led Growth', text: 'Building a self-serve motion that converts free users to paid at scale.' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#8b5cf6',
          textColor: '#ffffff',
          headline: "Spots are capped at 500. Register now — it's free.",
          buttonText: 'Register for Free →',
          buttonColor: '#ffffff',
          buttonTextColor: '#8b5cf6',
          buttonUrl: '#',
        },
      },
      STD_FOOTER('Acme Events'),
    ],
  },

  {
    id: 'event-reminder',
    name: 'Event Reminder',
    description: 'Remind registered attendees about an upcoming event.',
    mainCategory: 'event',
    subCategory: 'event-reminder',
    accentColor: '#7c3aed',
    sections: [
      hdr('Acme Events', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#2e1065',
          textColor: '#ffffff',
          headline: 'Reminder: The Future of SaaS — Tomorrow',
          subheadline: "Your webinar is in 24 hours. Here's everything you need to join and get the most out of it.",
          buttonText: 'Add to Calendar',
          buttonColor: '#7c3aed',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 32,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#f5f3ff',
          textColor: '#111111',
          headline: 'Event Details',
          featureItems: [
            { title: 'When', text: 'January 24, 2025 · 2:00 PM – 3:00 PM EST\n(11:00 AM – 12:00 PM PST)' },
            { title: 'Join Link', text: 'zoom.us/j/98765432100\nMeeting ID: 987 6543 2100\nPasscode: future2025' },
            { title: 'Share With a Colleague', text: 'Forward this email or use the share link below. The more the merrier.' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#7c3aed',
          textColor: '#ffffff',
          headline: 'See you tomorrow!',
          buttonText: 'Join the Webinar →',
          buttonColor: '#ffffff',
          buttonTextColor: '#7c3aed',
          buttonUrl: '#',
        },
      },
      STD_FOOTER('Acme Events'),
    ],
  },

  {
    id: 'event-rsvp',
    name: 'RSVP Confirmation',
    description: 'Confirm event registration and share all the practical details.',
    mainCategory: 'event',
    subCategory: 'rsvp-confirmation',
    accentColor: '#14b8a6',
    sections: [
      hdr('Acme Events', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#134e4a',
          textColor: '#ffffff',
          headline: "You're In! See You on January 24th",
          subheadline: "Your spot for The Future of SaaS Webinar is confirmed. We've sent a calendar invite to your inbox.",
          buttonText: 'View Event Details',
          buttonColor: '#14b8a6',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 34,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#f0fdfa',
          textColor: '#111111',
          headline: 'Everything You Need',
          featureItems: [
            { title: 'Date & Time', text: 'January 24, 2025 · 2:00 PM EST\nDuration: 60 minutes' },
            { title: 'Join Link', text: 'zoom.us/j/98765432100\nYour confirmation code: ACME-7749' },
            { title: 'What to Prepare', text: 'No preparation needed — but bring your questions for the live Q&A at the end.' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#14b8a6',
          textColor: '#ffffff',
          headline: "Can't make it? All registered attendees receive a recording within 24 hours.",
          buttonText: 'View My Registration →',
          buttonColor: '#ffffff',
          buttonTextColor: '#14b8a6',
          buttonUrl: '#',
        },
      },
      STD_FOOTER('Acme Events'),
    ],
  },

  // ── SURVEY & FEEDBACK ─────────────────────────────────────────────────────────

  {
    id: 'survey-nps',
    name: 'NPS Survey',
    description: 'Net Promoter Score email to measure overall user satisfaction.',
    mainCategory: 'survey',
    subCategory: 'nps-survey',
    accentColor: '#14b8a6',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#134e4a',
          textColor: '#ffffff',
          headline: 'How Likely Are You to Recommend Acme?',
          subheadline: "We're constantly working to make Acme better. Your honest feedback takes 30 seconds and helps us prioritize what matters most.",
          headlineFontSize: 34,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#f0fdfa',
          textColor: '#134e4a',
          headline: 'How Others Have Rated Us',
          buttonColor: '#14b8a6',
          statItems: [
            { value: '4.9', label: 'Average Score' },
            { value: '89%', label: 'Promoters' },
            { value: '12k+', label: 'Responses' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#14b8a6',
          textColor: '#ffffff',
          headline: 'On a scale of 0–10, how likely are you to recommend Acme?',
          buttonText: 'Give My Score →',
          buttonColor: '#ffffff',
          buttonTextColor: '#14b8a6',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'survey-product-feedback',
    name: 'Product Feedback',
    description: 'Collect structured feedback on a specific feature or release.',
    mainCategory: 'survey',
    subCategory: 'product-feedback',
    accentColor: '#0ea5e9',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#0c4a6e',
          textColor: '#ffffff',
          headline: "We'd Love Your Feedback on the New Dashboard",
          subheadline: "You've been using the new Analytics Dashboard for 2 weeks. A 3-minute survey will help us improve it for everyone.",
          buttonText: 'Start the Survey',
          buttonColor: '#0ea5e9',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 32,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#f0f9ff',
          textColor: '#111111',
          headline: 'What We Want to Know',
          featureItems: [
            { title: 'Ease of Use', text: 'How easy was it to find the data you needed? What confused you?' },
            { title: 'Most-used Charts', text: 'Which metrics and visualizations do you rely on most day-to-day?' },
            { title: 'Comparison', text: 'How does the new dashboard compare to the old one? What is missing?' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#0ea5e9',
          textColor: '#ffffff',
          headline: 'Takes 3 minutes · No login required',
          buttonText: 'Share My Feedback →',
          buttonColor: '#ffffff',
          buttonTextColor: '#0ea5e9',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'survey-review-request',
    name: 'Review Request',
    description: 'Ask satisfied customers to leave a public review or testimonial.',
    mainCategory: 'survey',
    subCategory: 'review-collection',
    accentColor: '#f59e0b',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#78350f',
          textColor: '#ffffff',
          headline: 'Enjoying Acme? Tell the World.',
          subheadline: "You've been with us for 6 months. If Acme has helped your team, a quick review helps other teams find us.",
          buttonText: 'Leave a Review on G2',
          buttonColor: '#f59e0b',
          buttonTextColor: '#111111',
          buttonUrl: '#',
          headlineFontSize: 34,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'testimonial',
        content: {
          backgroundColor: '#fffbeb',
          textColor: '#111111',
          quoteText: '"Acme completely changed how our team works. We ship twice as fast and everyone is happier. A must-have for any growing team."',
          authorName: 'Amelia William',
          authorTitle: 'Founder & Product Lead',
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          headline: 'What Our Community Says',
          buttonColor: '#f59e0b',
          statItems: [
            { value: '4.9★', label: 'G2 Rating' },
            { value: '2k+', label: 'Reviews' },
            { value: '12k+', label: 'Teams' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#f59e0b',
          textColor: '#111111',
          headline: 'Takes 2 minutes — and we really appreciate it',
          buttonText: 'Write My Review →',
          buttonColor: '#111111',
          buttonTextColor: '#f59e0b',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  // ── LEAD GENERATION ───────────────────────────────────────────────────────────

  {
    id: 'lead-magnet-delivery',
    name: 'Lead Magnet Delivery',
    description: 'Deliver a content download and introduce your product.',
    mainCategory: 'lead',
    subCategory: 'lead-magnet',
    accentColor: '#f97316',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#111111',
          textColor: '#ffffff',
          headline: 'Your Free Guide Is Ready',
          subheadline: "Here's the 2025 SaaS Growth Playbook you requested. 47 pages of proven tactics, benchmarks, and templates.",
          buttonText: 'Download My Free Guide',
          buttonColor: '#f97316',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 36,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#fff7ed',
          textColor: '#111111',
          headline: 'Inside the Playbook',
          featureItems: [
            { title: 'Growth Tactics', text: '14 proven tactics used by top SaaS companies to hit their first $1M ARR.' },
            { title: 'Benchmark Data', text: 'Conversion rates, churn benchmarks, and pricing data across 500+ companies.' },
            { title: 'Ready-to-use Templates', text: 'Outreach scripts, onboarding sequences, and pricing page frameworks.' },
          ],
        },
      },
      {
        type: 'text',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#374151',
          headline: 'While You Read — a Quick Introduction',
          bodyText: "Acme helps SaaS teams manage projects, automate workflows, and track growth metrics — all in one place.\n\nMore than 12,000 teams use Acme to ship faster and retain more customers. Feel free to reply with any questions — I read every reply.",
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#f97316',
          textColor: '#ffffff',
          headline: 'Want to see Acme in action?',
          buttonText: 'Start Free Trial →',
          buttonColor: '#ffffff',
          buttonTextColor: '#f97316',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'lead-sales-followup',
    name: 'Sales Follow-up',
    description: 'Personal follow-up after a demo, trial signup, or inquiry.',
    mainCategory: 'lead',
    subCategory: 'sales-followup',
    accentColor: '#64748b',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#0f172a',
          textColor: '#ffffff',
          headline: 'Following Up on Your Acme Trial, Chris',
          subheadline: "You signed up 3 days ago and I noticed you've been exploring the automations feature — one of our most powerful. Anything I can help with?",
          buttonText: 'Book a 20-min Call',
          buttonColor: '#64748b',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 32,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'text',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#374151',
          headline: 'What Teams Like Yours Do With Automations',
          bodyText: "Auto-assign tasks based on project tags or team member load\nDaily digest emails sent automatically to stakeholders\nTrigger Slack messages when tasks reach specific stages\nZapier-style workflows without leaving Acme\n\nMost teams set up their first automation in under 10 minutes.",
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#f8fafc',
          textColor: '#111111',
          headline: 'Common Next Steps',
          featureItems: [
            { title: 'Book a Call', text: '15 minutes with me — I will walk you through setup for your specific use case.' },
            { title: 'Read the Docs', text: 'Our automation guide covers every trigger and action with real examples.' },
            { title: 'Join the Community', text: '2,400+ members sharing workflows, templates, and tips. Free to join.' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#0f172a',
          textColor: '#ffffff',
          headline: "Let's make sure your trial is worth your time",
          buttonText: 'Pick a Time That Works →',
          buttonColor: '#64748b',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'lead-demo-request',
    name: 'Demo Confirmation',
    description: 'Confirm a product demo and help prospects prepare.',
    mainCategory: 'lead',
    subCategory: 'demo-request',
    accentColor: '#0ea5e9',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#0c4a6e',
          textColor: '#ffffff',
          headline: 'Your Acme Demo Is Confirmed',
          subheadline: 'Tuesday, January 28 · 3:00 PM EST · 30 minutes\nYou will meet with Jordan from our solutions team.',
          buttonText: 'Add to Calendar',
          buttonColor: '#0ea5e9',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 34,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#f0f9ff',
          textColor: '#111111',
          headline: "What We'll Cover",
          featureItems: [
            { title: 'Your Specific Use Case', text: 'Jordan reviewed your signup notes — we will start by addressing the challenges you mentioned.' },
            { title: 'Live Product Walkthrough', text: 'A live demo tailored to your team size and industry. No generic slides.' },
            { title: 'Q&A', text: 'The last 10 minutes are open for any questions from you and your team.' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#0ea5e9',
          textColor: '#ffffff',
          headline: 'Bringing a colleague? Forward this email.',
          buttonText: 'Join the Meeting →',
          buttonColor: '#ffffff',
          buttonTextColor: '#0ea5e9',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  // ── CORPORATE ─────────────────────────────────────────────────────────────────

  {
    id: 'corporate-announcement',
    name: 'Company Announcement',
    description: 'Major company news shared with customers and stakeholders.',
    mainCategory: 'corporate',
    subCategory: 'company-announcement',
    accentColor: '#475569',
    sections: [
      hdr('Acme Inc.', '#0f172a', '#f8fafc'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#0f172a',
          textColor: '#ffffff',
          headline: 'Acme Has Raised $20M Series A',
          subheadline: 'Today we announced a $20M Series A round led by Sequoia Capital. Here is what it means for you as a customer.',
          buttonText: 'Read the Full Announcement',
          buttonColor: '#475569',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 36,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#f8fafc',
          textColor: '#0f172a',
          headline: 'The Numbers Behind the Milestone',
          buttonColor: '#475569',
          statItems: [
            { value: '$20M', label: 'Raised' },
            { value: '12k+', label: 'Teams' },
            { value: '5yrs', label: 'Building' },
          ],
        },
      },
      {
        type: 'text',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#374151',
          headline: 'A Message from Our CEO',
          bodyText: "Five years ago, we started Acme with a single goal: make project management feel effortless for engineering teams.\n\nToday, more than 12,000 teams trust Acme to run their operations. This funding lets us accelerate everything — more engineers, faster releases, enterprise security, and deeper integrations.\n\nYour product gets better. Your price stays the same. Thank you for being part of this journey.\n\n— Jamie Chen, CEO",
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#0f172a',
          textColor: '#ffffff',
          headline: "What's coming next",
          buttonText: 'Read Our Roadmap →',
          buttonColor: '#475569',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'corporate-hr',
    name: 'HR Communication',
    description: 'Internal HR notice for benefits, policy updates, or team news.',
    mainCategory: 'corporate',
    subCategory: 'hr-communication',
    accentColor: '#3b82f6',
    sections: [
      hdr('Acme People Team', '#1d4ed8', '#ffffff'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#1e3a8a',
          textColor: '#ffffff',
          headline: 'Updated: Parental Leave Policy',
          subheadline: 'Effective February 1, 2025, Acme is expanding parental leave to 20 weeks for all full-time employees globally.',
          buttonText: 'Read the Updated Policy',
          buttonColor: '#3b82f6',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 34,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'text',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#374151',
          headline: 'Key Changes',
          bodyText: "Primary caregivers: 20 weeks fully paid (was 12 weeks)\nSecondary caregivers: 10 weeks fully paid (was 4 weeks)\nAdoptive parents: same 20-week entitlement\nApplication process: updated form now in Lattice\n\nThis update applies to all employees globally, including contractors on long-term engagements of 6+ months.",
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#eff6ff',
          textColor: '#111111',
          headline: 'Other Updates in the Feb Refresh',
          featureItems: [
            { title: 'Health Benefits', text: 'Mental health coverage increased to $2,500/year. Includes therapy, coaching, and apps.' },
            { title: 'Remote Stipend', text: '$1,500/year home office stipend, up from $500. Receipts via Expensify as usual.' },
            { title: 'Learning Budget', text: '$2,000/year per employee for courses, books, and conferences. No pre-approval needed.' },
          ],
        },
      },
      STD_FOOTER('Acme People Team', '123 Main Street, San Francisco, CA 94107'),
    ],
  },

  {
    id: 'corporate-partnership',
    name: 'Partnership Outreach',
    description: 'Introduce a strategic partnership or integration collaboration.',
    mainCategory: 'corporate',
    subCategory: 'partnership-outreach',
    accentColor: '#7c3aed',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#2e1065',
          textColor: '#ffffff',
          headline: 'Acme + Notion: Better Together',
          subheadline: "We've partnered with Notion to bring a native two-way sync between your wikis and your Acme projects. Available today.",
          buttonText: 'Connect Notion Now',
          buttonColor: '#7c3aed',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 36,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          headline: 'What the Integration Does',
          featureItems: [
            { title: 'Two-way Sync', text: 'Sync Notion database rows as Acme tasks automatically — and push updates back in real time.' },
            { title: 'Instant Context', text: 'Link any Acme project to a Notion page for instant context without switching tools.' },
            { title: 'Shared Comments', text: 'Bi-directional comments so your team stays in sync wherever they work.' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#7c3aed',
          textColor: '#ffffff',
          headline: 'Free on all Acme plans. Setup in 5 minutes.',
          buttonText: 'Enable the Integration →',
          buttonColor: '#ffffff',
          buttonTextColor: '#7c3aed',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  // ── INDUSTRY-SPECIFIC ─────────────────────────────────────────────────────────

  {
    id: 'industry-real-estate',
    name: 'Real Estate Showcase',
    description: 'Promote a new listing or open house to a buyer audience.',
    mainCategory: 'industry',
    subCategory: 'real-estate',
    accentColor: '#b45309',
    sections: [
      hdr('Acme Realty', '#1c1917', '#f5f5f4'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#1c1917',
          textColor: '#ffffff',
          headline: 'New Listing: 142 Maple Grove, Portland',
          subheadline: '4 bed · 3 bath · 2,400 sqft · $849,000\nA stunning mid-century modern in the heart of Sellwood.',
          buttonText: 'View the Full Listing',
          buttonColor: '#b45309',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 34,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#fefce8',
          textColor: '#1c1917',
          headline: 'Property at a Glance',
          buttonColor: '#b45309',
          statItems: [
            { value: '4', label: 'Bedrooms' },
            { value: '3', label: 'Bathrooms' },
            { value: '2400', label: 'Sq Ft' },
          ],
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          headline: 'Property Highlights',
          featureItems: [
            { title: 'Renovated Kitchen', text: 'Fully remodeled in 2023. Quartz counters, custom cabinetry, and Wolf appliances.' },
            { title: 'Private Backyard', text: '900 sqft of landscaped outdoor space with a deck and mature trees. Fully fenced.' },
            { title: 'Prime Location', text: 'Two blocks from Sellwood Park, walkable to cafes, restaurants, and top-rated schools.' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#b45309',
          textColor: '#ffffff',
          headline: 'Open House: Saturday Jan 25 · 12:00 – 4:00 PM',
          buttonText: 'RSVP for the Open House',
          buttonColor: '#ffffff',
          buttonTextColor: '#b45309',
          buttonUrl: '#',
        },
      },
      STD_FOOTER('Acme Realty', '44 SE Morrison Street, Portland, OR 97214'),
    ],
  },

  {
    id: 'industry-restaurant',
    name: 'Restaurant Reservation',
    description: 'Confirm a dining reservation and share arrival details.',
    mainCategory: 'industry',
    subCategory: 'restaurant',
    accentColor: '#dc2626',
    sections: [
      hdr('Osteria Acme', '#1a0a00', '#fef3c7'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#7f1d1d',
          textColor: '#ffffff',
          headline: 'Your Table Is Confirmed',
          subheadline: "We're looking forward to having you at Osteria Acme. Your reservation details are below.",
          buttonText: 'Add to Calendar',
          buttonColor: '#dc2626',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 36,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#fff7ed',
          textColor: '#7f1d1d',
          headline: 'Your Reservation',
          buttonColor: '#dc2626',
          statItems: [
            { value: 'Jan 31', label: 'Date' },
            { value: '7:30 PM', label: 'Time' },
            { value: '4', label: 'Guests' },
          ],
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          headline: 'Everything You Need to Know',
          featureItems: [
            { title: 'Location', text: '88 North Beach Blvd, San Francisco\nValet parking available on-site from 6 PM' },
            { title: 'Contact Us', text: 'Need to change or cancel? Call (415) 555-0142 or reply to this email. 24-hour cancellation policy.' },
            { title: "Tonight's Menu", text: 'Seasonal truffle tasting experience and a new selection of biodynamic wines from the Piedmont region.' },
          ],
        },
      },
      STD_FOOTER('Osteria Acme', '88 North Beach Blvd, San Francisco, CA 94133'),
    ],
  },

  {
    id: 'industry-healthcare',
    name: 'Healthcare Appointment',
    description: 'Confirm a medical appointment with pre-visit instructions.',
    mainCategory: 'industry',
    subCategory: 'healthcare',
    accentColor: '#0891b2',
    sections: [
      hdr('Acme Health', '#164e63', '#ecfeff'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#164e63',
          textColor: '#ffffff',
          headline: 'Appointment Confirmed',
          subheadline: 'Your upcoming appointment with Dr. Sarah Lee has been scheduled. Please review the details below.',
          buttonText: 'View Appointment Details',
          buttonColor: '#0891b2',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 36,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#ecfeff',
          textColor: '#164e63',
          headline: 'Your Appointment',
          buttonColor: '#0891b2',
          statItems: [
            { value: 'Feb 4', label: 'Date' },
            { value: '10:15', label: 'Time' },
            { value: 'Dr. Lee', label: 'Physician' },
          ],
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          headline: 'What to Bring',
          featureItems: [
            { title: 'Documents', text: 'Photo ID, insurance card, and list of current medications.' },
            { title: 'Location', text: 'Acme Health Clinic, 320 Market Street, Suite 4, San Francisco\nFree parking in lot B.' },
            { title: 'Intake Form', text: 'Complete your intake form before your visit using the link below to save time.' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#0891b2',
          textColor: '#ffffff',
          headline: 'Please complete your intake form before your visit',
          buttonText: 'Complete Intake Form →',
          buttonColor: '#ffffff',
          buttonTextColor: '#0891b2',
          buttonUrl: '#',
        },
      },
      STD_FOOTER('Acme Health', '320 Market Street, San Francisco, CA 94105'),
    ],
  },

  // ── HOLIDAY & SEASONAL ────────────────────────────────────────────────────────

  {
    id: 'seasonal-black-friday',
    name: 'Black Friday',
    description: 'High-impact Black Friday sale announcement with urgency.',
    mainCategory: 'seasonal',
    subCategory: 'black-friday',
    accentColor: '#eab308',
    sections: [
      hdr('Acme', '#09090b', '#f4f4f5'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#09090b',
          textColor: '#ffffff',
          headline: 'Black Friday: 50% Off Everything',
          subheadline: 'Our biggest deal ever. Today only. No exceptions, no exclusions.',
          buttonText: 'Shop the Sale →',
          buttonColor: '#eab308',
          buttonTextColor: '#09090b',
          buttonUrl: '#',
          headlineFontSize: 40,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#1c1917',
          textColor: '#fef9c3',
          headline: 'The Deal in Numbers',
          buttonColor: '#eab308',
          statItems: [
            { value: '50%', label: 'Off Everything' },
            { value: '24hrs', label: 'Only' },
            { value: 'BF2025', label: 'Code' },
          ],
        },
      },
      {
        type: 'pricing',
        content: {
          backgroundColor: '#111111',
          textColor: '#ffffff',
          headline: "What's Included",
          buttonColor: '#eab308',
          pricingPlans: [
            { name: 'Pro Plan', price: '$49', period: '/mo', features: ['Was $99', 'Unlimited projects', 'Priority support', 'Advanced analytics'], buttonText: 'Get Pro', buttonUrl: '#', highlight: false },
            { name: 'Team Plan', price: '$79', period: '/mo', features: ['Was $159', 'Up to 20 seats', 'Admin controls', 'SSO + audit logs', 'Everything in Pro'], buttonText: 'Get Team', buttonUrl: '#', highlight: true },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#eab308',
          textColor: '#09090b',
          headline: 'Sale ends at midnight. Code: BF2025',
          buttonText: 'Claim 50% Off Now',
          buttonColor: '#09090b',
          buttonTextColor: '#eab308',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'seasonal-christmas',
    name: 'Christmas Campaign',
    description: 'Warm holiday email with a seasonal message and offer.',
    mainCategory: 'seasonal',
    subCategory: 'christmas',
    accentColor: '#dc2626',
    sections: [
      hdr('Acme', '#14532d', '#ffffff'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#14532d',
          textColor: '#ffffff',
          headline: 'Happy Holidays from Acme',
          subheadline: "As 2024 wraps up, we want to thank you for being part of our community this year. Here's a little something from us.",
          buttonText: 'Unwrap Your Gift →',
          buttonColor: '#dc2626',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 38,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#f0fdf4',
          textColor: '#14532d',
          headline: 'What a Year It Was',
          buttonColor: '#10b981',
          statItems: [
            { value: '3', label: 'Major Releases' },
            { value: '12k+', label: 'Teams' },
            { value: '78', label: 'Countries' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#dc2626',
          textColor: '#ffffff',
          headline: 'Your holiday gift: 2 months free — code HOLIDAY24',
          buttonText: 'Claim Your 2 Free Months',
          buttonColor: '#ffffff',
          buttonTextColor: '#dc2626',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'seasonal-new-year',
    name: 'New Year Campaign',
    description: 'Kick off the new year with a message and forward-looking offer.',
    mainCategory: 'seasonal',
    subCategory: 'new-year',
    accentColor: '#a78bfa',
    sections: [
      hdr('Acme', '#0a0a0f', '#f4f4f5'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#0a0a0f',
          textColor: '#ffffff',
          headline: 'Happy New Year — Make 2025 Count',
          subheadline: 'New year, new goals. Acme is here to help your team execute faster and waste less time on process.',
          buttonText: 'Start 2025 Strong →',
          buttonColor: '#a78bfa',
          buttonTextColor: '#0a0a0f',
          buttonUrl: '#',
          headlineFontSize: 36,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#1e1b4b',
          textColor: '#c4b5fd',
          headline: 'Your 2024 With Acme',
          buttonColor: '#a78bfa',
          statItems: [
            { value: '147', label: 'Projects' },
            { value: '2304', label: 'Tasks' },
            { value: '89hrs', label: 'Saved' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#a78bfa',
          textColor: '#1e1b4b',
          headline: 'New Year offer: 20% off annual plans through Jan 31',
          buttonText: 'Upgrade Now — Code NY2025',
          buttonColor: '#1e1b4b',
          buttonTextColor: '#a78bfa',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  // ── INTERACTIVE ───────────────────────────────────────────────────────────────

  {
    id: 'interactive-poll',
    name: 'Poll Email',
    description: 'Embed a simple poll to gauge audience opinions directly in email.',
    mainCategory: 'interactive',
    subCategory: 'poll-email',
    accentColor: '#06b6d4',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#164e63',
          textColor: '#ffffff',
          headline: 'Quick Question for You',
          subheadline: "We're deciding what to build next in Q1. Your vote will directly influence our roadmap. Takes 10 seconds.",
          headlineFontSize: 36,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#ecfeff',
          textColor: '#111111',
          headline: 'What Should We Build Next?',
          featureItems: [
            { title: 'AI Writing Assistant', text: 'Smart suggestions and auto-draft tools built directly into your workspace. Vote for this →' },
            { title: 'Calendar Integration', text: 'Two-way sync with Google Calendar and Outlook. See tasks and meetings in one view. Vote for this →' },
            { title: 'Advanced Reporting', text: 'Custom dashboards, scheduled reports, and exportable data in any format. Vote for this →' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#06b6d4',
          textColor: '#ffffff',
          headline: 'Cast your vote — results published next Friday',
          buttonText: 'Vote Now →',
          buttonColor: '#ffffff',
          buttonTextColor: '#06b6d4',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'interactive-quiz',
    name: 'Quiz Email',
    description: 'Engage subscribers with a quick knowledge quiz or product assessment.',
    mainCategory: 'interactive',
    subCategory: 'quiz-email',
    accentColor: '#7c3aed',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#2e1065',
          textColor: '#ffffff',
          headline: 'Quiz: What Type of Builder Are You?',
          subheadline: "Answer 4 quick questions and we'll tell you which Acme workflow matches your working style — plus the template to start with.",
          buttonText: 'Take the Quiz',
          buttonColor: '#7c3aed',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 34,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          headline: 'The Four Builder Types',
          featureItems: [
            { title: 'The Planner', text: 'You live in docs and spreadsheets. Structure first, execute second.' },
            { title: 'The Sprinter', text: 'You move fast and fix it later. Ship it, iterate, repeat.' },
            { title: 'The Connector', text: "You're the glue. Your job is aligning teams across tools and timelines." },
            { title: 'The Analyst', text: 'Data drives every decision. You want dashboards, not gut feelings.' },
          ],
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#f5f3ff',
          textColor: '#111111',
          headline: 'What You Get After the Quiz',
          featureItems: [
            { title: 'Your Builder Profile', text: 'A detailed breakdown of your working style and what tools complement it.' },
            { title: 'A Starter Template', text: 'A pre-built Acme workspace configured for your builder type. One click to import.' },
            { title: '3 Custom Tips', text: 'Actionable advice for getting the most out of Acme based on how you work.' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#7c3aed',
          textColor: '#ffffff',
          headline: '4 questions · 2 minutes · 100% worth it',
          buttonText: 'Start the Quiz →',
          buttonColor: '#ffffff',
          buttonTextColor: '#7c3aed',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  {
    id: 'interactive-survey-email',
    name: 'Interactive Survey',
    description: 'Invite subscribers to complete a short in-email survey.',
    mainCategory: 'interactive',
    subCategory: 'interactive-survey',
    accentColor: '#0891b2',
    sections: [
      hdr('Acme', '#ffffff', '#111111'),
      {
        type: 'hero',
        content: {
          backgroundColor: '#0c4a6e',
          textColor: '#ffffff',
          headline: '2 Minutes to Shape the Future of Acme',
          subheadline: "Every quarter we run a short survey to prioritize the roadmap. This is your chance to tell us what matters most.",
          buttonText: 'Start Survey',
          buttonColor: '#0891b2',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 34,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#ecfeff',
          textColor: '#0c4a6e',
          headline: 'About This Survey',
          buttonColor: '#0891b2',
          statItems: [
            { value: '5', label: 'Questions' },
            { value: '2min', label: 'Duration' },
            { value: '100%', label: 'Anonymous' },
          ],
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          headline: "What We're Asking About",
          featureItems: [
            { title: 'Feature Usage', text: 'Which features you use most (and least) in your day-to-day workflow.' },
            { title: 'Pain Points', text: "What's slowing your team down the most right now." },
            { title: 'Integrations', text: 'Which integrations you would like us to prioritize building next.' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#0891b2',
          textColor: '#ffffff',
          headline: '5 questions · completely anonymous · takes 2 minutes',
          buttonText: 'Give My Feedback →',
          buttonColor: '#ffffff',
          buttonTextColor: '#0891b2',
          buttonUrl: '#',
        },
      },
      STD_FOOTER(),
    ],
  },

  // ── ARABIC ───────────────────────────────────────────────────────────────────

  {
    id: 'arabic-ramadan-greeting',
    name: 'رمضان كريم — Ramadan Greeting',
    description: 'A warm Ramadan newsletter with RTL layout, crescent motifs, and Arabic typography.',
    mainCategory: 'arabic',
    subCategory: 'ramadan',
    accentColor: '#059669',
    direction: 'rtl',
    featured: true,
    sections: [
      {
        type: 'header',
        content: {
          logoText: 'شركتكم',
          backgroundColor: '#064e3b',
          textColor: '#a7f3d0',
        },
      },
      {
        type: 'hero',
        content: {
          backgroundColor: '#064e3b',
          textColor: '#f0fdf4',
          headline: 'رمضان كريم 🌙',
          subheadline: 'بمناسبة حلول شهر رمضان المبارك، نتقدم إليكم بأصدق التهاني والتمنيات بالصحة والسعادة والبركة في هذا الشهر الفضيل.',
          buttonText: 'اكتشف عروضنا الخاصة',
          buttonColor: '#059669',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 40,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'text',
        content: {
          backgroundColor: '#f0fdf4',
          textColor: '#064e3b',
          bodyText: 'يسعدنا في هذه المناسبة المباركة أن نُقدّم لكم مجموعة من العروض الحصرية خلال شهر رمضان. نتمنى لكم صياماً مقبولاً وإفطاراً شهياً.\n\nرمضان شهر الخير والعطاء، ونحن هنا لنكون معكم في كل خطوة.',
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#ecfdf5',
          textColor: '#064e3b',
          headline: 'عروض رمضان الحصرية',
          featureItems: [
            { title: 'خصم ٣٠٪', text: 'على جميع المنتجات المختارة طوال شهر رمضان المبارك.' },
            { title: 'توصيل مجاني', text: 'لجميع الطلبات التي تتجاوز ٢٠٠ ريال خلال الشهر.' },
            { title: 'هدايا رمضانية', text: 'هدية مميزة مع كل طلب يزيد عن ٥٠٠ ريال.' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#059669',
          textColor: '#ffffff',
          headline: 'لا تفوّت عروضنا الرمضانية الحصرية',
          buttonText: 'تسوّق الآن →',
          buttonColor: '#ffffff',
          buttonTextColor: '#059669',
          buttonUrl: '#',
        },
      },
      {
        type: 'footer',
        content: {
          backgroundColor: '#064e3b',
          textColor: '#6ee7b7',
          companyName: 'شركتكم',
          companyAddress: 'المملكة العربية السعودية، الرياض',
          unsubscribeUrl: '#',
        },
      },
    ],
  },

  {
    id: 'arabic-eid-celebration',
    name: 'عيد مبارك — Eid Celebration',
    description: 'Festive Eid al-Fitr or Eid al-Adha email with warm gold tones and RTL layout.',
    mainCategory: 'arabic',
    subCategory: 'eid',
    accentColor: '#d97706',
    direction: 'rtl',
    sections: [
      {
        type: 'header',
        content: {
          logoText: 'علامتكم',
          backgroundColor: '#78350f',
          textColor: '#fde68a',
        },
      },
      {
        type: 'hero',
        content: {
          backgroundColor: '#92400e',
          textColor: '#fffbeb',
          headline: 'عيد مبارك وسعيد 🎉',
          subheadline: 'تقبّل الله منا ومنكم صالح الأعمال. نتمنى لكم عيداً مليئاً بالفرحة والسرور والمحبة.',
          buttonText: 'تفضّل بزيارتنا',
          buttonColor: '#d97706',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 38,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#fffbeb',
          textColor: '#78350f',
          headline: 'احتفالاتنا معكم هذا العيد',
          buttonColor: '#d97706',
          statItems: [
            { value: '+٥٠٪', label: 'خصم العيد' },
            { value: '٢٤ ساعة', label: 'توصيل سريع' },
            { value: 'مجاناً', label: 'الإرجاع' },
          ],
        },
      },
      {
        type: 'text',
        content: {
          backgroundColor: '#fef3c7',
          textColor: '#78350f',
          bodyText: 'بمناسبة العيد السعيد، نقدم لكم أجمل العروض الاحتفالية. سواء كنتم تبحثون عن هدايا للأحبة أو مستلزمات الاحتفال، نحن هنا لنجعل عيدكم أكثر بهجة.',
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#d97706',
          textColor: '#ffffff',
          headline: 'اجعل عيدكم لا يُنسى مع عروضنا الحصرية',
          buttonText: 'استكشف العروض',
          buttonColor: '#ffffff',
          buttonTextColor: '#d97706',
          buttonUrl: '#',
        },
      },
      {
        type: 'footer',
        content: {
          backgroundColor: '#78350f',
          textColor: '#fde68a',
          companyName: 'علامتكم',
          companyAddress: 'الإمارات العربية المتحدة، دبي',
          unsubscribeUrl: '#',
        },
      },
    ],
  },

  {
    id: 'arabic-ecommerce-promo',
    name: 'عرض متجر — Arabic E-commerce Promo',
    description: 'Product promotion email for Arabic-speaking markets with RTL product grid.',
    mainCategory: 'arabic',
    subCategory: 'arabic-ecommerce',
    accentColor: '#7c3aed',
    direction: 'rtl',
    sections: [
      {
        type: 'header',
        content: {
          logoText: 'متجركم',
          backgroundColor: '#ffffff',
          textColor: '#111111',
        },
      },
      {
        type: 'hero',
        content: {
          backgroundColor: '#7c3aed',
          textColor: '#ffffff',
          headline: 'تخفيضات كبرى على أفضل المنتجات',
          subheadline: 'اكتشف مجموعتنا المختارة بعناية. جودة عالية، أسعار لا تُقاوم، توصيل سريع لباب منزلك.',
          buttonText: 'تسوّق الآن',
          buttonColor: '#ffffff',
          buttonTextColor: '#7c3aed',
          buttonUrl: '#',
          headlineFontSize: 34,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          headline: 'لماذا تختار متجرنا؟',
          featureItems: [
            { title: 'جودة مضمونة', text: 'جميع منتجاتنا مختارة بعناية ومعتمدة من فريق الجودة لدينا.' },
            { title: 'أسعار تنافسية', text: 'نضمن لك أفضل الأسعار في السوق مع عروض حصرية للمشتركين.' },
            { title: 'خدمة عملاء ٢٤/٧', text: 'فريقنا متاح على مدار الساعة للإجابة على استفساراتكم.' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#f3f4f6',
          textColor: '#111111',
          headline: 'العرض ينتهي خلال ٤٨ ساعة — لا تفوّته!',
          buttonText: 'احجز طلبك الآن',
          buttonColor: '#7c3aed',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
        },
      },
      {
        type: 'footer',
        content: {
          backgroundColor: '#111111',
          textColor: '#6b7280',
          companyName: 'متجركم',
          companyAddress: 'المملكة العربية السعودية، جدة',
          unsubscribeUrl: '#',
        },
      },
    ],
  },

  {
    id: 'arabic-saas-welcome',
    name: 'مرحباً بك في المنصة — Arabic SaaS Welcome',
    description: 'Onboarding welcome email for Arabic-first SaaS products with RTL layout.',
    mainCategory: 'arabic',
    subCategory: 'arabic-saas',
    accentColor: '#0ea5e9',
    direction: 'rtl',
    sections: [
      {
        type: 'header',
        content: {
          logoText: 'منصتكم',
          backgroundColor: '#0c4a6e',
          textColor: '#bae6fd',
        },
      },
      {
        type: 'hero',
        content: {
          backgroundColor: '#0c4a6e',
          textColor: '#f0f9ff',
          headline: 'مرحباً بك في منصتنا! 🚀',
          subheadline: 'نحن سعداء جداً بانضمامك إلينا. حسابك جاهز الآن وبإمكانك البدء فوراً باستخدام جميع الميزات.',
          buttonText: 'ابدأ الآن',
          buttonColor: '#0ea5e9',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
          headlineFontSize: 36,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'features',
        content: {
          backgroundColor: '#f0f9ff',
          textColor: '#0c4a6e',
          headline: 'ثلاث خطوات للبداية',
          featureItems: [
            { title: '١. أكمل ملفك الشخصي', text: 'أضف معلوماتك وشعار شركتك لتجربة مخصصة تماماً لك.' },
            { title: '٢. أنشئ مشروعك الأول', text: 'ابدأ بمشروع جديد أو استورد بياناتك الحالية بسهولة.' },
            { title: '٣. دعوة فريقك', text: 'شارك الوصول مع زملائك وابدأوا العمل معاً على الفور.' },
          ],
        },
      },
      {
        type: 'text',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          bodyText: 'هل تحتاج مساعدة في البدء؟ فريق الدعم الفني متاح لك على مدار الساعة. يمكنك أيضاً الاطلاع على مركز المساعدة لمقاطع الفيديو التعليمية والأدلة الإرشادية.',
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#0ea5e9',
          textColor: '#ffffff',
          headline: 'جاهز للبدء؟ لوحة التحكم تنتظرك',
          buttonText: 'اذهب إلى لوحة التحكم →',
          buttonColor: '#ffffff',
          buttonTextColor: '#0ea5e9',
          buttonUrl: '#',
        },
      },
      {
        type: 'footer',
        content: {
          backgroundColor: '#0c4a6e',
          textColor: '#bae6fd',
          companyName: 'منصتكم',
          companyAddress: 'المملكة العربية السعودية، الرياض',
          unsubscribeUrl: '#',
        },
      },
    ],
  },

  {
    id: 'arabic-welcome-newsletter',
    name: 'أهلاً وسهلاً — Arabic Welcome Newsletter',
    description: 'Warm subscriber welcome email for Arabic audiences with brand story and CTAs.',
    mainCategory: 'arabic',
    subCategory: 'arabic-welcome',
    accentColor: '#dc2626',
    direction: 'rtl',
    sections: [
      {
        type: 'header',
        content: {
          logoText: 'نشرتكم',
          backgroundColor: '#ffffff',
          textColor: '#111111',
        },
      },
      {
        type: 'hero',
        content: {
          backgroundColor: '#dc2626',
          textColor: '#ffffff',
          headline: 'أهلاً بك في عائلتنا! ❤️',
          subheadline: 'شكراً لاشتراكك في نشرتنا الإخبارية. كل أسبوع، نضع بين يديك أفضل المقالات والأفكار والعروض المختارة خصيصاً لك.',
          buttonText: 'اقرأ أحدث إصداراتنا',
          buttonColor: '#ffffff',
          buttonTextColor: '#dc2626',
          buttonUrl: '#',
          headlineFontSize: 36,
          headlineFontWeight: 700,
        },
      },
      {
        type: 'text',
        content: {
          backgroundColor: '#ffffff',
          textColor: '#374151',
          bodyText: 'نحن مجموعة من المتحمسين الذين يؤمنون بأن المحتوى الجيد يغيّر حياة الناس. منذ تأسيسنا، ونحن نعمل يومياً لنقدم لك أفضل وأدق المعلومات في مجالنا.\n\nبانضمامك إلينا، أصبحت جزءاً من مجتمع يزيد على ٥٠٬٠٠٠ قارئ متميز.',
        },
      },
      {
        type: 'stats',
        content: {
          backgroundColor: '#fef2f2',
          textColor: '#dc2626',
          headline: 'لماذا نحن؟',
          buttonColor: '#dc2626',
          statItems: [
            { value: '٥٠ ألف', label: 'مشترك' },
            { value: '٤ سنوات', label: 'من الخبرة' },
            { value: '٩٨٪', label: 'رضا القراء' },
          ],
        },
      },
      {
        type: 'cta',
        content: {
          backgroundColor: '#111111',
          textColor: '#ffffff',
          headline: 'تابعنا على وسائل التواصل الاجتماعي للمزيد',
          buttonText: 'تابعنا الآن',
          buttonColor: '#dc2626',
          buttonTextColor: '#ffffff',
          buttonUrl: '#',
        },
      },
      {
        type: 'footer',
        content: {
          backgroundColor: '#111111',
          textColor: '#6b7280',
          companyName: 'نشرتكم',
          companyAddress: 'مصر، القاهرة',
          unsubscribeUrl: '#',
        },
      },
    ],
  },
];
