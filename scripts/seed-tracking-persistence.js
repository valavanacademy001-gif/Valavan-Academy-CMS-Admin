const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DEFAULT_PAGE_RULES = [
  {
    id: 'ptr-home',
    page_title: 'Home Page',
    page_path: '/',
    is_active: true,
    meta_event: 'PageView',
    ga4_event: 'page_view',
    gtm_datalayer_event: 'homepage_viewed',
    datalayer_payload: JSON.stringify({ page_type: 'home', academy: 'Valavan Academy' }, null, 2),
    trigger_on: 'page_load',
  },
  {
    id: 'ptr-workshop',
    page_title: '3 Hours Live Workshop',
    page_path: '/programs/3-hours-live-workshop',
    is_active: true,
    meta_event: 'ViewContent',
    ga4_event: 'view_item',
    gtm_datalayer_event: 'workshop_landing_view',
    datalayer_payload: JSON.stringify({ course_name: '3 Hours Graphic Design & Printing Workshop' }, null, 2),
    trigger_on: 'page_load',
  },
  {
    id: 'ptr-90days',
    page_title: '90-Day Graphic Design Mastery',
    page_path: '/programs/90-days-graphic-design',
    is_active: true,
    meta_event: 'ViewContent',
    ga4_event: 'view_item',
    gtm_datalayer_event: 'course_detail_view',
    datalayer_payload: JSON.stringify({ program_id: '90-days-gd', category: 'Graphic Design', duration: '90 Days' }, null, 2),
    trigger_on: 'page_load',
  },
  {
    id: 'ptr-fullstack',
    page_title: 'Full Stack Digital Creator Program',
    page_path: '/programs/full-stack-creator',
    is_active: true,
    meta_event: 'ViewContent',
    ga4_event: 'view_item',
    gtm_datalayer_event: 'fullstack_program_view',
    datalayer_payload: JSON.stringify({ program_id: 'full-stack-creator', level: 'Comprehensive Pro', duration: '6 Months' }, null, 2),
    trigger_on: 'page_load',
  },
  {
    id: 'ptr-contact',
    page_title: 'Contact Us Page',
    page_path: '/contact',
    is_active: true,
    meta_event: 'Contact',
    ga4_event: 'generate_lead',
    gtm_datalayer_event: 'contact_page_interaction',
    trigger_on: 'page_load',
  },
  {
    id: 'ptr-thankyou',
    page_title: 'Workshop Registration Success',
    page_path: '/thank-you/3-hours-live-workshop',
    is_active: true,
    meta_event: 'CompleteRegistration',
    ga4_event: 'purchase',
    gtm_datalayer_event: 'conversion_success',
    datalayer_payload: JSON.stringify({ conversion_type: 'workshop_enrollment', status: 'confirmed' }, null, 2),
    event_value: 99,
    currency: 'INR',
    trigger_on: 'page_load',
  },
];

