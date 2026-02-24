require('dotenv').config();
const supabase = require('./config/database');

async function testVideosTable() {
    console.log('--- Testing videos table ---');

    // Test 1: Check if table exists by selecting from it
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .limit(5);

    if (error) {
        console.error('❌ Table error:', error.message);
        console.log('\n👉 You need to run CREATE_VIDEOS_TABLE.sql in your Supabase SQL Editor!');
        console.log('   Go to: https://supabase.com/dashboard → SQL Editor → paste the SQL → Run');
    } else {
        console.log('✅ Table exists!');
        console.log(`   Found ${data.length} video(s) in the database`);
        if (data.length > 0) {
            console.log('   Videos:', data.map(v => ({ id: v.id, title: v.title, url: v.url?.substring(0, 50) + '...' })));
        }
    }
}

testVideosTable().catch(console.error);
