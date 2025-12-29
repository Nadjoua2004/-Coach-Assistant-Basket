const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const bcrypt = require('bcryptjs');
const supabase = require('./config/database');

async function seedUser() {
    const email = 'admin@test.com';
    const password = 'password123';
    const name = 'Admin Test';
    const role = 'admin';

    console.log(`🌱 Seeding user: ${email}...`);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from('users')
            .insert({
                email,
                password: hashedPassword,
                name,
                role,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error creating user:', error.message);
            if (error.message.includes('getaddrinfo')) {
                console.log('💡 TIP: This is a DNS error. Check your internet connection.');
            }
            return;
        }

        console.log('✅ User created successfully!');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
    } catch (err) {
        console.error('💥 Unexpected error:', err.message);
    }
}

seedUser();
