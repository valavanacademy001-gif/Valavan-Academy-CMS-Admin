const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDatabase() {
  console.log('Testing Supabase connection...');

  const tables = [
    'admins',
    'pages',
    'sections',
    'section_types',
    'fields',
    'field_values',
    'programs',
    'testimonials',
    'learner_stories',
    'certifications',
    'media',
    'site_settings',
    'content_versions',
    'audit_logs'
  ];

  for (const table of tables) {
    try {
      const { data, count, error } = await supabase.from(table).select('*', { count: 'exact', head: false }).limit(5);
      if (error) {
        console.log(`Table "${table}": ERROR -> ${error.message} (Code: ${error.code})`);
      } else {
        console.log(`Table "${table}": OK -> count: ${count}, rows returned: ${data ? data.length : 0}`);
      }
    } catch (e) {
      console.log(`Table "${table}": EXCEPTION -> ${e.message}`);
    }
  }
}

checkDatabase();
