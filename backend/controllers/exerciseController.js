const { validationResult } = require('express-validator');
const supabase = require('../config/database');
const { uploadToR2, deleteFromR2 } = require('../config/storage');

class ExerciseController {
  /**
   * Get all exercises
   */
  static async getAllExercises(req, res) {
    try {
      let query = supabase.from('exercises').select('*');

      // Filter by category
      if (req.query.category) {
        query = query.eq('category', req.query.category);
      }

      // Filter by subcategory
      if (req.query.subcategory) {
        query = query.eq('subcategory', req.query.subcategory);
      }

      const { data: exercises, error } = await query.order('name', { ascending: true });

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching exercises',
          error: error.message
        });
      }

      res.json({
        success: true,
        data: exercises,
        count: exercises.length
      });
    } catch (error) {
      console.error('Get exercises error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Get exercise by ID
   */
  static async getExerciseById(req, res) {
    try {
      const { data: exercise, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error || !exercise) {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found'
        });
      }

      res.json({
        success: true,
        data: exercise
      });
    } catch (error) {
      console.error('Get exercise error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Create exercise
   */
  static async createExercise(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      let videoUrl = req.body.video_url;
      let storageKey = null;

      // Handle direct file upload
      if (req.file) {
        const uploadResult = await uploadToR2(req.file, 'exercises');
        if (uploadResult.success) {
          videoUrl = uploadResult.url;
          storageKey = uploadResult.key;
        }
      } else if (!videoUrl) {
        console.log('Exercise created with NO video URL provided.');
      }

      const exerciseData = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        subcategory: req.body.subcategory,
        duration: req.body.duration,
        players_min: req.body.players_min,
        players_max: req.body.players_max,
        equipment: req.body.equipment,
        video_url: videoUrl,
        video_id: req.body.video_id,
        created_by: req.user.id,
        created_at: new Date().toISOString()
      };

      // Only add storage_key if it's actually provided (migration might be missing)
      if (storageKey) {
        exerciseData.storage_key = storageKey;
      }

      console.log('Inserting exercise with data:', JSON.stringify(exerciseData, null, 2));

      const { data: exercise, error } = await supabase
        .from('exercises')
        .insert(exerciseData)
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error for exercise:', error);
        // Rollback: delete from R2 if DB insert fails
        if (storageKey) {
          await deleteFromR2(storageKey);
        }
        return res.status(500).json({
          success: false,
          message: 'Error creating exercise',
          error: error.message,
          details: error.details,
          hint: error.hint
        });
      }

      res.status(201).json({
        success: true,
        message: 'Exercise created successfully',
        data: exercise
      });
    } catch (error) {
      console.error('Create exercise FATAL error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error',
        error_code: error.code
      });
    }
  }

  /**
   * Update exercise
   */
  static async updateExercise(req, res) {
    try {
      const { data: oldExercise, error: fetchError } = await supabase
        .from('exercises')
        .select('storage_key, video_url')
        .eq('id', req.params.id)
        .single();

      if (fetchError) {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found'
        });
      }

      let videoUrl = req.body.video_url;
      let storageKey = oldExercise.storage_key;

      // Handle new file upload
      if (req.file) {
        // Delete old video from R2 if it exists
        if (oldExercise.storage_key) {
          await deleteFromR2(oldExercise.storage_key);
        }
        const uploadResult = await uploadToR2(req.file, 'exercises');
        if (uploadResult.success) {
          videoUrl = uploadResult.url;
          storageKey = uploadResult.key;
        }
      }

      const updateData = {
        ...req.body,
        video_url: videoUrl,
        storage_key: storageKey,
        updated_at: new Date().toISOString()
      };

      const { data: updatedExercise, error } = await supabase
        .from('exercises')
        .update(updateData)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error updating exercise',
          error: error.message
        });
      }

      res.json({
        success: true,
        message: 'Exercise updated successfully',
        data: updatedExercise
      });
    } catch (error) {
      console.error('Update exercise error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Delete exercise
   */
  static async deleteExercise(req, res) {
    try {
      // Fetch to check for storage_key
      const { data: exercise, error: fetchError } = await supabase
        .from('exercises')
        .select('storage_key')
        .eq('id', req.params.id)
        .single();

      if (!fetchError && exercise?.storage_key) {
        await deleteFromR2(exercise.storage_key);
      }

      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', req.params.id);

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error deleting exercise',
          error: error.message
        });
      }

      res.json({
        success: true,
        message: 'Exercise deleted successfully'
      });
    } catch (error) {
      console.error('Delete exercise error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = ExerciseController;

