const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GLOBAL_SEO_SEED = {
  site_name: 'Valavan Academy',
  default_title: 'Valavan Academy — Build a Future-Ready Creative Career in Tamil',
  default_meta_description: 'Master Graphic Design, Video Editing, AI Tools, Web Design, and Freelancing through practical Tamil-first education designed for the real world.',
  default_keywords: [
    'Graphic Design course in Tamil',
    'Video Editing Masterclass Tamil',
    'Tamil Nadu Graphic Design Training',
    'AI Tools for Designers Tamil',
    'Freelancing Mentorship Tamil Nadu',
    'Valavan Academy Vellore'
  ],
  canonical_domain: 'https://valavanacademy.com',
  default_og_image: 'https://valavanacademy.com/assets/images/hero/ai-powered-GD.webp',
  default_author: 'Valavan Academy Mentorship Team',
  default_brand_name: 'Valavan Academy',
  organization_type: 'EducationalOrganization',
  contact_phone: '+91 90800 70624',
  contact_whatsapp: '919080070624',
  address_locality: 'Vellore',
  address_region: 'Tamil Nadu',
  postal_code: '632001',
  address_country: 'IN',
  email: 'contact@valavanacademy.com',
  same_as_socials: [
    'https://www.youtube.com/@valavanacademy',
    'https://www.instagram.com/valavanacademy',
    'https://twitter.com/valavanacademy',
    'https://www.linkedin.com/company/valavan-academy'
  ],
  languages_spoken: ['Tamil', 'English']
};

