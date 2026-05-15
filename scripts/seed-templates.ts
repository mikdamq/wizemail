/**
 * One-time seed script: populate the `templates` table from lib/templates.ts
 * Run with: npx tsx scripts/seed-templates.ts
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local manually — no dotenv dependency needed
function loadEnvLocal() {
  try {
    const content = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local not found — rely on existing env vars
  }
}

loadEnvLocal();

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  // Dynamic import so tsx compiles the TS file on-the-fly
  const { TEMPLATES } = await import('../lib/templates');

  const rows = TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    main_category: t.mainCategory,
    sub_category: t.subCategory,
    accent_color: t.accentColor,
    access: t.access ?? 'free',
    featured: t.featured ?? false,
    published: true,
    collection: t.collection ?? null,
    direction: t.direction ?? 'ltr',
    sections: t.sections as unknown as object,
    use_count: 0,
  }));

  console.log(`Seeding ${rows.length} templates…`);

  const { error } = await supabase
    .from('templates')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }

  console.log(`✓ Seeded ${rows.length} templates successfully.`);
}

main();
