import type { SectionType, SectionContent, EmailRow } from './types';

export interface SectionDefinition {
  type: SectionType;
  label: string;
  description: string;
  icon: string;
  defaultContent: SectionContent;
}

export const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    type: 'header',
    label: 'Header',
    description: 'Brand logo and navigation',
    icon: 'Layout',
    defaultContent: {
      logoText: 'Acme Inc.',
      backgroundColor: '#ffffff',
      textColor: '#111111',
    },
  },
  {
    type: 'hero',
    label: 'Hero',
    description: 'Big headline with CTA button',
    icon: 'Sparkles',
    defaultContent: {
      backgroundColor: '#0f172a',
      textColor: '#ffffff',
      headline: 'Welcome to something great',
      subheadline: 'A single, focused sentence that explains your value and invites action.',
      buttonText: 'Get Started',
      buttonColor: '#6366f1',
      buttonTextColor: '#ffffff',
      buttonUrl: '#',
    },
  },
  {
    type: 'cta',
    label: 'CTA',
    description: 'Call-to-action banner',
    icon: 'Zap',
    defaultContent: {
      backgroundColor: '#6366f1',
      textColor: '#ffffff',
      headline: 'Ready to get started?',
      buttonText: 'Start Free Trial',
      buttonColor: '#ffffff',
      buttonTextColor: '#6366f1',
      buttonUrl: '#',
    },
  },
  {
    type: 'text',
    label: 'Text Block',
    description: 'Body copy and paragraphs',
    icon: 'AlignLeft',
    defaultContent: {
      backgroundColor: '#ffffff',
      textColor: '#374151',
      headline: 'Here\'s what\'s new',
      bodyText: 'We\'ve been working hard to bring you the best possible experience. This update includes performance improvements, new features, and bug fixes that make everything feel faster and smoother.\n\nThank you for being part of our community. We\'re excited about what\'s ahead.',
    },
  },
  {
    type: 'image',
    label: 'Image',
    description: 'Full-width image block',
    icon: 'Image',
    defaultContent: {
      backgroundColor: '#ffffff',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
      imageAlt: 'Featured image',
    },
  },
  {
    type: 'divider',
    label: 'Divider',
    description: 'Horizontal section separator',
    icon: 'Minus',
    defaultContent: {
      backgroundColor: '#ffffff',
      dividerColor: '#e5e7eb',
    },
  },
  {
    type: 'features',
    label: 'Features',
    description: 'Three-column feature grid',
    icon: 'Grid3x3',
    defaultContent: {
      backgroundColor: '#f9fafb',
      textColor: '#111111',
      headline: 'Why choose us',
      featureItems: [
        { title: 'Lightning Fast', text: 'Built for performance from the ground up. No compromises.' },
        { title: 'Secure by Default', text: 'Enterprise-grade security baked into every layer.' },
        { title: 'Easy to Use', text: 'Intuitive interface that your whole team will love.' },
      ],
    },
  },
  {
    type: 'testimonial',
    label: 'Testimonial',
    description: 'Customer quote block',
    icon: 'Quote',
    defaultContent: {
      backgroundColor: '#ffffff',
      textColor: '#111111',
      quoteText: '"This product completely changed how our team works. We ship twice as fast and everyone is happier. I wish we had found it sooner."',
      authorName: 'Sarah Johnson',
      authorTitle: 'Head of Product at Streamline',
    },
  },
  {
    type: 'social',
    label: 'Social Links',
    description: 'Social media icons row',
    icon: 'Share2',
    defaultContent: {
      backgroundColor: '#f9fafb',
      textColor: '#6b7280',
      socialLinks: [
        { label: 'Twitter', url: '#' },
        { label: 'LinkedIn', url: '#' },
        { label: 'Instagram', url: '#' },
      ],
    },
  },
  {
    type: 'footer',
    label: 'Footer',
    description: 'Company info and unsubscribe',
    icon: 'ChevronsDown',
    defaultContent: {
      backgroundColor: '#f3f4f6',
      textColor: '#9ca3af',
      companyName: 'Acme Inc.',
      companyAddress: '123 Main Street, San Francisco, CA 94107',
      unsubscribeUrl: '#',
    },
  },
  {
    type: 'html',
    label: 'Custom HTML',
    description: 'Raw HTML — full control',
    icon: 'Code2',
    defaultContent: {
      backgroundColor: '#ffffff',
      customHtml: '<!-- Write your custom HTML here -->\n<p style="font-family:Arial,sans-serif;font-size:15px;color:#374151;margin:0;">Your custom content</p>',
    },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    description: 'Configurable vertical whitespace',
    icon: 'ArrowUpDown',
    defaultContent: {
      backgroundColor: 'transparent',
      spacerHeight: 32,
    },
  },
  {
    type: 'button-row',
    label: 'Button',
    description: 'Standalone CTA button',
    icon: 'MousePointerClick',
    defaultContent: {
      backgroundColor: '#ffffff',
      buttonText: 'Click Here',
      buttonColor: '#6366f1',
      buttonTextColor: '#ffffff',
      buttonUrl: '#',
      buttonAlign: 'center',
    },
  },
  {
    type: 'list',
    label: 'List',
    description: 'Bullet, numbered, or plain list',
    icon: 'List',
    defaultContent: {
      backgroundColor: '#ffffff',
      textColor: '#374151',
      listItems: 'First item\nSecond item\nThird item',
      listStyle: 'bullet',
    },
  },
  {
    type: 'announcement',
    label: 'Announcement',
    description: 'Bold centered announcement with optional CTA',
    icon: 'Megaphone',
    defaultContent: {
      backgroundColor: '#4f46e5',
      textColor: '#ffffff',
      headline: 'Important announcement',
      bodyText: 'A short, focused message that grabs attention and drives action.',
      buttonText: 'Learn More',
      buttonColor: '#ffffff',
      buttonTextColor: '#4f46e5',
      buttonUrl: '#',
    },
  },
  {
    type: 'product-card',
    label: 'Product Card',
    description: 'Product image, name, price, and CTA',
    icon: 'ShoppingBag',
    defaultContent: {
      backgroundColor: '#ffffff',
      textColor: '#111111',
      headline: 'Product Name',
      bodyText: 'Short product description highlighting key benefits.',
      productPrice: '$99.00',
      buttonText: 'Buy Now',
      buttonColor: '#6366f1',
      buttonTextColor: '#ffffff',
      buttonUrl: '#',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=480&q=80',
      imageAlt: 'Product image',
    },
  },
];

