import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';

interface ParseRequest {
  type: 'html' | 'mjml';
  content: string;
}

interface SectionDef {
  type: string;
  content: Record<string, unknown>;
}

function htmlToSections(html: string): SectionDef[] {
  // If the HTML already has data-row-id tables (Wizemail-exported HTML), extract each row's content
  const rowMatches = [...html.matchAll(/<table[^>]*data-row-id="[^"]*"[^>]*>/gi)];
  if (rowMatches.length > 0) {
    // Structured Wizemail HTML — wrap entire body as a single html section
    return [{ type: 'html', content: { htmlContent: extractBodyContent(html) } }];
  }

  // Generic HTML — try to split by common structural patterns
  const sections: SectionDef[] = [];
  const body = extractBodyContent(html);

  // Look for <h1>/<h2> followed by text — treat as hero/text sections
  const hasHeading = /<h[1-3][^>]*>/i.test(body);
  const hasParagraph = /<p[^>]*>/i.test(body);

  if (hasHeading || hasParagraph) {
    // Extract headline from first heading
    const headlineMatch = body.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
    const headline = headlineMatch ? stripTags(headlineMatch[1]).trim() : '';

    // Extract first paragraph as body text
    const bodyMatch = body.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const bodyText = bodyMatch ? stripTags(bodyMatch[1]).trim() : '';

    // Extract first link text as button text
    const btnMatch = body.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
    const buttonText = btnMatch ? stripTags(btnMatch[1]).trim() : '';
    const btnHrefMatch = body.match(/<a[^>]*href="([^"]*)"[^>]*>/i);
    const buttonUrl = btnHrefMatch ? btnHrefMatch[1] : '';

    if (headline) {
      sections.push({
        type: 'hero',
        content: {
          headline,
          bodyText: bodyText || '',
          buttonText: buttonText || 'Learn more',
          buttonUrl: buttonUrl || '#',
        },
      });
    } else if (bodyText) {
      sections.push({ type: 'text', content: { bodyText } });
    } else {
      sections.push({ type: 'html', content: { htmlContent: body } });
    }
  } else {
    // Fallback: single html section containing the full body
    sections.push({ type: 'html', content: { htmlContent: body } });
  }

  return sections.length > 0 ? sections : [{ type: 'html', content: { htmlContent: body } }];
}

function extractBodyContent(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1].trim() : html.trim();
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  let body: ParseRequest;
  try {
    body = (await req.json()) as ParseRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { type, content } = body;
  if (!type || !content) {
    return NextResponse.json({ error: 'type and content are required' }, { status: 400 });
  }

  let html = content;

  if (type === 'mjml') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mjml2html = require('mjml') as (input: string, opts?: Record<string, unknown>) => { html: string; errors: { formattedMessage: string; tagName?: string }[] };
      const result = mjml2html(content, { validationLevel: 'skip' });
      if (result.errors && result.errors.length > 0) {
        const fatalErrors = result.errors.filter((e) => !e.tagName);
        if (fatalErrors.length > 0) {
          return NextResponse.json({ error: 'MJML compilation failed: ' + result.errors[0].formattedMessage }, { status: 422 });
        }
      }
      html = result.html;
    } catch (err) {
      return NextResponse.json({ error: 'MJML compilation failed: ' + (err instanceof Error ? err.message : 'unknown error') }, { status: 500 });
    }
  }

  const sections = htmlToSections(html);
  return NextResponse.json({ sections });
}
