require('dotenv').config();
const supabase = require('../config/database');

async function checkTables() {
    console.log('Checking database tables...');

    // Check exercises table
    const { data: exercises, error: exerciseError } = await supabase
        .from('exercises')
        .select('*')
        .limit(1);

    if (exerciseError) {
        console.error('❌ Error accessing exercises table:', exerciseError);
    } else {
        console.log('✅ Exercises table exists. Count:', exercises.length);
    }

    // Check videos table
    const { data: videos, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .limit(1);

    if (videoError) {
        console.error('❌ Error accessing videos table:', videoError);
    } else {
        console.log('✅ Videos table exists. Count:', videos.length);
    }

    // Attempt to insert a test exercise with FULL payload
    console.log('Attempting to insert test exercise with full payload...');
    const payload = {
        name: 'Full Test Exercise',
        description: 'Test description full',
        category: 'shoot',
        subcategory: '', // Empty string
        duration: 15,
        players_min: 1,
        players_max: 12,
        equipment: 'Ball',
        video_url: null,
        storage_key: null,
        // created_by is omitted, mimicking null (backend sets it)
    };

    const { data: testEx, error: insertError } = await supabase
        .from('exercises')
        .insert(payload)
        .select()
        .single();

    if (insertError) {
        console.error('❌ INSERT FAILED:', insertError);
    } else {
        console.log('✅ INSERT SUCCESS:', testEx);
        // Clean up
        await supabase.from('exercises').delete().eq('id', testEx.id);
    }
}

checkTables();
