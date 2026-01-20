import ApiService from './api';

class PlanningService {
    /**
     * Get all planning events with optional date range
     * @param {Object} range - { start_date, end_date }
     */
    static async getAllPlanning(range = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (range.start_date) queryParams.append('start_date', range.start_date);
            if (range.end_date) queryParams.append('end_date', range.end_date);
            if (range.athlete_id) queryParams.append('athlete_id', range.athlete_id);

            const endpoint = `/api/planning${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            return await ApiService.get(endpoint);
        } catch (error) {
            console.error('Error in PlanningService.getAllPlanning:', error);
            throw error;
        }
    }

    /**
     * Create a new planning event
     * @param {Object} eventData 
     */
    static async createPlanning(eventData) {
        try {
            return await ApiService.post('/api/planning', eventData);
        } catch (error) {
            console.error('Error in PlanningService.createPlanning:', error);
            throw error;
        }
    }

    /**
     * Update an existing planning event
     * @param {string} id 
     * @param {Object} updateData 
     */
    static async updatePlanning(id, updateData) {
        try {
            return await ApiService.put(`/api/planning/${id}`, updateData);
        } catch (error) {
            console.error('Error in PlanningService.updatePlanning:', error);
            throw error;
        }
    }

    /**
     * Delete a planning event
     * @param {string} id 
     */
    static async deletePlanning(id) {
        try {
            return await ApiService.delete(`/api/planning/${id}`);
        } catch (error) {
            console.error('Error in PlanningService.deletePlanning:', error);
            throw error;
        }
    }

    /**
     * Get participants for an event
     */
    static async getParticipants(id) {
        try {
            return await ApiService.get(`/api/planning/${id}/participants`);
        } catch (error) {
            console.error('Error in PlanningService.getParticipants:', error);
            throw error;
        }
    }

    /**
     * Add participant
     */
    static async addParticipant(id, athlete_id) {
        try {
            return await ApiService.post(`/api/planning/${id}/participants`, { athlete_id });
        } catch (error) {
            console.error('Error in PlanningService.addParticipant:', error);
            throw error;
        }
    }

    /**
     * Remove participant
     */
    static async removeParticipant(id, athlete_id) {
        try {
            return await ApiService.delete(`/api/planning/${id}/participants/${athlete_id}`);
        } catch (error) {
            console.error('Error in PlanningService.removeParticipant:', error);
            throw error;
        }
    }
}

export default PlanningService;