export function getDefaultContent(type: SectionType): SectionContent {
  return SECTION_DEFINITIONS.find((d) => d.type === type)?.defaultContent ?? {};
}

export function getSectionLabel(type: SectionType): string {
  return SECTION_DEFINITIONS.find((d) => d.type === type)?.label ?? type;
}

function esc(str: string | undefined): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const FONT = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";

function sectionPad(content: SectionContent, defaultPy: number, defaultPx: number): string {
  const t = content.sectionPaddingTop ?? defaultPy;
  const r = content.sectionPaddingRight ?? defaultPx;
  const b = content.sectionPaddingBottom ?? defaultPy;
  const l = content.sectionPaddingLeft ?? defaultPx;
  return `padding:${t}px ${r}px ${b}px ${l}px;`;
}

function bgTableStyle(bg: string, content: SectionContent): string {
  const base = `background-color:${bg};`;
  if (!content.backgroundImageUrl) return base;
  const pos = content.backgroundImagePosition ?? 'center center';
  const size = content.backgroundImageSize ?? 'cover';
  return `${base}background-image:url('${content.backgroundImageUrl}');background-position:${pos};background-size:${size};background-repeat:no-repeat;`;
}

export function renderSection(type: SectionType, content: SectionContent, darkMode = false): string {
  const bg = darkMode ? adjustColorForDark(content.backgroundColor ?? '#ffffff') : (content.backgroundColor ?? '#ffffff');
  const fg = darkMode ? adjustTextForDark(content.textColor ?? '#111111') : (content.textColor ?? '#111111');

  switch (type) {
    case 'header': {
      const hSize = content.headlineFontSize ?? 20;
      const hWeight = content.headlineFontWeight ?? 700;
      const ls = content.letterSpacing != null ? `letter-spacing:${content.letterSpacing}em;` : 'letter-spacing:-0.3px;';
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${bgTableStyle(bg, content)}">
  <tr>
    <td align="center" style="${sectionPad(content, 20, 40)}">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="${FONT};font-size:${hSize}px;font-weight:${hWeight};color:${fg};${ls}">
            ${esc(content.logoText ?? 'Company')}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
    }

    case 'hero': {
      const hSize = content.headlineFontSize ?? 36;
      const hWeight = content.headlineFontWeight ?? 700;
      const bSize = content.bodyFontSize ?? 17;
      const lh = content.bodyLineHeight ?? 1.6;
      const ls = content.letterSpacing != null ? `letter-spacing:${content.letterSpacing}em;` : 'letter-spacing:-0.5px;';
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${bgTableStyle(bg, content)}">
  <tr>
    <td align="center" style="${sectionPad(content, 64, 40)}">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
        <tr>
          <td align="center" style="padding-bottom:16px;">
            <h1 style="${FONT};font-size:${hSize}px;font-weight:${hWeight};color:${fg};margin:0;line-height:1.2;${ls}">
              ${esc(content.headline)}
            </h1>
          </td>
        </tr>
        ${content.subheadline ? `<tr>
          <td align="center" style="padding-bottom:32px;">
            <p style="${FONT};font-size:${bSize}px;color:${darkMode ? '#94a3b8' : '#6b7280'};margin:0;line-height:${lh};">
              ${esc(content.subheadline)}
            </p>
          </td>
        </tr>` : ''}
        ${content.buttonText ? `<tr>
          <td align="center">
            <a href="${esc(content.buttonUrl ?? '#')}" style="display:inline-block;background-color:${content.buttonColor ?? '#6366f1'};color:${content.buttonTextColor ?? '#ffffff'};${FONT};font-size:15px;font-weight:600;padding:14px 32px;text-decoration:none;border-radius:8px;">
              ${esc(content.buttonText)}
            </a>
          </td>
        </tr>` : ''}
      </table>
    </td>
  </tr>
</table>`;
    }

    case 'cta': {
      const hSize = content.headlineFontSize ?? 28;
      const hWeight = content.headlineFontWeight ?? 700;
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${bgTableStyle(bg, content)}">
  <tr>
    <td align="center" style="${sectionPad(content, 48, 40)}">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <h2 style="${FONT};font-size:${hSize}px;font-weight:${hWeight};color:${fg};margin:0;line-height:1.3;">
              ${esc(content.headline)}
            </h2>
          </td>
        </tr>
        ${content.buttonText ? `<tr>
          <td align="center">
            <a href="${esc(content.buttonUrl ?? '#')}" style="display:inline-block;background-color:${content.buttonColor ?? '#ffffff'};color:${content.buttonTextColor ?? '#6366f1'};${FONT};font-size:15px;font-weight:600;padding:14px 32px;text-decoration:none;border-radius:8px;">
              ${esc(content.buttonText)}
            </a>
          </td>
        </tr>` : ''}
      </table>
    </td>
  </tr>
</table>`;
    }

    case 'text': {
      const hSize = content.headlineFontSize ?? 22;
      const hWeight = content.headlineFontWeight ?? 700;
      const bSize = content.bodyFontSize ?? 15;
      const lh = content.bodyLineHeight ?? 1.7;
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};">
  <tr>
    <td align="center" style="${sectionPad(content, 40, 40)}">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
        ${content.headline ? `<tr>
          <td style="padding-bottom:16px;">
            <h2 style="${FONT};font-size:${hSize}px;font-weight:${hWeight};color:${fg};margin:0;line-height:1.3;">
              ${esc(content.headline)}
            </h2>
          </td>
        </tr>` : ''}
        ${content.bodyText ? `<tr>
          <td>
            ${content.bodyText.split('\n\n').map(para => `<p style="${FONT};font-size:${bSize}px;color:${darkMode ? '#cbd5e1' : '#4b5563'};margin:0 0 16px 0;line-height:${lh};">${esc(para)}</p>`).join('')}
          </td>
        </tr>` : ''}
      </table>
    </td>
  </tr>
</table>`;
    }

    case 'image':
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};">
  <tr>
    <td align="center" style="${sectionPad(content, 0, 0)}">
      <img src="${esc(content.imageUrl ?? '')}" alt="${esc(content.imageAlt ?? '')}" width="600" style="display:block;max-width:100%;height:auto;width:100%;" />
    </td>
  </tr>
</table>`;

    case 'divider':
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};">
  <tr>
    <td align="center" style="${sectionPad(content, 24, 40)}">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
        <tr>
          <td style="border-bottom:1px solid ${darkMode ? '#2d3748' : (content.dividerColor ?? '#e5e7eb')};font-size:0;line-height:0;">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

    case 'features': {
      const subColor = darkMode ? '#94a3b8' : '#6b7280';
      const hSize = content.headlineFontSize ?? 24;
      const hWeight = content.headlineFontWeight ?? 700;
      const bSize = content.bodyFontSize ?? 14;
      const featureItems = content.featureItems && content.featureItems.length > 0
        ? content.featureItems
        : [
            ...(content.feature1Title || content.feature1Text ? [{ title: content.feature1Title ?? '', text: content.feature1Text ?? '' }] : []),
            ...(content.feature2Title || content.feature2Text ? [{ title: content.feature2Title ?? '', text: content.feature2Text ?? '' }] : []),
            ...(content.feature3Title || content.feature3Text ? [{ title: content.feature3Title ?? '', text: content.feature3Text ?? '' }] : []),
          ];
      const CHUNK = 3;
      const featureRows: string[] = [];
      for (let i = 0; i < featureItems.length; i += CHUNK) {
        const chunk = featureItems.slice(i, i + CHUNK);
        const colW = Math.floor(100 / chunk.length);
        const cells = chunk.map((item, j) => {
          const pr = j < chunk.length - 1 ? 'padding-right:16px;' : '';
          return `<td width="${colW}%" valign="top" style="${pr}padding-bottom:20px;">
                  <p style="${FONT};font-size:${bSize}px;font-weight:700;color:${fg};margin:0 0 8px 0;">${esc(item.title)}</p>
                  <p style="${FONT};font-size:${bSize}px;color:${subColor};margin:0;line-height:1.6;">${esc(item.text)}</p>
                </td>`;
        }).join('');
        featureRows.push(`<tr>${cells}</tr>`);
      }
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};">
  <tr>
    <td align="center" style="${sectionPad(content, 48, 40)}">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
        ${content.headline ? `<tr>
          <td align="center" style="padding-bottom:36px;">
            <h2 style="${FONT};font-size:${hSize}px;font-weight:${hWeight};color:${fg};margin:0;">${esc(content.headline)}</h2>
          </td>
        </tr>` : ''}
        <tr>
          <td>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${featureRows.join('\n              ')}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
    }

    case 'testimonial': {
      const bSize = content.bodyFontSize ?? 18;
      const lh = content.bodyLineHeight ?? 1.7;
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};">
  <tr>
    <td align="center" style="${sectionPad(content, 48, 40)}">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <p style="${FONT};font-size:${bSize}px;color:${darkMode ? '#e2e8f0' : '#1f2937'};margin:0;line-height:${lh};font-style:italic;">
              ${esc(content.quoteText)}
            </p>
          </td>
        </tr>
        <tr>
          <td align="center">
            <p style="${FONT};font-size:14px;font-weight:600;color:${fg};margin:0 0 4px 0;">${esc(content.authorName)}</p>
            <p style="${FONT};font-size:13px;color:${darkMode ? '#64748b' : '#9ca3af'};margin:0;">${esc(content.authorTitle)}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
    }

    case 'social': {
      const linkColor = darkMode ? '#94a3b8' : '#6b7280';
      const sepColor = darkMode ? '#2d3748' : '#e5e7eb';
      const socialLinks = content.socialLinks && content.socialLinks.length > 0
        ? content.socialLinks
        : [
            { label: 'Twitter', url: content.twitterUrl ?? '#' },
            { label: 'LinkedIn', url: content.linkedinUrl ?? '#' },
            { label: 'Instagram', url: content.instagramUrl ?? '#' },
          ];
      const linkCells = socialLinks.map((link, i) => {
        const border = i > 0 ? `border-left:1px solid ${sepColor};` : '';
        return `<td style="padding:0 8px;${border}"><a href="${esc(link.url)}" style="${FONT};font-size:13px;font-weight:600;color:${linkColor};text-decoration:none;">${esc(link.label)}</a></td>`;
      }).join('\n          ');
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};">
  <tr>
    <td align="center" style="${sectionPad(content, 32, 40)}">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${linkCells}
        </tr>
      </table>
    </td>
  </tr>
