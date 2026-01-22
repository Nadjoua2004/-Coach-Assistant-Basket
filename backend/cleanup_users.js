const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = require('./config/database');

async function cleanup() {
    console.log('🧹 Cleaning up casing duplicates...');

    // Delete the capitalized one specifically
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('email', 'Yacine.ouksel@gmail.com');

    if (error) {
        console.error('❌ Error deleting capitalized user:', error.message);
    } else {
        console.log('✅ Deleted Yacine.ouksel@gmail.com (capitalized)');
    }
}

cleanup();
