const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const bcrypt = require('bcryptjs');
const supabase = require('./config/database');

async function seedUsers() {
    const usersToSeed = [
        { email: 'mlkkaouah@gmail.com', name: 'Malik kaouha', password: 'password123', role: 'admin' },
        { email: 'adel@ntf-dz.com', name: 'Adel benmesbah', password: 'password123', role: 'coach' },
        { email: 'da.ouksel@gmail.com', name: 'danyl ouksel', password: 'player123', role: 'joueur' },
        { email: 'yacine.ouksel@gmail.com', name: 'Yacine ouksel', password: 'parent123', role: 'parent' }
    ];

    console.log('🌱 Seeding specific users...');

    for (const userData of usersToSeed) {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Upsert user (update if email exists)
            const { data, error } = await supabase
                .from('users')
                .upsert({
                    email: userData.email,
                    password: hashedPassword,
                    name: userData.name,
                    role: userData.role,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'email' })
                .select()
                .single();

            if (error) {
                console.error(`❌ Error seeding user ${userData.email}:`, error.message);
                continue;
            }

            console.log(`✅ User seeded (Created/Updated): ${userData.email} (${userData.role})`);
        } catch (err) {
            console.error(`💥 Unexpected error for ${userData.email}:`, err.message);
        }
    }
}

seedUsers();
