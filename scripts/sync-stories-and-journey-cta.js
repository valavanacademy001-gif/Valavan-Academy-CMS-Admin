const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log('--- Syncing Student Stories and Journey CTA to Supabase ---');
  const { data: page } = await supabase.from('pages').select('id').eq('slug', '90-days-graphic-design').single();
  if (!page) { console.error('Page not found'); return; }

  // 1. TESTIMONIALS (Watch Student Stories Video Section)
  const { data: testSec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'testimonials').single();
  if (testSec) {
    const testFields = [
      { name: 'badge', label: 'Badge', field_type: 'short_text', val: '▶ Watch Student Stories', sort_order: 1 },
      { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', val: "See What's Possible When", sort_order: 2 },
      { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', val: 'Skills Meet Action.', sort_order: 3 },
      { name: 'description', label: 'Description', field_type: 'long_text', val: 'Thousands of learners have transformed their creativity into real opportunities through consistent learning and implementation.', sort_order: 4 },
    ];

    for (const f of testFields) {
      const { data: existing } = await supabase.from('fields').select('id').eq('section_id', testSec.id).eq('name', f.name).maybeSingle();
      let fieldId = existing?.id;
      if (!existing) {
        const { data: ins } = await supabase.from('fields').insert({
          section_id: testSec.id,
          name: f.name,
          label: f.label,
          field_type: f.field_type,
          sort_order: f.sort_order
        }).select('id').single();
        fieldId = ins?.id;
        console.log(`Added testimonials field: ${f.name}`);
      }
      if (fieldId) {
        const { data: existingVal } = await supabase.from('field_values').select('id').eq('field_id', fieldId).maybeSingle();
        if (!existingVal) {
          await supabase.from('field_values').insert({
            section_id: testSec.id,
            field_id: fieldId,
            value_text: f.val,
            published_value_text: f.val
          });
          console.log(`Added testimonials value for: ${f.name}`);
        } else {
          await supabase.from('field_values').update({
            value_text: f.val,
            published_value_text: f.val
          }).eq('id', existingVal.id);
          console.log(`Updated testimonials value for: ${f.name}`);
        }
      }
    }
  }

  // 2. ENROLLMENT SUPPORT (Your Design Journey Starts Today Pre-FAQ CTA)
  const { data: supportSec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'enrollment_support').single();
  if (supportSec) {
    const supportFields = [
      { name: 'badge', label: 'Badge', field_type: 'short_text', val: 'START YOUR JOURNEY', sort_order: 1 },
      { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', val: 'Your Design Journey', sort_order: 2 },
      { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', val: 'Starts Today.', sort_order: 3 },
      { name: 'headline_sub', label: 'Headline Sub-statement', field_type: 'long_text', val: 'Every successful designer started with a blank canvas. The difference is they started.', sort_order: 4 },
      { name: 'description', label: 'Description', field_type: 'long_text', val: "If you're ready to build a valuable creative skill, create an impressive portfolio, and open new opportunities, this program is designed for you.", sort_order: 5 },
      { name: 'primary_btn_text', label: 'Primary Button Text', field_type: 'short_text', val: '🚀 Enroll Now', sort_order: 6 },
      { name: 'primary_btn_url', label: 'Primary Button URL', field_type: 'url', val: 'https://learn.valavanacademy.com/clientapp/signup', sort_order: 7 },
      { name: 'secondary_btn_text', label: 'Secondary Button Text', field_type: 'short_text', val: '📖 View Curriculum', sort_order: 8 },
      { name: 'secondary_btn_url', label: 'Secondary Button URL (or #roadmap)', field_type: 'short_text', val: '#roadmap', sort_order: 9 },
      { name: 'footer_subtext', label: 'Footer Subtext', field_type: 'short_text', val: 'Join thousands of learners building their creative future with Valavan Academy.', sort_order: 10 },
    ];

    for (const f of supportFields) {
      const { data: existing } = await supabase.from('fields').select('id').eq('section_id', supportSec.id).eq('name', f.name).maybeSingle();
      let fieldId = existing?.id;
      if (!existing) {
        const { data: ins } = await supabase.from('fields').insert({
          section_id: supportSec.id,
          name: f.name,
          label: f.label,
          field_type: f.field_type,
          sort_order: f.sort_order
        }).select('id').single();
        fieldId = ins?.id;
        console.log(`Added support field: ${f.name}`);
      }
      if (fieldId) {
        const { data: existingVal } = await supabase.from('field_values').select('id').eq('field_id', fieldId).maybeSingle();
        if (!existingVal) {
          await supabase.from('field_values').insert({
            section_id: supportSec.id,
            field_id: fieldId,
            value_text: f.val,
            published_value_text: f.val
          });
          console.log(`Added support value for: ${f.name}`);
        } else {
          await supabase.from('field_values').update({
            value_text: f.val,
            published_value_text: f.val
          }).eq('id', existingVal.id);
          console.log(`Updated support value for: ${f.name}`);
        }
      }
    }
  }

  console.log('--- Finished Syncing ---');
}

run();