const DEFAULT_TRACKING_FIELDS = [
  { name: 'meta_pixel_id', label: 'Meta Pixel ID', field_type: 'short_text', default_val: '' },
  { name: 'meta_pixel_enabled', label: 'Meta Pixel Enabled', field_type: 'toggle', default_val: 'true' },
  { name: 'ga4_measurement_id', label: 'GA4 Measurement ID', field_type: 'short_text', default_val: '' },
  { name: 'ga4_enabled', label: 'GA4 Enabled', field_type: 'toggle', default_val: 'true' },
  { name: 'gtm_container_id', label: 'GTM Container ID', field_type: 'short_text', default_val: '' },
  { name: 'gtm_enabled', label: 'GTM Enabled', field_type: 'toggle', default_val: 'true' },
  { name: 'clarity_project_id', label: 'Clarity Project ID', field_type: 'short_text', default_val: '' },
  { name: 'clarity_enabled', label: 'Microsoft Clarity Enabled', field_type: 'toggle', default_val: 'true' },
  { name: 'tiktok_pixel_id', label: 'TikTok Pixel ID', field_type: 'short_text', default_val: '' },
  { name: 'tiktok_enabled', label: 'TikTok Pixel Enabled', field_type: 'toggle', default_val: 'false' },
  { name: 'linkedin_partner_id', label: 'LinkedIn Partner ID', field_type: 'short_text', default_val: '' },
  { name: 'linkedin_enabled', label: 'LinkedIn Insight Tag Enabled', field_type: 'toggle', default_val: 'false' },
  { name: 'hotjar_site_id', label: 'Hotjar Site ID', field_type: 'short_text', default_val: '' },
  { name: 'hotjar_enabled', label: 'Hotjar Heatmaps Enabled', field_type: 'toggle', default_val: 'false' },
  { name: 'custom_head_code', label: 'Custom Head Code', field_type: 'rich_text', default_val: '' },
  { name: 'custom_body_code', label: 'Custom Body Code', field_type: 'rich_text', default_val: '' },
  { name: 'custom_footer_code', label: 'Custom Footer Code', field_type: 'rich_text', default_val: '' },
  { name: 'cookie_consent_enabled', label: 'Cookie Consent Banner Enabled', field_type: 'toggle', default_val: 'false' },
  { name: 'cookie_banner_headline', label: 'Cookie Banner Headline', field_type: 'short_text', default_val: 'We value your privacy' },
  { name: 'cookie_banner_text', label: 'Cookie Banner Description', field_type: 'long_text', default_val: 'We use cookies and tracking pixels to deliver personalized experiences and measure advertising performance.' },
  { name: 'page_tracking_data', label: 'Page Tracking Rules JSON', field_type: 'json', default_val: JSON.stringify(DEFAULT_PAGE_RULES) },
];

async function seedTracking() {
  console.log('=== SEEDING TRACKING & PAGE RULES PERSISTENCE ===\n');

  const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').single();
  if (!page) {
    console.error('global_settings page not found');
    return;
  }

  let { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').maybeSingle();
  if (!sec) {
    const { data: newSec, error: secErr } = await supabase.from('sections').insert({
      page_id: page.id,
      name: 'Tracking & Analytics Engine',
      slug: 'tracking_analytics',
      is_visible: true,
      sort_order: 1
    }).select('id').single();
    if (secErr) {
      console.error('Error creating section:', secErr);
      return;
    }
    sec = newSec;
  }

  const sectionId = sec.id;
  const pageId = page.id;

  for (const def of DEFAULT_TRACKING_FIELDS) {
    // 1. Check or insert field
    let { data: field } = await supabase.from('fields').select('id').eq('section_id', sectionId).eq('name', def.name).maybeSingle();
    if (!field) {
      const { data: newF, error: fErr } = await supabase.from('fields').insert({
        section_id: sectionId,
        name: def.name,
        label: def.label,
        field_type: def.field_type,
        sort_order: 1
      }).select('id').single();
      if (fErr) {
        console.error(`Error inserting field ${def.name}:`, fErr);
        continue;
      }
      field = newF;
      console.log(`+ Created field: ${def.name}`);
    }

    const fieldId = field.id;

    // 2. Check or insert field_value (NON-DESTRUCTIVE: if value exists and is non-empty, PRESERVE IT!)
    const { data: existingVal } = await supabase.from('field_values').select('id, value_text').eq('field_id', fieldId).maybeSingle();

    if (!existingVal) {
      await supabase.from('field_values').insert({
        section_id: sectionId,
        field_id: fieldId,
        page_id: pageId,
        value_text: def.default_val,
        published_value_text: def.default_val,
        is_draft: false,
        updated_at: new Date().toISOString()
      });
      console.log(`  + Seeded value for: ${def.name}`);
    } else if (!existingVal.value_text && def.default_val) {
      // Only set default if value_text is null/empty
      await supabase.from('field_values').update({
        value_text: def.default_val,
        published_value_text: def.default_val,
        updated_at: new Date().toISOString()
      }).eq('id', existingVal.id);
      console.log(`  ✓ Populated initial empty value for: ${def.name}`);
    } else {
      console.log(`  ✓ Kept existing user value for: ${def.name}`);
    }
  }

  console.log('\n=== FINISHED PERSISTING TRACKING DATA IN DATABASE ===');
}

seedTracking().catch(console.error);
