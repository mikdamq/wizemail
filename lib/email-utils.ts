import { renderRow } from './sections';
import type { EmailRow, ThemeMode, SectionType, SectionContent, ClientMode } from './types';

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

type SectionLike = { type: SectionType; content: SectionContent; id?: string };

export function sectionsToRows(sections: SectionLike[]): EmailRow[] {
  return sections.map((s) => ({
    id: uid(),
    columns: [{ id: uid(), type: s.type, content: s.content }],
  }));
}

export function assembleEmailHTML(rows: EmailRow[], theme: ThemeMode = 'light', previewText?: string, variables?: Record<string, string>): string {
  const isDark = theme === 'dark';
  const bodyBg = isDark ? '#0f172a' : '#f1f5f9';

  let rowsHTML = rows.map((r) => renderRow(r, isDark)).join('\n');
  if (variables && Object.keys(variables).length > 0) {
    rowsHTML = applyVariables(rowsHTML, variables);
  }

  const preheader = previewText
    ? `\n  <!-- Preheader -->\n  <div style="display:none;mso-hide:all;font-size:1px;color:${bodyBg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${previewText}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { text-decoration: none; }
    @media only screen and (max-width: 480px) {
      table[class="email-container"] { width: 100% !important; }
      td[class="email-padding"] { padding-left: 20px !important; padding-right: 20px !important; }
      td[class="email-col"] { display: block !important; width: 100% !important; padding-right: 0 !important; padding-bottom: 16px; }
      h1 { font-size: 26px !important; }
      h2 { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${bodyBg};">${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bodyBg};">
    <tr>
      <td>
${rowsHTML}
      </td>
    </tr>
  </table>
  <script>
    (function() {
      function sendHeight() {
        var h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        window.parent.postMessage({ type: 'wizemail-height', height: h }, '*');
      }
      if (document.readyState === 'complete') {
        sendHeight();
      } else {
        window.addEventListener('load', sendHeight);
      }
      new MutationObserver(sendHeight).observe(document.body, { subtree: true, childList: true });
    })();
  </script>
</body>
</html>`;
}

