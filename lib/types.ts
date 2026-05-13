export interface BrandKit {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  logoText: string;
  fontFamily: string;
  customColors?: string[];
  direction?: 'ltr' | 'rtl';
}

export type SectionType =
  | 'header'
  | 'hero'
  | 'cta'
  | 'text'
  | 'image'
  | 'divider'
  | 'features'
  | 'testimonial'
  | 'social'
  | 'footer'
  | 'html'
  | 'spacer'
  | 'button-row'
  | 'list'
  | 'announcement'
  | 'product-card'
  | 'stats'
  | 'team'
  | 'pricing'
  | 'articles'
  | 'empty';

export type EditorMode = 'visual' | 'code' | 'split';
export type DeviceMode = 'desktop' | 'tablet' | 'mobile';
export type ThemeMode = 'light' | 'dark';
export type ClientMode = 'gmail' | 'outlook' | 'apple' | 'mobile';

export interface SectionContent {
  backgroundColor?: string;
  textColor?: string;

  // Header
  logoText?: string;

  // Hero / Headlines
  headline?: string;
  subheadline?: string;

  // Body text
  bodyText?: string;

  // Button
  buttonText?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  buttonUrl?: string;

  // Image
  imageUrl?: string;
  imageAlt?: string;

  // Features
  feature1Title?: string;
  feature1Text?: string;
  feature2Title?: string;
  feature2Text?: string;
  feature3Title?: string;
  feature3Text?: string;

  // Testimonial
  quoteText?: string;
  authorName?: string;
  authorTitle?: string;

  // Social
  twitterUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;

  // Footer
  companyName?: string;
  companyAddress?: string;
  unsubscribeUrl?: string;

  // Divider
  dividerColor?: string;

  // Custom HTML block
  customHtml?: string;

  // Spacer
  spacerHeight?: number;

  // Button Row
  buttonAlign?: 'left' | 'center' | 'right';

  // List
  listItems?: string;
  listStyle?: 'bullet' | 'numbered' | 'none';

  // Product card
  productPrice?: string;

  // Features (dynamic array — supersedes fixed feature1/2/3 fields)
  featureItems?: Array<{ title: string; text: string }>;

  // Social (dynamic array — supersedes fixed twitterUrl/linkedinUrl/instagramUrl)
  socialLinks?: Array<{ label: string; url: string }>;

  // Section-level padding overrides
  sectionPaddingTop?: number;
  sectionPaddingBottom?: number;
  sectionPaddingLeft?: number;
  sectionPaddingRight?: number;

  // Typography overrides (applied to headline and body text)
  headlineFontSize?: number;
  headlineFontWeight?: number;
  bodyFontSize?: number;
  bodyLineHeight?: number;
  letterSpacing?: number;

  // Per-section font override ('$brand' uses brandKit.fontFamily, 'system' = system font stack)
  fontFamily?: string;

  // Background image (hero, cta, announcement, header sections)
  backgroundImageUrl?: string;
  backgroundImagePosition?: string;
  backgroundImageSize?: 'cover' | 'contain' | 'auto';

  // Stats section
  statItems?: Array<{ value: string; label: string }>;

  // Team section
  teamMembers?: Array<{ name: string; role: string; imageUrl?: string }>;

  // Pricing section
  pricingPlans?: Array<{ name: string; price: string; period?: string; features: string[]; buttonText?: string; buttonUrl?: string; highlight?: boolean }>;

  // Articles section
  articleItems?: Array<{ title: string; date?: string; excerpt?: string; imageUrl?: string; url?: string }>;
}

export interface EmailSection {
  id: string;
  type: SectionType;
  content: SectionContent;
}

export interface EmailColumn {
  id: string;
  type: SectionType;
  content: SectionContent;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
}

export interface EmailRow {
  id: string;
  columns: EmailColumn[];
  columnGap?: number;
  outerPaddingX?: number;
  outerPaddingY?: number;
  outerPaddingTop?: number;
  outerPaddingRight?: number;
  outerPaddingBottom?: number;
  outerPaddingLeft?: number;
}

export interface EmailDetails {
  subject: string;
  previewText: string;
  senderName: string;
  senderEmail: string;
  replyTo: string;
}

export interface SavedDesign {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  version?: number;
  rows: EmailRow[];
  sections?: EmailSection[]; // legacy — auto-migrated on load
  emailDetails: EmailDetails;
  theme: ThemeMode;
  variables?: Record<string, string>;
  brandKit?: BrandKit;
}

export interface SavedBlock {
  id: string;
  name: string;
  createdAt: string;
  row: EmailRow;
}

export interface CompatibilityIssue {
  id: string;
  client: ClientMode;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestion: string;
  confidence: number;
}

export interface CompatibilityReport {
  issues: CompatibilityIssue[];
  score: number;
  gmailClippingRisk: 'low' | 'medium' | 'high';
  outlookNestingDepth: number;
  mobileResponsiveScore: number;
}
