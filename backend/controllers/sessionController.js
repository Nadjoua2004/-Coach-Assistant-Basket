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
   * Export session to PDF
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

      // Fetch exercise details
      let exercises = [];
      if (session.exercises && Array.isArray(session.exercises) && session.exercises.length > 0) {
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select('*')
          .in('id', session.exercises);

        if (!exerciseError && exerciseData) {
          // Preserve order from session.exercises
          exercises = session.exercises
            .map(exId => exerciseData.find(e => e.id === exId))
            .filter(Boolean);
        }
      }

      // Initialize PDF
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      let filename = `session_${id}.pdf`;

      res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
      res.setHeader('Content-type', 'application/pdf');

      doc.pipe(res);

      // Header
      doc.fillColor('#f97316').fontSize(25).text('Fiche Séance Basket', { align: 'center' });
      doc.moveDown(0.5);
      doc.fillColor('#1f2937').fontSize(20).text(session.title, { align: 'center' });
      doc.moveDown();

      // Info box
      doc.rect(50, doc.y, 500, 100).strokeColor('#e5e7eb').stroke();
      const currentY = doc.y + 10;
      doc.fontSize(12).fillColor('#4b5563');
      doc.text(`Objectif:`, 60, currentY);
      doc.text(`Durée:`, 60, currentY + 20);
      doc.text(`Date & Heure:`, 60, currentY + 40);
      doc.text(`Lieu:`, 60, currentY + 60);

      doc.fillColor('#111827');
      doc.text(session.objective, 150, currentY);
      doc.text(`${session.total_duration} minutes`, 150, currentY + 20);
      doc.text(`${session.date || 'Non spécifiée'} à ${session.heure || '--:--'}`, 150, currentY + 40);
      doc.text(session.lieu || 'Non spécifié', 150, currentY + 60);

      doc.moveDown(5);

      // Structure
      const sections = [
        { title: 'ÉCHAUFFEMENT', content: session.warmup },
        { title: 'FOND PRINCIPAL', content: session.main_content },
        { title: 'FIN DE SÉANCE', content: session.cooldown }
      ];

      sections.forEach(section => {
        if (section.content) {
          doc.fillColor('#f97316').fontSize(14).text(section.title, { underline: true });
          doc.moveDown(0.2);
          doc.fillColor('#374151').fontSize(11).text(section.content);
          doc.moveDown();
        }
      });

      // Exercises
      if (exercises.length > 0) {
        doc.addPage();
        doc.fillColor('#f97316').fontSize(18).text('LISTE DES EXERCICES', { align: 'center' });
        doc.moveDown();

        exercises.forEach((ex, index) => {
          doc.fillColor('#1f2937').fontSize(14).text(`${index + 1}. ${ex.name}`);
          doc.fontSize(10).fillColor('#6b7280').text(`Durée: ${ex.duration}min | Joueurs: ${ex.players_min}-${ex.players_max} | Matériel: ${ex.equipment || 'Standard'}`);
          doc.moveDown(0.5);
          doc.fillColor('#374151').fontSize(11).text(ex.description);
          doc.moveDown();
          doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#f3f4f6').stroke();
          doc.moveDown();
        });
      }

      // Footer
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#9ca3af').text(
          `Généré par Coach Assistant Basket - Page ${i + 1} sur ${range.count}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
      }

      doc.end();

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

