const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const bcrypt = require('bcryptjs');
const supabase = require('./config/database');

async function resetAdmin() {
    const email = 'admin@test.com';
    const password = 'password123';

    console.log(`🔐 Resetting password for: ${email}...`);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('email', email)
            .select()
            .single();

        if (error) {
            console.error('❌ Error updating password:', error.message);
            return;
        }

        console.log('✅ Password reset successfully!');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 New Password: ${password}`);
    } catch (err) {
        console.error('💥 Unexpected error:', err.message);
    }
}

resetAdmin();
