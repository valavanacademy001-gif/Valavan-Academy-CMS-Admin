const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DEFAULT_PROGRAM_CONVERSIONS = [
  {
    id: '90-days-graphic-design',
    name: '90-Day Graphic Design Mastery',
    slug: '90-days-graphic-design',
    price: 4999,
    currency: 'INR',
    payment_url: 'https://pages.razorpay.com/pl_SuHNtUTy7rhIe0/view',
    thank_you_url: '/thank-you/90-days-graphic-design',
    whatsapp_group_url: 'https://chat.whatsapp.com/JfBplPD1MisAt0RMgrylRj',
    course_access_url: 'https://learn.valavanacademy.com/clientapp/login',
    is_active: true,
    description: 'Comprehensive 90-day practical design course with live mentorship and career portfolio.',
  },
  {
    id: '3-hours-live-workshop',
    name: '3 Hours Live Graphic Design Workshop',
    slug: '3-hours-live-workshop',
    price: 199,
    currency: 'INR',
    payment_url: 'https://rzp.io/rzp/e9OpaQTo',
    thank_you_url: '/thank-you/3-hours-live-workshop',
    whatsapp_group_url: 'https://chat.whatsapp.com/JfBplPD1MisAt0RMgrylRj',
    course_access_url: 'https://learn.valavanacademy.com/clientapp/login',
    is_active: true,
    description: 'Live 3-hour printing, flex design, and high-margin client acquisition masterclass.',
  },
  {
    id: 'full-stack-creator',
    name: 'Full Stack Digital Creator Program',
    slug: 'full-stack-creator',
    price: 14999,
    currency: 'INR',
    payment_url: 'https://rzp.io/rzp/v8ykjCk',
    thank_you_url: '/thank-you/full-stack-creator',
    whatsapp_group_url: 'https://chat.whatsapp.com/JfBplPD1MisAt0RMgrylRj',
    course_access_url: 'https://learn.valavanacademy.com/clientapp/login',
    is_active: true,
    description: 'Elite 6-month creator incubator covering design, 4K video editing, web, and monetization.',
  },
];

async function seedConversionSettings() {
  console.log('🚀 Seeding Program Conversion Settings in Supabase...');

  const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').single();
  if (!page) { console.error('Page not found'); return; }

  const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').single();
  if (!sec) { console.error('Section not found'); return; }

  let { data: field } = await supabase.from('fields').select('id').eq('section_id', sec.id).eq('name', 'program_conversion_settings').maybeSingle();
  if (!field) {
    const { data: newF, error: fErr } = await supabase.from('fields').insert({
      section_id: sec.id,
      name: 'program_conversion_settings',
      label: 'Program Conversion Settings',
      field_type: 'json',
      sort_order: 30,
    }).select('id').single();
    if (fErr) { console.error('Field insert error:', fErr); return; }
    field = newF;
  }

  const jsonStr = JSON.stringify(DEFAULT_PROGRAM_CONVERSIONS, null, 2);
  const { data: existingVal } = await supabase.from('field_values').select('id').eq('field_id', field.id).maybeSingle();

  if (existingVal) {
    await supabase.from('field_values').update({
      value_text: jsonStr,
      published_value_text: jsonStr,
      is_draft: false,
      updated_at: new Date().toISOString(),
    }).eq('id', existingVal.id);
    console.log('✅ Updated program_conversion_settings in database!');
  } else {
    await supabase.from('field_values').insert({
      page_id: page.id,
      section_id: sec.id,
      field_id: field.id,
      value_text: jsonStr,
      published_value_text: jsonStr,
      is_draft: false,
    });
    console.log('✅ Inserted program_conversion_settings in database!');
  }

  console.log('🎉 Seed Completed Successfully!');
}

seedConversionSettings().catch(console.error);