</table>`;
    }

    case 'footer':
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};">
  <tr>
    <td align="center" style="${sectionPad(content, 32, 40)}">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">
        <tr>
          <td align="center" style="padding-bottom:12px;">
            <p style="${FONT};font-size:13px;font-weight:600;color:${darkMode ? '#64748b' : '#9ca3af'};margin:0;">${esc(content.companyName)}</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:12px;">
            <p style="${FONT};font-size:12px;color:${darkMode ? '#475569' : '#d1d5db'};margin:0;">${esc(content.companyAddress)}</p>
          </td>
        </tr>
        <tr>
          <td align="center">
            <a href="${esc(content.unsubscribeUrl ?? '#')}" style="${FONT};font-size:12px;color:${darkMode ? '#475569' : '#d1d5db'};text-decoration:underline;">Unsubscribe</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

    case 'html':
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};">
  <tr>
    <td align="center" style="${sectionPad(content, 24, 40)}">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding:0;">${content.customHtml ?? ''}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

    case 'spacer':
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg === 'transparent' ? 'transparent' : bg};">
  <tr>
    <td style="font-size:0;line-height:0;height:${content.spacerHeight ?? 32}px;">&nbsp;</td>
  </tr>
</table>`;

    case 'button-row': {
      const align = content.buttonAlign ?? 'center';
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};">
  <tr>
    <td align="${align}" style="${sectionPad(content, 24, 40)}">
      ${content.buttonText ? `<a href="${esc(content.buttonUrl ?? '#')}" style="display:inline-block;background-color:${content.buttonColor ?? '#6366f1'};color:${content.buttonTextColor ?? '#ffffff'};${FONT};font-size:15px;font-weight:600;padding:14px 32px;text-decoration:none;border-radius:8px;">${esc(content.buttonText)}</a>` : ''}
    </td>
  </tr>
