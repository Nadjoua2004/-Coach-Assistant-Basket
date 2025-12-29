const dotenv = require('dotenv');
dotenv.config();
const supabase = require('./config/database');

async function checkUsers() {
    console.log('🔍 Checking for existing users...');
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('email, name, role');

        if (error) {
            console.error('❌ Error fetching users:', error.message);
            return;
        }

        if (users && users.length > 0) {
            console.log('✅ Found users:');
            users.forEach(u => console.log(`- ${u.name} (${u.email}) - Role: ${u.role}`));
        } else {
            console.log('ℹ️ No users found in the database. You need to register first.');
        }
    } catch (err) {
        console.error('💥 Unexpected error:', err.message);
    }
}

checkUsers();
