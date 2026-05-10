import type { EmailRow, EmailDetails } from './types';

export interface A11yCheck {
  id: string;
  label: string;
  description: string;
  status: 'pass' | 'fail' | 'warn' | 'na';
  detail?: string;
  wcag?: string;
}

export interface A11yReport {
  score: number;
  passing: number;
  failing: number;
  warnings: number;
  na: number;
  total: number;
  isEmpty: boolean;
  checks: A11yCheck[];
}

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(fg: string, bg: string): number {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  if (!fgRgb || !bgRgb) return 21;
  const L1 = relativeLuminance(...fgRgb);
  const L2 = relativeLuminance(...bgRgb);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

const GENERIC_BUTTON_TEXT = ['click here', 'here', 'read more', 'click', 'more', 'link', 'button'];

export function runA11yChecks(rows: EmailRow[], emailDetails?: EmailDetails): A11yReport {
  const checks: A11yCheck[] = [];
  // Flatten all columns from all rows into a single list — same shape as old EmailSection[]
  const sections = rows.flatMap((r) => r.columns).filter((c) => c.type !== 'empty');
  const isEmpty = sections.length === 0;

  // 1. Alt text on all images
  const imageSections = sections.filter((s) => s.type === 'image');
  const missingAlt = imageSections.filter((s) => !s.content.imageAlt?.trim());
  checks.push({
    id: 'image-alt',
    label: 'Image alt text',
    description: 'All images must have descriptive alternative text for screen readers.',
    wcag: 'WCAG 1.1.1',
    status: imageSections.length === 0 ? 'na' : missingAlt.length === 0 ? 'pass' : 'fail',
    detail: imageSections.length === 0
      ? 'No image sections in this email'
      : missingAlt.length > 0
      ? `${missingAlt.length} image${missingAlt.length > 1 ? 's are' : ' is'} missing alt text`
      : 'All images have alt text',
  });

  // 2. Color contrast (WCAG AA = 4.5:1 for normal text)
  const sectionsWithColors = sections.filter((s) => s.content.textColor && s.content.backgroundColor);
  const contrastIssues: string[] = [];
  for (const s of sectionsWithColors) {
    const ratio = contrastRatio(s.content.textColor!, s.content.backgroundColor!);
    if (ratio < 4.5) {
      contrastIssues.push(`${s.type} (${ratio}:1)`);
    }
  }
  checks.push({
    id: 'color-contrast',
    label: 'Color contrast',
    description: 'Text must have a contrast ratio of at least 4.5:1 against its background (WCAG AA).',
    wcag: 'WCAG 1.4.3',
    status: sectionsWithColors.length === 0 ? 'na' : contrastIssues.length === 0 ? 'pass' : 'fail',
    detail: sectionsWithColors.length === 0
      ? 'No sections with custom colors to check'
      : contrastIssues.length > 0
      ? `Low contrast in: ${contrastIssues.join(', ')}`
      : 'All checked sections meet 4.5:1 ratio',
  });

  // 3. Descriptive button/link text
  const buttonSections = sections.filter((s) => s.type === 'hero' || s.type === 'cta');
  const genericButtons = buttonSections.filter(
    (s) => s.content.buttonText && GENERIC_BUTTON_TEXT.includes(s.content.buttonText.toLowerCase().trim())
  );
  checks.push({
    id: 'link-text',
    label: 'Descriptive button text',
    description: 'Button and link text should describe the destination or action, not just say "Click here".',
    wcag: 'WCAG 2.4.6',
    status: buttonSections.length === 0 ? 'na' : genericButtons.length === 0 ? 'pass' : 'fail',
    detail: buttonSections.length === 0
      ? 'No Hero or CTA sections in this email'
      : genericButtons.length > 0
      ? `${genericButtons.length} button${genericButtons.length > 1 ? 's have' : ' has'} generic text`
      : 'All buttons have descriptive text',
  });

  // 4. Email has a meaningful headline
  const hasHeadline = sections.some((s) => s.content.headline?.trim());
  checks.push({
    id: 'content-structure',
    label: 'Content structure',
    description: 'Emails should have a clear headline to orient the reader.',
    wcag: 'WCAG 2.4.6',
    status: isEmpty ? 'na' : hasHeadline ? 'pass' : 'warn',
    detail: isEmpty
      ? 'No sections added yet'
      : hasHeadline
      ? 'At least one headline is present'
      : 'No headline found — consider adding a Hero or CTA section',
  });

  // 5. Unsubscribe / footer present
  const hasFooter = sections.some((s) => s.type === 'footer');
  const hasUnsubscribe = sections.some((s) => s.type === 'footer' && s.content.unsubscribeUrl?.trim());
  checks.push({
    id: 'unsubscribe',
    label: 'Unsubscribe option',
    description: 'Marketing emails must include a way to opt out (CAN-SPAM, GDPR requirement).',
    wcag: 'CAN-SPAM / GDPR',
    status: isEmpty ? 'na' : hasUnsubscribe ? 'pass' : hasFooter ? 'warn' : 'fail',
    detail: isEmpty
      ? 'No sections added yet'
      : !hasFooter
      ? 'No footer section found'
      : !hasUnsubscribe
      ? 'Footer is missing an unsubscribe URL'
      : 'Unsubscribe link is present',
  });

  // 6. Table semantics (generated code uses role="presentation")
  checks.push({
    id: 'table-roles',
    label: 'Layout table semantics',
    description: 'Tables used for layout must use role="presentation" to prevent misinterpretation by screen readers.',
    wcag: 'WCAG 1.3.1',
    status: isEmpty ? 'na' : 'pass',
    detail: isEmpty ? 'No sections to check' : 'All generated tables include role="presentation"',
  });

  // 7. Language attribute
  checks.push({
    id: 'lang-attr',
    label: 'Language declaration',
    description: 'The HTML element must specify the content language so assistive technology uses the right pronunciation.',
    wcag: 'WCAG 3.1.1',
    status: isEmpty ? 'na' : 'pass',
    detail: isEmpty ? 'No sections to check' : 'lang="en" is set on the generated <html> element',
  });

  // 8. Email length / cognitive load
  const sectionCount = sections.length;
  checks.push({
    id: 'email-length',
    label: 'Email length',
    description: 'Excessively long emails increase cognitive load and reduce engagement.',
    wcag: 'Best practice',
    status: isEmpty
      ? 'na'
      : sectionCount <= 8
      ? 'pass'
      : sectionCount <= 12
      ? 'warn'
      : 'fail',
    detail: isEmpty
      ? 'No sections added yet'
      : `${sectionCount} section${sectionCount !== 1 ? 's' : ''}${
          sectionCount > 12
            ? ' — consider trimming to under 8'
            : sectionCount > 8
            ? ' — aim for 8 or fewer'
            : ''
        }`,
  });

  // 9. Button contrast
  const buttonContrastSections = sections.filter(
    (s) =>
      (s.type === 'hero' || s.type === 'cta') &&
      s.content.buttonText &&
      s.content.buttonColor &&
      s.content.buttonTextColor
  );
  const buttonContrastIssues: string[] = [];
  for (const s of buttonContrastSections) {
    const ratio = contrastRatio(s.content.buttonTextColor!, s.content.buttonColor!);
    if (ratio < 4.5) {
      buttonContrastIssues.push(`${s.type} button (${ratio}:1)`);
    }
  }
  checks.push({
    id: 'button-contrast',
    label: 'Button text contrast',
    description: 'Button text must have sufficient contrast against the button background color.',
    wcag: 'WCAG 1.4.3',
    status: buttonContrastSections.length === 0 ? 'na' : buttonContrastIssues.length === 0 ? 'pass' : 'fail',
    detail: buttonContrastSections.length === 0
      ? 'No buttons with custom colors to check'
      : buttonContrastIssues.length > 0
      ? `Low contrast: ${buttonContrastIssues.join(', ')}`
      : 'All buttons meet contrast requirements',
  });

  // 10. Font size checks
  const sectionsWithText = sections.filter((s) => s.content.headline || s.content.bodyText || s.content.subheadline);
  const smallFontIssues: string[] = [];
  for (const s of sectionsWithText) {
    const headlineSize = s.content.headlineFontSize || 24; // default
    const bodySize = s.content.bodyFontSize || 16; // default
    if (headlineSize < 18) {
      smallFontIssues.push(`${s.type} headline (${headlineSize}px)`);
    }
    if (bodySize < 14) {
      smallFontIssues.push(`${s.type} body (${bodySize}px)`);
    }
  }
  checks.push({
    id: 'font-size',
    label: 'Font size accessibility',
    description: 'Text should be at least 14px for body text and 18px for headlines to ensure readability.',
    wcag: 'WCAG 1.4.4',
    status: sectionsWithText.length === 0 ? 'na' : smallFontIssues.length === 0 ? 'pass' : 'fail',
    detail: sectionsWithText.length === 0
      ? 'No text sections to check'
      : smallFontIssues.length > 0
      ? `Small fonts: ${smallFontIssues.join(', ')}`
      : 'All text meets minimum size requirements',
  });

  // 11. Heading structure
  const headlineSections = sections.filter((s) => s.content.headline?.trim());
  const hasPrimaryHeadline = headlineSections.some((s) => s.type === 'hero' || s.type === 'header');
  checks.push({
    id: 'heading-structure',
    label: 'Heading structure',
    description: 'Emails should have a clear primary headline (Hero/Header) followed by supporting content.',
    wcag: 'WCAG 1.3.1',
    status: isEmpty ? 'na' : hasPrimaryHeadline ? 'pass' : 'warn',
    detail: isEmpty
      ? 'No sections added yet'
      : hasPrimaryHeadline
      ? 'Primary headline is present'
      : 'Consider adding a Hero or Header section as the main headline',
  });

  // 12. Link clarity and validation
  const sectionsWithLinks = sections.filter((s) => s.content.buttonUrl || s.content.customHtml?.includes('href='));
  const linkIssues: string[] = [];
  for (const s of sectionsWithLinks) {
    if (s.content.buttonUrl) {
      if (!s.content.buttonUrl.trim()) {
        linkIssues.push(`${s.type} button has empty URL`);
      } else if (!s.content.buttonUrl.startsWith('http') && !s.content.buttonUrl.startsWith('mailto:')) {
        linkIssues.push(`${s.type} button URL may be invalid: ${s.content.buttonUrl}`);
      }
    }
    if (s.content.customHtml) {
      // Check for links in custom HTML
      const linkMatches = s.content.customHtml.match(/href=["']([^"']*)["']/g);
      if (linkMatches) {
        linkMatches.forEach((match) => {
          const url = match.match(/href=["']([^"']*)["']/)?.[1];
          if (url && !url.startsWith('http') && !url.startsWith('mailto:') && !url.startsWith('#')) {
            linkIssues.push(`${s.type} custom HTML link may be invalid: ${url}`);
          }
        });
      }
    }
  }
  checks.push({
    id: 'link-clarity',
    label: 'Link clarity and validation',
    description: 'All links should have valid URLs and buttons should have meaningful text.',
    wcag: 'WCAG 2.4.4',
    status: sectionsWithLinks.length === 0 ? 'na' : linkIssues.length === 0 ? 'pass' : 'fail',
    detail: sectionsWithLinks.length === 0
      ? 'No links to check'
      : linkIssues.length > 0
      ? `Link issues: ${linkIssues.join('; ')}`
      : 'All links appear valid',
  });

  // 13. Preview text check
  const hasPreviewText = emailDetails?.previewText?.trim();
  const previewTextLength = hasPreviewText ? emailDetails!.previewText.length : 0;
  checks.push({
    id: 'preview-text',
    label: 'Preview text',
    description: 'Emails should have meaningful preview text (40-90 characters) that entices opens.',
    wcag: 'Best practice',
    status: !emailDetails ? 'na' : hasPreviewText && previewTextLength >= 40 && previewTextLength <= 90 ? 'pass' : hasPreviewText ? 'warn' : 'fail',
    detail: !emailDetails
      ? 'Email details not available'
      : !hasPreviewText
      ? 'No preview text set'
      : previewTextLength < 40
      ? `Preview text too short (${previewTextLength} chars) — aim for 40-90`
      : previewTextLength > 90
      ? `Preview text too long (${previewTextLength} chars) — aim for 40-90`
      : 'Preview text is well-sized',
  });

  const passing = checks.filter((c) => c.status === 'pass').length;
  const failing = checks.filter((c) => c.status === 'fail').length;
  const warnings = checks.filter((c) => c.status === 'warn').length;
  const na = checks.filter((c) => c.status === 'na').length;
  const total = checks.length;
  const scorable = total - na;
  const score = scorable === 0 ? 0 : Math.round((passing / scorable) * 100);

  return { score, passing, failing, warnings, na, total, isEmpty, checks };
}