</table>`;
    }

    case 'list': {
      const items = (content.listItems ?? '').split('\n').filter(Boolean);
      const style = content.listStyle ?? 'bullet';
      const tag = style === 'numbered' ? 'ol' : 'ul';
      const listStyleCss = style === 'none' ? 'none' : style === 'numbered' ? 'decimal' : 'disc';
      const paddingLeft = style === 'none' ? '0' : '20px';
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};">
  <tr>
    <td align="center" style="${sectionPad(content, 32, 40)}">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
        <tr>
          <td>
            <${tag} style="${FONT};font-size:15px;color:${fg};margin:0;padding-left:${paddingLeft};line-height:1.8;list-style-type:${listStyleCss};">
              ${items.map(item => `<li style="margin-bottom:6px;">${esc(item)}</li>`).join('\n              ')}
            </${tag}>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
    }

    case 'announcement': {
      const hSize = content.headlineFontSize ?? 28;
      const hWeight = content.headlineFontWeight ?? 700;
      const bSize = content.bodyFontSize ?? 16;
      const lh = content.bodyLineHeight ?? 1.6;
      const ls = content.letterSpacing != null ? `letter-spacing:${content.letterSpacing}em;` : 'letter-spacing:-0.4px;';
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${bgTableStyle(bg, content)}">
  <tr>
    <td align="center" style="${sectionPad(content, 56, 40)}">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">
        <tr>
          <td align="center" style="padding-bottom:20px;">
            <h1 style="${FONT};font-size:${hSize}px;font-weight:${hWeight};color:${fg};margin:0;line-height:1.2;${ls}">
              ${esc(content.headline)}
            </h1>
          </td>
        </tr>
        ${content.bodyText ? `<tr>
          <td align="center" style="padding-bottom:28px;">
            <p style="${FONT};font-size:${bSize}px;color:${darkMode ? '#a5b4fc' : '#c7d2fe'};margin:0;line-height:${lh};">
              ${esc(content.bodyText)}
            </p>
          </td>
        </tr>` : ''}
        ${content.buttonText ? `<tr>
          <td align="center">
            <a href="${esc(content.buttonUrl ?? '#')}" style="display:inline-block;background-color:${content.buttonColor ?? '#ffffff'};color:${content.buttonTextColor ?? bg};${FONT};font-size:15px;font-weight:600;padding:14px 32px;text-decoration:none;border-radius:8px;">
              ${esc(content.buttonText)}
            </a>
          </td>
        </tr>` : ''}
      </table>
    </td>
  </tr>
</table>`;
    }

    case 'product-card':
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};">
  <tr>
    <td align="center" style="${sectionPad(content, 40, 40)}">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%;border:1px solid ${darkMode ? '#2d3748' : '#e5e7eb'};border-radius:12px;overflow:hidden;">
        ${content.imageUrl ? `<tr>
          <td>
            <img src="${esc(content.imageUrl)}" alt="${esc(content.imageAlt ?? '')}" width="480" style="display:block;max-width:100%;height:auto;" />
          </td>
        </tr>` : ''}
        <tr>
          <td style="padding:24px;">
            ${content.headline ? `<p style="${FONT};font-size:20px;font-weight:700;color:${fg};margin:0 0 8px 0;line-height:1.3;">${esc(content.headline)}</p>` : ''}
            ${content.bodyText ? `<p style="${FONT};font-size:14px;color:${darkMode ? '#94a3b8' : '#6b7280'};margin:0 0 16px 0;line-height:1.6;">${esc(content.bodyText)}</p>` : ''}
            ${content.productPrice ? `<p style="${FONT};font-size:24px;font-weight:700;color:${fg};margin:0 0 20px 0;">${esc(content.productPrice)}</p>` : ''}
            ${content.buttonText ? `<a href="${esc(content.buttonUrl ?? '#')}" style="display:inline-block;background-color:${content.buttonColor ?? '#6366f1'};color:${content.buttonTextColor ?? '#ffffff'};${FONT};font-size:15px;font-weight:600;padding:12px 28px;text-decoration:none;border-radius:8px;">${esc(content.buttonText)}</a>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

    case 'empty':
      return '';

    default:
      return '';
  }
}

export function renderColumnContent(type: SectionType, content: SectionContent, isDark: boolean): string {
  const fg = isDark ? adjustTextForDark(content.textColor ?? '#111111') : (content.textColor ?? '#111111');

  switch (type) {
    case 'image':
      return `<img src="${esc(content.imageUrl ?? '')}" alt="${esc(content.imageAlt ?? '')}" style="display:block;max-width:100%;height:auto;width:100%;" />`;

    case 'text':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:16px;">
        ${content.headline ? `<p style="${FONT};font-size:16px;font-weight:700;color:${fg};margin:0 0 8px 0;line-height:1.3;">${esc(content.headline)}</p>` : ''}
        ${content.bodyText ? content.bodyText.split('\n\n').map(p => `<p style="${FONT};font-size:14px;color:${isDark ? '#94a3b8' : '#6b7280'};margin:0 0 8px 0;line-height:1.6;">${esc(p)}</p>`).join('') : ''}
      </td></tr></table>`;

    case 'hero':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:20px 12px;" align="center">
        ${content.headline ? `<h2 style="${FONT};font-size:20px;font-weight:700;color:${fg};margin:0 0 10px 0;line-height:1.3;">${esc(content.headline)}</h2>` : ''}
        ${content.subheadline ? `<p style="${FONT};font-size:13px;color:${isDark ? '#94a3b8' : '#6b7280'};margin:0 0 14px 0;line-height:1.5;">${esc(content.subheadline)}</p>` : ''}
        ${content.buttonText ? `<a href="${esc(content.buttonUrl ?? '#')}" style="display:inline-block;background-color:${content.buttonColor ?? '#6366f1'};color:${content.buttonTextColor ?? '#ffffff'};${FONT};font-size:13px;font-weight:600;padding:10px 20px;text-decoration:none;border-radius:8px;">${esc(content.buttonText)}</a>` : ''}
      </td></tr></table>`;

    case 'cta':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:20px 12px;" align="center">
        ${content.headline ? `<h2 style="${FONT};font-size:18px;font-weight:700;color:${fg};margin:0 0 14px 0;">${esc(content.headline)}</h2>` : ''}
        ${content.buttonText ? `<a href="${esc(content.buttonUrl ?? '#')}" style="display:inline-block;background-color:${content.buttonColor ?? '#ffffff'};color:${content.buttonTextColor ?? '#6366f1'};${FONT};font-size:13px;font-weight:600;padding:10px 20px;text-decoration:none;border-radius:8px;">${esc(content.buttonText)}</a>` : ''}
      </td></tr></table>`;

    case 'header':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:14px 12px;${FONT};font-size:17px;font-weight:700;color:${fg};">${esc(content.logoText ?? 'Company')}</td></tr></table>`;

    case 'divider':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:12px 0;border-bottom:1px solid ${isDark ? '#2d3748' : (content.dividerColor ?? '#e5e7eb')};font-size:0;line-height:0;">&nbsp;</td></tr></table>`;

    case 'spacer':
      return `<div style="height:${content.spacerHeight ?? 32}px;font-size:0;line-height:0;">&nbsp;</div>`;

    case 'button-row': {
      const align = content.buttonAlign ?? 'center';
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:14px 12px;" align="${align}">
        ${content.buttonText ? `<a href="${esc(content.buttonUrl ?? '#')}" style="display:inline-block;background-color:${content.buttonColor ?? '#6366f1'};color:${content.buttonTextColor ?? '#ffffff'};${FONT};font-size:13px;font-weight:600;padding:10px 20px;text-decoration:none;border-radius:8px;">${esc(content.buttonText)}</a>` : ''}
      </td></tr></table>`;
    }

    case 'list': {
      const items = (content.listItems ?? '').split('\n').filter(Boolean);
      const style = content.listStyle ?? 'bullet';
      const tag = style === 'numbered' ? 'ol' : 'ul';
      const listStyleCss = style === 'none' ? 'none' : style === 'numbered' ? 'decimal' : 'disc';
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:14px 12px;">
        <${tag} style="${FONT};font-size:14px;color:${fg};margin:0;padding-left:${style === 'none' ? '0' : '18px'};line-height:1.7;list-style-type:${listStyleCss};">
          ${items.map(item => `<li style="margin-bottom:4px;">${esc(item)}</li>`).join('\n          ')}
        </${tag}>
      </td></tr></table>`;
    }

    case 'empty':
      return '';

    default:
      // Fallback: render full-width section inside the column td
      return renderSection(type, content, isDark);
  }
}

