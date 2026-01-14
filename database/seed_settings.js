require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert(
      {
        setting_key: 'email_service_provider',
        setting_value: 'google_smtp',
        setting_type: 'text',
        description: 'Selected email service provider: google_smtp or emailjs'
      },
      { onConflict: 'setting_key' }
    )
    .select();

  if (error) {
    console.error('Error seeding settings:', error);
  } else {
    console.log('Settings seeded:', data);
  }
}

seed();
