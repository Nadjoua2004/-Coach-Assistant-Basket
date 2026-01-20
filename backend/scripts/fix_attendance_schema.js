require('dotenv').config();
const supabase = require('../config/database');

async function fixAttendanceConstraint() {
    console.log('Adding unique constraint to attendance table...');

    // We can't run raw SQL easily via Supabase JS client unless we have a RPC function
    // Let's try to see if we can use the 'query' RPC if it exists or just handle it differently

    // Actually, I can use the workaround of deleting before inserting if upsert fails
    // But it's better to have a constraint.

    // Let's check if we can run this via an RPC
    const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE attendance ADD CONSTRAINT unique_planning_athlete UNIQUE (planning_id, athlete_id);'
    });

    if (error) {
        console.error('Error adding constraint (it might already exist):', error);
    } else {
        console.log('Constraint added successfully:', data);
    }
}

fixAttendanceConstraint();
