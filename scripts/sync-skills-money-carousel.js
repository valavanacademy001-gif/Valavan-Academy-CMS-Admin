const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SKILLS_CARDS = [
  {
    title: 'Foundation of Graphic Design',
    image: '/assets/programs/full-stack-creator/skills-modules/foundation-of-graphic-design-1.webp',
  },
  {
    title: 'Adobe Photoshop CC Mastery',
    image: '/assets/programs/full-stack-creator/skills-modules/photoshop-mastery-1.webp',
  },
  {
    title: 'Adobe Illustrator CC Mastery',
    image: '/assets/programs/full-stack-creator/skills-modules/illustrator-mastery-1.webp',
  },
  {
    title: 'Logo Design Mastery',
    image: '/assets/programs/full-stack-creator/skills-modules/logo-design-mastery-2.webp',
  },
  {
    title: 'Social Media Design Mastery',
    image: '/assets/programs/full-stack-creator/skills-modules/social-media-design-mastery-1.webp',
  },
  {
    title: 'YouTube Thumbnail Mastery',
    image: '/assets/programs/full-stack-creator/skills-modules/thumbnail-mastery.webp',
  },
  {
    title: 'Branding Mastery',
    image: '/assets/programs/full-stack-creator/skills-modules/branding-mastery-1.webp',
  },
  {
    title: 'Video Editing Mastery',
    image: '/assets/programs/full-stack-creator/skills-modules/Video-Editing-Mastery-1.webp',
  },
  {
    title: 'WordPress Mastery',
    image: '/assets/programs/full-stack-creator/skills-modules/WordPress-Mastery-1.webp',
  },
  {
    title: 'AI Graphic Design Workflow',
    image: '/assets/programs/full-stack-creator/skills-modules/ai-graphic-design-work-flow-1.webp',
  },
  {
    title: 'Canva Mastery',
    image: '/assets/programs/full-stack-creator/skills-modules/canva-Mastery-3.webp',
  },
];

async function syncSkillsMoneyFields() {
  console.log('--- Syncing Skills Money Carousel Fields to Supabase CMS ---');

  const { data: page } = await supabase.from('pages').select('id').eq('slug', 'full-stack-creator').single();
  if (!page) {
    console.error('Page full-stack-creator not found');
    return;
  }

  const { data: section } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'skills_money').single();
  if (!section) {
    console.error('Section skills_money not found');
    return;
  }

  // Ensure header fields exist with friendly labels
  const headerFields = [
    { name: 'badge', label: 'Badge', field_type: 'short_text', val: 'Topics', sort_order: 1 },
    { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', val: 'Learn Skills That', sort_order: 2 },
    { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', val: 'Actually Make Money', sort_order: 3 },
    { name: 'description', label: 'Description', field_type: 'long_text', val: 'Not outdated theory. Real digital skills businesses & clients are hiring for right now.', sort_order: 4 },
  ];

  for (const hf of headerFields) {
    let { data: existing } = await supabase.from('fields').select('id').eq('section_id', section.id).eq('name', hf.name).maybeSingle();
    let fieldId = existing?.id;
    if (!existing) {
      const { data: ins } = await supabase.from('fields').insert({
        section_id: section.id,
        name: hf.name,
        label: hf.label,
        field_type: hf.field_type,
        sort_order: hf.sort_order,
      }).select('id').single();
      fieldId = ins?.id;
    }
    if (fieldId) {
      const { data: existingVal } = await supabase.from('field_values').select('id').eq('field_id', fieldId).maybeSingle();
      if (!existingVal) {
        await supabase.from('field_values').insert({
          section_id: section.id,
          field_id: fieldId,
          page_id: page.id,
          value_text: hf.val,
          published_value_text: hf.val,
        });
      }
    }
  }

  // Add all 11 cards with title & image fields
  for (let i = 0; i < SKILLS_CARDS.length; i++) {
    const card = SKILLS_CARDS[i];
    const idx = i + 1;

    const titleField = {
      name: `card_${idx}_title`,
      label: `Card ${idx}: Title`,
      field_type: 'short_text',
      val: card.title,
      sort_order: 10 + i * 2,
    };

    const imageField = {
      name: `card_${idx}_image`,
      label: `Card ${idx}: Image Card`,
      field_type: 'image',
      val: card.image,
      sort_order: 11 + i * 2,
    };

    for (const f of [titleField, imageField]) {
      let { data: existing } = await supabase.from('fields').select('id').eq('section_id', section.id).eq('name', f.name).maybeSingle();
      let fieldId = existing?.id;
      if (!existing) {
        const { data: ins } = await supabase.from('fields').insert({
          section_id: section.id,
          name: f.name,
          label: f.label,
          field_type: f.field_type,
          sort_order: f.sort_order,
        }).select('id').single();
        fieldId = ins?.id;
        console.log(`Added field: ${f.name} (${f.label})`);
      }

      if (fieldId) {
        const { data: existingVal } = await supabase.from('field_values').select('id, value_text, value_url, published_value_text').eq('field_id', fieldId).maybeSingle();
        if (!existingVal) {
          await supabase.from('field_values').insert({
            section_id: section.id,
            field_id: fieldId,
            page_id: page.id,
            value_text: f.val,
            value_url: f.field_type === 'image' ? f.val : null,
            published_value_text: f.val,
          });
          console.log(`Initialized value for ${f.name} -> ${f.val}`);
        } else if (!existingVal.value_text && !existingVal.value_url && !existingVal.published_value_text) {
          await supabase.from('field_values').update({
            value_text: f.val,
            value_url: f.field_type === 'image' ? f.val : null,
            published_value_text: f.val,
          }).eq('id', existingVal.id);
          console.log(`Populated empty value for ${f.name} -> ${f.val}`);
        }
      }
    }
  }

  console.log('--- Successfully Synced All Skills Money Carousel Fields to Supabase CMS! ---');
}

syncSkillsMoneyFields();
