const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * SAFE NON-DESTRUCTIVE SEEDER
 * - NEVER deletes existing field_values or fields
 * - NEVER overwrites user-edited custom values
 * - Safely adds new pages, sections, and fields only if missing
 */

const ALL_PAGES = [
  {
    slug: 'home',
    title: 'Home Page',
    description: 'Valavan Academy Home Page with hero, marquee, programs, blueprint, and certifications.',
    sort_order: 1,
  },
  {
    slug: '90-days-graphic-design',
    title: '90-Day Graphic Design Mastery',
    description: 'Detailed program landing page for 90-Day Graphic Design Mastery.',
    sort_order: 2,
  },
  {
    slug: 'full-stack-creator',
    title: 'Full Stack Digital Creator Program',
    description: 'Detailed program landing page for 6-Month Full Stack Digital Creator Program.',
    sort_order: 3,
  },
  {
    slug: '3-hours-live-workshop',
    title: '3 Hours Live Workshop',
    description: 'Live workshop landing page for Graphic Design & Printing Business.',
    sort_order: 4,
  },
  {
    slug: 'programs',
    title: 'Programs Archive',
    description: 'Browse all practical career tracks and workshops.',
    sort_order: 5,
  },
  {
    slug: 'about',
    title: 'About Us',
    description: 'Our founder, story, mission, and vision.',
    sort_order: 6,
  },
  {
    slug: 'community',
    title: 'Community (TNCC)',
    description: 'Tamil Nadu Creators Club community details.',
    sort_order: 7,
  },
  {
    slug: 'contact',
    title: 'Contact Us',
    description: 'Contact information, office location, and inquiries.',
    sort_order: 8,
  },
  {
    slug: 'thank-you/90-days-graphic-design',
    title: 'Thank You — 90-Day Graphic Design',
    description: 'Post-payment confirmation & WhatsApp onboarding for 90-Day Graphic Design Mastery.',
    sort_order: 9,
  },
  {
    slug: 'thank-you/full-stack-creator',
    title: 'Thank You — Full Stack Creator',
    description: 'Post-payment confirmation & WhatsApp onboarding for Full Stack Digital Creator.',
    sort_order: 10,
  },
  {
    slug: 'thank-you/3-hours-live-workshop',
    title: 'Thank You — 3 Hours Live Workshop',
    description: 'Post-payment confirmation & WhatsApp onboarding for 3 Hours Live Workshop.',
    sort_order: 11,
  },
  {
    slug: 'thank-you',
    title: 'Thank You — General / Fallback',
    description: 'Default post-purchase thank you & onboarding confirmation page.',
    sort_order: 12,
  },
];