const PAGE_SEO_SEED = [
  {
    slug: 'home',
    page_path: '/',
    name: 'Home Page',
    seo_title: 'Valavan Academy — Build a Future-Ready Creative Career in Tamil',
    meta_description: 'Master Graphic Design, Video Editing, AI Tools, Web Design, and Freelancing through practical Tamil-first education designed for the real world.',
    focus_keyword: 'Graphic Design course in Tamil',
    seo_keywords: ['graphic design course Tamil', 'learn photoshop in Tamil', 'creative career Tamil Nadu', 'AI tools course Tamil', 'Valavan Academy Vellore'],
    canonical_url: 'https://valavanacademy.com',
    og_title: 'Valavan Academy — Build a Future-Ready Creative Career',
    og_description: 'Master Graphic Design, Video Editing, AI Tools & Freelancing in Tamil. Build a commercial portfolio with live mentorship.',
    og_image: 'https://valavanacademy.com/assets/images/hero/ai-powered-GD.webp',
    og_type: 'website',
    twitter_card: 'summary_large_image',
    robots_index: true,
    robots_follow: true,
    schema_type: 'EducationalOrganization',
    aeo_qa_data: [
      {
        question: 'What is Valavan Academy?',
        answer: 'Valavan Academy is Tamil Nadu’s premier creative career learning platform offering hands-on, project-driven coaching in Graphic Design, Video Editing, Web Design, and AI Tools in Tamil.',
        key_takeaway: 'Tamil-first practical creative career coaching since 2018.'
      },
      {
        question: 'What courses does Valavan Academy offer?',
        answer: 'Valavan Academy offers the 90-Day Graphic Design Mastery program, the 3 Hours Live Printing & Design Workshop, and the 6-Month Full Stack Digital Creator Masterclass.',
        key_takeaway: 'Beginner to advanced design & creator programs.'
      }
    ]
  },
  {
    slug: '90-days-graphic-design',
    page_path: '/programs/90-days-graphic-design',
    name: '90-Day Graphic Design Mastery',
    seo_title: '90-Day Graphic Design Mastery in Tamil | Valavan Academy',
    meta_description: 'Master commercial Photoshop, Illustrator, InDesign, Canva, AI workflows, print media, branding, and client freelancing in 90 days. Tamil mentorship with job portfolio.',
    focus_keyword: '90-day graphic design course in Tamil',
    seo_keywords: ['graphic design mastery tamil', 'photoshop course tamil', 'illustrator training tamil', 'freelancing graphic designer tamil nadu', 'print design course tamil'],
    canonical_url: 'https://valavanacademy.com/programs/90-days-graphic-design',
    og_title: '90-Day Graphic Design Mastery Program — In Tamil',
    og_description: 'Become an industry-ready Graphic Designer in 90 Days. Live projects, agency assignments, AI tools, and 1-on-1 portfolio review.',
    og_image: 'https://valavanacademy.com/assets/images/hero/ai-powered-GD.webp',
    og_type: 'course',
    twitter_card: 'summary_large_image',
    robots_index: true,
    robots_follow: true,
    schema_type: 'Course',
    price: 4999,
    currency: 'INR',
    rating: 4.9,
    review_count: 320,
    duration: '90 Days',
    aeo_qa_data: [
      {
        question: 'What is the duration of the Graphic Design program at Valavan Academy?',
        answer: 'The program is an intensive 90-day structured roadmap covering design principles, Photoshop, Illustrator, AI tools, commercial print design, and client acquisition.',
        key_takeaway: '90 Days hands-on with live mentor feedback.'
      },
      {
        question: 'Is this course suitable for complete beginners?',
        answer: 'Yes, no prior design experience is required. The curriculum begins from core visual foundations and scales up to agency-grade projects and client freelancing.',
        key_takeaway: 'Beginner friendly, taught 100% in Tamil.'
      }
    ]
  },
  {
    slug: '3-hours-live-workshop',
    page_path: '/programs/3-hours-live-workshop',
    name: '3 Hours Live Workshop',
    seo_title: '3-Hour Live Printing & Graphic Design Workshop | Valavan Academy',
    meta_description: 'Live interactive 3-hour masterclass covering real-world printing techniques, color separation (CMYK), flex & offset design secrets, and direct client freelancing tactics.',
    focus_keyword: 'Live Printing and Graphic Design Workshop in Tamil',
    seo_keywords: ['printing workshop tamil', 'cmyk print design', 'flex banner design tamil', 'offset printing secrets', 'graphic design masterclass live'],
    canonical_url: 'https://valavanacademy.com/programs/3-hours-live-workshop',
    og_title: '3-Hour Live Printing & Graphic Design Masterclass',
    og_description: 'Discover commercial print production secrets, CMYK color profiles, and client-ready artwork preparation live in 3 hours.',
    og_image: 'https://valavanacademy.com/assets/images/hero/ai-powered-GD.webp',
    og_type: 'course',
    twitter_card: 'summary_large_image',
    robots_index: true,
    robots_follow: true,
    schema_type: 'Course',
    price: 199,
    currency: 'INR',
    rating: 4.9,
    review_count: 580,
    duration: '3 Hours',
    aeo_qa_data: [
      {
        question: 'What is covered in the 3 Hours Live Workshop?',
        answer: 'The workshop teaches real-world offset, digital, and flex printing standards, bleed & crop marks, CMYK vs RGB color mastery, and high-margin print client strategies.',
        key_takeaway: '3 Hours of commercial printing mastery with Q&A.'
      }
    ]
  },
  {
    slug: 'full-stack-creator',
    page_path: '/programs/full-stack-creator',
    name: 'Full Stack Digital Creator',
    seo_title: 'Full Stack Creator Masterclass (6 Months) | Valavan Academy',
    meta_description: 'Comprehensive 6-month elite incubation: Master Graphic Design, Premiere Pro, After Effects, Web Design, AI automations, and personal brand monetization in Tamil.',
    focus_keyword: 'Full Stack Creator Course Tamil',
    seo_keywords: ['digital creator masterclass tamil', 'video editing course tamil', 'youtube content creator course tamil', 'motion graphics course tamil', 'personal branding tamil'],
    canonical_url: 'https://valavanacademy.com/programs/full-stack-creator',
    og_title: 'Full Stack Digital Creator Masterclass (6 Months)',
    og_description: 'Transform into a full-scale digital creator and agency owner. Complete mastery over visual design, video editing, web, and monetized channels.',
    og_image: 'https://valavanacademy.com/assets/images/hero/ai-powered-GD.webp',
    og_type: 'course',
    twitter_card: 'summary_large_image',
    robots_index: true,
    robots_follow: true,
    schema_type: 'Course',
    price: 14999,
    currency: 'INR',
    rating: 5.0,
    review_count: 140,
    duration: '6 Months',
    aeo_qa_data: [
      {
        question: 'What is the Full Stack Creator program?',
        answer: 'The Full Stack Creator program is a 6-month advanced incubator teaching Graphic Design, Video Editing, Motion Graphics, Web Funnels, and AI automation for digital creators.',
        key_takeaway: 'Comprehensive 6-month creator & agency track.'
      }
    ]
  },
  {
    slug: 'about',
    page_path: '/about',
    name: 'About Valavan Academy',
    seo_title: 'About Valavan Academy — Empowering Creators in Tamil Nadu',
    meta_description: 'Discover the mission, mentors, and journey behind Valavan Academy. Tamil Nadu’s leading institute for practical digital skills and creator careers.',
    canonical_url: 'https://valavanacademy.com/about',
    og_image: 'https://valavanacademy.com/assets/images/team/team.webp',
    og_type: 'article',
    twitter_card: 'summary_large_image',
    robots_index: true,
    robots_follow: true,
    schema_type: 'AboutPage'
  },
  {
    slug: 'contact',
    page_path: '/contact',
    name: 'Contact Us',
    seo_title: 'Contact Valavan Academy | Admission & Course Support',
    meta_description: 'Get in touch with Valavan Academy. Reach our admissions and student support team via WhatsApp, call, or email.',
    canonical_url: 'https://valavanacademy.com/contact',
    og_image: 'https://valavanacademy.com/assets/images/hero/ai-powered-GD.webp',
    og_type: 'website',
    twitter_card: 'summary_large_image',
    robots_index: true,
    robots_follow: true,
    schema_type: 'ContactPage'
  },
  {
    slug: 'community',
    page_path: '/community',
    name: 'TNCC Community',
    seo_title: 'TNCC Creative Community | Valavan Academy',
    meta_description: 'Join TNCC (Tamil Nadu Creators Club) by Valavan Academy. Network with 5,000+ designers, video editors, and digital entrepreneurs.',
    canonical_url: 'https://valavanacademy.com/community',
    og_image: 'https://valavanacademy.com/assets/images/team/team.webp',
    og_type: 'website',
    twitter_card: 'summary_large_image',
    robots_index: true,
    robots_follow: true,
    schema_type: 'WebPage'
  },
  {
    slug: 'programs',
    page_path: '/programs',
    name: 'All Programs',
    seo_title: 'Creative & Digital Career Courses in Tamil | Valavan Academy',
    meta_description: 'Explore all high-income digital programs: 90-Day Graphic Design, 3-Hour Printing Workshop, and Full Stack Creator Masterclass.',
    canonical_url: 'https://valavanacademy.com/programs',
    og_image: 'https://valavanacademy.com/assets/images/hero/ai-powered-GD.webp',
    og_type: 'website',
    twitter_card: 'summary_large_image',
    robots_index: true,
    robots_follow: true,
    schema_type: 'EducationalOrganization'
  }
];

