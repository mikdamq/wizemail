import type { SectionType, SectionContent } from './types';

export interface SectionTemplateColumn {
  type: SectionType;
  content?: Partial<SectionContent>;
}

export interface SectionTemplateRow {
  columns: SectionTemplateColumn[];
  columnGap?: number;
  outerPaddingX?: number;
  outerPaddingY?: number;
}

export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  rowCount: number;
  rows: SectionTemplateRow[];
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'tpl-two-col-feature',
    name: 'Two-Col Feature',
    description: 'Image on left, text on right',
    icon: 'Columns2',
    rowCount: 1,
    rows: [
      {
        columns: [
          {
            type: 'image',
            content: {
              imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
              imageAlt: 'Feature image',
            },
          },
          {
            type: 'text',
            content: {
              headline: 'Feature headline',
              bodyText: 'Describe your key feature here in a concise, benefit-focused way.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'tpl-three-stats',
    name: 'Three Stats',
    description: 'Three bold numbers with labels',
    icon: 'BarChart3',
    rowCount: 1,
    rows: [
      {
        columns: [
          { type: 'text', content: { headline: '10,000+', bodyText: 'Active users' } },
          { type: 'text', content: { headline: '99.9%', bodyText: 'Uptime SLA' } },
          { type: 'text', content: { headline: '4.9 / 5', bodyText: 'Customer rating' } },
        ],
      },
    ],
  },
  {
    id: 'tpl-feature-row-cta',
    name: 'Feature Row + CTA',
    description: 'Feature grid followed by a call-to-action',
    icon: 'Layers',
    rowCount: 2,
    rows: [
      { columns: [{ type: 'features' }] },
      { columns: [{ type: 'cta' }] },
    ],
  },
  {
    id: 'tpl-newsletter-opener',
    name: 'Newsletter Opener',
    description: 'Header and hero section ready to send',
    icon: 'Newspaper',
    rowCount: 2,
    rows: [
      { columns: [{ type: 'header' }] },
      { columns: [{ type: 'hero' }] },
    ],
  },
];
