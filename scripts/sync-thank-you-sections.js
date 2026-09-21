const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const THANK_YOU_SECTIONS = {
  '90-days-graphic-design': {
    name: 'Thank You Page Content',
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
  'full-stack-creator': {
    name: 'Thank You Page Content',
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
  '3-hours-live-workshop': {
    name: 'Thank You Page Content',
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
  }
};

async function syncThankYouSections() {
  console.log('=== Syncing Thank You Sections into Supabase CMS ===\n');

  for (const [pageSlug, secData] of Object.entries(THANK_YOU_SECTIONS)) {
    const { data: page } = await supabase.from('pages').select('id, title').eq('slug', pageSlug).maybeSingle();
    if (!page) {
      console.log(`Page not found: ${pageSlug}`);
      continue;
    }

    console.log(`\nPage [${page.title}] (${pageSlug})`);

    // Find or create 'thank_you' section
    let { data: section } = await supabase
      .from('sections')
      .select('id')
      .eq('page_id', page.id)
      .eq('slug', 'thank_you')
      .maybeSingle();

    if (!section) {
      const { data: newSec, error: newSecErr } = await supabase
        .from('sections')
        .insert({
          page_id: page.id,
          name: secData.name,
          slug: 'thank_you',
          is_visible: true,
          sort_order: 20,
        })
        .select('id')
        .single();

      if (newSecErr) {
        console.error(`Error creating section thank_you:`, newSecErr);
        continue;
      }
      section = newSec;
      console.log(`  + Created Section: ${secData.name}`);
    } else {
      console.log(`  ✓ Found Section: ${secData.name}`);
    }

    const sectionId = section.id;

    for (const f of secData.fields) {
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
        console.log(`  + Created Field: ${f.name} (${f.label})`);
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
        page_id: page.id,
        value_text: f.val,
        value_url: (f.field_type === 'url' || f.field_type === 'image') ? f.val : null,
        published_value_text: f.val,
        is_draft: false,
        updated_at: new Date().toISOString(),
      };

      if (!existingVal) {
        const { error: insErr } = await supabase
          .from('field_values')
          .insert(valObj);

        if (insErr) {
          console.error(`  Error inserting value for ${f.name}:`, insErr);
        } else {
          console.log(`  + Inserted Value for: ${f.name} -> "${f.val}"`);
        }
      } else {
        const { error: updErr } = await supabase
          .from('field_values')
          .update(valObj)
          .eq('id', existingVal.id);

        if (updErr) {
          console.error(`  Error updating value for ${f.name}:`, updErr);
        } else {
          console.log(`  ✓ Updated Value for: ${f.name} -> "${f.val}"`);
        }
      }
    }
  }

  console.log('\n--- Finished Syncing Thank You Sections! ---');
}

syncThankYouSections().catch(console.error);
