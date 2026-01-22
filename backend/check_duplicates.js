const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = require('./config/database');

async function checkDuplicates() {
    console.log('🔍 Searching for all users to check casing...');

    const { data: users, error } = await supabase
        .from('users')
        .select('id, email, role');

    if (error) {
        console.error('❌ Error:', error.message);
        return;
    }

    console.log(`✅ Found ${users.length} users:`);
    users.forEach(u => {
        console.log(`   - ${u.email} (${u.role})`);
    });

    const duplicates = users.filter((u, index) =>
        users.some((other, otherIndex) =>
            index !== otherIndex && u.email.toLowerCase() === other.email.toLowerCase()
        )
    );

    if (duplicates.length > 0) {
        console.log('\n⚠️ Found potential casing duplicates:');
        duplicates.forEach(u => console.log(`   - ${u.email}`));
    } else {
        console.log('\n✅ No casing duplicates found.');
    }
}

checkDuplicates();
