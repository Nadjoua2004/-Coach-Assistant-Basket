const { validationResult } = require('express-validator');
const supabase = require('../config/database');
const { uploadToR2, deleteFromR2 } = require('../config/storage');

class AthleteController {
  /**
   * Get all athletes with filters
   */
  /**
   * Get athlete profile for the current logged-in user
   */
  static async getMyProfile(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { data: athlete, error } = await supabase
        .from('athletes')
        .select('*')
        .eq('user_id', req.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found" which is fine here
        throw error;
      }

      res.json({
        success: true,
        data: athlete || null
      });
    } catch (error) {
      console.error('Get my profile error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * Get all athletes with filters
   * Now includes users with role 'joueur' who don't have an athlete profile yet
   */
  static async getAllAthletes(req, res) {
    try {
      // 1. Get existing athletes
      let query = supabase.from('athletes').select('*');

      // Apply filters
      if (req.query.groupe) query = query.eq('groupe', req.query.groupe);
      if (req.query.sexe) query = query.eq('sexe', req.query.sexe);
      if (req.query.poste) query = query.eq('poste', req.query.poste);
      if (req.query.blesse === 'true') query = query.eq('blesse', true);

      const { data: existingAthletes, error: athletesError } = await query.order('nom', { ascending: true });

      if (athletesError) throw athletesError;

      // 2. Get unlinked users with role 'joueur'
      // Only fetch if no specific filters preventing it (like 'groupe' or 'blesse' which unlinked users won't have)
      let unlinkedPlayers = [];
      if (!req.query.groupe && !req.query.sexe && !req.query.poste && !req.query.blesse) {
        const { data: players, error: playersError } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('role', 'joueur');

        if (!playersError && players) {
          // Filter out users who already have an athlete record linked (assuming we link them later, or just name matching)
          // Since we don't have a direct link yet, we'll check against existing athletes 
          // (Note: This is a loose check. Ideally, we should have a user_id foreign key in athletes table.
          // Schema indicates created_by relates to user, but doesn't explicitly say 'user_id' is the athlete's account.
          // Assuming 'name' might match or we just show them as "New")

          // Only filter by exact name match for now to avoid duplicates if manual entry exists
          const existingNames = new Set(existingAthletes.map(a => `${a.prenom} ${a.nom}`.toLowerCase().trim()));

          unlinkedPlayers = players.filter(p => !existingNames.has(p.name.toLowerCase().trim())).map(p => {
            const nameParts = p.name.split(' ');
            return {
              id: `temp_${p.id}`, // Temporary ID to distinguish
              user_id: p.id,
              nom: nameParts[0] || p.name,
              prenom: nameParts.slice(1).join(' ') || '',
              groupe: 'Non assigné',
              poste: null,
              photo_url: null,
              is_unlinked: true // Flag to show UI indication
            };
          });
        }
      }

      const allAthletes = [...existingAthletes, ...unlinkedPlayers];

      res.json({
        success: true,
        data: allAthletes,
        count: allAthletes.length
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
        created_by: req.user.id,
        // If the creator is a player, link this athlete record to their user account
        user_id: req.user.role === 'joueur' ? req.user.id : null
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

      // 1. Delete associated medical records
      const { error: medError } = await supabase
        .from('medical_records')
        .delete()
        .eq('athlete_id', req.params.id);

      if (medError) console.error('Error deleting medical records:', medError);

      // 2. Delete associated attendance
      const { error: attError } = await supabase
        .from('attendance')
        .delete()
        .eq('athlete_id', req.params.id);

      if (attError) console.error('Error deleting attendance:', attError);

      // 3. Delete the athlete
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

