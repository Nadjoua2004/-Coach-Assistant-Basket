import ApiService from './api';

class DashboardService {
    /**
     * Get dashboard statistics
     */
    static async getStats() {
        try {
            return await ApiService.get('/api/dashboard');
        } catch (error) {
            console.error('Error in DashboardService.getStats:', error);
            throw error;
        }
    }
}

export default DashboardService;
