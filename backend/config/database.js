const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuration missing!');
  console.error('Please set SUPABASE_URL and SUPABASE_KEY in your .env file');
  process.exit(1);
}

console.log(`🔌 Connecting to Supabase at: "${supabaseUrl}"`);
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;

