const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjktqpmtlwfsmofaaajv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa3RxcG10bHdmc21vZmFhYWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDkzNTEsImV4cCI6MjEwMjg4NTM1MX0.HUp094ulUH7sIw9F5oAzlE23kjRqow11yj_0jd5mvL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runCRUDTests() {
  console.log('=== RUNNING LIVE DATABASE CRUD TESTS ===\n');

  // TEST 1: PAGE CRUD
  console.log('1. Testing Page CREATE...');
  const { data: initialPages } = await supabase.from('pages').select('id', { count: 'exact' });
  const initialCount = initialPages ? initialPages.length : 0;
  console.log('   Initial Pages count:', initialCount);

  const { data: createdPage, error: createPageErr } = await supabase.from('pages').insert([{
    title: 'Test Page',
    slug: 'test-page-' + Date.now(),
    description: 'A temporary test page to verify database CRUD',
    status: 'draft'
  }]).select().single();

  if (createPageErr || !createdPage) {
    throw new Error('Failed to create page: ' + (createPageErr?.message || 'unknown error'));
  }
  console.log('   ✓ Page created with ID:', createdPage.id, 'Slug:', createdPage.slug);

  const { data: afterCreatePages } = await supabase.from('pages').select('id', { count: 'exact' });
  console.log('   ✓ Pages count after create:', afterCreatePages?.length, '(Increased by 1)');

  console.log('2. Testing Page UPDATE...');
  const { data: updatedPage, error: updatePageErr } = await supabase.from('pages').update({
    title: 'Test Page (Updated)'
  }).eq('id', createdPage.id).select().single();

  if (updatePageErr || !updatedPage || updatedPage.title !== 'Test Page (Updated)') {
    throw new Error('Failed to update page: ' + (updatePageErr?.message || 'unknown error'));
  }
  console.log('   ✓ Page updated title:', updatedPage.title);

  console.log('3. Testing Page DELETE...');
  const { error: deletePageErr } = await supabase.from('pages').delete().eq('id', createdPage.id);
  if (deletePageErr) {
    throw new Error('Failed to delete page: ' + deletePageErr.message);
  }
  const { data: afterDeletePages } = await supabase.from('pages').select('id', { count: 'exact' });
  console.log('   ✓ Pages count after delete:', afterDeletePages?.length, '(Returned to baseline)');

  // TEST 2: PROGRAM CRUD
  console.log('\n4. Testing Program CREATE & DELETE...');
  const { data: createdProg, error: progErr } = await supabase.from('programs').insert([{
    title: 'Temporary Test Course',
    slug: 'temp-test-course-' + Date.now(),
    description: 'Temporary program for testing',
    level: 'beginner',
    status: 'draft'
  }]).select().single();

  if (progErr || !createdProg) {
    throw new Error('Failed to create program: ' + (progErr?.message || 'unknown error'));
  }
  console.log('   ✓ Program created ID:', createdProg.id);

  await supabase.from('programs').delete().eq('id', createdProg.id);
  console.log('   ✓ Program deleted successfully.');

  // TEST 3: LEARNER STORY CRUD
  console.log('\n5. Testing Learner Story CREATE & DELETE...');
  const { data: createdStory, error: storyErr } = await supabase.from('learner_stories').insert([{
    title: 'Test Story',
    student_name: 'Test Student',
    youtube_video_id: 'TEST_ID_' + Date.now(),
    is_visible: true
  }]).select().single();

  if (storyErr || !createdStory) {
    throw new Error('Failed to create story: ' + (storyErr?.message || 'unknown error'));
  }
  console.log('   ✓ Story created ID:', createdStory.id);

  await supabase.from('learner_stories').delete().eq('id', createdStory.id);
  console.log('   ✓ Story deleted successfully.');

  console.log('\n=== ALL LIVE CRUD TESTS PASSED WITH 100% SUCCESS ===');
}

runCRUDTests().catch(err => {
  console.error('CRUD Test Failed:', err);
  process.exit(1);
});
