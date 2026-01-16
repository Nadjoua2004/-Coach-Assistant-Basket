import api from './api';

class VideoService {
    /**
     * Get all videos from the library
     */
    async getAllVideos() {
        try {
            const response = await api.get('/api/videos');
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: error.message || 'Network error' };
        }
    }

    /**
     * Upload a video to the library (Admin only)
     * @param {FormData} formData - Should contain 'video' file and 'title'
     */
    async uploadVideo(formData) {
        try {
            const response = await api.postFormData('/api/videos', formData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: error.message || 'Network error' };
        }
    }

    /**
     * Delete a video from the library (Admin only)
     * @param {string} id - Video ID
     */
    async deleteVideo(id) {
        try {
            const response = await api.delete(`/api/videos/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: error.message || 'Network error' };
        }
    }
}

export default new VideoService();
