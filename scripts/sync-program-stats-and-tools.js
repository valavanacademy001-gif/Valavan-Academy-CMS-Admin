const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GD_TOOLS = [
  { name: 'Adobe InDesign', image: '/assets/tools/indesign.png' },
  { name: 'Adobe Illustrator', image: '/assets/tools/illustrator.png' },
  { name: 'Adobe Photoshop', image: '/assets/tools/ps.png' },
  { name: 'ChatGPT 4o', image: '/assets/tools/chatgpt.png' },
  { name: 'Google Gemini AI', image: '/assets/tools/gemini-ai.png' },
  { name: 'Canva Pro', image: '/assets/tools/canva.png' },
  { name: 'CorelDraw', image: '/assets/tools/coreldraw.png' },
  { name: 'Color Palette & Theory', image: '/assets/tools/color wheel.png' },
];

const FS_TOOLS = [
  { name: 'Adobe Premiere Pro', image: '/assets/tools/premiere-pro.png' },
  { name: 'Adobe After Effects', image: '/assets/tools/after-effects.png' },
  { name: 'WordPress CMS', image: '/assets/tools/wordpress.png' },
  { name: 'Elementor Pro', image: '/assets/tools/elementor-pro.png' },
  { name: 'ChatGPT AI', image: '/assets/tools/chatgpt.png' },
  { name: 'Google Gemini AI', image: '/assets/tools/gemini-ai.png' },
  { name: 'Adobe Photoshop', image: '/assets/tools/ps.png' },
  { name: 'Adobe Illustrator', image: '/assets/tools/illustrator.png' },
];

async function runSync() {
  console.log('--- Syncing Program Stats, Buttons, and Tools to Supabase ---');

  for (const pageSlug of ['90-days-graphic-design', 'full-stack-creator']) {
    const { data: page } = await supabase.from('pages').select('id').eq('slug', pageSlug).single();
    if (!page) continue;

    // 1. HERO SECTION FIELDS
    const { data: heroSec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'hero').single();
    if (heroSec) {
      const heroFields = [
        { name: 'enroll_btn_text', label: 'Primary Button Text', field_type: 'short_text', val: 'Enroll Now', sort_order: 10 },
        { name: 'enroll_url', label: 'Primary Button URL', field_type: 'url', val: 'https://learn.valavanacademy.com/clientapp/signup', sort_order: 11 },
        { name: 'secondary_btn_text', label: 'Secondary Button Text', field_type: 'short_text', val: 'View Curriculum', sort_order: 12 },
        { name: 'secondary_btn_url', label: 'Secondary Button URL (e.g. #roadmap)', field_type: 'short_text', val: '#roadmap', sort_order: 13 },
        { name: 'stat_students', label: 'Stat: Students Trained', field_type: 'short_text', val: '10,000+ Students Trained', sort_order: 20 },
        { name: 'stat_projects', label: 'Stat: Portfolio Projects', field_type: 'short_text', val: pageSlug === 'full-stack-creator' ? '25+ Portfolio Projects' : '20+ Portfolio Projects', sort_order: 21 },
        { name: 'stat_lessons', label: 'Stat: Learning Lessons', field_type: 'short_text', val: '150+ Learning Lessons', sort_order: 22 },
        { name: 'stat_access', label: 'Stat: Lifetime Access', field_type: 'short_text', val: 'Lifetime Access', sort_order: 23 },
        { name: 'stat_guidance', label: 'Stat: Expert Guidance', field_type: 'short_text', val: 'Expert Guidance', sort_order: 24 },
      ];

      for (const hf of heroFields) {
        const { data: existing } = await supabase.from('fields').select('id').eq('section_id', heroSec.id).eq('name', hf.name).maybeSingle();
        let fieldId = existing?.id;
        if (!existing) {
          const { data: ins } = await supabase.from('fields').insert({
            section_id: heroSec.id,
            name: hf.name,
            label: hf.label,
            field_type: hf.field_type,
            sort_order: hf.sort_order
          }).select('id').single();
          fieldId = ins?.id;
          console.log(`[${pageSlug}] Added hero field: ${hf.name}`);
        }
        if (fieldId) {
          const { data: existingVal } = await supabase.from('field_values').select('id').eq('field_id', fieldId).maybeSingle();
          if (!existingVal) {
            await supabase.from('field_values').insert({
              section_id: heroSec.id,
              field_id: fieldId,
              value_text: hf.val,
              published_value_text: hf.val
            });
            console.log(`[${pageSlug}] Added hero default value for: ${hf.name}`);
          }
        }
      }
    }

    // 2. TOOLS SECTION FIELDS
    const { data: toolsSec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tools').single();
    if (toolsSec) {
      const toolsList = pageSlug === '90-days-graphic-design' ? GD_TOOLS : FS_TOOLS;
      for (let i = 0; i < toolsList.length; i++) {
        const idx = i + 1;
        const tool = toolsList[i];

        const nameField = { name: `tool_${idx}_name`, label: `Tool ${idx} Name`, field_type: 'short_text', val: tool.name, sort_order: 10 + i * 2 };
        const imageField = { name: `tool_${idx}_image`, label: `Tool ${idx} Image/Logo`, field_type: 'image', val: tool.image, sort_order: 11 + i * 2 };

        for (const tf of [nameField, imageField]) {
          const { data: existing } = await supabase.from('fields').select('id').eq('section_id', toolsSec.id).eq('name', tf.name).maybeSingle();
          let fieldId = existing?.id;
          if (!existing) {
            const { data: ins } = await supabase.from('fields').insert({
              section_id: toolsSec.id,
              name: tf.name,
              label: tf.label,
              field_type: tf.field_type,
              sort_order: tf.sort_order
            }).select('id').single();
            fieldId = ins?.id;
            console.log(`[${pageSlug}] Added tool field: ${tf.name}`);
          }
          if (fieldId) {
            const { data: existingVal } = await supabase.from('field_values').select('id').eq('field_id', fieldId).maybeSingle();
            if (!existingVal) {
              await supabase.from('field_values').insert({
                section_id: toolsSec.id,
                field_id: fieldId,
                value_text: tf.val,
                value_url: tf.field_type === 'image' ? tf.val : null,
                published_value_text: tf.val
              });
              console.log(`[${pageSlug}] Added tool default value for: ${tf.name}`);
            }
          }
        }
      }
    }
  }

  console.log('--- Sync Completed Successfully ---');
}

runSync();
