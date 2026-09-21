const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const URL_MAPPING = {
  '90-days-graphic-design': 'https://rzp.io/rzp/4ydecO7',
  'full-stack-creator': 'https://rzp.io/rzp/v8ykjCk',
  '3-hours-live-workshop': 'https://rzp.io/rzp/e9OpaQTo'
};

async function updateEnrollUrls() {
  console.log('=== Updating Enroll / CTA URLs in Supabase Database ===\n');

  // 1. Update programs table cta_url
  for (const [slug, url] of Object.entries(URL_MAPPING)) {
    const { data: prog, error: progErr } = await supabase
      .from('programs')
      .update({ cta_url: url })
      .eq('slug', slug)
      .select();

    if (progErr) {
      console.log(`Program update error for ${slug}:`, progErr.message);
    } else {
      console.log(`Updated program [${slug}] cta_url -> ${url}`);
    }
  }

  // 2. Update all section field_values for each program page
  for (const [pageSlug, url] of Object.entries(URL_MAPPING)) {
    const { data: page, error: pageErr } = await supabase
      .from('pages')
      .select('id, slug, title')
      .eq('slug', pageSlug)
      .maybeSingle();

    if (!page) {
      console.log(`Page not found: ${pageSlug}`);
      continue;
    }

    console.log(`\nFound page [${page.title}] (${page.slug})`);

    const { data: sections } = await supabase
      .from('sections')
      .select('id, name, slug')
      .eq('page_id', page.id);

    if (!sections || sections.length === 0) {
      console.log(`  No sections found for page ${pageSlug}`);
      continue;
    }

    for (const sec of sections) {
      const { data: fields } = await supabase
        .from('fields')
        .select('id, name, label, field_type')
        .eq('section_id', sec.id);

      if (!fields || fields.length === 0) continue;

      for (const field of fields) {
        if (
          field.name === 'enroll_url' ||
          field.name === 'primary_btn_url' ||
          field.name === 'cta_url'
        ) {
          const { data: existingVal } = await supabase
            .from('field_values')
            .select('id')
            .eq('field_id', field.id)
            .maybeSingle();

          const payload = {
            section_id: sec.id,
            field_id: field.id,
            page_id: page.id,
            value_text: url,
            value_url: url,
            published_value_text: url,
            is_draft: false,
            updated_at: new Date().toISOString()
          };

          if (existingVal) {
            const { error: updErr } = await supabase
              .from('field_values')
              .update(payload)
              .eq('id', existingVal.id);

            if (updErr) {
              console.log(`  Error updating field ${field.name} on ${sec.name}:`, updErr.message);
            } else {
              console.log(`  ✓ Updated section [${sec.name}] field [${field.name}] -> ${url}`);
            }
          } else {
            const { error: insErr } = await supabase
              .from('field_values')
              .insert(payload);

            if (insErr) {
              console.log(`  Error inserting field ${field.name} on ${sec.name}:`, insErr.message);
            } else {
              console.log(`  + Inserted section [${sec.name}] field [${field.name}] -> ${url}`);
            }
          }
        }
      }
    }
  }

  console.log('\n--- Finished Updating Database URLs! ---');
}

updateEnrollUrls().catch(console.error);
