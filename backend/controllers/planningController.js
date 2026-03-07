const { validationResult } = require('express-validator');
const supabase = require('../config/database');

class PlanningController {
  /**
   * Get all planning events
   */
  static async getAllPlanning(req, res) {
    try {
      let query = supabase.from('planning').select('*');

      // Filter by athlete if provided
      if (req.query.athlete_id) {
        // 1. Get athlete's group
        const { data: athlete, error: athleteError } = await supabase
          .from('athletes')
          .select('groupe')
          .eq('id', req.query.athlete_id)
          .single();

        if (athleteError) {
          console.error('Error fetching athlete group:', athleteError);
          // Fallback to just ID filtering if athlete lookup fails
        }

        const athleteGroup = athlete?.groupe;

        // 2. Find planning IDs where this athlete is explicitly assigned
        const { data: assignments, error: assignError } = await supabase
          .from('planning_athletes')
          .select('planning_id')
          .eq('athlete_id', req.query.athlete_id);

        if (assignError) throw assignError;

        const assignedIds = assignments.map(a => a.planning_id);

        // 3. Build compound filter: (id IN assignedIds) OR (groupe == athleteGroup)
        if (assignedIds.length > 0 && athleteGroup) {
          // Both conditions
          query = query.or(`id.in.(${assignedIds.join(',')}),groupe.eq.${athleteGroup}`);
        } else if (assignedIds.length > 0) {
          // Only direct assignments
          query = query.in('id', assignedIds);
        } else if (athleteGroup) {
          // Only group match
          query = query.eq('groupe', athleteGroup);
        } else {
          // No group and no assignments -> return nothing
          return res.json({ success: true, data: [], count: 0 });
        }
      }

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

      const { athletes_assignes, ...restOfData } = req.body;
      const eventData = {
        ...restOfData,
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

      // Handle athlete assignments if provided
      if (athletes_assignes && Array.isArray(athletes_assignes)) {
        const assignments = athletes_assignes.map(athlete_id => ({
          planning_id: event.id,
          athlete_id
        }));

        if (assignments.length > 0) {
          await supabase.from('planning_athletes').insert(assignments);
        }
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
   * Duplicate a week's planning
   */
  static async duplicateWeek(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { source_date, target_date } = req.body;
      const created_by = req.user.id;

      const startSource = new Date(source_date);
      const endSource = new Date(startSource);
      endSource.setDate(endSource.getDate() + 6);

      const startSourceStr = startSource.toISOString().split('T')[0];
      const endSourceStr = endSource.toISOString().split('T')[0];

      const startTarget = new Date(target_date);
      const diffTime = startTarget.getTime() - startSource.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      // Fetch source events
      const { data: sourceEvents, error: fetchError } = await supabase
        .from('planning')
        .select('*')
        .gte('date', startSourceStr)
        .lte('date', endSourceStr);

      if (fetchError) throw fetchError;

      if (!sourceEvents || sourceEvents.length === 0) {
        return res.json({ success: true, message: 'Aucun événement à dupliquer', count: 0 });
      }

      // Fetch all expected assignments for these events
      const sourceIds = sourceEvents.map(e => e.id);
      const { data: sourceAssignments, error: assignError } = await supabase
        .from('planning_athletes')
        .select('*')
        .in('planning_id', sourceIds);

      if (assignError) throw assignError;

      let duplicateCount = 0;
      for (const event of sourceEvents) {
        const oldEventDate = new Date(event.date);
        const newEventDate = new Date(oldEventDate);
        newEventDate.setDate(newEventDate.getDate() + diffDays);

        const newEvent = {
          date: newEventDate.toISOString().split('T')[0],
          heure: event.heure,
          duree: event.duree,
          lieu: event.lieu,
          theme: event.theme,
          groupe: event.groupe,
          session_id: event.session_id,
          created_by,
          created_at: new Date().toISOString()
        };

        const { data: insertedEvent, error: insertError } = await supabase
          .from('planning')
          .insert(newEvent)
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting duplicated event:", insertError);
          continue;
        }

        duplicateCount++;

        // Duplicate assignments
        const relatedAssignments = sourceAssignments ? sourceAssignments.filter(a => a.planning_id === event.id) : [];
        if (relatedAssignments.length > 0) {
          const newAssignments = relatedAssignments.map(a => ({
            planning_id: insertedEvent.id,
            athlete_id: a.athlete_id
          }));
          await supabase.from('planning_athletes').insert(newAssignments);
        }
      }

      res.json({
        success: true,
        message: `Planning dupliqué avec succès (${duplicateCount} événements)`,
        count: duplicateCount
      });
    } catch (error) {
      console.error('Duplicate planning error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * Update planning event
   */
  static async updatePlanningEvent(req, res) {
    try {
      const { athletes_assignes, ...restOfData } = req.body;
      const updateData = {
        ...restOfData,
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

      // Handle athlete assignments if provided (syncing approach)
      if (athletes_assignes && Array.isArray(athletes_assignes)) {
        // Delete old assignments
        await supabase.from('planning_athletes').delete().eq('planning_id', req.params.id);

        // Insert new ones
        const assignments = athletes_assignes.map(athlete_id => ({
          planning_id: req.params.id,
          athlete_id
        }));

        if (assignments.length > 0) {
          await supabase.from('planning_athletes').insert(assignments);
        }
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

