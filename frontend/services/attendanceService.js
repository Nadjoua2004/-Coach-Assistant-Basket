import ApiService from './api';

class AttendanceService {
    /**
     * Get attendance records with filters
     * @param {Object} filters - { session_id, athlete_id }
     */
    static async getAllAttendance(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (filters.session_id) queryParams.append('session_id', filters.session_id);
            if (filters.athlete_id) queryParams.append('athlete_id', filters.athlete_id);

            const endpoint = `/attendance${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            return await ApiService.get(endpoint);
        } catch (error) {
            console.error('Error in AttendanceService.getAllAttendance:', error);
            throw error;
        }
    }

    /**
     * Record attendance for an athlete
     * @param {Object} attendanceData - { session_id, athlete_id, status, notes }
     */
    static async recordAttendance(attendanceData) {
        try {
            return await ApiService.post('/attendance', attendanceData);
        } catch (error) {
            console.error('Error in AttendanceService.recordAttendance:', error);
            throw error;
        }
    }

    /**
     * Get attendance statistics
     * @param {Object} filters - { athlete_id, start_date, end_date }
     */
    static async getStats(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (filters.athlete_id) queryParams.append('athlete_id', filters.athlete_id);
            if (filters.start_date) queryParams.append('start_date', filters.start_date);
            if (filters.end_date) queryParams.append('end_date', filters.end_date);

            const endpoint = `/attendance/stats${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            return await ApiService.get(endpoint);
        } catch (error) {
            console.error('Error in AttendanceService.getStats:', error);
            throw error;
        }
    }
}

export default AttendanceService;