export function renderRow(row: EmailRow, isDark: boolean): string {
  if (row.columns.length === 1) {
    const col = row.columns[0];
    // Only wrap in outer spacing table if row spacing is explicitly set
    if (row.outerPaddingX !== undefined || row.outerPaddingY !== undefined) {
      const px = row.outerPaddingX ?? 0;
      const py = row.outerPaddingY ?? 0;
      return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding:${py}px ${px}px;">
      ${renderSection(col.type, col.content, isDark)}
    </td>
  </tr>
</table>`;
    }
    return renderSection(col.type, col.content, isDark);
  }

  const n = row.columns.length;
  const totalWidth = 560;
  const gap = row.columnGap ?? 16;
  const outerPx = row.outerPaddingX ?? 40;
  const outerPy = row.outerPaddingY ?? 24;
  const colWidth = Math.floor((totalWidth - gap * (n - 1)) / n);

  const colsHTML = row.columns.map((col, i) => {
    const bg = isDark
      ? adjustColorForDark(col.content.backgroundColor ?? '#ffffff')
      : (col.content.backgroundColor === 'transparent' ? 'transparent' : (col.content.backgroundColor ?? '#ffffff'));
    const paddingRight = i < n - 1 ? `padding-right:${gap}px;` : '';
    const hasColPad = col.paddingTop !== undefined || col.paddingBottom !== undefined || col.paddingLeft !== undefined || col.paddingRight !== undefined;
    const colPad = hasColPad
      ? `padding:${col.paddingTop ?? 0}px ${col.paddingRight ?? 0}px ${col.paddingBottom ?? 0}px ${col.paddingLeft ?? 0}px;`
      : '';
    return `          <td class="email-col" width="${colWidth}" valign="top" style="${paddingRight}${colPad}background-color:${bg};">
            ${renderColumnContent(col.type, col.content, isDark)}
          </td>`;
  }).join('\n');

  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="padding:${outerPy}px ${outerPx}px;">
      <table role="presentation" width="${totalWidth}" cellpadding="0" cellspacing="0" border="0" style="max-width:${totalWidth}px;width:100%;">
        <tr>
${colsHTML}
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

function adjustColorForDark(color: string): string {
  const lightColors: Record<string, string> = {
    '#ffffff': '#1a1a2e',
    '#f9fafb': '#111827',
    '#f3f4f6': '#0f172a',
    '#f5f5f5': '#111827',
  };
  return lightColors[color.toLowerCase()] ?? color;
}

function adjustTextForDark(color: string): string {
  const darkColors: Record<string, string> = {
    '#111111': '#f1f5f9',
    '#1f2937': '#f1f5f9',
    '#374151': '#e2e8f0',
    '#111827': '#f1f5f9',
  };
  return darkColors[color.toLowerCase()] ?? color;
}