export function assembleCleanHTML(rows: EmailRow[], theme: ThemeMode = 'light'): string {
  const isDark = theme === 'dark';
  const bodyBg = isDark ? '#0f172a' : '#f1f5f9';
  const rowsHTML = rows.map((r) => renderRow(r, isDark)).join('\n');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
    table { border-collapse: collapse; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    a { text-decoration: none; }
    @media only screen and (max-width: 480px) {
      td[class="email-col"] { display: block !important; width: 100% !important; padding-right: 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${bodyBg};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bodyBg};">
    <tr><td>${rowsHTML}</td></tr>
  </table>
</body>
</html>`;
}

export function applyVariables(html: string, variables: Record<string, string>): string {
  return Object.entries(variables).reduce(
    (acc, [key, val]) => acc.replaceAll(`{{${key}}}`, val),
    html
  );
}

export function minifyHtml(html: string): string {
  return html
    .replace(/<!--(?!\[if)(?!<!\[endif\])[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function downloadHTML(html: string, filename = 'email.html'): void {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export async function downloadInlinedHTML(html: string, filename = 'email-inlined.html'): Promise<void> {
  const res = await fetch('/api/inline-css', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html }),
  });
  const { html: inlined } = await res.json() as { html: string };
  downloadHTML(inlined, filename);
}

export async function exportAsSVG(rows: EmailRow[], theme: ThemeMode = 'light'): Promise<void> {
  const { toSvg } = await import('html-to-image');

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:600px;background:#f1f5f9;';
  document.body.appendChild(container);

  const isDark = theme === 'dark';
  const bodyBg = isDark ? '#0f172a' : '#f1f5f9';
  const rowsHTML = rows.map((r) => renderRow(r, isDark)).join('\n');

  container.innerHTML = `
    <div style="width:600px;background-color:${bodyBg};margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
      ${rowsHTML}
    </div>
  `;

  try {
    const inner = container.firstElementChild as HTMLElement;
    const svgDataUrl = await toSvg(inner, {
      width: 600,
      style: { margin: '0', padding: '0' },
    });

    const a = document.createElement('a');
    a.href = svgDataUrl;
    a.download = 'email-preview.svg';
    a.click();
  } finally {
    document.body.removeChild(container);
  }
}

// ─── Email Compatibility Engine ─────────────────────────────

export interface CompatibilityIssue {
  id: string;
  client: ClientMode;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestion: string;
  confidence: number; // 0-100
}

export interface CompatibilityReport {
  issues: CompatibilityIssue[];
  score: number; // 0-100
  gmailClippingRisk: 'low' | 'medium' | 'high';
  outlookNestingDepth: number;
  mobileResponsiveScore: number;
}

export function runCompatibilityChecks(rows: EmailRow[], client: ClientMode): CompatibilityReport {
  const issues: CompatibilityIssue[] = [];
  const sections = rows.flatMap((r) => r.columns).filter((c) => c.type !== 'empty');

  // Gmail clipping detection (Gmail clips at ~102KB)
  const estimatedSize = estimateEmailSize(rows);
  const gmailClippingRisk = estimatedSize > 100 * 1024 ? 'high' : estimatedSize > 50 * 1024 ? 'medium' : 'low';
  if (gmailClippingRisk !== 'low') {
    issues.push({
      id: 'gmail-clipping',
      client: 'gmail',
      severity: gmailClippingRisk === 'high' ? 'high' : 'medium',
      title: 'Gmail clipping risk',
      description: `Email size (${Math.round(estimatedSize / 1024)}KB) may be clipped by Gmail.`,
      suggestion: 'Reduce image sizes, remove unused CSS, or split into multiple emails.',
      confidence: 90,
    });
  }

  // Outlook table nesting warnings
  const maxNesting = getMaxTableNesting(rows);
  if (maxNesting > 4) {
    issues.push({
      id: 'outlook-nesting',
      client: 'outlook',
      severity: 'high',
      title: 'Deep table nesting',
      description: `Outlook struggles with deeply nested tables (depth: ${maxNesting}).`,
      suggestion: 'Simplify layout structure and reduce nested tables.',
      confidence: 85,
    });
  }

  // Apple Mail dark mode simulation
  if (client === 'apple') {
    const darkModeIssues = checkDarkModeCompatibility(sections);
    issues.push(...darkModeIssues);
  }

  // Mobile responsiveness scoring
  const mobileScore = calculateMobileResponsiveScore(sections);
  if (mobileScore < 70) {
    issues.push({
      id: 'mobile-responsive',
      client: 'mobile',
      severity: mobileScore < 50 ? 'high' : 'medium',
      title: 'Mobile responsiveness issues',
      description: `Mobile rendering score: ${mobileScore}/100`,
      suggestion: 'Ensure all content fits mobile screens and uses responsive design.',
      confidence: 80,
    });
  }

  // Client-specific issues
  if (client === 'gmail') {
    // Gmail-specific checks
    const gmailIssues = checkGmailCompatibility(sections);
    issues.push(...gmailIssues);
  } else if (client === 'outlook') {
    // Outlook-specific checks
    const outlookIssues = checkOutlookCompatibility(sections);
    issues.push(...outlookIssues);
  }

  const score = Math.max(0, 100 - issues.reduce((acc, issue) => acc + (issue.severity === 'high' ? 20 : issue.severity === 'medium' ? 10 : 5), 0));

  return {
    issues,
    score,
    gmailClippingRisk,
    outlookNestingDepth: maxNesting,
    mobileResponsiveScore: mobileScore,
  };
}

function estimateEmailSize(rows: EmailRow[]): number {
  // Rough estimation: HTML structure + images
  const htmlSize = assembleEmailHTML(rows).length * 2; // UTF-8 bytes
  const imageSections = rows.flatMap(r => r.columns).filter(c => c.type === 'image');
  const estimatedImageSize = imageSections.length * 50 * 1024; // Assume 50KB per image
  return htmlSize + estimatedImageSize;
}

function getMaxTableNesting(rows: EmailRow[]): number {
  // Count nested table structures in rendered HTML
  const html = assembleEmailHTML(rows);
  const tagRegex = /<\/?table[^>]*>/gi;
  let maxDepth = 0;
  let currentDepth = 0;
  let match: RegExpExecArray | null = null;

  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[0].toLowerCase();
    if (tag.startsWith('</')) {
      currentDepth = Math.max(0, currentDepth - 1);
    } else {
      currentDepth += 1;
      maxDepth = Math.max(maxDepth, currentDepth);
    }
  }

  return maxDepth;
}

function checkDarkModeCompatibility(sections: any[]): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];

  for (const section of sections) {
    // Check for hardcoded light colors that won't adapt to dark mode
    if (section.content.textColor === '#000000' || section.content.textColor === '#111111') {
      issues.push({
        id: `dark-mode-text-${section.id}`,
        client: 'apple',
        severity: 'medium',
        title: 'Hardcoded dark text color',
        description: 'Black text may not be visible in dark mode.',
        suggestion: 'Use theme-aware colors or CSS that adapts to dark mode.',
        confidence: 75,
      });
    }

    if (section.content.backgroundColor === '#ffffff' || section.content.backgroundColor === '#f1f5f9') {
      issues.push({
        id: `dark-mode-bg-${section.id}`,
        client: 'apple',
        severity: 'medium',
        title: 'Hardcoded light background',
        description: 'Light backgrounds may not contrast well in dark mode.',
        suggestion: 'Use theme-aware backgrounds or ensure sufficient contrast.',
        confidence: 70,
      });
    }
  }

  return issues;
}

function calculateMobileResponsiveScore(sections: any[]): number {
  let score = 100;

  // Check for sections that might not fit mobile
  const wideSections = sections.filter(s => s.content.headlineFontSize && s.content.headlineFontSize > 32);
  score -= wideSections.length * 5;

  // Check for complex layouts
  const complexSections = sections.filter(s => s.type === 'features' && (!s.content.featureItems || s.content.featureItems.length > 3));
  score -= complexSections.length * 10;

  // Check for long text blocks
  const longTextSections = sections.filter(s => s.content.bodyText && s.content.bodyText.length > 500);
  score -= longTextSections.length * 5;

  return Math.max(0, Math.min(100, score));
}

function checkGmailCompatibility(sections: any[]): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];

  // Gmail strips styles from head
  const styledSections = sections.filter(s => s.content.customHtml && s.content.customHtml.includes('<style'));
  if (styledSections.length > 0) {
    issues.push({
      id: 'gmail-head-styles',
      client: 'gmail',
      severity: 'high',
      title: 'Head styles may be stripped',
      description: 'Gmail removes <style> tags from the <head> section.',
      suggestion: 'Use inline styles or move styles to the body.',
      confidence: 95,
    });
  }

  return issues;
}

function checkOutlookCompatibility(sections: any[]): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];

  // Outlook ignores max-width
  const maxWidthSections = sections.filter(s => s.content.customHtml && s.content.customHtml.includes('max-width'));
  if (maxWidthSections.length > 0) {
    issues.push({
      id: 'outlook-max-width',
      client: 'outlook',
      severity: 'medium',
      title: 'Max-width ignored',
      description: 'Outlook ignores CSS max-width properties.',
      suggestion: 'Use table-based width constraints for Outlook compatibility.',
      confidence: 90,
    });
  }

  return issues;
}
