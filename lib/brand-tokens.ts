import type { BrandKit } from './types';

export const SYSTEM_FONT_STACK = "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";

export const BRAND_TOKEN_NAMES = [
  '$primary',
  '$secondary',
  '$background',
  '$text',
  '$custom1', '$custom2', '$custom3', '$custom4',
  '$custom5', '$custom6', '$custom7', '$custom8',
] as const;

export type BrandTokenName = typeof BRAND_TOKEN_NAMES[number];

/**
 * Resolve a color value that may be either a hex string or a brand token.
 * Token format: $primary, $secondary, $background, $text, $custom1..$custom8
 * Always returns a hex string safe for CSS/HTML attributes.
 */
export function resolveColor(
  value: string | undefined,
  brandKit: BrandKit,
  fallback = '#ffffff'
): string {
  if (!value) return fallback;
  if (!value.startsWith('$')) return value;
  switch (value) {
    case '$primary':    return brandKit.primaryColor;
    case '$secondary':  return brandKit.secondaryColor;
    case '$background': return brandKit.backgroundColor;
    case '$text':       return brandKit.textColor;
    default: {
      const match = value.match(/^\$custom(\d+)$/);
      if (match) {
        const idx = parseInt(match[1], 10) - 1;
        return brandKit.customColors?.[idx] ?? fallback;
      }
      return fallback;
    }
  }
}

/**
 * Resolve a font-family value.
 * '$brand' or undefined → brandKit.fontFamily (recursively resolved)
 * 'system' → full CSS system font stack
 * Anything else → returned as-is (e.g. 'Georgia, serif')
 */
export function resolveFontFamily(
  value: string | undefined,
  brandKit: BrandKit
): string {
  if (!value || value === '$brand') {
    return resolveFontFamily(brandKit.fontFamily, brandKit);
  }
  if (value === 'system') return SYSTEM_FONT_STACK;
  return value;
}

/**
 * Given a resolved hex color, return the first matching brand token name.
 * Used by applyBrandKitToAll() to convert existing hex values to token references.
 * Returns null if no token matches.
 */
export function hexToToken(hex: string, brandKit: BrandKit): BrandTokenName | null {
  if (!hex || !hex.startsWith('#')) return null;
  const normalized = hex.toLowerCase();
  if (brandKit.primaryColor.toLowerCase() === normalized) return '$primary';
  if (brandKit.secondaryColor.toLowerCase() === normalized) return '$secondary';
  if (brandKit.backgroundColor.toLowerCase() === normalized) return '$background';
  if (brandKit.textColor.toLowerCase() === normalized) return '$text';
  const customs = brandKit.customColors ?? [];
  for (let i = 0; i < customs.length; i++) {
    if (customs[i].toLowerCase() === normalized) {
      return `$custom${i + 1}` as BrandTokenName;
    }
  }
  return null;
}

// All SectionContent keys that hold color values — used by applyBrandKitToAll
export const COLOR_CONTENT_KEYS: ReadonlyArray<string> = [
  'backgroundColor',
  'textColor',
  'buttonColor',
  'buttonTextColor',
  'dividerColor',
];
