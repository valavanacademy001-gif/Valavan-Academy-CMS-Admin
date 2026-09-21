const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STANDARD_TEMPLATE_ID = 'c0bbad7b-4959-4378-99e9-8be53cbd09bc';

// 1. Thank You Pages to register in CMS `pages` table
const THANK_YOU_PAGES = [
  {
    title: 'Thank You — 90-Day Graphic Design',
    slug: 'thank-you/90-days-graphic-design',
    description: 'Post-payment confirmation & WhatsApp onboarding for 90-Day Graphic Design Mastery',
    sort_order: 10,
    fields: [
      { name: 'heading', label: 'Headline', field_type: 'short_text', val: 'Thank You For Purchasing', sort_order: 1 },
      { name: 'program_title', label: 'Program Name', field_type: 'short_text', val: '90-Day Graphic Design Mastery Program', sort_order: 2 },
      { name: 'journey_subtext', label: 'Journey Subtitle', field_type: 'short_text', val: 'Your Creative Design Journey Starts Now', sort_order: 3 },
      { name: 'inbox_note', label: 'Inbox Notice', field_type: 'long_text', val: 'Check Your Inbox! ✉️ We Have Sent Your Order Confirmation, Your Registered Email Address.', sort_order: 4 },
      { name: 'activation_note', label: 'Working Hours & Activation Note', field_type: 'long_text', val: 'In Case Your Course Access Is Not Activated Instantly After Purchase, Kindly Note That It Will Be Activated Within Our Working Hours, Between 10:00 AM To 7:00 PM.', sort_order: 5 },
      { name: 'course_access_btn_text', label: 'Course Access Button Text', field_type: 'short_text', val: 'I Need Course Access', sort_order: 6 },
      { name: 'course_access_phone', label: 'Course Access WhatsApp Number', field_type: 'short_text', val: '+91 82205 11273', sort_order: 7 },
      { name: 'course_access_btn_url', label: 'Course Access Custom URL (Optional)', field_type: 'url', val: '', sort_order: 8 },
      { name: 'whatsapp_group_btn_text', label: 'WhatsApp Group Button Text', field_type: 'short_text', val: 'Join Whatsapp Community Group', sort_order: 9 },
      { name: 'whatsapp_group_url', label: 'WhatsApp Group Invite Link', field_type: 'url', val: 'https://chat.whatsapp.com/JfBplPD1MisAt0RMgrylRj', sort_order: 10 },
      { name: 'conversion_value', label: 'Conversion Tracking Value (INR)', field_type: 'number', val: '0', sort_order: 11 },
    ]
  },
  {
    title: 'Thank You — Full Stack Creator',
    slug: 'thank-you/full-stack-creator',
    description: 'Post-payment confirmation & WhatsApp onboarding for Full Stack Digital Creator',
    sort_order: 11,
    fields: [
      { name: 'heading', label: 'Headline', field_type: 'short_text', val: 'Thank You For Purchasing', sort_order: 1 },
      { name: 'program_title', label: 'Program Name', field_type: 'short_text', val: 'Full Stack Digital Creator Program', sort_order: 2 },
      { name: 'journey_subtext', label: 'Journey Subtitle', field_type: 'short_text', val: 'Your Digital Creator Journey Starts Now', sort_order: 3 },
      { name: 'inbox_note', label: 'Inbox Notice', field_type: 'long_text', val: 'Check Your Inbox! ✉️ We Have Sent Your Order Confirmation, Your Registered Email Address.', sort_order: 4 },
      { name: 'activation_note', label: 'Working Hours & Activation Note', field_type: 'long_text', val: 'In Case Your Course Access Is Not Activated Instantly After Purchase, Kindly Note That It Will Be Activated Within Our Working Hours, Between 10:00 AM To 7:00 PM.', sort_order: 5 },
      { name: 'course_access_btn_text', label: 'Course Access Button Text', field_type: 'short_text', val: 'I Need Course Access', sort_order: 6 },
      { name: 'course_access_phone', label: 'Course Access WhatsApp Number', field_type: 'short_text', val: '+91 82205 11273', sort_order: 7 },
      { name: 'course_access_btn_url', label: 'Course Access Custom URL (Optional)', field_type: 'url', val: '', sort_order: 8 },
      { name: 'whatsapp_group_btn_text', label: 'WhatsApp Group Button Text', field_type: 'short_text', val: 'Join Whatsapp Community Group', sort_order: 9 },
      { name: 'whatsapp_group_url', label: 'WhatsApp Group Invite Link', field_type: 'url', val: 'https://chat.whatsapp.com/JfBplPD1MisAt0RMgrylRj', sort_order: 10 },
      { name: 'conversion_value', label: 'Conversion Tracking Value (INR)', field_type: 'number', val: '0', sort_order: 11 },
    ]
  },
  {
    title: 'Thank You — 3 Hours Live Workshop',
    slug: 'thank-you/3-hours-live-workshop',
    description: 'Post-payment confirmation & WhatsApp onboarding for 3 Hours Live Workshop',
    sort_order: 12,
    fields: [
      { name: 'heading', label: 'Headline', field_type: 'short_text', val: 'Thank You For Purchasing', sort_order: 1 },
      { name: 'program_title', label: 'Program Name', field_type: 'short_text', val: '3 Hours Live Workshop', sort_order: 2 },
      { name: 'journey_subtext', label: 'Journey Subtitle', field_type: 'short_text', val: 'Your Graphic Design & Printing Business Journey Starts Now', sort_order: 3 },
      { name: 'inbox_note', label: 'Inbox Notice', field_type: 'long_text', val: 'Check Your Inbox! ✉️ We Have Sent Your Order Confirmation, Your Registered Email Address.', sort_order: 4 },
      { name: 'activation_note', label: 'Working Hours & Activation Note', field_type: 'long_text', val: 'In Case Your Course Access Is Not Activated Instantly After Purchase, Kindly Note That It Will Be Activated Within Our Working Hours, Between 10:00 AM To 7:00 PM.', sort_order: 5 },
      { name: 'course_access_btn_text', label: 'Course Access Button Text', field_type: 'short_text', val: 'I Need Course Access', sort_order: 6 },
      { name: 'course_access_phone', label: 'Course Access WhatsApp Number', field_type: 'short_text', val: '+91 82205 11273', sort_order: 7 },
      { name: 'course_access_btn_url', label: 'Course Access Custom URL (Optional)', field_type: 'url', val: '', sort_order: 8 },
      { name: 'whatsapp_group_btn_text', label: 'WhatsApp Group Button Text', field_type: 'short_text', val: 'Join Whatsapp Community Group', sort_order: 9 },
      { name: 'whatsapp_group_url', label: 'WhatsApp Group Invite Link', field_type: 'url', val: 'https://chat.whatsapp.com/JfBplPD1MisAt0RMgrylRj', sort_order: 10 },
      { name: 'conversion_value', label: 'Conversion Tracking Value (INR)', field_type: 'number', val: '99', sort_order: 11 },
    ]
  },
  {
    title: 'Thank You — General / Fallback',
    slug: 'thank-you',
    description: 'Default post-purchase thank you & onboarding confirmation page',
    sort_order: 13,
    fields: [
      { name: 'heading', label: 'Headline', field_type: 'short_text', val: 'Thank You For Purchasing', sort_order: 1 },
      { name: 'program_title', label: 'Program Name', field_type: 'short_text', val: 'Valavan Academy Program', sort_order: 2 },
      { name: 'journey_subtext', label: 'Journey Subtitle', field_type: 'short_text', val: 'Your Creative Learning Journey Starts Now', sort_order: 3 },
      { name: 'inbox_note', label: 'Inbox Notice', field_type: 'long_text', val: 'Check Your Inbox! ✉️ We Have Sent Your Order Confirmation, Your Registered Email Address.', sort_order: 4 },
      { name: 'activation_note', label: 'Working Hours & Activation Note', field_type: 'long_text', val: 'In Case Your Course Access Is Not Activated Instantly After Purchase, Kindly Note That It Will Be Activated Within Our Working Hours, Between 10:00 AM To 7:00 PM.', sort_order: 5 },
      { name: 'course_access_btn_text', label: 'Course Access Button Text', field_type: 'short_text', val: 'I Need Course Access', sort_order: 6 },
      { name: 'course_access_phone', label: 'Course Access WhatsApp Number', field_type: 'short_text', val: '+91 82205 11273', sort_order: 7 },
      { name: 'course_access_btn_url', label: 'Course Access Custom URL (Optional)', field_type: 'url', val: '', sort_order: 8 },
      { name: 'whatsapp_group_btn_text', label: 'WhatsApp Group Button Text', field_type: 'short_text', val: 'Join Whatsapp Community Group', sort_order: 9 },
      { name: 'whatsapp_group_url', label: 'WhatsApp Group Invite Link', field_type: 'url', val: 'https://chat.whatsapp.com/JfBplPD1MisAt0RMgrylRj', sort_order: 10 },
      { name: 'conversion_value', label: 'Conversion Tracking Value (INR)', field_type: 'number', val: '0', sort_order: 11 },
    ]
  }
];

