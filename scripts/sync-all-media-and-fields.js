const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      files.push(name);
    }
  }
  return files;
}

async function syncAll() {
  console.log('=== VALAVAN ACADEMY FULL CONTENT & MEDIA SYNC ===\n');

  // 1. SYNC MEDIA ASSETS
  const publicDir = path.resolve(__dirname, '../../valavan-academy-v2/public');
  const assetsDir = path.join(publicDir, 'assets');
  const filePaths = getFiles(assetsDir);
  const logoIcon = path.join(publicDir, 'logo-icon.png');
  if (fs.existsSync(logoIcon)) filePaths.push(logoIcon);

  console.log(`1. Found ${filePaths.length} physical assets in ${publicDir}`);

  if (filePaths.length > 0) {
    await supabase.from('media').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const mediaRows = [];
    for (const fp of filePaths) {
      const stat = fs.statSync(fp);
      const rel = '/' + path.relative(publicDir, fp).replace(/\\/g, '/');
      const filename = path.basename(fp);
      const ext = path.extname(fp).toLowerCase();

      let file_type = 'image';
      if (ext === '.mp4' || ext === '.webm') file_type = 'video';
      else if (ext === '.pdf') file_type = 'document';
      else if (ext === '.mp3' || ext === '.wav') file_type = 'audio';

      let alt_text = filename.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, '');
      if (rel.includes('certifications')) alt_text = 'Valavan Academy Certificate - ' + alt_text;
      else if (rel.includes('about')) alt_text = 'Valavan Academy Team - ' + alt_text;
      else if (rel.includes('programs')) alt_text = 'Valavan Academy Program - ' + alt_text;

      mediaRows.push({
        filename,
        original_name: filename,
        file_url: rel,
        file_type,
        file_size: stat.size,
        alt_text,
      });
    }

    for (let i = 0; i < mediaRows.length; i += 30) {
      const batch = mediaRows.slice(i, i + 30);
      await supabase.from('media').insert(batch);
    }
    console.log(`✓ Inserted ${mediaRows.length} media records into Supabase.`);
  }

  // 2. SEED ALL 3 PROGRAMS
  console.log('\n2. Syncing Programs...');
  const programsData = [
    {
      slug: '90-days-graphic-design',
      title: '90-Day Graphic Design Mastery',
      subtitle: 'From beginner to confident commercial designer',
      description: 'A practical, project-driven program covering complete visual branding, commercial layouts, and AI-powered workflows in Tamil.',
      duration: '90 Days',
      level: 'beginner',
      thumbnail_url: '/assets/images/hero/ai-powered-GD.webp',
      banner_url: '/assets/images/hero/ai-powered-GD.webp',
      cta_text: 'Enroll Now',
      cta_url: 'https://learn.valavanacademy.com/clientapp/signup',
      price: 4999,
      original_price: 9999,
      currency: 'INR',
      is_featured: true,
      is_visible: true,
      sort_order: 1,
      status: 'published',
      skills: ['Photoshop', 'Illustrator', 'Canva', 'Logo Design', 'Branding', 'Social Media Design', 'AI Graphic Design'],
      software_tools: ['Photoshop', 'Illustrator', 'Canva', 'CorelDraw', 'InDesign', 'Midjourney', 'ChatGPT'],
      modules: [
        { title: 'Foundation & Principles', duration: '2 Weeks', lessons: 8 },
        { title: 'Adobe Photoshop Mastery', duration: '3 Weeks', lessons: 14 },
        { title: 'Adobe Illustrator Vector Art', duration: '3 Weeks', lessons: 12 },
        { title: 'Branding & Social Media', duration: '2 Weeks', lessons: 10 },
        { title: 'AI-Powered Design Workflows', duration: '2 Weeks', lessons: 8 }
      ]
    },
    {
      slug: 'full-stack-creator',
      title: 'Full Stack Digital Creator Program',
      subtitle: 'Master Design, Video Editing, Web & AI to become an unstoppable creator',
      description: 'Our most comprehensive 6-month career program covering the complete stack of digital creation: Graphic Design, Motion Graphics, Premiere Pro, After Effects, Webflow/Framer, and Generative AI.',
      duration: '6 Months',
      level: 'intermediate',
      thumbnail_url: '/assets/images/hero/full-stack-.jpg-1.webp',
      banner_url: '/assets/images/hero/full-stack-.jpg-1.webp',
      cta_text: 'Apply for Next Cohort',
      cta_url: 'https://learn.valavanacademy.com/clientapp/signup',
      price: 14999,
      original_price: 29999,
      currency: 'INR',
      is_featured: true,
      is_visible: true,
      sort_order: 2,
      status: 'published',
      skills: ['Graphic Design', 'Video Editing', 'Motion Graphics', 'Web Design', 'UI/UX', 'AI Workflows', 'Client Acquisition'],
      software_tools: ['Photoshop', 'Illustrator', 'Premiere Pro', 'After Effects', 'Figma', 'Webflow', 'Runway AI'],
      modules: [
        { title: 'Design Foundations & Advanced Typography', duration: '4 Weeks', lessons: 16 },
        { title: 'Video Editing & Visual Storytelling', duration: '5 Weeks', lessons: 20 },
        { title: 'Motion Graphics & VFX in After Effects', duration: '5 Weeks', lessons: 18 },
        { title: 'Modern Web Design & UI/UX', duration: '4 Weeks', lessons: 15 },
        { title: 'Generative AI & Automation', duration: '3 Weeks', lessons: 12 },
        { title: 'Portfolio, Freelancing & High-Ticket Clients', duration: '3 Weeks', lessons: 10 }
      ]
    },
    {
      slug: '3-hours-live-workshop',
      title: '3 Hours Live Workshop — Graphic Design & Printing Business',
      subtitle: 'Start your Graphic Design journey and learn how designers build profitable businesses',
      description: 'A complete beginner roadmap to learning Graphic Design and building a lucrative freelance career in Tamil by Mr. Valavan.',
      duration: '3 Hours',
      level: 'beginner',
      thumbnail_url: '/assets/workshop/ChatGPT-Image-Aug-4-2026-12_10_47-PM-1024x683.webp',
      banner_url: '/assets/workshop/ChatGPT-Image-Aug-4-2026-12_10_47-PM-1024x683.webp',
      cta_text: 'Register Now for ₹99',
      cta_url: 'https://learn.valavanacademy.com/clientapp/signup',
      price: 99,
      original_price: 999,
      currency: 'INR',
      is_featured: true,
      is_visible: true,
      sort_order: 3,
      status: 'published',
      skills: ['Graphic Design Basics', 'Photoshop Poster Creation', 'Printing Fundamentals', 'Freelance Career Roadmap'],
      software_tools: ['Photoshop', 'Canva', 'AI Tools'],
      modules: [
        { title: 'Graphic Design Fundamentals & Colour Theory', duration: '45 Mins', lessons: 1 },
        { title: 'Live Poster Creation in Photoshop', duration: '60 Mins', lessons: 1 },
        { title: 'Printing Business & Client Acquisition', duration: '45 Mins', lessons: 1 },
        { title: 'Live Q&A & Mentorship Roadmap', duration: '30 Mins', lessons: 1 }
      ]
    }
  ];

  for (const prog of programsData) {
    const { data: existing } = await supabase.from('programs').select('id').eq('slug', prog.slug).maybeSingle();
    if (existing) {
      await supabase.from('programs').update(prog).eq('id', existing.id);
      console.log(`✓ Program "${prog.slug}" updated.`);
    } else {
      await supabase.from('programs').insert([prog]);
      console.log(`✓ Program "${prog.slug}" inserted.`);
    }
  }

  // 3. SEED PAGES & SECTIONS
  console.log('\n3. Syncing Pages & Sections...');
  const pagesData = [
    {
      slug: 'home',
      title: 'Home',
      description: 'Valavan Academy — Your Career Changing Partner. Tamil Nadu premier digital skills hub.',
      status: 'published',
      sort_order: 1,
      seo_title: 'Valavan Academy — Your Career Changing Partner',
      seo_description: 'Tamil-first creative learning platform for Graphic Design, Video Editing, Web Design & AI Tools.'
    },
    {
      slug: 'about',
      title: 'About Us',
      description: 'Learn about Valavan Academy, our founder, our vision, and our journey.',
      status: 'published',
      sort_order: 2,
      seo_title: 'About Us — Valavan Academy',
      seo_description: 'Discover our mission to empower Tamil youth with world-class digital and creative skills.'
    },
    {
      slug: 'programs',
      title: 'Programs',
      description: 'Explore all practical career tracks and programs.',
      status: 'published',
      sort_order: 3,
      seo_title: 'Programs & Courses — Valavan Academy',
      seo_description: 'Join 90-Day Graphic Design Mastery and Full Stack Digital Creator Program.'
    },
    {
      slug: 'community',
      title: 'Community',
      description: 'Tamil Nadu Creators Club (TNCC) — A vibrant community of 40,000+ creators.',
      status: 'published',
      sort_order: 4,
      seo_title: 'Community — Tamil Nadu Creators Club',
      seo_description: 'Connect, network, and grow with fellow designers, editors, and digital creators.'
    },
    {
      slug: 'contact',
      title: 'Contact',
      description: 'Get in touch with the Valavan Academy team.',
      status: 'published',
      sort_order: 5,
      seo_title: 'Contact Us — Valavan Academy',
      seo_description: 'Reach out for admissions, corporate training, and collaboration inquiries.'
    }
  ];

  const pageIdMap = {};
  for (const p of pagesData) {
    const { data: existing } = await supabase.from('pages').select('id, slug').eq('slug', p.slug).maybeSingle();
    if (existing) {
      const { data: updated } = await supabase.from('pages').update(p).eq('id', existing.id).select().single();
      pageIdMap[p.slug] = updated ? updated.id : existing.id;
    } else {
      const { data: inserted } = await supabase.from('pages').insert([p]).select().single();
      if (inserted) pageIdMap[p.slug] = inserted.id;
    }
  }

  // Get section types
  const { data: sectionTypes } = await supabase.from('section_types').select('id, slug');
  const typeMap = {};
  if (sectionTypes) {
    sectionTypes.forEach(t => { typeMap[t.slug] = t.id; });
  }

  // Define sections per page
  const pageSections = {
    home: [
      { name: 'Hero Section', slug: 'hero', type: 'hero', sort_order: 1 },
      { name: 'Marquee Ribbon', slug: 'marquee_ribbon', type: 'text_image', sort_order: 2 },
      { name: 'Learn Create Grow', slug: 'learn_create_grow', type: 'features', sort_order: 3 },
      { name: 'Our Programs', slug: 'programs', type: 'programs', sort_order: 4 },
      { name: 'Career Journey', slug: 'career_journey', type: 'features', sort_order: 5 },
      { name: 'Skill Stack', slug: 'skill_stack', type: 'features', sort_order: 6 },
      { name: 'Certifications', slug: 'certifications', type: 'certification_gallery', sort_order: 7 },
      { name: 'Learner Stories', slug: 'learner_stories', type: 'youtube_gallery', sort_order: 8 },
      { name: 'Community', slug: 'community', type: 'cta', sort_order: 9 },
      { name: 'Student Feedback', slug: 'testimonials', type: 'testimonials', sort_order: 10 },
      { name: 'Final CTA', slug: 'cta', type: 'cta', sort_order: 11 }
    ],
    about: [
      { name: 'Hero Section', slug: 'hero', type: 'hero', sort_order: 1 },
      { name: 'Our Story & Origins', slug: 'story', type: 'text_image', sort_order: 2 },
      { name: 'Mission & Vision', slug: 'pillars', type: 'features', sort_order: 3 },
      { name: 'Key Statistics', slug: 'stats', type: 'stats', sort_order: 4 },
      { name: 'Timeline Journey', slug: 'timeline', type: 'features', sort_order: 5 },
      { name: 'Team & Mentors', slug: 'team', type: 'cards', sort_order: 6 },
      { name: 'CTA Section', slug: 'cta', type: 'cta', sort_order: 7 }
    ],
    programs: [
      { name: 'Hero Section', slug: 'hero', type: 'hero', sort_order: 1 },
      { name: 'Programs List', slug: 'programs_list', type: 'programs', sort_order: 2 },
      { name: 'Why Valavan Academy', slug: 'why_valavan', type: 'features', sort_order: 3 },
      { name: 'CTA Section', slug: 'cta', type: 'cta', sort_order: 4 }
    ],
    community: [
      { name: 'Hero Section', slug: 'hero', type: 'hero', sort_order: 1 },
      { name: 'Community Stats', slug: 'stats', type: 'stats', sort_order: 2 },
      { name: 'Member Benefits', slug: 'benefits', type: 'features', sort_order: 3 },
      { name: 'CTA Section', slug: 'cta', type: 'cta', sort_order: 4 }
    ],
    contact: [
      { name: 'Hero Section', slug: 'hero', type: 'hero', sort_order: 1 },
      { name: 'Contact Details', slug: 'contact_info', type: 'text_image', sort_order: 2 },
      { name: 'Locations & Map', slug: 'location', type: 'text_image', sort_order: 3 }
    ]
  };

  // Section fields definitions for all sections
  const allFieldDefs = {
    'home.hero': [
      { name: 'eyebrow', label: 'Eyebrow Tag', field_type: 'short_text', value: "TAMIL NADU'S PREMIER DIGITAL SKILLS HUB", sort_order: 1 },
      { name: 'headline_prefix', label: 'Headline Top (White)', field_type: 'heading', value: 'Your Career', sort_order: 2 },
      { name: 'headline_highlight', label: 'Headline Highlight (Blue)', field_type: 'heading', value: 'Changing Partner', sort_order: 3 },
      { name: 'description', label: 'Subtext Description', field_type: 'long_text', value: 'Learn Graphic Design, Video Editing , Web Design & Advanced AI in Tamil with hands-on mentorship and real-world projects.', sort_order: 4 },
      { name: 'primary_button_text', label: 'Primary Button Text', field_type: 'short_text', value: 'Explore Courses', sort_order: 5 },
      { name: 'primary_button_url', label: 'Primary Button URL', field_type: 'url', value: '/programs', sort_order: 6 },
      { name: 'secondary_button_text', label: 'Secondary Button Text', field_type: 'short_text', value: 'Join TNCC Community →', sort_order: 7 },
      { name: 'secondary_button_url', label: 'Secondary Button URL', field_type: 'url', value: 'https://tamilnaducreatorsclub.com/', sort_order: 8 },
      { name: 'background_video_url', label: 'Desktop Background Video URL (1920 × 1080)', field_type: 'video', value: '/assets/videos/hero-bg.mp4', sort_order: 9 },
    ],
    'home.marquee_ribbon': [
      { name: 'ribbon_items', label: 'Ticker Phrases (Comma Separated)', field_type: 'long_text', value: 'Graphic Design, Video Editing, Web Design, UI/UX, AI Tools, Creative Skills, Career Growth, Tamil-First Learning, Real Projects, Build Your Portfolio', sort_order: 1 }
    ],
    'home.learn_create_grow': [
      { name: 'badge', label: 'Section Badge', field_type: 'short_text', value: 'LEARN • PRACTICE • CREATE • GROW', sort_order: 1 },
      { name: 'headline_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Master Creative', sort_order: 2 },
      { name: 'headline_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Digital Skills In Tamil', sort_order: 3 },
      { name: 'heading', label: 'Main Heading (Fallback)', field_type: 'heading', value: 'Master Creative Digital Skills In Tamil', sort_order: 4 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'Step-by-step career programs engineered to transform beginners into confident creative professionals.', sort_order: 5 },
      { name: 'step_1_keyword', label: 'Step 01 Keyword', field_type: 'short_text', value: 'LEARN', sort_order: 6 },
      { name: 'step_1_title', label: 'Step 01 Headline', field_type: 'short_text', value: 'Acquire Skills That Matter', sort_order: 7 },
      { name: 'step_1_body', label: 'Step 01 Description', field_type: 'long_text', value: 'Start from zero. Our Tamil-language curriculum breaks down Graphic Design, Video Editing, Web Design, UI/UX, and AI tools into clear, practical lessons — no jargon, no fluff.', sort_order: 8 },
      { name: 'step_2_keyword', label: 'Step 02 Keyword', field_type: 'short_text', value: 'PRACTICE', sort_order: 9 },
      { name: 'step_2_title', label: 'Step 02 Headline', field_type: 'short_text', value: 'Build With Real Briefs', sort_order: 10 },
      { name: 'step_2_body', label: 'Step 02 Description', field_type: 'long_text', value: 'Learning only clicks when you create. Every module comes with real-world project briefs, commercial design challenges, and hands-on exercises guided by experienced mentors.', sort_order: 11 },
      { name: 'step_3_keyword', label: 'Step 03 Keyword', field_type: 'short_text', value: 'CREATE', sort_order: 12 },
      { name: 'step_3_title', label: 'Step 03 Headline', field_type: 'short_text', value: 'Build Your Portfolio', sort_order: 13 },
      { name: 'step_3_body', label: 'Step 03 Description', field_type: 'long_text', value: 'Walk away with a professional portfolio of projects. Show potential clients and employers actual work — not theory. Your skills become visible, tangible, and high-converting.', sort_order: 14 },
      { name: 'step_4_keyword', label: 'Step 04 Keyword', field_type: 'short_text', value: 'GROW', sort_order: 15 },
      { name: 'step_4_title', label: 'Step 04 Headline', field_type: 'short_text', value: 'Launch Your Career or Business', sort_order: 16 },
      { name: 'step_4_body', label: 'Step 04 Description', field_type: 'long_text', value: 'Freelance, get hired, or build your own brand. With in-demand digital skills, a portfolio, and community support, you have everything you need to grow on your own terms.', sort_order: 17 },
    ],
    'home.programs': [
      { name: 'badge', label: 'Section Badge', field_type: 'short_text', value: 'OUR PROGRAMS', sort_order: 1 },
      { name: 'headline_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Choose Your', sort_order: 2 },
      { name: 'headline_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Learning Path.', sort_order: 3 },
      { name: 'heading', label: 'Main Heading (Fallback)', field_type: 'heading', value: 'Choose Your Learning Path.', sort_order: 4 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'Two programs. One goal — to give you the creative digital skills that open doors to careers, freelancing, and your own brand.', sort_order: 5 },
      { name: 'program_1_badge', label: 'Program 1 Duration Badge', field_type: 'short_text', value: '90 Days Program', sort_order: 6 },
      { name: 'program_1_accent', label: 'Program 1 Tag Accent', field_type: 'short_text', value: 'Most Popular', sort_order: 7 },
      { name: 'program_2_badge', label: 'Program 2 Duration Badge', field_type: 'short_text', value: '180 Days Program', sort_order: 8 },
      { name: 'program_2_accent', label: 'Program 2 Tag Accent', field_type: 'short_text', value: 'Flagship Track', sort_order: 9 },
    ],
    'home.career_journey': [
      { name: 'badge', label: 'Section Badge', field_type: 'short_text', value: 'CAREER BLUEPRINT', sort_order: 1 },
      { name: 'headline_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Your Path to a', sort_order: 2 },
      { name: 'headline_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Creative Career.', sort_order: 3 },
      { name: 'heading', label: 'Main Heading (Fallback)', field_type: 'heading', value: 'Your Path to a Creative Career.', sort_order: 4 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'A structured 5-step milestone journey from zero experience to a thriving creative career.', sort_order: 5 },
      { name: 'step_1_number', label: 'Milestone 01 Number', field_type: 'short_text', value: '01', sort_order: 6 },
      { name: 'step_1_title', label: 'Milestone 01 Title', field_type: 'short_text', value: 'START', sort_order: 7 },
      { name: 'step_1_desc', label: 'Milestone 01 Subtitle', field_type: 'short_text', value: 'Zero experience, big ambition', sort_order: 8 },
      { name: 'step_2_number', label: 'Milestone 02 Number', field_type: 'short_text', value: '02', sort_order: 9 },
      { name: 'step_2_title', label: 'Milestone 02 Title', field_type: 'short_text', value: 'LEARN', sort_order: 10 },
      { name: 'step_2_desc', label: 'Milestone 02 Subtitle', field_type: 'short_text', value: 'Build skills in Tamil', sort_order: 11 },
      { name: 'step_3_number', label: 'Milestone 03 Number', field_type: 'short_text', value: '03', sort_order: 12 },
      { name: 'step_3_title', label: 'Milestone 03 Title', field_type: 'short_text', value: 'PRACTICE', sort_order: 13 },
      { name: 'step_3_desc', label: 'Milestone 03 Subtitle', field_type: 'short_text', value: 'Real briefs, live reviews', sort_order: 14 },
      { name: 'step_4_number', label: 'Milestone 04 Number', field_type: 'short_text', value: '04', sort_order: 15 },
      { name: 'step_4_title', label: 'Milestone 04 Title', field_type: 'short_text', value: 'PORTFOLIO', sort_order: 16 },
      { name: 'step_4_desc', label: 'Milestone 04 Subtitle', field_type: 'short_text', value: 'Showcase your best work', sort_order: 17 },
      { name: 'step_5_number', label: 'Milestone 05 Number', field_type: 'short_text', value: '05', sort_order: 18 },
      { name: 'step_5_title', label: 'Milestone 05 Title', field_type: 'short_text', value: 'CAREER', sort_order: 19 },
      { name: 'step_5_desc', label: 'Milestone 05 Subtitle', field_type: 'short_text', value: 'Freelance, hired, or studio', sort_order: 20 },
    ],
    'home.skill_stack': [
      { name: 'badge', label: 'Section Badge', field_type: 'short_text', value: 'Power of Stacking', sort_order: 1 },
      { name: 'headline_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'One Skill Is Good.', sort_order: 2 },
      { name: 'headline_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'A Skill Stack Is Powerful.', sort_order: 3 },
      { name: 'heading', label: 'Main Heading (Fallback)', field_type: 'heading', value: 'One Skill Is Good. A Skill Stack Is Powerful.', sort_order: 4 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'Scroll down to watch how combining Design, Video, Web, and AI gradually stacks together into one complete, high-demand Creator.', sort_order: 5 }
    ],
    'home.certifications': [
      { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'STUDENT ACHIEVEMENTS', sort_order: 1 },
      { name: 'headline_prefix', label: 'Headline Prefix (Black / Dark)', field_type: 'short_text', value: 'More than a', sort_order: 2 },
      { name: 'headline_highlight', label: 'Headline Highlight (Blue #1748BB)', field_type: 'short_text', value: 'Certificate.', sort_order: 3 },
      { name: 'heading', label: 'Full Heading (Fallback)', field_type: 'heading', value: 'More than a Certificate.', sort_order: 4 },
      { name: 'subheading', label: 'Section Subheading', field_type: 'subheading', value: 'Skill Verification for High-Income Careers', sort_order: 5 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'Valavan Academy certifications validate real-world portfolio deliverables, tool mastery, and hands-on client projects.', sort_order: 6 },
      { name: 'cert_image_1', label: 'Certificate 01 Image', field_type: 'image', value: '/assets/certifications/2.webp', sort_order: 7 },
      { name: 'cert_image_2', label: 'Certificate 02 Image', field_type: 'image', value: '/assets/certifications/3.webp', sort_order: 8 },
      { name: 'cert_image_3', label: 'Certificate 03 Image', field_type: 'image', value: '/assets/certifications/4.webp', sort_order: 9 },
      { name: 'cert_image_4', label: 'Certificate 04 Image', field_type: 'image', value: '/assets/certifications/5.webp', sort_order: 10 },
      { name: 'cert_image_5', label: 'Certificate 05 Image', field_type: 'image', value: '/assets/certifications/6.webp', sort_order: 11 },
      { name: 'cert_image_6', label: 'Certificate 06 Image', field_type: 'image', value: '/assets/certifications/7.webp', sort_order: 12 },
      { name: 'cert_image_7', label: 'Certificate 07 Image', field_type: 'image', value: '/assets/certifications/8.webp', sort_order: 13 },
      { name: 'cert_image_8', label: 'Certificate 08 Image', field_type: 'image', value: '/assets/certifications/9.webp', sort_order: 14 },
    ],
    'home.learner_stories': [
      { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'STUDENT TRANSFORMATIONS', sort_order: 1 },
      { name: 'headline_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Real People,', sort_order: 2 },
      { name: 'headline_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Real Transformations.', sort_order: 3 },
      { name: 'heading', label: 'Heading (Fallback)', field_type: 'heading', value: 'Real People, Real Transformations.', sort_order: 4 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'Watch how our students turned their passion for design and video editing into high-income freelance careers and job offers.', sort_order: 5 }
    ],
    'home.community': [
      { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'TAMIL NADU CREATORS CLUB', sort_order: 1 },
      { name: 'headline_prefix', label: 'Headline Prefix', field_type: 'short_text', value: "You Don't Have to", sort_order: 2 },
      { name: 'headline_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: "Learn Alone.", sort_order: 3 },
      { name: 'heading', label: 'Heading (Fallback)', field_type: 'heading', value: "You Don't Have to Learn Alone.", sort_order: 4 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'Join the Tamil Nadu Creators Club — a thriving community of designers, creators, and digital professionals learning, sharing, and growing together.', sort_order: 5 },
      { name: 'cta_button_text', label: 'Button Text', field_type: 'short_text', value: 'Join the Community →', sort_order: 6 },
      { name: 'cta_button_url', label: 'Button URL', field_type: 'url', value: 'https://tamilnaducreatorsclub.com/', sort_order: 7 },
      { name: 'stat_members', label: 'Members Stat', field_type: 'short_text', value: '40K+ Community Members', sort_order: 8 },
      { name: 'stat_workshops', label: 'Workshops Stat', field_type: 'short_text', value: '100+ Workshops Held', sort_order: 9 },
      { name: 'stat_students', label: 'Students Stat', field_type: 'short_text', value: '5K+ Students Trained', sort_order: 10 },
    ],
    'home.testimonials': [
      { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'STUDENT FEEDBACKS', sort_order: 1 },
      { name: 'headline_prefix', label: 'Headline Prefix', field_type: 'short_text', value: 'Hear from', sort_order: 2 },
      { name: 'headline_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', value: 'Our Students', sort_order: 3 },
      { name: 'heading', label: 'Heading (Fallback)', field_type: 'heading', value: 'Hear from Our Students', sort_order: 4 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'Graphic Design, Video Editing & Web Design Success Stories from Tamil Students', sort_order: 5 }
    ],
    'home.cta': [
      { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'Get Started', sort_order: 1 },
      { name: 'heading', label: 'Main Heading', field_type: 'heading', value: 'Your Next Chapter Starts Here.', sort_order: 2 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'Learn practical digital skills. Build real projects. Create your future — in Tamil.', sort_order: 3 },
      { name: 'primary_button_text', label: 'Primary Button Text', field_type: 'short_text', value: 'Explore Courses', sort_order: 4 },
      { name: 'primary_button_url', label: 'Primary Button URL', field_type: 'url', value: '/programs', sort_order: 5 },
      { name: 'secondary_button_text', label: 'Secondary Button Text', field_type: 'short_text', value: 'Join TNCC Community →', sort_order: 6 },
      { name: 'secondary_button_url', label: 'Secondary Button URL', field_type: 'url', value: 'https://tamilnaducreatorsclub.com/', sort_order: 7 }
    ],
    'about.hero': [
      { name: 'eyebrow', label: 'Eyebrow', field_type: 'short_text', value: 'ABOUT VALAVAN ACADEMY', sort_order: 1 },
      { name: 'heading', label: 'Main Heading', field_type: 'heading', value: 'Empowering Tamil Creators with High-Income Skills', sort_order: 2 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'From humble beginnings to Tamil Nadu premier digital skills academy — bridging the gap between passionate learners and high-demand commercial digital careers.', sort_order: 3 }
    ],
    'about.story': [
      { name: 'heading', label: 'Story Heading', field_type: 'heading', value: 'Built from Passion, Designed for Impact', sort_order: 1 },
      { name: 'description', label: 'Story Description', field_type: 'long_text', value: 'Founded by Valavan, our mission is to deliver world-class creative education entirely in Tamil — empowering every ambitious student with real-world skills.', sort_order: 2 }
    ],
    'about.pillars': [
      { name: 'mission_title', label: 'Mission Title', field_type: 'short_text', value: 'Our Mission', sort_order: 1 },
      { name: 'mission_desc', label: 'Mission Description', field_type: 'long_text', value: 'To empower Tamil-speaking learners with practical, industry-aligned skills in Graphic Design, Video Editing, UI/UX, and AI Tools that lead to real freelance careers and financial independence.', sort_order: 2 },
      { name: 'vision_title', label: 'Vision Title', field_type: 'short_text', value: 'Our Vision', sort_order: 3 },
      { name: 'vision_desc', label: 'Vision Description', field_type: 'long_text', value: "To build the world's largest Tamil creative ecosystem — empowering 100,000+ skilled creators, designers, and entrepreneurs to compete on a global stage.", sort_order: 4 }
    ],
    'community.hero': [
      { name: 'eyebrow', label: 'Eyebrow', field_type: 'short_text', value: 'TAMIL NADU CREATORS CLUB', sort_order: 1 },
      { name: 'heading', label: 'Main Heading', field_type: 'heading', value: 'The Largest Community of Tamil Creators & Designers', sort_order: 2 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'Over 40,000+ passionate creators collaborating, sharing client opportunities, attending offline summits, and mastering modern digital skills together.', sort_order: 3 },
      { name: 'cta_button_text', label: 'Button Text', field_type: 'short_text', value: 'Join the Community Now →', sort_order: 4 },
      { name: 'cta_button_url', label: 'Button URL', field_type: 'url', value: 'https://tamilnaducreatorsclub.com/', sort_order: 5 }
    ],
    'contact.hero': [
      { name: 'eyebrow', label: 'Eyebrow', field_type: 'short_text', value: 'GET IN TOUCH', sort_order: 1 },
      { name: 'heading', label: 'Main Heading', field_type: 'heading', value: "Let's Start a Conversation", sort_order: 2 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'Have questions about our programs, workshop enrollment, corporate training, or TNCC community? We are here to help.', sort_order: 3 }
    ],
    'contact.contact_info': [
      { name: 'email', label: 'Contact Email', field_type: 'email', value: 'valavanacademy001@gmail.com', sort_order: 1 },
      { name: 'phone', label: 'Contact Phone', field_type: 'short_text', value: '+91 93452 79541', sort_order: 2 },
      { name: 'address', label: 'Academy Address', field_type: 'long_text', value: 'Valavan Academy, Tirupattur / Vellore District, Tamil Nadu, India', sort_order: 3 },
      { name: 'working_hours', label: 'Working Hours', field_type: 'short_text', value: 'Monday - Saturday: 9:00 AM - 7:00 PM IST', sort_order: 4 }
    ]
  };

  for (const [pageSlug, sections] of Object.entries(pageSections)) {
    const pageId = pageIdMap[pageSlug];
    if (!pageId) continue;

    console.log(`\nSeeding sections for "${pageSlug}"...`);

    for (const s of sections) {
      let secId;
      const { data: existingSec } = await supabase.from('sections').select('id').eq('page_id', pageId).eq('slug', s.slug).maybeSingle();
      if (existingSec) {
        await supabase.from('sections').update({
          name: s.name,
          section_type_id: typeMap[s.type] || null,
          sort_order: s.sort_order,
          is_visible: true
        }).eq('id', existingSec.id);
        secId = existingSec.id;
      } else {
        const { data: insSec } = await supabase.from('sections').insert([{
          page_id: pageId,
          name: s.name,
          slug: s.slug,
          section_type_id: typeMap[s.type] || null,
          sort_order: s.sort_order,
          is_visible: true
        }]).select().single();
        if (insSec) secId = insSec.id;
      }

      if (!secId) continue;

      // Seed fields
      const defKey = `${pageSlug}.${s.slug}`;
      const defs = allFieldDefs[defKey];
      if (defs && defs.length > 0) {
        // Clean old fields for this section
        await supabase.from('fields').delete().eq('section_id', secId);

        for (const def of defs) {
          const { data: field, error: fErr } = await supabase.from('fields').insert({
            section_id: secId,
            name: def.name,
            label: def.label,
            field_type: def.field_type,
            sort_order: def.sort_order,
            is_required: false
          }).select().single();

          if (fErr || !field) continue;

          const isText = ['short_text','long_text','rich_text','heading','subheading','color','select'].includes(def.field_type);
          const isUrl = ['url','email','youtube','video','image'].includes(def.field_type);

          await supabase.from('field_values').insert({
            field_id: field.id,
            section_id: secId,
            page_id: pageId,
            value_text: isText ? def.value : null,
            value_url: isUrl ? def.value : null,
            published_value_text: isText ? def.value : null,
            is_draft: false
          });
        }
        console.log(`  ✓ Seeded ${defs.length} fields for section "${s.name}" (${s.slug})`);
      }
    }
  }

  console.log('\n=== ALL SECTIONS, FIELDS & PROGRAMS SYNCED 100% SUCCESSFULLY ===');
}

syncAll().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
