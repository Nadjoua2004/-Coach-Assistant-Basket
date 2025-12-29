const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const bcrypt = require('bcryptjs');
const supabase = require('./config/database');

async function seedUsers() {
    const usersToSeed = [
        { email: 'mlkkaouah@gmail.com', name: 'Malik kaouha', password: 'password123', role: 'admin' },
        { email: 'adel@ntf-dz.com', name: 'Adel benmesbah', password: 'password123', role: 'admin' }, // admin/coach
        { email: 'da.ouksel@gmail.com', name: 'danyl ouksel', password: 'password123', role: 'joueur' },
        { email: 'Yacine.ouksel@gmail.com', name: 'Yacine ouksel', password: 'password123', role: 'parent' }
    ];

    console.log('🌱 Seeding specific users...');

    for (const userData of usersToSeed) {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const { data, error } = await supabase
                .from('users')
                .insert({
                    email: userData.email,
                    password: hashedPassword,
                    name: userData.name,
                    role: userData.role,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    console.log(`ℹ️ User already exists: ${userData.email}`);
                } else {
                    console.error(`❌ Error creating user ${userData.email}:`, error.message);
                }
                continue;
            }

            console.log(`✅ User created: ${userData.email} (${userData.role})`);
        } catch (err) {
            console.error(`💥 Unexpected error for ${userData.email}:`, err.message);
        }
    }
}

seedUsers();
