const fetch = require('node-fetch');

async function testActivities() {
  try {
    console.log('Testing getPublishedActivities...');
    
    // Import the function
    const { getPublishedActivities } = require('./lib/supabase-queries');
    
    const activities = await getPublishedActivities();
    console.log('✅ Success! Found', activities.length, 'activities');
    console.log('First activity:', activities[0] ? activities[0].title : 'None');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testActivities();
