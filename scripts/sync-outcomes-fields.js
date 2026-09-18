const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const OUTCOMES = [
  { title: 'Create Professional Designs With Confidence', tag: 'Core Skill' },
  { title: 'Build Your Own Portfolio', tag: 'Showcase' },
  { title: 'Handle Real Client Projects', tag: 'Hands-on' },
  { title: 'Design Social Media Creatives', tag: 'Social Growth' },
  { title: 'Create Advertising Campaign Assets', tag: 'Marketing' },
  { title: 'Develop Brand Identities', tag: 'Branding' },
  { title: 'Work As A Freelancer', tag: 'High Income' },
  { title: 'Apply For Design Opportunities', tag: 'Career Ready' },
  { title: 'Build A Personal Brand', tag: 'Authority' },
  { title: 'Continue Growing As A Creative Professional', tag: 'Lifelong Growth' },
];

async function run() {
  console.log('--- Syncing 10 Outcomes Fields to Supabase ---');
  const { data: page } = await supabase.from('pages').select('id').eq('slug', '90-days-graphic-design').single();
  if (!page) { console.error('Page not found'); return; }

  const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'outcomes').single();
  if (!sec) { console.error('Outcomes section not found'); return; }

  for (let i = 0; i < OUTCOMES.length; i++) {
    const idx = i + 1;
    const item = OUTCOMES[i];

    const titleField = { name: `outcome_${idx}_title`, label: `Outcome ${idx} Title`, field_type: 'short_text', val: item.title, sort_order: 10 + i * 2 };
    const tagField = { name: `outcome_${idx}_tag`, label: `Outcome ${idx} Tag`, field_type: 'short_text', val: item.tag, sort_order: 11 + i * 2 };

    for (const f of [titleField, tagField]) {
      const { data: existing } = await supabase.from('fields').select('id').eq('section_id', sec.id).eq('name', f.name).maybeSingle();
      let fieldId = existing?.id;
      if (!existing) {
        const { data: ins } = await supabase.from('fields').insert({
          section_id: sec.id,
          name: f.name,
          label: f.label,
          field_type: f.field_type,
          sort_order: f.sort_order
        }).select('id').single();
        fieldId = ins?.id;
        console.log(`Added field: ${f.name}`);
      }
      if (fieldId) {
        const { data: existingVal } = await supabase.from('field_values').select('id').eq('field_id', fieldId).maybeSingle();
        if (!existingVal) {
          await supabase.from('field_values').insert({
            section_id: sec.id,
            field_id: fieldId,
            value_text: f.val,
            published_value_text: f.val
          });
          console.log(`Added value for: ${f.name}`);
        } else {
          // Update to match new requested text
          await supabase.from('field_values').update({
            value_text: f.val,
            published_value_text: f.val
          }).eq('id', existingVal.id);
          console.log(`Updated value for: ${f.name}`);
        }
      }
    }
  }

  console.log('--- Finished Outcomes Sync ---');
}

run();
