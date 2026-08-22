const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getFiles(dir, files = []) {
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
  console.log('--- 1. SYNCING ALL 111 MEDIA ASSETS INTO SUPABASE ---');
  const publicDir = path.resolve('d:/Valavan Academy Website/valavan-academy-v2/public');
  const assetsDir = path.join(publicDir, 'assets');
  const filePaths = getFiles(assetsDir);

  // Add logo-icon.png
  filePaths.push(path.join(publicDir, 'logo-icon.png'));

  console.log(`Found ${filePaths.length} physical assets to sync.`);

  // Delete current media records to avoid duplicates and re-insert complete clean library
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
    if (rel.includes('certifications')) alt_text = 'Valavan Academy Student Certificate - ' + alt_text;
    else if (rel.includes('about')) alt_text = 'Valavan Academy Team Mentor - ' + alt_text;
    else if (rel.includes('programs')) alt_text = 'Valavan Academy Course Module - ' + alt_text;
    else if (rel.includes('tools')) alt_text = 'Creative Software & Tool - ' + alt_text;

    mediaRows.push({
      filename: filename,
      original_name: filename,
      file_url: rel,
      file_type: file_type,
      file_size: stat.size,
      alt_text: alt_text
    });
  }

  // Insert in batches of 30
  for (let i = 0; i < mediaRows.length; i += 30) {
    const batch = mediaRows.slice(i, i + 30);
    const { error } = await supabase.from('media').insert(batch);
    if (error) console.error('Error inserting media batch:', error.message);
  }
  console.log(`✓ Inserted ${mediaRows.length} media records into Supabase media table.`);

  // --- 2. SEEDING FIELDS FOR ALL HOME SECTIONS ---
  console.log('\n--- 2. SEEDING FIELDS FOR HOME SECTIONS ---');
  
  // Get home page ID
  const { data: homePage } = await supabase.from('pages').select('id').eq('slug', 'home').single();
  if (!homePage) throw new Error('Home page not found');

  const { data: sections } = await supabase.from('sections').select('id, slug, name').eq('page_id', homePage.id);
  console.log(`Found ${sections.length} sections for Home page.`);

  // Clean old fields for these sections
  for (const s of sections) {
    await supabase.from('fields').delete().eq('section_id', s.id);
  }

  // Define section fields configuration
  const sectionFieldDefs = {
    hero: [
      { name: 'headline_prefix', label: 'Headline Top (White)', field_type: 'heading', value: 'Your Career', sort_order: 1 },
      { name: 'headline_highlight', label: 'Headline Highlight (Blue)', field_type: 'heading', value: 'Changing Partner', sort_order: 2 },
      { name: 'description', label: 'Subtext Description', field_type: 'long_text', value: 'Learn Graphic Design, Video Editing , Web Design & Advanced AI in Tamil with hands-on mentorship and real-world projects.', sort_order: 3 },
      { name: 'primary_button_text', label: 'Primary Button Text', field_type: 'short_text', value: 'Explore Courses', sort_order: 4 },
      { name: 'primary_button_url', label: 'Primary Button URL', field_type: 'url', value: '/programs', sort_order: 5 },
      { name: 'secondary_button_text', label: 'Secondary Button Text', field_type: 'short_text', value: 'Join TNCC Community', sort_order: 6 },
      { name: 'secondary_button_url', label: 'Secondary Button URL', field_type: 'url', value: 'https://tamilnaducreatorsclub.com/', sort_order: 7 },
      { name: 'background_video_url', label: 'Desktop Background Video URL (1920 × 1080)', field_type: 'video', value: '/assets/videos/hero-bg.mp4', sort_order: 8 },
    ],
    marquee_ribbon: [
      { name: 'ribbon_items', label: 'Ticker Phrases (Comma Separated)', field_type: 'long_text', value: 'AI-POWERED WORKFLOWS, 100% PRACTICAL MENTORSHIP, TAMIL-FIRST LEARNING, REAL CLIENT PROJECTS, PORTFOLIO FIRST, FREELANCING MASTERY', sort_order: 1 }
    ],
    learn_create_grow: [
      { name: 'badge', label: 'Section Badge', field_type: 'short_text', value: 'LEARN • CREATE • GROW', sort_order: 1 },
      { name: 'heading', label: 'Main Heading', field_type: 'heading', value: 'Master Creative Digital Skills In Tamil', sort_order: 2 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'Step-by-step career programs engineered to transform beginners into confident creative professionals.', sort_order: 3 }
    ],
    certifications: [
      { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'STUDENT ACHIEVEMENTS', sort_order: 1 },
      { name: 'heading', label: 'Section Heading', field_type: 'heading', value: 'MORE THAN A CERTIFICATE.', sort_order: 2 },
      { name: 'subheading', label: 'Section Subheading', field_type: 'subheading', value: 'Skill Verification for High-Income Careers', sort_order: 3 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'Valavan Academy certifications validate real-world portfolio deliverables, tool mastery, and hands-on client projects.', sort_order: 4 },
      { name: 'cert_image_1', label: 'Certificate 01 Image (1600 × 1200 px)', field_type: 'image', value: '/assets/certifications/2.webp', sort_order: 5 },
      { name: 'cert_image_2', label: 'Certificate 02 Image (1600 × 1200 px)', field_type: 'image', value: '/assets/certifications/3.webp', sort_order: 6 },
      { name: 'cert_image_3', label: 'Certificate 03 Image (1600 × 1200 px)', field_type: 'image', value: '/assets/certifications/4.webp', sort_order: 7 },
      { name: 'cert_image_4', label: 'Certificate 04 Image (1600 × 1200 px)', field_type: 'image', value: '/assets/certifications/5.webp', sort_order: 8 },
      { name: 'cert_image_5', label: 'Certificate 05 Image (1600 × 1200 px)', field_type: 'image', value: '/assets/certifications/6.webp', sort_order: 9 },
      { name: 'cert_image_6', label: 'Certificate 06 Image (1600 × 1200 px)', field_type: 'image', value: '/assets/certifications/7.webp', sort_order: 10 },
      { name: 'cert_image_7', label: 'Certificate 07 Image (1600 × 1200 px)', field_type: 'image', value: '/assets/certifications/8.webp', sort_order: 11 },
      { name: 'cert_image_8', label: 'Certificate 08 Image (1600 × 1200 px)', field_type: 'image', value: '/assets/certifications/9.webp', sort_order: 12 },
    ],
    learner_stories: [
      { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'STUDENT TRANSFORMATIONS', sort_order: 1 },
      { name: 'heading', label: 'Heading', field_type: 'heading', value: 'Watch Real Student Stories', sort_order: 2 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'Discover how our students transformed their careers through practical Tamil mentorship.', sort_order: 3 }
    ],
    community: [
      { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'TAMIL NADU CREATORS CLUB', sort_order: 1 },
      { name: 'heading', label: 'Heading', field_type: 'heading', value: 'Join 10,000+ Tamil Creators', sort_order: 2 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'Network with creators, attend exclusive offline meetups, and collaborate on real client projects across Tamil Nadu.', sort_order: 3 },
      { name: 'cta_button_text', label: 'Button Text', field_type: 'short_text', value: 'Join TNCC Community →', sort_order: 4 },
      { name: 'cta_button_url', label: 'Button URL', field_type: 'url', value: 'https://tamilnaducreatorsclub.com/', sort_order: 5 }
    ],
    testimonials: [
      { name: 'badge', label: 'Badge', field_type: 'short_text', value: 'STUDENT FEEDBACKS', sort_order: 1 },
      { name: 'heading', label: 'Heading', field_type: 'heading', value: 'Hear from Our Students', sort_order: 2 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'Graphic Design, Video Editing & Web Design Success Stories from Tamil Students', sort_order: 3 }
    ],
    cta: [
      { name: 'heading', label: 'Main Heading', field_type: 'heading', value: 'Ready to Start Your Creative Journey?', sort_order: 1 },
      { name: 'description', label: 'Description', field_type: 'long_text', value: 'Join hundreds of successful Tamil creators and designers today.', sort_order: 2 },
      { name: 'primary_button_text', label: 'Button Text', field_type: 'short_text', value: 'Explore Programs', sort_order: 3 },
      { name: 'primary_button_url', label: 'Button URL', field_type: 'url', value: '/programs', sort_order: 4 }
    ]
  };

  for (const s of sections) {
    const defs = sectionFieldDefs[s.slug];
    if (defs && defs.length > 0) {
      for (const def of defs) {
        const { data: field, error: fErr } = await supabase.from('fields').insert({
          section_id: s.id,
          name: def.name,
          label: def.label,
          field_type: def.field_type,
          sort_order: def.sort_order,
          is_required: false
        }).select().single();

        if (fErr) {
          console.error(`Error inserting field ${def.name} for section ${s.slug}:`, fErr.message);
          continue;
        }

        const isText = ['short_text','long_text','rich_text','heading','subheading','color','select'].includes(def.field_type);
        const isUrl = ['url','email','youtube','video','image'].includes(def.field_type);

        await supabase.from('field_values').insert({
          field_id: field.id,
          section_id: s.id,
          page_id: homePage.id,
          value_text: isText ? def.value : null,
          value_url: isUrl ? def.value : null,
          is_draft: false
        });
      }
      console.log(`✓ Seeded ${defs.length} fields for section "${s.slug}".`);
    }
  }

  console.log('\n--- SYNC & SEED COMPLETED 100% SUCCESSFULLY ---');
}

syncAll().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
