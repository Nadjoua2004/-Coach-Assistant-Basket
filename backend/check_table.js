const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = require('./config/database');

async function checkTable() {
    console.log('--- Checking exercises table info ---');
    try {
        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error fetching one row:', error);
        } else {
            console.log('One row sample:', data);
        }
    } catch (err) {
        console.error('Fatal:', err);
    }
}

checkTable();