async function runSeed() {
  console.log('🚀 Seeding Global SEO & AEO Settings into Supabase...');

  // 1. Get or create page 'global_settings'
  let { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').maybeSingle();
  if (!page) {
    const { data: newPage, error: pErr } = await supabase.from('pages').insert({
      title: 'Global Settings',
      slug: 'global_settings',
      status: 'published'
    }).select().single();
    if (pErr) {
      console.error('Error creating page global_settings:', pErr);
      return;
    }
    page = newPage;
  }
  console.log('✅ Page ID:', page.id);

  // 2. Get or create section 'tracking_analytics'
  let { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').maybeSingle();
  if (!sec) {
    const { data: newSec, error: sErr } = await supabase.from('sections').insert({
      page_id: page.id,
      title: 'Tracking & Analytics Settings',
      slug: 'tracking_analytics',
      section_type: 'settings',
      order_index: 0
    }).select().single();
    if (sErr) {
      console.error('Error creating section tracking_analytics:', sErr);
      return;
    }
    sec = newSec;
  }
  console.log('✅ Section ID:', sec.id);

  // Helper to ensure field and field_value
  async function saveField(fieldName, fieldLabel, dataObj) {
    let { data: field } = await supabase.from('fields').select('id').eq('section_id', sec.id).eq('name', fieldName).maybeSingle();
    if (!field) {
      const { data: newField, error: fErr } = await supabase.from('fields').insert({
        section_id: sec.id,
        name: fieldName,
        label: fieldLabel,
        field_type: 'json',
        sort_order: 10
      }).select('id').single();
      if (fErr) {
        console.error(`Error creating field ${fieldName}:`, fErr);
        return;
      }
      field = newField;
    }

    const jsonStr = JSON.stringify(dataObj, null, 2);

    const { data: fv } = await supabase.from('field_values').select('id').eq('field_id', field.id).eq('section_id', sec.id).maybeSingle();
    if (fv) {
      const { error: uErr } = await supabase.from('field_values').update({
        value_text: jsonStr,
        published_value_text: jsonStr,
        updated_at: new Date().toISOString()
      }).eq('id', fv.id);
      if (uErr) console.error(`Error updating field_value ${fieldName}:`, uErr);
      else console.log(`✅ Updated field_value: ${fieldName}`);
    } else {
      const { error: iErr } = await supabase.from('field_values').insert({
        page_id: page.id,
        field_id: field.id,
        section_id: sec.id,
        value_text: jsonStr,
        published_value_text: jsonStr
      });
      if (iErr) console.error(`Error inserting field_value ${fieldName}:`, iErr);
      else console.log(`✅ Inserted field_value: ${fieldName}`);
    }
  }

  await saveField('global_seo_data', 'Global SEO Settings', GLOBAL_SEO_SEED);
  await saveField('seo_settings_data', 'Page SEO & AEO Data', PAGE_SEO_SEED);

  console.log('🎉 SEO & AEO Settings Seed Completed Successfully!');
}

runSeed().catch(console.error);
