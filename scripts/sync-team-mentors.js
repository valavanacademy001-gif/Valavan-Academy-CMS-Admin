const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MENTORS_DATA = [
  {
    name: 'Valavan',
    role: 'FOUNDER & LEAD MENTOR',
    designation: 'Founder of Valavan Ventures Private Limited',
    specialty: 'Graphic Design & Creative Strategy',
    bio: 'Founder of Valavan Academy & Designee. Trained 10,000+ students with project-driven Graphic Design mentorship and built the TNCC community for creators across Tamil Nadu.',
    experience: '15+ Years',
    skills: 'Branding, Creative Direction, Typography, Visual Identity',
    image: '/assets/about/valavan.webp',
  },
  {
    name: 'RP Kiran Kumar',
    role: 'CREATIVE DIRECTOR | BRAND STRATEGIST',
    designation: 'Creative Director | Brand Strategist',
    specialty: 'Brand Strategy, UI/UX & Creative Direction',
    bio: 'Spent over a decade guiding Tamil creative professionals to evolve into authoritative Full Stack Creative Directors who command high value and build future-proof brand systems.',
    experience: '10+ Years',
    skills: 'Brand Strategy, Creative Direction, Design Systems, UI/UX',
    image: '/assets/about/Kiran.webp',
  },
  {
    name: 'Ganapathi R',
    role: 'SENIOR VIDEO EDITOR | CEO',
    designation: 'Senior Video Editor | CEO',
    specialty: 'Short-Form Video Editing & Viral Content',
    bio: 'Senior Video Editor with 5+ years experience. Generated 10M+ views and trained 1,000+ creators and brands to produce viral, high-performing short-form video content.',
    experience: '5+ Years',
    skills: 'Premiere Pro, After Effects, Viral Pacing, Short-Form Content',
    image: '/assets/about/gana.webp',
  },
  {
    name: 'Sundhar',
    role: 'STUDENTS SUPPORT MANAGER | SENIOR GRAPHIC DESIGNER',
    designation: 'Students Support Manager | Senior Graphic Designer',
    specialty: 'Graphic Design & Practical Mentorship',
    bio: 'Senior Graphic Designer with 5+ years of industry experience. Guided and mentored 10,000+ students through hands-on project-based design training and continuous doubt clearing.',
    experience: '5+ Years',
    skills: 'Graphic Design, Student Mentoring, Portfolio Reviews, Client Projects',
    image: '/assets/about/Nandha.webp',
  },
  {
    name: 'Suganesh',
    role: 'FULLSTACK CREATIVE MASTER | PORTFOLIO HEAD',
    designation: 'Fullstack Creative Master | Student Portfolio Division Head',
    specialty: 'Fullstack Creation, Web, Video & AI Design',
    bio: 'Student Portfolio Division Head with 5+ years of creative experience. Delivered 10,000+ designs and trained 10,000+ students across design, web, editing, branding, and AI.',
    experience: '5+ Years',
    skills: 'Fullstack Design, Web Design, Video Editing, AI Creative Tools',
    image: '/assets/about/soban.webp',
  },
  {
    name: 'Dhanush',
    role: 'PROFESSIONAL THUMBNAIL DESIGNER',
    designation: 'Professional Thumbnail Designer',
    specialty: 'High-CTR Thumbnail Design & Visual Retention',
    bio: 'Specialized in high-converting thumbnail design with 600M+ views generated across top creators in Tamil Nadu. Master in creating thumb-stopping commercial visuals using Photoshop.',
    experience: '5+ Years',
    skills: 'Photoshop, Thumbnail Design, CTR Optimization, Visual Storytelling',
    image: '/assets/about/Dhanush.webp',
  },
];

async function syncTeamMentors() {
  console.log('--- Syncing Team & Mentors Fields to Supabase CMS ---');

  const { data: page } = await supabase.from('pages').select('id').eq('slug', 'about').single();
  if (!page) {
    console.error('Page "about" not found');
    return;
  }

  const { data: section } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'team').single();
  if (!section) {
    console.error('Section "team" not found for page "about"');
    return;
  }

  // 1. Header Fields
  const headerFields = [
    { name: 'eyebrow', label: 'Eyebrow Tag', field_type: 'short_text', val: 'EXPERT INSTRUCTORS', sort_order: 1 },
    { name: 'heading', label: 'Main Heading', field_type: 'heading', val: 'The Core of Valavan Academy.', sort_order: 2 },
    { name: 'description', label: 'Description', field_type: 'long_text', val: 'Learn directly from experienced practitioners dedicated to your creative and commercial growth.', sort_order: 3 },
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
          is_draft: false,
        });
      }
    }
  }

  // 2. Mentors Fields (mentor_1_name, mentor_1_role, mentor_1_designation, mentor_1_specialty, mentor_1_bio, mentor_1_experience, mentor_1_skills, mentor_1_image)
  for (let i = 0; i < MENTORS_DATA.length; i++) {
    const m = MENTORS_DATA[i];
    const idx = i + 1;
    const baseOrder = 10 + i * 10;

    const fieldsToSync = [
      { name: `mentor_${idx}_name`, label: `Mentor ${idx}: Name`, field_type: 'short_text', val: m.name, sort_order: baseOrder + 1 },
      { name: `mentor_${idx}_role`, label: `Mentor ${idx}: Front Role Badge`, field_type: 'short_text', val: m.role, sort_order: baseOrder + 2 },
      { name: `mentor_${idx}_designation`, label: `Mentor ${idx}: Designation`, field_type: 'short_text', val: m.designation, sort_order: baseOrder + 3 },
      { name: `mentor_${idx}_specialty`, label: `Mentor ${idx}: Specialization`, field_type: 'short_text', val: m.specialty, sort_order: baseOrder + 4 },
      { name: `mentor_${idx}_bio`, label: `Mentor ${idx}: Bio / About`, field_type: 'long_text', val: m.bio, sort_order: baseOrder + 5 },
      { name: `mentor_${idx}_experience`, label: `Mentor ${idx}: Experience`, field_type: 'short_text', val: m.experience, sort_order: baseOrder + 6 },
      { name: `mentor_${idx}_skills`, label: `Mentor ${idx}: Key Skills & Tools`, field_type: 'short_text', val: m.skills, sort_order: baseOrder + 7 },
      { name: `mentor_${idx}_image`, label: `Mentor ${idx}: Photo Image`, field_type: 'image', val: m.image, sort_order: baseOrder + 8 },
    ];

    for (const f of fieldsToSync) {
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
      }

      if (fieldId) {
        const { data: existingVal } = await supabase.from('field_values').select('id').eq('field_id', fieldId).maybeSingle();
        if (!existingVal) {
          await supabase.from('field_values').insert({
            section_id: section.id,
            field_id: fieldId,
            page_id: page.id,
            value_text: f.val,
            value_url: f.field_type === 'image' ? f.val : null,
            published_value_text: f.val,
            is_draft: false,
          });
        } else {
          await supabase.from('field_values').update({
            value_text: f.val,
            value_url: f.field_type === 'image' ? f.val : null,
            published_value_text: f.val,
            is_draft: false,
          }).eq('id', existingVal.id);
        }
      }
    }
  }

  console.log('--- Successfully Synced All 6 Mentors & Team Fields to Supabase CMS! ---');
}

syncTeamMentors();
