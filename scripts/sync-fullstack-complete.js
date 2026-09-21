const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const FULLSTACK_SECTIONS = {
  hero: {
    name: 'Hero Section',
    fields: [
      { name: 'badge', label: 'Badge Text', field_type: 'short_text', val: '🚀 Tamil Nadu\'s Most Complete Creator Learning Program', sort_order: 1 },
      { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', val: 'Become A Full Stack ', sort_order: 2 },
      { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', val: 'Digital Creator.', sort_order: 3 },
      { name: 'description', label: 'Description', field_type: 'long_text', val: 'A complete 6-month career transformation program covering Video Editing, Web Design, UI/UX, WordPress, AI Tools, and Freelancing — everything you need to build high-income creative skills in Tamil.', sort_order: 4 },
      { name: 'highlight_duration', label: 'Duration Text', field_type: 'short_text', val: '6 Months', sort_order: 5 },
      { name: 'hero_image', label: 'Hero Image', field_type: 'image', val: '/assets/images/hero/full-stack-.jpg-1.webp', sort_order: 6 },
      { name: 'enroll_btn_text', label: 'Primary Button Text', field_type: 'short_text', val: '🚀 Join The Program', sort_order: 10 },
      { name: 'enroll_url', label: 'Primary Button URL', field_type: 'url', val: 'https://learn.valavanacademy.com/clientapp/signup', sort_order: 11 },
      { name: 'secondary_btn_text', label: 'Secondary Button Text', field_type: 'short_text', val: '📖 View Curriculum', sort_order: 12 },
      { name: 'secondary_btn_url', label: 'Secondary Button URL (e.g. #syllabus)', field_type: 'short_text', val: '#syllabus', sort_order: 13 },
      { name: 'stat_students', label: 'Stat: Students Trained', field_type: 'short_text', val: '10,000+ Students', sort_order: 20 },
      { name: 'stat_skills', label: 'Stat: Core Skill Areas', field_type: 'short_text', val: '6 Core Skill Areas', sort_order: 21 },
      { name: 'stat_lessons', label: 'Stat: Learning Lessons', field_type: 'short_text', val: '200+ Lessons', sort_order: 22 },
      { name: 'stat_access', label: 'Stat: Lifetime Access', field_type: 'short_text', val: 'Lifetime Access', sort_order: 23 },
      { name: 'stat_ai', label: 'Stat: AI Learning', field_type: 'short_text', val: 'AI Integrated Learning', sort_order: 24 },
    ]
  },
  tools: {
    name: 'Tools Covered',
    fields: [
      { name: 'badge', label: 'Badge Text', field_type: 'short_text', val: 'FULL STACK SUITE', sort_order: 1 },
      { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', val: 'Master the Complete', sort_order: 2 },
      { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', val: 'Creative Arsenal.', sort_order: 3 },
      { name: 'description', label: 'Description', field_type: 'long_text', val: 'Learn Premiere Pro, After Effects, Figma, Webflow, WordPress, and cutting-edge Generative AI.', sort_order: 4 },
      { name: 'tool_1_name', label: 'Tool 1 Name', field_type: 'short_text', val: 'Adobe Premiere Pro', sort_order: 10 },
      { name: 'tool_1_image', label: 'Tool 1 Image/Logo', field_type: 'image', val: '/assets/tools/premiere-pro.png', sort_order: 11 },
      { name: 'tool_2_name', label: 'Tool 2 Name', field_type: 'short_text', val: 'Adobe After Effects', sort_order: 12 },
      { name: 'tool_2_image', label: 'Tool 2 Image/Logo', field_type: 'image', val: '/assets/tools/after-effects.png', sort_order: 13 },
      { name: 'tool_3_name', label: 'Tool 3 Name', field_type: 'short_text', val: 'WordPress CMS', sort_order: 14 },
      { name: 'tool_3_image', label: 'Tool 3 Image/Logo', field_type: 'image', val: '/assets/tools/wordpress.png', sort_order: 15 },
      { name: 'tool_4_name', label: 'Tool 4 Name', field_type: 'short_text', val: 'Elementor Pro', sort_order: 16 },
      { name: 'tool_4_image', label: 'Tool 4 Image/Logo', field_type: 'image', val: '/assets/tools/elementor-pro.png', sort_order: 17 },
      { name: 'tool_5_name', label: 'Tool 5 Name', field_type: 'short_text', val: 'ChatGPT AI', sort_order: 18 },
      { name: 'tool_5_image', label: 'Tool 5 Image/Logo', field_type: 'image', val: '/assets/tools/chatgpt.png', sort_order: 19 },
      { name: 'tool_6_name', label: 'Tool 6 Name', field_type: 'short_text', val: 'Google Gemini AI', sort_order: 20 },
      { name: 'tool_6_image', label: 'Tool 6 Image/Logo', field_type: 'image', val: '/assets/tools/gemini-ai.png', sort_order: 21 },
      { name: 'tool_7_name', label: 'Tool 7 Name', field_type: 'short_text', val: 'Adobe Photoshop', sort_order: 22 },
      { name: 'tool_7_image', label: 'Tool 7 Image/Logo', field_type: 'image', val: '/assets/tools/ps.png', sort_order: 23 },
      { name: 'tool_8_name', label: 'Tool 8 Name', field_type: 'short_text', val: 'Adobe Illustrator', sort_order: 24 },
      { name: 'tool_8_image', label: 'Tool 8 Image/Logo', field_type: 'image', val: '/assets/tools/illustrator.png', sort_order: 25 },
    ]
  },
  syllabus: {
    name: 'Syllabus & Curriculum',
    fields: [
      { name: 'badge', label: 'Badge Text', field_type: 'short_text', val: 'COURSE STRUCTURE', sort_order: 1 },
      { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', val: 'Why we are different from', sort_order: 2 },
      { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', val: 'others', sort_order: 3 },
      { name: 'description', label: 'Description', field_type: 'long_text', val: 'Learn directly from our mentors and engage 24/7 within the community', sort_order: 4 },
    ]
  },
  skills_money: {
    name: 'Skills That Make Money',
    fields: [
      { name: 'badge', label: 'Badge Text', field_type: 'short_text', val: 'HIGH-INCOME SKILLS', sort_order: 1 },
      { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', val: 'Learn Skills That Actually', sort_order: 2 },
      { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', val: 'Make Money', sort_order: 3 },
      { name: 'description', label: 'Description', field_type: 'long_text', val: 'From thumbnail design to high-ticket brand packaging, see the real-world skills our students master.', sort_order: 4 },
    ]
  },
  certification: {
    name: 'Certification',
    fields: [
      { name: 'badge', label: 'Badge Text', field_type: 'short_text', val: 'Get Certified', sort_order: 1 },
      { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', val: 'Industry Ready', sort_order: 2 },
      { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', val: 'Certification', sort_order: 3 },
      { name: 'subtitle', label: 'Subtitle', field_type: 'short_text', val: 'Showcase your creator skills confidently with a professional completion certificate', sort_order: 4 },
      { name: 'program_title', label: 'Program Certificate Title', field_type: 'short_text', val: 'Earn a Professional Certification in Full Stack Digital Creator Program', sort_order: 5 },
      { name: 'program_description', label: 'Program Description', field_type: 'long_text', val: 'Build credibility for freelancing, portfolio & job opportunities with recognized project-based learning', sort_order: 6 },
      { name: 'certificate_image', label: 'Certificate Image Mockup', field_type: 'image', val: '/assets/programs/full-stack-creator/CERTIFICATE-model-2.jpg-1-2048x1448.webp', sort_order: 7 },
      { name: 'enroll_url', label: 'Button URL', field_type: 'url', val: 'https://learn.valavanacademy.com/clientapp/signup', sort_order: 8 },
    ]
  },
  creator_economy: {
    name: 'Creator Economy Boom',
    fields: [
      { name: 'badge', label: 'Badge Text', field_type: 'short_text', val: 'Growth Update', sort_order: 1 },
      { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', val: 'Creator Economy :', sort_order: 2 },
      { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', val: 'Why is it Booming ?', sort_order: 3 },
      { name: 'description', label: 'Description', field_type: 'long_text', val: 'Graphic design blends creativity, visual storytelling, and technology to turn ideas into stunning visuals. With the rise of digital content, talented freelance designers are in high demand!', sort_order: 4 },
      { name: 'card_1_tag', label: 'Card 1: Top Tag', field_type: 'short_text', val: 'Market Demand', sort_order: 10 },
      { name: 'card_1_rise', label: 'Card 1: Rise Metric', field_type: 'short_text', val: '+250% Rise', sort_order: 11 },
      { name: 'card_1_title', label: 'Card 1: Title', field_type: 'short_text', val: 'Explosive Growth in India', sort_order: 12 },
      { name: 'card_1_stat', label: 'Card 1: Stat Number', field_type: 'short_text', val: '250%', sort_order: 13 },
      { name: 'card_1_stat_label', label: 'Card 1: Stat Label', field_type: 'short_text', val: 'Industry Expansion Rate', sort_order: 14 },
      { name: 'card_1_desc', label: 'Card 1: Description', field_type: 'long_text', val: 'Between 2022–2030, India\'s freelancing and graphic design industry is set for massive growth driven by digital marketing, brand design demand, and AI-powered creative tools.', sort_order: 15 },
      { name: 'card_1_source', label: 'Card 1: Source Citation', field_type: 'short_text', val: '(Source: FICCI Report)', sort_order: 16 },
      { name: 'card_2_tag', label: 'Card 2: Top Tag', field_type: 'short_text', val: 'Multi-Sector Adoption', sort_order: 20 },
      { name: 'card_2_badge', label: 'Card 2: Top Badge', field_type: 'short_text', val: 'Global Reach', sort_order: 21 },
      { name: 'card_2_title', label: 'Card 2: Title', field_type: 'short_text', val: 'Diverse Opportunities', sort_order: 22 },
      { name: 'card_2_stat', label: 'Card 2: Stat Number', field_type: 'short_text', val: '95%', sort_order: 23 },
      { name: 'card_2_stat_label', label: 'Card 2: Stat Label', field_type: 'short_text', val: 'Businesses Rely on Visuals', sort_order: 24 },
      { name: 'card_2_desc', label: 'Card 2: Description', field_type: 'long_text', val: 'From marketing and education to fashion, real estate, and e-commerce nearly every industry now depends on graphic design to build brand identity and attract customers.', sort_order: 25 },
      { name: 'card_2_source', label: 'Card 2: Source Citation', field_type: 'short_text', val: '(Source: Statista)', sort_order: 26 },
    ]
  },
  templates_bonus: {
    name: "What You'll Get (Bonus Access)",
    fields: [
      { name: 'badge', label: 'Badge Text', field_type: 'short_text', val: "WHAT YOU'LL GET", sort_order: 1 },
      { name: 'title', label: 'Headline', field_type: 'short_text', val: 'Complete Program Access', sort_order: 2 },
      { name: 'feature_1', label: 'Feature 1', field_type: 'short_text', val: 'Full Curriculum', sort_order: 10 },
      { name: 'feature_2', label: 'Feature 2', field_type: 'short_text', val: 'Lifetime Access', sort_order: 11 },
      { name: 'feature_3', label: 'Feature 3', field_type: 'short_text', val: 'Community Access', sort_order: 12 },
      { name: 'feature_4', label: 'Feature 4', field_type: 'short_text', val: 'Resource Library', sort_order: 13 },
      { name: 'feature_5', label: 'Feature 5', field_type: 'short_text', val: 'Templates & Assets', sort_order: 14 },
      { name: 'feature_6', label: 'Feature 6', field_type: 'short_text', val: 'AI Systems', sort_order: 15 },
      { name: 'feature_7', label: 'Feature 7', field_type: 'short_text', val: 'Project-Based Learning', sort_order: 16 },
      { name: 'feature_8', label: 'Feature 8', field_type: 'short_text', val: 'Future Updates', sort_order: 17 },
      { name: 'image', label: 'Asset Vault Mockup Image', field_type: 'image', val: '/assets/programs/full-stack-creator/Untitled-design-3-1-1-2048x1152-1-1024x576.webp', sort_order: 20 },
      { name: 'button_text', label: 'Button Text', field_type: 'short_text', val: '🚀 Join Full Stack Creator Program', sort_order: 21 },
      { name: 'enroll_url', label: 'Button URL', field_type: 'url', val: 'https://learn.valavanacademy.com/clientapp/signup', sort_order: 22 },
    ]
  },
  who_is_this_for: {
    name: 'Who Is This For',
    fields: [
      { name: 'badge', label: 'Badge Text', field_type: 'short_text', val: 'Who Is This For', sort_order: 1 },
      { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', val: 'This Program Is Perfect For You', sort_order: 2 },
      { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', val: 'If...', sort_order: 3 },
      { name: 'persona_1_title', label: 'Persona 1 Title', field_type: 'short_text', val: 'Beginner', sort_order: 10 },
      { name: 'persona_1_desc', label: 'Persona 1 Description', field_type: 'long_text', val: 'who\'s never touched editing software but wants to start from scratch the right way', sort_order: 11 },
      { name: 'persona_2_title', label: 'Persona 2 Title', field_type: 'short_text', val: 'Home Maker', sort_order: 12 },
      { name: 'persona_2_desc', label: 'Persona 2 Description', field_type: 'long_text', val: 'who wants to level up editing skills for YouTube, Reels, or client videos', sort_order: 13 },
      { name: 'persona_3_title', label: 'Persona 3 Title', field_type: 'short_text', val: 'Student', sort_order: 14 },
      { name: 'persona_3_desc', label: 'Persona 3 Description', field_type: 'long_text', val: 'looking to build a career in media, video production, or freelance editing', sort_order: 15 },
      { name: 'persona_4_title', label: 'Persona 4 Title', field_type: 'short_text', val: 'Freelancer', sort_order: 16 },
      { name: 'persona_4_desc', label: 'Persona 4 Description', field_type: 'long_text', val: 'tired of low-paying gigs and wants to charge higher by delivering pro-level edits', sort_order: 17 },
      { name: 'persona_5_title', label: 'Persona 5 Title', field_type: 'short_text', val: 'Job Seeker', sort_order: 18 },
      { name: 'persona_5_desc', label: 'Persona 5 Description', field_type: 'long_text', val: 'To Work a Creative Field and needs step-by-step, practical guidance', sort_order: 19 },
      { name: 'button_text', label: 'Button Text', field_type: 'short_text', val: 'Enroll Now', sort_order: 30 },
      { name: 'enroll_url', label: 'Button URL', field_type: 'url', val: 'https://learn.valavanacademy.com/clientapp/signup', sort_order: 31 },
    ]
  },
  guidance_mentors: {
    name: 'Guidance & Mentors',
    fields: [
      { name: 'badge', label: 'Badge Text', field_type: 'short_text', val: 'Expert Mentors', sort_order: 1 },
      { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', val: 'Guidance From', sort_order: 2 },
      { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', val: 'Experienced Mentors', sort_order: 3 },
      { name: 'description', label: 'Description', field_type: 'long_text', val: 'Learn from creators focused on practical workflows, not boring theory', sort_order: 4 },
      { name: 'why_title_prefix', label: 'Left Box Headline Prefix', field_type: 'short_text', val: 'Why Choose', sort_order: 10 },
      { name: 'why_title_highlight', label: 'Left Box Headline Highlight (Blue)', field_type: 'short_text', val: 'Valavan Academy ?', sort_order: 11 },
      { name: 'point_1', label: 'Point 1', field_type: 'short_text', val: 'Practical Learning', sort_order: 12 },
      { name: 'point_2', label: 'Point 2', field_type: 'short_text', val: 'Tamil-First Education', sort_order: 13 },
      { name: 'point_3', label: 'Point 3', field_type: 'short_text', val: 'Industry Experience', sort_order: 14 },
      { name: 'point_4', label: 'Point 4', field_type: 'short_text', val: 'Proven Frameworks', sort_order: 15 },
      { name: 'point_5', label: 'Point 5', field_type: 'short_text', val: 'Supportive Community', sort_order: 16 },
      { name: 'point_6', label: 'Point 6', field_type: 'short_text', val: 'Real-World Focus', sort_order: 17 },
      { name: 'why_desc_2', label: 'Mission Paragraph', field_type: 'long_text', val: 'More than 1,000 freelancers and studio designers have already upgraded their skills through our programs, and our 180K+ YouTube learning community continues to grow every day. Our mission is to help 10,000+ creative learners build confidence, develop job-ready portfolios, and step into freelancing or professional design careers successfully.', sort_order: 18 },
      { name: 'team_image', label: 'Mentor Team Photo', field_type: 'image', val: '/assets/programs/full-stack-creator/team-1024x682-1.webp', sort_order: 19 },
    ]
  },
  offer: {
    name: 'Offer & Pricing',
    fields: [
      { name: 'badge', label: 'Badge Text', field_type: 'short_text', val: 'Make Your Next Move Count', sort_order: 1 },
      { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', val: 'Learn How To Work With ', sort_order: 2 },
      { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', val: 'AI, Not Compete Against It.', sort_order: 3 },
      { name: 'description', label: 'Description', field_type: 'long_text', val: 'AI is changing how creators work. Instead of fearing it, learn how to leverage AI to improve creativity, productivity, research, content creation, and workflow efficiency.', sort_order: 4 },
      { name: 'feature_1', label: 'Feature Item 1', field_type: 'short_text', val: 'AI Design Workflows', sort_order: 10 },
      { name: 'feature_2', label: 'Feature Item 2', field_type: 'short_text', val: 'AI Content Systems', sort_order: 11 },
      { name: 'feature_3', label: 'Feature Item 3', field_type: 'short_text', val: 'AI Research Methods', sort_order: 12 },
      { name: 'feature_4', label: 'Feature Item 4', field_type: 'short_text', val: 'Prompt Engineering Basics', sort_order: 13 },
      { name: 'feature_5', label: 'Feature Item 5', field_type: 'short_text', val: 'AI Productivity Tools', sort_order: 14 },
      { name: 'feature_6', label: 'Feature Item 6', field_type: 'short_text', val: 'Creative Automation', sort_order: 15 },
      { name: 'card_title', label: 'Card Title', field_type: 'short_text', val: 'Full Stack Creator Program', sort_order: 20 },
      { name: 'card_badge', label: 'Card Badge Text', field_type: 'short_text', val: 'Lifetime Access', sort_order: 21 },
      { name: 'button_text', label: 'Button Text', field_type: 'short_text', val: 'Join Today', sort_order: 22 },
      { name: 'card_note', label: 'Card Sub-Note', field_type: 'short_text', val: 'For A Limited Time Only', sort_order: 23 },
      { name: 'enroll_url', label: 'Enroll Button URL', field_type: 'url', val: 'https://learn.valavanacademy.com/clientapp/signup', sort_order: 24 },
    ]
  },
  final_cta: {
    name: 'Final Call To Action (Pre-FAQ)',
    fields: [
      { name: 'badge', label: 'Badge Text (Optional)', field_type: 'short_text', val: '', sort_order: 1 },
      { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', val: 'The Future Belongs To ', sort_order: 2 },
      { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', val: 'Creators.', sort_order: 3 },
      { name: 'headline_sub', label: 'Sub-Headline', field_type: 'long_text', val: 'The people who can design, communicate, create content, use AI, and build audiences will have more opportunities than ever before.', sort_order: 4 },
      { name: 'description', label: 'Description', field_type: 'long_text', val: 'Start building those skills today.', sort_order: 5 },
      { name: 'primary_btn_text', label: 'Primary CTA Text', field_type: 'short_text', val: '🚀 Join The Program', sort_order: 10 },
      { name: 'primary_btn_url', label: 'Primary CTA URL', field_type: 'url', val: 'https://learn.valavanacademy.com/clientapp/signup', sort_order: 11 },
      { name: 'secondary_btn_text', label: 'Secondary CTA Text', field_type: 'short_text', val: '📖 Explore Curriculum', sort_order: 12 },
      { name: 'secondary_btn_url', label: 'Secondary CTA URL (e.g. #syllabus)', field_type: 'short_text', val: '#syllabus', sort_order: 13 },
      { name: 'footer_subtext', label: 'Closing Line Text', field_type: 'long_text', val: 'Build Skills. Create Opportunities. Shape Your Future. — Valavan Academy – Empowering The Next Generation Of Digital Creators. 🚀', sort_order: 14 },
    ]
  },
  faq: {
    name: 'Frequently Asked Questions',
    fields: [
      { name: 'badge', label: 'Badge Text', field_type: 'short_text', val: 'FAQ', sort_order: 1 },
      { name: 'title_prefix', label: 'Headline Prefix', field_type: 'short_text', val: 'Your Questions,', sort_order: 2 },
      { name: 'title_highlight', label: 'Headline Highlight (Blue)', field_type: 'short_text', val: 'Answered', sort_order: 3 },
      { name: 'subtitle', label: 'Subtitle', field_type: 'long_text', val: 'Have a question about our courses, career support, or community? We\'ve gathered some of the most common questions to help you find the answers you need and get started with confidence', sort_order: 4 },
      { name: 'faq_1_question', label: 'FAQ 1: Question', field_type: 'short_text', val: 'Is this suitable for beginners?', sort_order: 10 },
      { name: 'faq_1_answer', label: 'FAQ 1: Answer', field_type: 'long_text', val: 'Yes. The program starts from the fundamentals and gradually progresses to advanced concepts.', sort_order: 11 },
      { name: 'faq_2_question', label: 'FAQ 2: Question', field_type: 'short_text', val: 'How will I access the course?', sort_order: 12 },
      { name: 'faq_2_answer', label: 'FAQ 2: Answer', field_type: 'long_text', val: 'You will receive access immediately after enrollment.', sort_order: 13 },
      { name: 'faq_3_question', label: 'FAQ 3: Question', field_type: 'short_text', val: 'Is this course in Tamil or English?', sort_order: 14 },
      { name: 'faq_3_answer', label: 'FAQ 3: Answer', field_type: 'long_text', val: 'The training is designed for Tamil-speaking students with easy-to-follow explanations.', sort_order: 15 },
      { name: 'faq_4_question', label: 'FAQ 4: Question', field_type: 'short_text', val: 'Is there any time limit to complete the course?', sort_order: 16 },
      { name: 'faq_4_answer', label: 'FAQ 4: Answer', field_type: 'long_text', val: 'No. You get lifetime access to the learning materials.', sort_order: 17 },
      { name: 'faq_5_question', label: 'FAQ 5: Question', field_type: 'short_text', val: 'Are projects included?', sort_order: 18 },
      { name: 'faq_5_answer', label: 'FAQ 5: Answer', field_type: 'long_text', val: 'Yes. Multiple practical projects are included to help build real-world experience.', sort_order: 19 },
      { name: 'faq_6_question', label: 'FAQ 6: Question', field_type: 'short_text', val: 'Will I receive a certificate?', sort_order: 20 },
      { name: 'faq_6_answer', label: 'FAQ 6: Answer', field_type: 'long_text', val: 'Yes. A certificate will be provided after successful completion.', sort_order: 21 },
    ]
  },
  sticky_cta: {
    name: 'Sticky Bottom Bar',
    fields: [
      { name: 'notice_text', label: 'Notice / Urgency Text', field_type: 'short_text', val: 'Limited Seats Only', sort_order: 1 },
      { name: 'button_text', label: 'Button Text', field_type: 'short_text', val: 'ENROLL NOW', sort_order: 2 },
      { name: 'enroll_url', label: 'Button URL', field_type: 'url', val: 'https://learn.valavanacademy.com/clientapp/signup', sort_order: 3 },
    ]
  }
};

async function syncAllFullStackSections() {
  console.log('--- Starting Complete Full Stack Creator CMS Sync ---');

  const { data: page, error: pageErr } = await supabase
    .from('pages')
    .select('id')
    .eq('slug', 'full-stack-creator')
    .single();

  if (pageErr || !page) {
    console.error('Failed to find page full-stack-creator:', pageErr);
    return;
  }

  for (const [sectionSlug, secConfig] of Object.entries(FULLSTACK_SECTIONS)) {
    console.log(`\nProcessing Section: ${sectionSlug} (${secConfig.name})`);

    let { data: section } = await supabase
      .from('sections')
      .select('id')
      .eq('page_id', page.id)
      .eq('slug', sectionSlug)
      .maybeSingle();

    if (!section) {
      const { data: newSec, error: newSecErr } = await supabase
        .from('sections')
        .insert({
          page_id: page.id,
          name: secConfig.name,
          slug: sectionSlug,
          is_visible: true,
          sort_order: 1,
        })
        .select('id')
        .single();

      if (newSecErr) {
        console.error(`Error creating section ${sectionSlug}:`, newSecErr);
        continue;
      }
      section = newSec;
    }

    const sectionId = section.id;

    for (const f of secConfig.fields) {
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
        value_url: (f.field_type === 'image' || f.field_type === 'url') ? f.val : null,
        published_value_text: f.val,
        is_draft: false,
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

  console.log('\n--- Full Stack Creator CMS Sync Completed Successfully! ---');
}

syncAllFullStackSections();