async function syncAll() {
  console.log('=== 1. SYNCING 3 HOURS LIVE WORKSHOP INTO PROGRAMS TABLE ===\n');
  
  // Find workshop page id if exists
  const { data: workshopPage } = await supabase.from('pages').select('id').eq('slug', '3-hours-live-workshop').maybeSingle();
  
  const workshopProgramData = {
    slug: '3-hours-live-workshop',
    title: '3 Hours Live Workshop',
    subtitle: 'AI Powered Graphic Design & Printing Business Workshop',
    description: 'Master AI-powered graphic design, real printing secrets, pricing formulas, and business workflows in a comprehensive 3-hour live interactive Tamil workshop.',
    duration: '3 Hours Live',
    level: 'beginner',
    thumbnail_url: '/assets/images/workshop/poster.webp',
    banner_url: '/assets/images/workshop/poster.webp',
    cta_text: 'Enroll in Workshop',
    cta_url: 'https://rzp.io/rzp/e9OpaQTo',
    price: 99,
    original_price: 299,
    currency: 'INR',
    is_featured: true,
    is_visible: true,
    sort_order: 3,
    status: 'published',
    software_tools: ['Photoshop', 'Illustrator', 'Midjourney', 'Canva', 'AI Tools'],
    page_id: workshopPage?.id || null,
    updated_at: new Date().toISOString()
  };

  const { data: existingProg } = await supabase.from('programs').select('id').eq('slug', '3-hours-live-workshop').maybeSingle();
  if (!existingProg) {
    const { data: insProg, error: insErr } = await supabase.from('programs').insert(workshopProgramData).select('id').single();
    if (insErr) {
      console.error('Error inserting 3 Hours Live Workshop program:', insErr);
    } else {
      console.log('✓ Successfully created 3 Hours Live Workshop in programs table! ID:', insProg.id);
    }
  } else {
    const { error: updErr } = await supabase.from('programs').update(workshopProgramData).eq('id', existingProg.id);
    if (updErr) {
      console.error('Error updating 3 Hours Live Workshop program:', updErr);
    } else {
      console.log('✓ Successfully updated 3 Hours Live Workshop in programs table!');
    }
  }

  console.log('\n=== 2. SYNCING THANK YOU PAGES INTO CMS PAGES TABLE ===\n');

  for (const pageDef of THANK_YOU_PAGES) {
    // 1. Check or create page in `pages` table
    let { data: page } = await supabase.from('pages').select('id, title').eq('slug', pageDef.slug).maybeSingle();

    if (!page) {
      const { data: newPage, error: newPageErr } = await supabase
        .from('pages')
        .insert({
          title: pageDef.title,
          slug: pageDef.slug,
          description: pageDef.description,
          template_id: STANDARD_TEMPLATE_ID,
          status: 'published',
          sort_order: pageDef.sort_order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id, title')
        .single();

      if (newPageErr) {
        console.error(`Error creating page [${pageDef.slug}]:`, newPageErr);
        continue;
      }
      page = newPage;
      console.log(`+ Created Page: ${page.title} (/${pageDef.slug})`);
    } else {
      await supabase
        .from('pages')
        .update({
          title: pageDef.title,
          description: pageDef.description,
          status: 'published',
          sort_order: pageDef.sort_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id);
      console.log(`✓ Found Page: ${page.title} (/${pageDef.slug})`);
    }

    const pageId = page.id;

    // 2. Check or create `thank_you` section for this page
    let { data: section } = await supabase
      .from('sections')
      .select('id')
      .eq('page_id', pageId)
      .eq('slug', 'thank_you')
      .maybeSingle();

    if (!section) {
      const { data: newSec, error: newSecErr } = await supabase
        .from('sections')
        .insert({
          page_id: pageId,
          name: 'Thank You Page Content',
          slug: 'thank_you',
          is_visible: true,
          sort_order: 1,
        })
        .select('id')
        .single();

      if (newSecErr) {
        console.error(`Error creating thank_you section for ${pageDef.slug}:`, newSecErr);
        continue;
      }
      section = newSec;
      console.log(`  + Created Section: Thank You Page Content`);
    } else {
      console.log(`  ✓ Found Section: Thank You Page Content`);
    }

    const sectionId = section.id;

    // 3. Create or update fields and field_values
    for (const f of pageDef.fields) {
      const { data: existingField } = await supabase
        .from('fields')
        .select('id')
        .eq('section_id', sectionId)
        .eq('name', f.name)
        .maybeSingle();

      let fieldId = existingField?.id;

      if (!fieldId) {
        const { data: newF, error: newFErr } = await supabase
          .from('fields')
          .insert({
            section_id: sectionId,
            name: f.name,
            label: f.label,
            field_type: f.field_type,
            sort_order: f.sort_order,
          })
          .select('id')
          .single();

        if (newFErr) {
          console.error(`  Error creating field ${f.name}:`, newFErr);
          continue;
        }
        fieldId = newF.id;
      } else {
        await supabase
          .from('fields')
          .update({
            label: f.label,
            field_type: f.field_type,
            sort_order: f.sort_order,
          })
          .eq('id', fieldId);
      }

      const { data: existingVal } = await supabase
        .from('field_values')
        .select('id')
        .eq('field_id', fieldId)
        .maybeSingle();

      const valObj = {
        section_id: sectionId,
        field_id: fieldId,
        page_id: pageId,
        value_text: f.val,
        value_url: (f.field_type === 'url' || f.field_type === 'image') ? f.val : null,
        published_value_text: f.val,
        is_draft: false,
        updated_at: new Date().toISOString(),
      };

      if (!existingVal) {
        await supabase.from('field_values').insert(valObj);
      } else {
        await supabase.from('field_values').update(valObj).eq('id', existingVal.id);
      }
    }
    console.log(`  ✓ All 11 fields synchronized for ${pageDef.title}`);
  }

  console.log('\n=============================================');
  console.log('ALL PROGRAMS AND THANK YOU PAGES SYNCHRONIZED!');
  console.log('=============================================');
}

syncAll().catch(console.error);
