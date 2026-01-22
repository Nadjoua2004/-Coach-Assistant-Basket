const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = require('./config/database');

async function checkUser() {
    const email = 'yacine.ouksel@gmail.com';
    console.log(`🔍 Checking user: ${email}...`);

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error) {
        console.error('❌ Error:', error.message);
        return;
    }

    if (!user) {
        console.log('❌ User not found in database.');
    } else {
        console.log('✅ User found:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Has password: ${!!user.password}`);
    }
}

checkUser();
