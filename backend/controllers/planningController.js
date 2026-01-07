const { validationResult } = require('express-validator');
const supabase = require('../config/database');

class PlanningController {
  /**
   * Get all planning events
   */
  static async getAllPlanning(req, res) {
    try {
      let query = supabase.from('planning').select('*');

      // Filter by date range
      if (req.query.start_date) {
        query = query.gte('date', req.query.start_date);
      }
      if (req.query.end_date) {
        query = query.lte('date', req.query.end_date);
      }

      const { data: events, error } = await query.order('date', { ascending: true });

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching planning',
          error: error.message
        });
      }

      res.json({
        success: true,
        data: events,
        count: events.length
      });
    } catch (error) {
      console.error('Get planning error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Create planning event
   */
  static async createPlanningEvent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const eventData = {
        ...req.body,
        created_by: req.user.id,
        created_at: new Date().toISOString()
      };

      const { data: event, error } = await supabase
        .from('planning')
        .insert(eventData)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error creating planning event',
          error: error.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'Planning event created successfully',
        data: event
      });
    } catch (error) {
      console.error('Create planning error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Update planning event
   */
  static async updatePlanningEvent(req, res) {
    try {
      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString()
      };

      const { data: event, error } = await supabase
        .from('planning')
        .update(updateData)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error updating planning event',
          error: error.message
        });
      }

      res.json({
        success: true,
        message: 'Planning event updated successfully',
        data: event
      });
    } catch (error) {
      console.error('Update planning error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Delete planning event
   */
  static async deletePlanningEvent(req, res) {
    try {
      const { error } = await supabase
        .from('planning')
        .delete()
        .eq('id', req.params.id);

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error deleting planning event',
          error: error.message
        });
      }

      res.json({
        success: true,
        message: 'Planning event deleted successfully'
      });
    } catch (error) {
      console.error('Delete planning error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Get participants for a planning event
   */
  static async getParticipants(req, res) {
    try {
      const { data, error } = await supabase
        .from('planning_athletes')
        .select('*, athletes(*)')
        .eq('planning_id', req.params.id);

      if (error) throw error;

      res.json({
        success: true,
        data: data.map(item => item.athletes)
      });
    } catch (error) {
      console.error('Get participants error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * Add participant to planning
   */
  static async addParticipant(req, res) {
    try {
      const { athlete_id } = req.body;
      const { error } = await supabase
        .from('planning_athletes')
        .insert({
          planning_id: req.params.id,
          athlete_id
        });

      if (error) {
        // Ignore duplicate errors (already assigned)
        if (error.code === '23505') {
          return res.json({ success: true, message: 'Already assigned' });
        }
        throw error;
      }

      res.json({ success: true, message: 'Athlete assigned' });
    } catch (error) {
      console.error('Add participant error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * Remove participant from planning
   */
  static async removeParticipant(req, res) {
    try {
      const { athlete_id } = req.params;
      const { error } = await supabase
        .from('planning_athletes')
        .delete()
        .match({
          planning_id: req.params.id,
          athlete_id
        });

      if (error) throw error;

      res.json({ success: true, message: 'Athlete removed' });
    } catch (error) {
      console.error('Remove participant error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

module.exports = PlanningController;

