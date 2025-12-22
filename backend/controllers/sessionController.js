const { validationResult } = require('express-validator');
const supabase = require('../config/database');

class SessionController {
  /**
   * Get all sessions
   */
  static async getAllSessions(req, res) {
    try {
      let query = supabase.from('sessions').select('*');

      // Filter by date if provided
      if (req.query.date) {
        query = query.eq('date', req.query.date);
      }

      // Filter by status
      if (req.query.status) {
        query = query.eq('status', req.query.status);
      }

      const { data: sessions, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching sessions',
          error: error.message
        });
      }

      res.json({
        success: true,
        data: sessions,
        count: sessions.length
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Get session by ID
   */
  static async getSessionById(req, res) {
    try {
      const { data: session, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error || !session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Create session
   */
  static async createSession(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const sessionData = {
        ...req.body,
        created_by: req.user.id,
        created_at: new Date().toISOString()
      };

      const { data: session, error } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error creating session',
          error: error.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'Session created successfully',
        data: session
      });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Update session
   */
  static async updateSession(req, res) {
    try {
      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString()
      };

      const { data: session, error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error updating session',
          error: error.message
        });
      }

      res.json({
        success: true,
        message: 'Session updated successfully',
        data: session
      });
    } catch (error) {
      console.error('Update session error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Delete session
   */
  static async deleteSession(req, res) {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', req.params.id);

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error deleting session',
          error: error.message
        });
      }

      res.json({
        success: true,
        message: 'Session deleted successfully'
      });
    } catch (error) {
      console.error('Delete session error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Export session to PDF (placeholder - implement PDF generation)
   */
  static async exportSessionToPDF(req, res) {
    try {
      const { id } = req.params;

      // Get session data
      const { data: session, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // TODO: Generate PDF using a library like pdfkit or puppeteer
      // For now, return session data
      res.json({
        success: true,
        message: 'PDF export functionality to be implemented',
        data: session
      });
    } catch (error) {
      console.error('Export PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = SessionController;

