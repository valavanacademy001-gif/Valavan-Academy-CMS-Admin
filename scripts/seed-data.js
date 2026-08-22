const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
  console.log('--- SEEDING REAL VALAVAN ACADEMY DATA INTO SUPABASE ---');

  // 1. SEED PAGES
  console.log('\n1. Seeding Pages...');
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
      description: 'Tamil Nadu Creators Club (TNCC) — A vibrant community of 5000+ creators.',
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
    // Check if exists
    const { data: existing } = await supabase.from('pages').select('id, slug').eq('slug', p.slug).maybeSingle();
    if (existing) {
      const { data: updated, error } = await supabase.from('pages').update(p).eq('id', existing.id).select().single();
      if (error) console.error(`Error updating page ${p.slug}:`, error.message);
      else {
        console.log(`Page "${p.slug}" updated.`);
        pageIdMap[p.slug] = updated.id;
      }
    } else {
      const { data: inserted, error } = await supabase.from('pages').insert([p]).select().single();
      if (error) console.error(`Error inserting page ${p.slug}:`, error.message);
      else {
        console.log(`Page "${p.slug}" inserted.`);
        pageIdMap[p.slug] = inserted.id;
      }
    }
  }

  // 2. SEED HOME PAGE SECTIONS
  console.log('\n2. Seeding Home Page Sections...');
  const homePageId = pageIdMap['home'];
  if (homePageId) {
    // Get section types
    const { data: sectionTypes } = await supabase.from('section_types').select('id, slug');
    const typeMap = {};
    if (sectionTypes) {
      sectionTypes.forEach(t => { typeMap[t.slug] = t.id; });
    }

    const sectionsData = [
      { page_id: homePageId, name: 'Hero Section', slug: 'hero', section_type_id: typeMap['hero'] || null, sort_order: 1, is_visible: true },
      { page_id: homePageId, name: 'Marquee Ribbon', slug: 'marquee_ribbon', section_type_id: typeMap['text_image'] || null, sort_order: 2, is_visible: true },
      { page_id: homePageId, name: 'Learn Create Grow', slug: 'learn_create_grow', section_type_id: typeMap['features'] || null, sort_order: 3, is_visible: true },
      { page_id: homePageId, name: 'Our Programs', slug: 'programs', section_type_id: typeMap['programs'] || null, sort_order: 4, is_visible: true },
      { page_id: homePageId, name: 'Career Journey', slug: 'career_journey', section_type_id: typeMap['features'] || null, sort_order: 5, is_visible: true },
      { page_id: homePageId, name: 'Skill Stack', slug: 'skill_stack', section_type_id: typeMap['features'] || null, sort_order: 6, is_visible: true },
      { page_id: homePageId, name: 'Certifications', slug: 'certifications', section_type_id: typeMap['certification_gallery'] || null, sort_order: 7, is_visible: true },
      { page_id: homePageId, name: 'Learner Stories', slug: 'learner_stories', section_type_id: typeMap['youtube_gallery'] || null, sort_order: 8, is_visible: true },
      { page_id: homePageId, name: 'Community', slug: 'community', section_type_id: typeMap['cta'] || null, sort_order: 9, is_visible: true },
      { page_id: homePageId, name: 'Student Feedback', slug: 'testimonials', section_type_id: typeMap['testimonials'] || null, sort_order: 10, is_visible: true },
      { page_id: homePageId, name: 'Final CTA', slug: 'cta', section_type_id: typeMap['cta'] || null, sort_order: 11, is_visible: true }
    ];

    for (const s of sectionsData) {
      const { data: existingSec } = await supabase.from('sections').select('id').eq('page_id', homePageId).eq('slug', s.slug).maybeSingle();
      if (existingSec) {
        await supabase.from('sections').update(s).eq('id', existingSec.id);
        console.log(`Section "${s.slug}" updated.`);
      } else {
        const { data: insSec, error } = await supabase.from('sections').insert([s]).select().single();
        if (error) console.error(`Error inserting section ${s.slug}:`, error.message);
        else console.log(`Section "${s.slug}" inserted.`);
      }
    }
  }

  // 3. SEED PROGRAMS
  console.log('\n3. Seeding Programs...');
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
      subtitle: 'Master high-income multi-skilled digital creation',
      description: 'A comprehensive program covering Video Editing, Web Design, UI/UX, WordPress, and AI Automation to build client-ready digital assets.',
      duration: '6 Months',
      level: 'all',
      thumbnail_url: '/assets/images/hero/full-stack-.jpg-1.webp',
      banner_url: '/assets/images/hero/full-stack-.jpg-1.webp',
      cta_text: 'Enroll Now',
      cta_url: 'https://learn.valavanacademy.com/clientapp/signup',
      price: 14999,
      original_price: 29999,
      currency: 'INR',
      is_featured: true,
      is_visible: true,
      sort_order: 2,
      status: 'published',
      skills: ['Video Editing', 'Web Design', 'UI/UX', 'WordPress', 'AI Tools', 'Digital Marketing', 'Freelancing'],
      software_tools: ['Premiere Pro', 'After Effects', 'Figma', 'WordPress', 'Elementor Pro', 'ChatGPT', 'Gemini AI'],
      modules: [
        { title: 'Graphic Design Core', duration: '4 Weeks', lessons: 16 },
        { title: 'Video Editing & Motion Design', duration: '6 Weeks', lessons: 24 },
        { title: 'UI/UX & Web Design', duration: '6 Weeks', lessons: 20 },
        { title: 'AI Tools & Automation', duration: '4 Weeks', lessons: 14 },
        { title: 'Freelancing & Client Acquisition', duration: '4 Weeks', lessons: 12 }
      ]
    }
  ];

  for (const prog of programsData) {
    const { data: existingProg } = await supabase.from('programs').select('id').eq('slug', prog.slug).maybeSingle();
    if (existingProg) {
      await supabase.from('programs').update(prog).eq('id', existingProg.id);
      console.log(`Program "${prog.slug}" updated.`);
    } else {
      const { error } = await supabase.from('programs').insert([prog]);
      if (error) console.error(`Error inserting program ${prog.slug}:`, error.message);
      else console.log(`Program "${prog.slug}" inserted.`);
    }
  }

  // 4. SEED LEARNER STORIES (12 YouTube Shorts)
  console.log('\n4. Seeding Learner Stories (12 YouTube Shorts)...');
  const storiesData = [
    { title: 'Learner Story 01', student_name: 'Valavan Academy Student', youtube_url: 'https://www.youtube.com/shorts/BzQ9wNPit5I', youtube_video_id: 'BzQ9wNPit5I', duration: '0:45', sort_order: 1, is_visible: true },
    { title: 'Learner Story 02', student_name: 'Valavan Academy Student', youtube_url: 'https://www.youtube.com/shorts/3oVzfOTkjWE', youtube_video_id: '3oVzfOTkjWE', duration: '0:50', sort_order: 2, is_visible: true },
    { title: 'Learner Story 03', student_name: 'Valavan Academy Student', youtube_url: 'https://youtube.com/shorts/N5a_d-R_eJw', youtube_video_id: 'N5a_d-R_eJw', duration: '0:40', sort_order: 3, is_visible: true },
    { title: 'Learner Story 04', student_name: 'Valavan Academy Student', youtube_url: 'https://youtube.com/shorts/wZ5HiQO8g74', youtube_video_id: 'wZ5HiQO8g74', duration: '0:55', sort_order: 4, is_visible: true },
    { title: 'Learner Story 05', student_name: 'Valavan Academy Student', youtube_url: 'https://www.youtube.com/shorts/h3uv9HAC3Ek', youtube_video_id: 'h3uv9HAC3Ek', duration: '0:48', sort_order: 5, is_visible: true },
    { title: 'Learner Story 06', student_name: 'Valavan Academy Student', youtube_url: 'https://www.youtube.com/shorts/tPPE5Jywfsg', youtube_video_id: 'tPPE5Jywfsg', duration: '0:42', sort_order: 6, is_visible: true },
    { title: 'Learner Story 07', student_name: 'Valavan Academy Student', youtube_url: 'https://www.youtube.com/shorts/RRn6b8cIgxc', youtube_video_id: 'RRn6b8cIgxc', duration: '0:52', sort_order: 7, is_visible: true },
    { title: 'Learner Story 08', student_name: 'Valavan Academy Student', youtube_url: 'https://youtube.com/shorts/GNLYaMdWF64', youtube_video_id: 'GNLYaMdWF64', duration: '0:46', sort_order: 8, is_visible: true },
    { title: 'Learner Story 09', student_name: 'Valavan Academy Student', youtube_url: 'https://youtube.com/shorts/R4nXDTTTq4g', youtube_video_id: 'R4nXDTTTq4g', duration: '0:54', sort_order: 9, is_visible: true },
    { title: 'Learner Story 10', student_name: 'Valavan Academy Student', youtube_url: 'https://youtube.com/shorts/nCQ18VfjKUQ', youtube_video_id: 'nCQ18VfjKUQ', duration: '0:49', sort_order: 10, is_visible: true },
    { title: 'Learner Story 11', student_name: 'Valavan Academy Student', youtube_url: 'https://youtube.com/shorts/ezqLPTS8vHk', youtube_video_id: 'ezqLPTS8vHk', duration: '0:51', sort_order: 11, is_visible: true },
    { title: 'Learner Story 12', student_name: 'Valavan Academy Student', youtube_url: 'https://youtube.com/shorts/YOhkWGcyTLw', youtube_video_id: 'YOhkWGcyTLw', duration: '0:47', sort_order: 12, is_visible: true }
  ];

  for (const st of storiesData) {
    const { data: existingSt } = await supabase.from('learner_stories').select('id').eq('youtube_video_id', st.youtube_video_id).maybeSingle();
    if (existingSt) {
      await supabase.from('learner_stories').update(st).eq('id', existingSt.id);
      console.log(`Story "${st.youtube_video_id}" updated.`);
    } else {
      const { error } = await supabase.from('learner_stories').insert([st]);
      if (error) console.error(`Error inserting story ${st.youtube_video_id}:`, error.message);
      else console.log(`Story "${st.youtube_video_id}" inserted.`);
    }
  }

  // 5. SEED TESTIMONIALS
  console.log('\n5. Seeding Testimonials...');
  const testimonialsData = [
    {
      student_name: 'Gowri sh',
      student_role: 'Photoshop & Illustrator Student',
      testimonial: 'I attended Photoshop & Illustrator & Coreldraw class from sir. Teaching method romba clear-aa irundhuchu, basics-la irundhu advanced-vara step by step explain panninneenga. Practice works, tips & shortcuts ellam real-time design work-ku romba helpful-aa irukku. Strongly recommend!',
      rating: 5,
      is_featured: true,
      is_visible: true,
      sort_order: 1
    },
    {
      student_name: 'Soban',
      student_role: 'Web & UI/UX Designer',
      testimonial: 'Before joining Valavan Academy, web design felt like a maze of codes and confusion. But their expert training unlocked everything — from layout basics to advanced UI/UX design. Today, I confidently build clean, responsive, and modern websites that look good and work on all devices.',
      rating: 5,
      is_featured: true,
      is_visible: true,
      sort_order: 2
    },
    {
      student_name: 'Saranya Swetha',
      student_role: 'Digital Creator',
      testimonial: 'I joined with zero experience, but thanks to the clear guidance and hands-on sessions, I now feel confident in using design tools like photoshop and premiere Pro. This academy truly helped me unlock my creative side.',
      rating: 5,
      is_featured: true,
      is_visible: true,
      sort_order: 3
    },
    {
      student_name: 'KR Naveen',
      student_role: 'Graphic Designer',
      testimonial: 'The valavan academy is very help full to learn graphics designing courses in familiar language (Tamil). Step by step mentoring with practical projects.',
      rating: 5,
      is_featured: false,
      is_visible: true,
      sort_order: 4
    },
    {
      student_name: 'Bala Subramaniyam',
      student_role: 'Freelance Creator',
      testimonial: 'Sir you give me a good confidence and my growth money and very simply understand all your tutorials. Very useful for me. Thank you sir!',
      rating: 5,
      is_featured: false,
      is_visible: true,
      sort_order: 5
    }
  ];

  for (const t of testimonialsData) {
    const { data: existingT } = await supabase.from('testimonials').select('id').eq('student_name', t.student_name).maybeSingle();
    if (existingT) {
      await supabase.from('testimonials').update(t).eq('id', existingT.id);
      console.log(`Testimonial for "${t.student_name}" updated.`);
    } else {
      const { error } = await supabase.from('testimonials').insert([t]);
      if (error) console.error(`Error inserting testimonial for ${t.student_name}:`, error.message);
      else console.log(`Testimonial for "${t.student_name}" inserted.`);
    }
  }

  // 6. SEED MEDIA
  console.log('\n6. Seeding Media Library...');
  const mediaData = [
    { filename: 'white-logo.webp', original_name: 'white-logo.webp', file_url: '/assets/logo/white-logo.webp', file_type: 'image', file_size: 15420, alt_text: 'Valavan Academy Logo' },
    { filename: 'ai-powered-GD.webp', original_name: 'ai-powered-GD.webp', file_url: '/assets/images/hero/ai-powered-GD.webp', file_type: 'image', file_size: 125000, alt_text: 'Graphic Design Mastery Banner' },
    { filename: 'full-stack-.jpg-1.webp', original_name: 'full-stack-.jpg-1.webp', file_url: '/assets/images/hero/full-stack-.jpg-1.webp', file_type: 'image', file_size: 145000, alt_text: 'Full Stack Creator Banner' },
    { filename: 'team.webp', original_name: 'team.webp', file_url: '/assets/images/team/team.webp', file_type: 'image', file_size: 210000, alt_text: 'Valavan Academy Team' },
    { filename: 'hero-bg.mp4', original_name: 'hero-bg.mp4', file_url: '/assets/videos/hero-bg.mp4', file_type: 'video', file_size: 4200000, alt_text: 'Hero Background Video' }
  ];

  for (const m of mediaData) {
    const { data: existingM } = await supabase.from('media').select('id').eq('filename', m.filename).maybeSingle();
    if (existingM) {
      await supabase.from('media').update(m).eq('id', existingM.id);
      console.log(`Media "${m.filename}" updated.`);
    } else {
      const { error } = await supabase.from('media').insert([m]);
      if (error) console.error(`Error inserting media ${m.filename}:`, error.message);
      else console.log(`Media "${m.filename}" inserted.`);
    }
  }

  console.log('\n--- SEED COMPLETE ---');
}

seed();
