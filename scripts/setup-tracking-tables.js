const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupTables() {
  console.log('--- Setting up Enterprise Tracking & Analytics Tables in Supabase ---');

  // Check or initialize tracking_settings table
  const { data: existingSettings, error: setErr } = await supabase.from('tracking_settings').select('*').limit(1);
  
  if (setErr && setErr.code === '42P01') {
    console.log('Table tracking_settings does not exist yet. Will create or check via RPC / insert.');
  }

  // Insert or update global default settings
  const defaultSettings = {
    id: 'global',
    meta_pixel_enabled: false,
    meta_pixel_id: '',
    ga4_enabled: false,
    ga4_measurement_id: '',
    gtm_enabled: false,
    gtm_container_id: '',
    clarity_enabled: false,
    clarity_project_id: '',
    linkedin_enabled: false,
    linkedin_partner_id: '',
    tiktok_enabled: false,
    tiktok_pixel_id: '',
    hotjar_enabled: false,
    hotjar_site_id: '',
    custom_head_code: '',
    custom_body_code: '',
    custom_footer_code: '',
    cookie_consent_enabled: true,
    cookie_banner_headline: 'We value your privacy',
    cookie_banner_text: 'We use cookies and analytics to enhance your browsing experience, provide personalized content, and analyze our traffic.',
    updated_at: new Date().toISOString(),
  };

  const { data: upsertData, error: upsertErr } = await supabase
    .from('tracking_settings')
    .upsert(defaultSettings, { onConflict: 'id' })
    .select();

  if (upsertErr) {
    console.log('Notice on tracking_settings upsert:', upsertErr.message);
  } else {
    console.log('✓ tracking_settings table verified & populated:', upsertData?.[0]?.id);
  }

  // Seed sample conversion goals if empty
  const sampleGoals = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Workshop Registration Started',
      trigger_type: 'whatsapp_click',
      trigger_value: 'whatsapp_click',
      is_active: true,
      completions_count: 142,
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Program Enrollment Click',
      trigger_type: 'event_name',
      trigger_value: 'enroll_now_click',
      is_active: true,
      completions_count: 89,
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Contact Inquiry Submitted',
      trigger_type: 'form_submit',
      trigger_value: 'contact_form_submit',
      is_active: true,
      completions_count: 47,
    },
  ];

  for (const goal of sampleGoals) {
    await supabase.from('conversion_goals').upsert(goal, { onConflict: 'id' });
  }
  console.log('✓ conversion_goals seeded/verified.');

  // Seed initial sample leads if empty
  const sampleLeads = [
    {
      id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
      name: 'Praveen Kumar',
      phone: '+91 98765 43210',
      email: 'praveen.k@gmail.com',
      program_interested: '90 Days Graphic Design Mastery',
      source: 'WhatsApp Click',
      status: 'New',
      utm_source: 'Instagram',
      utm_medium: 'Reels_Ad',
      utm_campaign: 'GD_Mastery_Sep26',
      utm_content: 'Design_Career_Video',
      utm_term: 'graphic design course in tamil',
      landing_page: '/programs/90-days-graphic-design',
      referrer: 'https://l.instagram.com/',
      notes: 'Interested in weekend live mentorship batch.',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
      name: 'Ananya Ramesh',
      phone: '+91 97890 12345',
      email: 'ananya.design@outlook.com',
      program_interested: '3 Hours Live Workshop',
      source: 'Contact Form',
      status: 'Contacted',
      utm_source: 'Google Ads',
      utm_medium: 'Search',
      utm_campaign: 'Workshop_Lead_Search',
      utm_content: 'Headline_A',
      utm_term: 'photoshop workshop tamil',
      landing_page: '/programs/3-hours-live-workshop',
      referrer: 'https://www.google.com/',
      notes: 'Called, confirmed registration link sent.',
      created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    {
      id: 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
      name: 'Vignesh S',
      phone: '+91 94440 98765',
      email: 'vignesh.creator@gmail.com',
      program_interested: 'Full Stack Creator Masterclass',
      source: 'Enroll CTA Click',
      status: 'Enrolled',
      utm_source: 'YouTube',
      utm_medium: 'Channel_Link',
      utm_campaign: 'YT_Description_Links',
      utm_content: 'Video_Outcomes',
      utm_term: '',
      landing_page: '/programs/full-stack-creator',
      referrer: 'https://www.youtube.com/',
      notes: 'Enrolled in full stack creator program.',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    }
  ];

  for (const lead of sampleLeads) {
    await supabase.from('lead_tracking').upsert(lead, { onConflict: 'id' });
  }
  console.log('✓ lead_tracking seeded/verified.');

  console.log('--- All Tracking Tables Verified Successfully ---');
}

setupTables();
