import ApiService from './api';

class SessionService {
    /**
     * Get all sessions
     */
    static async getAllSessions(filters = {}) {
        try {
            let endpoint = '/api/sessions';
            const params = new URLSearchParams();

            if (filters.date) params.append('date', filters.date);
            if (filters.status) params.append('status', filters.status);

            const queryString = params.toString();
            if (queryString) {
                endpoint += `?${queryString}`;
            }

            return await ApiService.get(endpoint);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            throw error;
        }
    }

    /**
     * Get session by ID
     */
    static async getSessionById(id) {
        try {
            return await ApiService.get(`/api/sessions/${id}`);
        } catch (error) {
            console.error(`Error fetching session ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create session
     */
    static async createSession(sessionData) {
        try {
            return await ApiService.post('/api/sessions', sessionData);
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    }

    /**
     * Update session
     */
    static async updateSession(id, sessionData) {
        try {
            return await ApiService.put(`/api/sessions/${id}`, sessionData);
        } catch (error) {
            console.error(`Error updating session ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete session
     */
    static async deleteSession(id) {
        try {
            return await ApiService.delete(`/api/sessions/${id}`);
        } catch (error) {
            console.error(`Error deleting session ${id}:`, error);
            throw error;
        }
    }

    /**
     * Export session to PDF
     */
    static async exportToPdf(id) {
        try {
            return await ApiService.get(`/api/sessions/${id}/export-pdf`);
        } catch (error) {
            console.error(`Error exporting session ${id} to PDF:`, error);
            throw error;
        }
    }
}

export default SessionService;
