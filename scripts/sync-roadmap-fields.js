const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ROADMAP_FIELDS = [
  { name: 'phase_1_title', label: 'Phase 1 Title', field_type: 'short_text', val: 'Foundation', sort_order: 10 },
  { name: 'phase_1_duration', label: 'Phase 1 Duration', field_type: 'short_text', val: '(Week 1–3)', sort_order: 11 },
  { name: 'phase_1_desc', label: 'Phase 1 Description', field_type: 'long_text', val: 'Build a strong creative foundation and understand the principles behind great design.', sort_order: 12 },
  { name: 'phase_1_topics', label: 'Phase 1 Topics (one per line)', field_type: 'long_text', val: 'Design Fundamentals\nColor Theory\nTypography\nLayout Principles\nVisual Hierarchy\nDesign Thinking\nCreative Mindset', sort_order: 13 },

  { name: 'phase_2_title', label: 'Phase 2 Title', field_type: 'short_text', val: 'Skill Development', sort_order: 20 },
  { name: 'phase_2_duration', label: 'Phase 2 Duration', field_type: 'short_text', val: '(Week 4–8)', sort_order: 21 },
  { name: 'phase_2_desc', label: 'Phase 2 Description', field_type: 'long_text', val: 'Master the tools, workflows, and techniques used in professional design projects.', sort_order: 22 },
  { name: 'phase_2_topics', label: 'Phase 2 Topics (one per line)', field_type: 'long_text', val: 'Photoshop Mastery\nImage Editing\nSocial Media Design\nPoster Design\nBranding Design\nAdvertisement Creatives\nClient Workflows', sort_order: 23 },

  { name: 'phase_3_title', label: 'Phase 3 Title', field_type: 'short_text', val: 'Career & Growth', sort_order: 30 },
  { name: 'phase_3_duration', label: 'Phase 3 Duration', field_type: 'short_text', val: '(Week 9–12)', sort_order: 31 },
  { name: 'phase_3_desc', label: 'Phase 3 Description', field_type: 'long_text', val: 'Transform your skills into opportunities.', sort_order: 32 },
  { name: 'phase_3_topics', label: 'Phase 3 Topics (one per line)', field_type: 'long_text', val: 'Portfolio Building\nFreelancing Basics\nClient Communication\nPersonal Branding\nProject Presentation\nPricing & Packaging\nCareer Preparation', sort_order: 33 },
];

async function run() {
  console.log('--- Syncing Roadmap Phase Fields to Supabase ---');
  const { data: page } = await supabase.from('pages').select('id').eq('slug', '90-days-graphic-design').single();
  if (!page) { console.error('Page not found'); return; }

  const { data: roadmapSec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'roadmap').single();
  if (!roadmapSec) { console.error('Roadmap section not found'); return; }

  for (const rf of ROADMAP_FIELDS) {
    const { data: existing } = await supabase.from('fields').select('id').eq('section_id', roadmapSec.id).eq('name', rf.name).maybeSingle();
    let fieldId = existing?.id;
    if (!existing) {
      const { data: ins } = await supabase.from('fields').insert({
        section_id: roadmapSec.id,
        name: rf.name,
        label: rf.label,
        field_type: rf.field_type,
        sort_order: rf.sort_order
      }).select('id').single();
      fieldId = ins?.id;
      console.log(`Added field: ${rf.name}`);
    }
    if (fieldId) {
      const { data: existingVal } = await supabase.from('field_values').select('id').eq('field_id', fieldId).maybeSingle();
      if (!existingVal) {
        await supabase.from('field_values').insert({
          section_id: roadmapSec.id,
          field_id: fieldId,
          value_text: rf.val,
          published_value_text: rf.val
        });
        console.log(`Added value for: ${rf.name}`);
      }
    }
  }
  console.log('--- Finished Roadmap Sync ---');
}

run();