const PAGE_SECTIONS = {
  // ── 90-DAY GRAPHIC DESIGN MASTERY ──────────────────────────
  '90-days-graphic-design': [
    {
      slug: 'hero',
      name: 'Hero Section',
      type: 'hero',
      sort_order: 1,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'Most Popular · 90 Days · Tamil', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: '90 Days Graphic Design', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Mastery Program.', sort_order: 3 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'A structured, project-driven career program covering Photoshop, Illustrator, Canva, Logo Design, Social Media Design, Branding, and AI-powered creative workflows — taught completely in practical Tamil.', sort_order: 4 },
        { name: 'highlight_duration', label: 'Duration Text', field_type: 'short_text', value: '90 Days', sort_order: 5 },
        { name: 'highlight_language', label: 'Language Text', field_type: 'short_text', value: '100% Tamil', sort_order: 6 },
        { name: 'highlight_level', label: 'Level Text', field_type: 'short_text', value: 'Beginner to Pro', sort_order: 7 },
        { name: 'highlight_projects', label: 'Projects Stat', field_type: 'short_text', value: '10+ Live Projects', sort_order: 8 },
        { name: 'hero_image', label: 'Hero Image', field_type: 'image', value: '/assets/images/hero/ai-powered-GD.webp', sort_order: 9 },
        { name: 'enroll_url', label: 'Enroll Button URL', field_type: 'url', value: 'https://rzp.io/rzp/4ydecO7', sort_order: 10 },
        { name: 'community_url', label: 'Community Button URL', field_type: 'url', value: 'https://tamilnaducreatorsclub.com/', sort_order: 11 },
      ]
    },
    {
      slug: 'tools',
      name: 'Tools Covered',
      type: 'features',
      sort_order: 2,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'MASTER INDUSTRY STANDARD', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Creative Tools &', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'AI Software.', sort_order: 3 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'Gain practical mastery across industry-standard vector, raster, and AI design tools.', sort_order: 4 },
      ]
    },
    {
      slug: 'roadmap',
      name: 'Curriculum & Roadmap',
      type: 'features',
      sort_order: 3,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'STRUCTURED CURRICULUM', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: '90 Days Graphic Design', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Mastery Roadmap.', sort_order: 3 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'Follow a structured step-by-step journey designed to help you learn, practice, build a portfolio and launch your design career.', sort_order: 4 },
      ]
    },
    {
      slug: 'projects',
      name: 'Practical Projects',
      type: 'features',
      sort_order: 4,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'HANDS-ON EXPERIENCE', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Build Real-World', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Commercial Projects.', sort_order: 3 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'Every module includes actual client-level design projects so you graduate with a job-winning portfolio.', sort_order: 4 },
      ]
    },
    {
      slug: 'outcomes',
      name: 'After 90 Days Outcomes',
      type: 'features',
      sort_order: 5,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'CAREER TRANSFORMATION', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'After 90 Days,', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'You Will Be Ready To:', sort_order: 3 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'From landing your first ₹30k/mo freelance client to securing a high-demand graphic design role.', sort_order: 4 },
      ]
    },
    {
      slug: 'testimonials',
      name: 'Student Testimonials',
      type: 'testimonials',
      sort_order: 6,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'REAL RESULTS', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Our Students', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Success', sort_order: 3 },
        { name: 'title_suffix', label: 'Headline Suffix', field_type: 'short_text', value: 'Stories', sort_order: 4 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'Watch how everyday Tamil learners transformed their careers with Valavan Academy.', sort_order: 5 },
      ]
    },
    {
      slug: 'enrollment_support',
      name: 'Enrollment & Support',
      type: 'pricing',
      sort_order: 7,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'LIMITED SEATS', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Start Your Journey', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Today.', sort_order: 3 },
        { name: 'duration_text', label: 'Duration Text', field_type: 'short_text', value: '90 Days', sort_order: 4 },
        { name: 'seats_text', label: 'Seats Text', field_type: 'short_text', value: '20 Seats Available', sort_order: 5 },
        { name: 'enroll_url', label: 'Enroll Button URL', field_type: 'url', value: 'https://rzp.io/rzp/4ydecO7', sort_order: 6 },
      ]
    },
    {
      slug: 'faq',
      name: 'Frequently Asked Questions',
      type: 'faq',
      sort_order: 8,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'Got Questions?', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Frequently Asked', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Questions.', sort_order: 3 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'Everything you need to know about the 90-Day Graphic Design Mastery program.', sort_order: 4 },
      ]
    },
    {
      slug: 'sticky_cta',
      name: 'Sticky Bottom Bar',
      type: 'cta',
      sort_order: 9,
      fields: [
        { name: 'notice_text', label: 'Notice Text', field_type: 'short_text', value: 'Limited Seats Only', sort_order: 1 },
        { name: 'button_text', label: 'Button Text', field_type: 'short_text', value: 'ENROLL NOW', sort_order: 2 },
        { name: 'enroll_url', label: 'Button URL', field_type: 'url', value: 'https://rzp.io/rzp/4ydecO7', sort_order: 3 },
      ]
    },
    {
      slug: 'thank_you',
      name: 'Thank You Page Content',
      type: 'cta',
      sort_order: 10,
      fields: [
        { name: 'heading', label: 'Headline', field_type: 'short_text', value: 'Thank You For Purchasing', sort_order: 1 },
        { name: 'program_title', label: 'Program Name', field_type: 'short_text', value: '90-Day Graphic Design Mastery Program', sort_order: 2 },
        { name: 'journey_subtext', label: 'Journey Subtitle', field_type: 'short_text', value: 'Your Creative Design Journey Starts Now', sort_order: 3 },
        { name: 'inbox_note', label: 'Inbox Notice', field_type: 'long_text', value: 'Check Your Inbox! ✉️ We Have Sent Your Order Confirmation, Your Registered Email Address.', sort_order: 4 },
        { name: 'activation_note', label: 'Working Hours & Activation Note', field_type: 'long_text', value: 'In Case Your Course Access Is Not Activated Instantly After Purchase, Kindly Note That It Will Be Activated Within Our Working Hours, Between 10:00 AM To 7:00 PM.', sort_order: 5 },
        { name: 'course_access_btn_text', label: 'Course Access Button Text', field_type: 'short_text', value: 'I Need Course Access', sort_order: 6 },
        { name: 'course_access_phone', label: 'Course Access WhatsApp Number', field_type: 'short_text', value: '+91 82205 11273', sort_order: 7 },
        { name: 'course_access_btn_url', label: 'Course Access Custom Link (Optional)', field_type: 'url', value: '', sort_order: 8 },
        { name: 'whatsapp_group_btn_text', label: 'WhatsApp Group Button Text', field_type: 'short_text', value: 'Join Whatsapp Community Group', sort_order: 9 },
        { name: 'whatsapp_group_url', label: 'WhatsApp Group Invite Link', field_type: 'url', value: 'https://chat.whatsapp.com/JfBplPD1MisAt0RMgrylRj', sort_order: 10 },
        { name: 'conversion_value', label: 'Conversion Tracking Value (INR)', field_type: 'number', value: '0', sort_order: 11 },
      ]
    }
  ],

  // ── FULL STACK DIGITAL CREATOR PROGRAM ─────────────────────
  'full-stack-creator': [
    {
      slug: 'hero',
      name: 'Hero Section',
      type: 'hero',
      sort_order: 1,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'Comprehensive Career Track · 6 Months · Tamil', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Full Stack Digital', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Creator Program.', sort_order: 3 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'A complete 6-month career transformation program covering Video Editing, Web Design, UI/UX, WordPress, AI Tools, and Freelancing — everything you need to build high-income creative skills in Tamil.', sort_order: 4 },
        { name: 'highlight_duration', label: 'Duration Text', field_type: 'short_text', value: '6 Months', sort_order: 5 },
        { name: 'highlight_language', label: 'Language Text', field_type: 'short_text', value: '100% Tamil', sort_order: 6 },
        { name: 'highlight_level', label: 'Level Text', field_type: 'short_text', value: 'Beginner to Advanced', sort_order: 7 },
        { name: 'highlight_projects', label: 'Projects Stat', field_type: 'short_text', value: '25+ Live Projects', sort_order: 8 },
        { name: 'hero_image', label: 'Hero Image', field_type: 'image', value: '/assets/images/hero/full-stack-.jpg-1.webp', sort_order: 9 },
        { name: 'enroll_url', label: 'Enroll Button URL', field_type: 'url', value: 'https://rzp.io/rzp/v8ykjCk', sort_order: 10 },
        { name: 'community_url', label: 'Community Button URL', field_type: 'url', value: 'https://tamilnaducreatorsclub.com/', sort_order: 11 },
      ]
    },
    {
      slug: 'tools',
      name: 'Tools Covered',
      type: 'features',
      sort_order: 2,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'FULL STACK SUITE', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Master the Complete', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Creative Arsenal.', sort_order: 3 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'Learn Premiere Pro, After Effects, Figma, Webflow, WordPress, and cutting-edge Generative AI.', sort_order: 4 },
      ]
    },
    {
      slug: 'syllabus',
      name: 'Syllabus & Curriculum',
      type: 'features',
      sort_order: 3,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'COMPREHENSIVE SYLLABUS', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: '6 Months of High-Impact', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Career Learning.', sort_order: 3 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'Explore every module from design fundamentals to international high-ticket client acquisition.', sort_order: 4 },
      ]
    },
    {
      slug: 'skills_money',
      name: 'Skills That Make Money',
      type: 'features',
      sort_order: 4,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'HIGH-INCOME SKILLS', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Skills That Unlock', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'High-Paying Opportunities.', sort_order: 3 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'Every skill taught is directly tied to high-value freelance projects and full-time creative roles.', sort_order: 4 },
      ]
    },
    {
      slug: 'certification',
      name: 'Certification',
      type: 'features',
      sort_order: 5,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'OFFICIAL CREDENTIAL', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Earn an Industry-Recognized', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Certificate.', sort_order: 3 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'Validate your multi-disciplinary creative skills with the official Valavan Academy credential.', sort_order: 4 },
      ]
    },
    {
      slug: 'creator_economy',
      name: 'Creator Economy Boom',
      type: 'features',
      sort_order: 6,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'WHY NOW?', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'The Digital Creator', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Economy is Exploding.', sort_order: 3 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'Every business needs videos, websites, and content. The demand for full-stack creators has never been higher.', sort_order: 4 },
      ]
    },
    {
      slug: 'templates_bonus',
      name: 'Templates & Assets Bonus',
      type: 'features',
      sort_order: 7,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'FREE BONUSES', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Exclusive ₹50,000+', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Creator Resource Vault.', sort_order: 3 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'Get immediate access to premium templates, sound effects, motion graphics packs, and website themes.', sort_order: 4 },
      ]
    },
    {
      slug: 'who_is_this_for',
      name: 'Who Is This For',
      type: 'features',
      sort_order: 8,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'IS THIS FOR YOU?', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Designed for Ambitious', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Action Takers.', sort_order: 3 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'Whether you are starting from zero or upgrading your creative skills.', sort_order: 4 },
      ]
    },
    {
      slug: 'guidance_mentors',
      name: 'Guidance & Mentors',
      type: 'features',
      sort_order: 9,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'EXPERT MENTORSHIP', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Learn Directly From', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Industry Practitioners.', sort_order: 3 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'Get personal 1-on-1 portfolio feedback, live doubt-clearing sessions, and career guidance.', sort_order: 4 },
      ]
    },
    {
      slug: 'offer',
      name: 'Offer & Pricing',
      type: 'pricing',
      sort_order: 10,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'FLAGSHIP ENROLLMENT', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Transform Your Career', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Starting Today.', sort_order: 3 },
        { name: 'duration_text', label: 'Duration Text', field_type: 'short_text', value: '6 Months', sort_order: 4 },
        { name: 'enroll_url', label: 'Enroll URL', field_type: 'url', value: 'https://rzp.io/rzp/v8ykjCk', sort_order: 5 },
      ]
    },
    {
      slug: 'faq',
      name: 'Frequently Asked Questions',
      type: 'faq',
      sort_order: 11,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'FAQs', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Full Stack Creator', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Common Questions.', sort_order: 3 },
      ]
    },
    {
      slug: 'sticky_cta',
      name: 'Sticky Bottom Bar',
      type: 'cta',
      sort_order: 12,
      fields: [
        { name: 'notice_text', label: 'Notice Text', field_type: 'short_text', value: 'Next Cohort Starting Soon', sort_order: 1 },
        { name: 'button_text', label: 'Button Text', field_type: 'short_text', value: 'APPLY NOW', sort_order: 2 },
        { name: 'enroll_url', label: 'Button URL', field_type: 'url', value: 'https://rzp.io/rzp/v8ykjCk', sort_order: 3 },
      ]
    },
    {
      slug: 'thank_you',
      name: 'Thank You Page Content',
      type: 'cta',
      sort_order: 13,
      fields: [
        { name: 'heading', label: 'Headline', field_type: 'short_text', value: 'Thank You For Purchasing', sort_order: 1 },
        { name: 'program_title', label: 'Program Name', field_type: 'short_text', value: 'Full Stack Digital Creator Program', sort_order: 2 },
        { name: 'journey_subtext', label: 'Journey Subtitle', field_type: 'short_text', value: 'Your Digital Creator Journey Starts Now', sort_order: 3 },
        { name: 'inbox_note', label: 'Inbox Notice', field_type: 'long_text', value: 'Check Your Inbox! ✉️ We Have Sent Your Order Confirmation, Your Registered Email Address.', sort_order: 4 },
        { name: 'activation_note', label: 'Working Hours & Activation Note', field_type: 'long_text', value: 'In Case Your Course Access Is Not Activated Instantly After Purchase, Kindly Note That It Will Be Activated Within Our Working Hours, Between 10:00 AM To 7:00 PM.', sort_order: 5 },
        { name: 'course_access_btn_text', label: 'Course Access Button Text', field_type: 'short_text', value: 'I Need Course Access', sort_order: 6 },
        { name: 'course_access_phone', label: 'Course Access WhatsApp Number', field_type: 'short_text', value: '+91 82205 11273', sort_order: 7 },
        { name: 'course_access_btn_url', label: 'Course Access Custom Link (Optional)', field_type: 'url', value: '', sort_order: 8 },
        { name: 'whatsapp_group_btn_text', label: 'WhatsApp Group Button Text', field_type: 'short_text', value: 'Join Whatsapp Community Group', sort_order: 9 },
        { name: 'whatsapp_group_url', label: 'WhatsApp Group Invite Link', field_type: 'url', value: 'https://chat.whatsapp.com/JfBplPD1MisAt0RMgrylRj', sort_order: 10 },
        { name: 'conversion_value', label: 'Conversion Tracking Value (INR)', field_type: 'number', value: '0', sort_order: 11 },
      ]
    }
  ],

  // ── 3 HOURS LIVE WORKSHOP ──────────────────────────────────
  '3-hours-live-workshop': [
    {
      slug: 'hero',
      name: 'Hero Section',
      type: 'hero',
      sort_order: 1,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'LIVE MASTERCLASS · 3 HOURS · TAMIL', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Graphic Design & Printing', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Business Live Workshop.', sort_order: 3 },
        { name: 'description', label: 'Description', field_type: 'long_text', value: 'Start your Graphic Design journey and learn how designers build profitable businesses in Tamil by Mr. Valavan.', sort_order: 4 },
        { name: 'price_text', label: 'Price Text', field_type: 'short_text', value: '₹99 (Regular ₹999)', sort_order: 5 },
        { name: 'date_text', label: 'Date & Time Text', field_type: 'short_text', value: 'Upcoming Sunday · 10:00 AM IST', sort_order: 6 },
        { name: 'enroll_url', label: 'Enroll URL', field_type: 'url', value: 'https://rzp.io/rzp/e9OpaQTo', sort_order: 7 },
      ]
    },
    {
      slug: 'what_you_discover',
      name: 'What You Will Discover',
      type: 'features',
      sort_order: 2,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: "WHAT YOU'LL LEARN", sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: '3 Hours Packed with', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Actionable Insights.', sort_order: 3 },
        { name: 'card_1_title', label: 'Card 1 Title', field_type: 'short_text', value: 'Understand What Graphic Design Really Is', sort_order: 4 },
        { name: 'card_1_desc', label: 'Card 1 Description', field_type: 'long_text', value: 'Learn the core fundamentals of color theory, typography, composition, and visual hierarchy from absolute scratch.', sort_order: 5 },
        { name: 'card_2_title', label: 'Card 2 Title', field_type: 'short_text', value: 'Design Your First Professional Poster', sort_order: 6 },
        { name: 'card_2_desc', label: 'Card 2 Description', field_type: 'long_text', value: 'Follow along live and create a stunning commercial social media poster in Photoshop within minutes.', sort_order: 7 },
        { name: 'card_3_title', label: 'Card 3 Title', field_type: 'short_text', value: 'Discover How Designers Earn Money', sort_order: 8 },
        { name: 'card_3_desc', label: 'Card 3 Description', field_type: 'long_text', value: 'Understand freelancing, client acquisition, and high-paying local & international printing business opportunities.', sort_order: 9 },
      ]
    },
    {
      slug: 'bonuses',
      name: 'Exclusive Bonuses',
      type: 'features',
      sort_order: 3,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'FREE BONUSES WORTH ₹4,999', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Join Live & Get Exclusive', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Bonus Assets.', sort_order: 3 },
        { name: 'bonus_1_title', label: 'Bonus 1 Title', field_type: 'short_text', value: 'Graphic Design Resource Vault', sort_order: 4 },
        { name: 'bonus_1_value', label: 'Bonus 1 Value Tag', field_type: 'short_text', value: 'WORTH ₹2,499', sort_order: 5 },
        { name: 'bonus_1_desc', label: 'Bonus 1 Description', field_type: 'long_text', value: 'Huge collection of premium fonts, editable PSD templates, design mockups, brushes, and assets for your commercial projects.', sort_order: 6 },
        { name: 'bonus_2_title', label: 'Bonus 2 Title', field_type: 'short_text', value: 'Workshop Completion Certificate', sort_order: 7 },
        { name: 'bonus_2_value', label: 'Bonus 2 Value Tag', field_type: 'short_text', value: 'WORTH ₹2,500', sort_order: 8 },
        { name: 'bonus_2_desc', label: 'Bonus 2 Description', field_type: 'long_text', value: 'Official Certificate of Participation by Valavan Academy after attending the live workshop.', sort_order: 9 },
      ]
    },
    {
      slug: 'who_should_attend',
      name: 'Who Should Attend',
      type: 'features',
      sort_order: 4,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'WHO IS THIS FOR?', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Ideal For Anyone Wanting To', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Master Visual Design.', sort_order: 3 },
      ]
    },
    {
      slug: 'mentor_bio',
      name: 'Meet Your Mentor',
      type: 'features',
      sort_order: 5,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'MEET YOUR MENTOR', sort_order: 1 },
        { name: 'mentor_name', label: 'Mentor Name', field_type: 'short_text', value: 'Mr. Valavan', sort_order: 2 },
        { name: 'mentor_title', label: 'Mentor Title', field_type: 'short_text', value: 'Founder & Lead Creative Mentor, Valavan Academy', sort_order: 3 },
        { name: 'mentor_bio', label: 'Mentor Bio', field_type: 'long_text', value: '10+ Years Experience in Graphic Design & Printing Business. Trained 5,000+ students across Tamil Nadu to launch successful careers.', sort_order: 4 },
        { name: 'mentor_image', label: 'Mentor Photo', field_type: 'image', value: '/assets/workshop/Valavan-Image-768x768.webp', sort_order: 5 },
      ]
    },
    {
      slug: 'pricing_cta',
      name: 'Pricing & Registration',
      type: 'pricing',
      sort_order: 6,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'LIMITED REGISTRATION', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Lock Your Seat For Just', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: '₹99 Only.', sort_order: 3 },
        { name: 'price_current', label: 'Current Price', field_type: 'short_text', value: '₹99', sort_order: 4 },
        { name: 'price_original', label: 'Original Price', field_type: 'short_text', value: '₹999', sort_order: 5 },
        { name: 'cta_url', label: 'Registration URL', field_type: 'url', value: 'https://rzp.io/rzp/e9OpaQTo', sort_order: 6 },
      ]
    },
    {
      slug: 'faq',
      name: 'Workshop FAQs',
      type: 'faq',
      sort_order: 7,
      fields: [
        { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'QUESTIONS?', sort_order: 1 },
        { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Workshop Frequently Asked', sort_order: 2 },
        { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Questions.', sort_order: 3 },
      ]
    },
    {
      slug: 'sticky_cta',
      name: 'Sticky Bottom Bar',
      type: 'cta',
      sort_order: 8,
      fields: [
        { name: 'notice_text', label: 'Notice Text', field_type: 'short_text', value: 'Live Workshop at ₹99 Only', sort_order: 1 },
        { name: 'button_text', label: 'Button Text', field_type: 'short_text', value: 'REGISTER NOW', sort_order: 2 },
        { name: 'cta_url', label: 'Button URL', field_type: 'url', value: 'https://rzp.io/rzp/e9OpaQTo', sort_order: 3 },
      ]
    },
    {
      slug: 'thank_you',
      name: 'Thank You Page Content',
      type: 'cta',
      sort_order: 9,
      fields: [
        { name: 'heading', label: 'Headline', field_type: 'short_text', value: 'Thank You For Purchasing', sort_order: 1 },
        { name: 'program_title', label: 'Program Name', field_type: 'short_text', value: '3 Hours Live Workshop', sort_order: 2 },
        { name: 'journey_subtext', label: 'Journey Subtitle', field_type: 'short_text', value: 'Your Graphic Design & Printing Business Journey Starts Now', sort_order: 3 },
        { name: 'inbox_note', label: 'Inbox Notice', field_type: 'long_text', value: 'Check Your Inbox! ✉️ We Have Sent Your Order Confirmation, Your Registered Email Address.', sort_order: 4 },
        { name: 'activation_note', label: 'Working Hours & Activation Note', field_type: 'long_text', value: 'In Case Your Course Access Is Not Activated Instantly After Purchase, Kindly Note That It Will Be Activated Within Our Working Hours, Between 10:00 AM To 7:00 PM.', sort_order: 5 },
        { name: 'course_access_btn_text', label: 'Course Access Button Text', field_type: 'short_text', value: 'I Need Course Access', sort_order: 6 },
        { name: 'course_access_phone', label: 'Course Access WhatsApp Number', field_type: 'short_text', value: '+91 82205 11273', sort_order: 7 },
        { name: 'course_access_btn_url', label: 'Course Access Custom Link (Optional)', field_type: 'url', value: '', sort_order: 8 },
        { name: 'whatsapp_group_btn_text', label: 'WhatsApp Group Button Text', field_type: 'short_text', value: 'Join Whatsapp Community Group', sort_order: 9 },
        { name: 'whatsapp_group_url', label: 'WhatsApp Group Invite Link', field_type: 'url', value: 'https://chat.whatsapp.com/JfBplPD1MisAt0RMgrylRj', sort_order: 10 },
        { name: 'conversion_value', label: 'Conversion Tracking Value (INR)', field_type: 'number', value: '99', sort_order: 11 },
      ]
    }
  ]
};

