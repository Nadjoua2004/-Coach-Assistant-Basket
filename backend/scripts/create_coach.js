require('dotenv').config();
const supabase = require('../config/database');
const bcrypt = require('bcryptjs');

async function createCoach() {
    const email = 'adel@ntf-dz.com';
    const password = 'password123';
    const name = 'Adel Coach';
    const role = 'coach';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
        .from('users')
        .insert([
            { email, password: hashedPassword, name, role }
        ])
        .select();

    if (error) {
        console.error('Error creating coach:', error);
    } else {
        console.log('Coach created successfully:', data);
    }
}

createCoach();
