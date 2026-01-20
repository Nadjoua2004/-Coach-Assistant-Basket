const { validationResult } = require('express-validator');
const supabase = require('../config/database');

class AttendanceController {
  /**
   * Get all attendance records
   */
  static async getAllAttendance(req, res) {
    try {
      let query = supabase.from('attendance').select('*, athletes(prenom, nom), planning(date, theme)');

      // Filter by session or planning
      if (req.query.session_id) {
        query = query.eq('session_id', req.query.session_id);
      }
      if (req.query.planning_id) {
        query = query.eq('planning_id', req.query.planning_id);
      }

      // Filter by athlete
      if (req.query.athlete_id) {
        query = query.eq('athlete_id', req.query.athlete_id);
      }

      const { data: records, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching attendance',
          error: error.message
        });
      }

      res.json({
        success: true,
        data: records,
        count: records.length
      });
    } catch (error) {
      console.error('Get attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Create attendance record
   */
  static async createAttendance(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('Attendance validation failed:', errors.array());
        return res.status(400).json({
          success: false,
          errors: errors.array(),
          message: errors.array()[0].msg
        });
      }

      const attendanceData = {
        ...req.body,
        recorded_by: req.user.id,
        created_at: new Date().toISOString()
      };

      // Manually handle upsert because of potential missing unique constraint
      const { data: existing, error: fetchError } = await supabase
        .from('attendance')
        .select('id')
        .eq('planning_id', attendanceData.planning_id)
        .eq('athlete_id', attendanceData.athlete_id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let result;
      if (existing) {
        // Update
        const { id, created_at, ...updateData } = attendanceData;
        const { data, error } = await supabase
          .from('attendance')
          .update(updateData)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('attendance')
          .insert(attendanceData)
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      res.status(201).json({
        success: true,
        message: 'Attendance recorded successfully',
        data: result
      });
    } catch (error) {
      console.error('Create attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error recording attendance',
        error: error.message
      });
    }
  }

  /**
   * Get attendance statistics
   */
  static async getAttendanceStats(req, res) {
    try {
      const { athlete_id, groupe, start_date, end_date } = req.query;

      let query = supabase.from('attendance').select('*');

      if (athlete_id) {
        query = query.eq('athlete_id', athlete_id);
      }
      if (req.query.planning_id) {
        query = query.eq('planning_id', req.query.planning_id);
      }
      if (start_date) {
        query = query.gte('created_at', start_date);
      }
      if (end_date) {
        query = query.lte('created_at', end_date);
      }

      const { data: records, error } = await query;

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching attendance stats',
          error: error.message
        });
      }

      // Calculate statistics
      const total = records.length;
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const retard = records.filter(r => r.status === 'retard').length;
      const excuse = records.filter(r => r.status === 'excuse').length;
      const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

      res.json({
        success: true,
        data: {
          total,
          present,
          absent,
          retard,
          excuse,
          attendanceRate: parseFloat(attendanceRate)
        }
      });
    } catch (error) {
      console.error('Get attendance stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = AttendanceController;