async function safeSync() {
  console.log('=== VALAVAN ACADEMY SAFE NON-DESTRUCTIVE CMS SEED ===\n');

  // 1. Ensure all Pages exist
  for (const page of ALL_PAGES) {
    const { data: existing } = await supabase.from('pages').select('id, slug').eq('slug', page.slug).maybeSingle();
    if (existing) {
      console.log(`✓ Page exists: ${page.title} (${page.slug})`);
    } else {
      const { data: newPage, error } = await supabase.from('pages').insert([{
        slug: page.slug,
        title: page.title,
        description: page.description,
        status: 'published',
        sort_order: page.sort_order,
        seo_title: `${page.title} — Valavan Academy`,
        seo_description: page.description,
      }]).select().single();
      if (error) console.error(`Error adding page ${page.slug}:`, error.message);
      else console.log(`+ Created new page: ${page.title} (${page.slug})`);
    }
  }

  // Get map of page slugs to IDs
  const { data: allDbPages } = await supabase.from('pages').select('id, slug');
  const pageIdMap = {};
  allDbPages.forEach(p => { pageIdMap[p.slug] = p.id; });

  // Get section types
  const { data: sTypes } = await supabase.from('section_types').select('id, slug');
  const typeMap = {};
  sTypes?.forEach(t => { typeMap[t.slug] = t.id; });

  // 2. Safely sync sections and fields
  for (const [pageSlug, sections] of Object.entries(PAGE_SECTIONS)) {
    const pageId = pageIdMap[pageSlug];
    if (!pageId) {
      console.warn(`! Page ID not found for ${pageSlug}`);
      continue;
    }

    console.log(`\nChecking sections for "${pageSlug}"...`);

    for (const s of sections) {
      let secId;
      const { data: existingSec } = await supabase.from('sections')
        .select('id')
        .eq('page_id', pageId)
        .eq('slug', s.slug)
        .maybeSingle();

      if (existingSec) {
        secId = existingSec.id;
        console.log(`  ✓ Section exists: ${s.name} (${s.slug})`);
      } else {
        const { data: insSec, error: sErr } = await supabase.from('sections').insert([{
          page_id: pageId,
          name: s.name,
          slug: s.slug,
          section_type_id: typeMap[s.type] || null,
          sort_order: s.sort_order,
          is_visible: true
        }]).select().single();
        if (sErr) console.error(`  ! Error creating section ${s.slug}:`, sErr.message);
        else {
          secId = insSec.id;
          console.log(`  + Created section: ${s.name} (${s.slug})`);
        }
      }

      if (!secId) continue;

      // Safely sync fields for this section (NEVER delete existing, only insert missing)
      for (const def of s.fields) {
        const { data: existingField } = await supabase.from('fields')
          .select('id, name')
          .eq('section_id', secId)
          .eq('name', def.name)
          .maybeSingle();

        let fieldId;
        if (existingField) {
          fieldId = existingField.id;
        } else {
          const { data: newField, error: fErr } = await supabase.from('fields').insert([{
            section_id: secId,
            name: def.name,
            label: def.label,
            field_type: def.field_type,
            sort_order: def.sort_order,
            is_required: false
          }]).select().single();

          if (fErr) {
            console.error(`    ! Error creating field ${def.name}:`, fErr.message);
            continue;
          }
          fieldId = newField.id;
          console.log(`    + Created field: ${def.label} (${def.name})`);
        }

        // Check if field_value exists
        const { data: existingVal } = await supabase.from('field_values')
          .select('id, value_text, value_url')
          .eq('field_id', fieldId)
          .maybeSingle();

        if (!existingVal) {
          // Only insert default value if value does NOT exist
          const isText = ['short_text','long_text','rich_text','heading','subheading','color','select'].includes(def.field_type);
          const isUrl = ['url','email','youtube','video','image'].includes(def.field_type);

          await supabase.from('field_values').insert([{
            field_id: fieldId,
            section_id: secId,
            page_id: pageId,
            value_text: isText ? def.value : null,
            value_url: isUrl ? def.value : null,
            published_value_text: isText ? def.value : null,
            is_draft: false
          }]);
          console.log(`    + Seeded default value for: ${def.name}`);
        }
      }
    }
  }

  console.log('\n=== SAFE NON-DESTRUCTIVE SYNC FINISHED! ===');
}

safeSync().catch(err => {
  console.error('Fatal safe sync error:', err);
  process.exit(1);
});
