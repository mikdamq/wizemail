import { NextRequest, NextResponse } from 'next/server';
import juice from 'juice';
import sanitizeHtml from 'sanitize-html';
import { minifyHtml } from '@/lib/email-utils';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function normalizeInlineStyle(style: string): string {
  return style
    .split(';')
    .map((rule) => rule.trim())
    .filter(Boolean)
    .map((rule) => {
      const [key, value] = rule.split(':').map((part) => part.trim());
      return key && value ? `${key}:${value}` : '';
    })
    .filter(Boolean)
    .sort()
    .join('; ');
}

function dedupeStyles(html: string): string {
  const uniqueStyleBlocks = new Set<string>();
  return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, (match) => {
    if (uniqueStyleBlocks.has(match)) {
      return '';
    }
    uniqueStyleBlocks.add(match);
    return match;
  });
}

function sanitizeEmailHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'html', 'head', 'body', 'meta', 'style', 'title',
      'table', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th',
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'img', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u',
      'ul', 'ol', 'li', 'small', 'sup', 'sub', 'blockquote',
      'center', 'font', 'caption', 'colgroup', 'col', 'pre'
    ],
    allowedAttributes: {
      '*': ['style', 'class', 'id', 'title', 'align', 'valign', 'width', 'height', 'border', 'cellpadding', 'cellspacing', 'role', 'scope', 'name'],
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'style', 'border', 'title'],
      table: ['width', 'cellpadding', 'cellspacing', 'border', 'role', 'style'],
      td: ['colspan', 'rowspan', 'width', 'height', 'valign', 'align', 'style'],
      th: ['colspan', 'rowspan', 'width', 'height', 'valign', 'align', 'style'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel', 'cid'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'cid'],
      a: ['http', 'https', 'mailto', 'tel'],
    },
    transformTags: {
      '*': (tagName: string, attribs: Record<string, any>) => {
        if (attribs.style) {
          return { tagName, attribs: { ...attribs, style: normalizeInlineStyle(attribs.style) } };
        }
        return { tagName, attribs };
      },
    },
    parser: {
      lowerCaseTags: true,
    },
  });
}

async function compileMjml(html: string): Promise<string> {
  if (!/<mjml[\s>]/i.test(html)) return html;
  try {
    const mjml: any = await import('mjml');
    const result = await mjml.default(html, {
      minify: false,
      validationLevel: 'soft',
      keepComments: false,
    });
    // MJML returns an object with html, json, and errors properties
    if (result && result.html) {
      return result.html;
    }
    // If there are errors, log them and return original HTML
    if (result.errors && result.errors.length > 0) {
      console.warn('MJML compilation errors:', result.errors);
      return html;
    }
    // If no html property, return original
    console.warn('MJML compilation returned no html property');
    return html;
  } catch (error) {
    console.error('MJML compilation failed:', error);
    return html; // Return original HTML on error
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = (await req.json()) as { html: string };
  const { html } = body;
  if (!html || typeof html !== 'string') {
    return NextResponse.json({ error: 'html is required' }, { status: 400 });
  }
  if (Buffer.byteLength(html, 'utf8') > 500_000) {
    return NextResponse.json({ error: 'HTML payload too large' }, { status: 413 });
  }

  const compiled = await compileMjml(html);
  const inlined = juice(compiled, {
    removeStyleTags: true,
    preserveMediaQueries: true,
    preserveFontFaces: true,
    applyWidthAttributes: true,
    preserveImportant: true,
  });
  const sanitized = sanitizeEmailHtml(inlined);
  const deduped = dedupeStyles(sanitized);
  return NextResponse.json({ html: minifyHtml(deduped) });
}
