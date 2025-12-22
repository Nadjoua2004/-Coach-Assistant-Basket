const { validationResult } = require('express-validator');
const supabase = require('../config/database');
const { uploadToR2, deleteFromR2 } = require('../config/storage');

class AthleteController {
  /**
   * Get all athletes with filters
   */
  static async getAllAthletes(req, res) {
    try {
      let query = supabase.from('athletes').select('*');

      // Apply filters
      if (req.query.groupe) {
        query = query.eq('groupe', req.query.groupe);
      }
      if (req.query.sexe) {
        query = query.eq('sexe', req.query.sexe);
      }
      if (req.query.poste) {
        query = query.eq('poste', req.query.poste);
      }
      if (req.query.blesse === 'true') {
        query = query.eq('blesse', true);
      }

      const { data: athletes, error } = await query.order('nom', { ascending: true });

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching athletes',
          error: error.message
        });
      }

      res.json({
        success: true,
        data: athletes,
        count: athletes.length
      });
    } catch (error) {
      console.error('Get athletes error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Get athlete by ID
   */
  static async getAthleteById(req, res) {
    try {
      const { data: athlete, error } = await supabase
        .from('athletes')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error || !athlete) {
        return res.status(404).json({
          success: false,
          message: 'Athlete not found'
        });
      }

      res.json({
        success: true,
        data: athlete
      });
    } catch (error) {
      console.error('Get athlete error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Create athlete
   */
  static async createAthlete(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const athleteData = {
        ...req.body,
        created_at: new Date().toISOString(),
        created_by: req.user.id
      };

      // Handle photo upload if provided
      if (req.file) {
        const photoPath = `athletes/photos/${req.params.id || Date.now()}-${req.file.originalname}`;
        const photoUrl = await uploadToR2(
          req.file.buffer,
          photoPath,
          req.file.mimetype
        );
        athleteData.photo_url = photoUrl;
      }

      const { data: athlete, error } = await supabase
        .from('athletes')
        .insert(athleteData)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error creating athlete',
          error: error.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'Athlete created successfully',
        data: athlete
      });
    } catch (error) {
      console.error('Create athlete error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Update athlete
   */
  static async updateAthlete(req, res) {
    try {
      const { data: athlete, error: fetchError } = await supabase
        .from('athletes')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (fetchError || !athlete) {
        return res.status(404).json({
          success: false,
          message: 'Athlete not found'
        });
      }

      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString()
      };

      // Handle photo upload if provided
      if (req.file) {
        // Delete old photo if exists
        if (athlete.photo_url) {
          try {
            const oldPhotoPath = athlete.photo_url.split('/').pop();
            await deleteFromR2(`athletes/photos/${oldPhotoPath}`);
          } catch (error) {
            console.error('Error deleting old photo:', error);
          }
        }

        const photoPath = `athletes/photos/${req.params.id}-${req.file.originalname}`;
        const photoUrl = await uploadToR2(
          req.file.buffer,
          photoPath,
          req.file.mimetype
        );
        updateData.photo_url = photoUrl;
      }

      const { data: updatedAthlete, error } = await supabase
        .from('athletes')
        .update(updateData)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error updating athlete',
          error: error.message
        });
      }

      res.json({
        success: true,
        message: 'Athlete updated successfully',
        data: updatedAthlete
      });
    } catch (error) {
      console.error('Update athlete error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Delete athlete
   */
  static async deleteAthlete(req, res) {
    try {
      // Get athlete to delete photo
      const { data: athlete } = await supabase
        .from('athletes')
        .select('photo_url')
        .eq('id', req.params.id)
        .single();

      // Delete photo from R2 if exists
      if (athlete?.photo_url) {
        try {
          const photoPath = athlete.photo_url.split('/').pop();
          await deleteFromR2(`athletes/photos/${photoPath}`);
        } catch (error) {
          console.error('Error deleting photo:', error);
        }
      }

      const { error } = await supabase
        .from('athletes')
        .delete()
        .eq('id', req.params.id);

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error deleting athlete',
          error: error.message
        });
      }

      res.json({
        success: true,
        message: 'Athlete deleted successfully'
      });
    } catch (error) {
      console.error('Delete athlete error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = AthleteController;

