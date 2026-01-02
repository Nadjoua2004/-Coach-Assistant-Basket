import ApiService from './api';

class ExerciseService {
    /**
     * Get all exercises
     */
    static async getAllExercises(filters = {}) {
        try {
            let endpoint = '/api/exercises';
            const params = new URLSearchParams();

            if (filters.category) params.append('category', filters.category);
            if (filters.subcategory) params.append('subcategory', filters.subcategory);

            const queryString = params.toString();
            if (queryString) {
                endpoint += `?${queryString}`;
            }

            return await ApiService.get(endpoint);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            throw error;
        }
    }

    /**
     * Get exercise by ID
     */
    static async getExerciseById(id) {
        try {
            return await ApiService.get(`/api/exercises/${id}`);
        } catch (error) {
            console.error(`Error fetching exercise ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create exercise
     */
    static async createExercise(exerciseData, videoFile = null) {
        try {
            if (videoFile) {
                const formData = new FormData();
                Object.keys(exerciseData).forEach(key => {
                    if (exerciseData[key] !== null && exerciseData[key] !== undefined) {
                        formData.append(key, exerciseData[key]);
                    }
                });

                const filename = videoFile.name || 'video_exercise.mp4';
                formData.append('video', {
                    uri: videoFile.uri,
                    name: filename,
                    type: videoFile.mimeType || 'video/mp4'
                });

                return await ApiService.postFormData('/api/exercises', formData);
            }
            return await ApiService.post('/api/exercises', exerciseData);
        } catch (error) {
            console.error('Error creating exercise:', error);
            throw error;
        }
    }

    /**
     * Update exercise
     */
    static async updateExercise(id, exerciseData, videoFile = null) {
        try {
            if (videoFile) {
                const formData = new FormData();
                Object.keys(exerciseData).forEach(key => {
                    if (exerciseData[key] !== null && exerciseData[key] !== undefined) {
                        formData.append(key, exerciseData[key]);
                    }
                });

                const filename = videoFile.name || 'video_exercise.mp4';
                formData.append('video', {
                    uri: videoFile.uri,
                    name: filename,
                    type: videoFile.mimeType || 'video/mp4'
                });

                return await ApiService.putFormData(`/api/exercises/${id}`, formData);
            }
            return await ApiService.put(`/api/exercises/${id}`, exerciseData);
        } catch (error) {
            console.error(`Error updating exercise ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete exercise
     */
    static async deleteExercise(id) {
        try {
            return await ApiService.delete(`/api/exercises/${id}`);
        } catch (error) {
            console.error(`Error deleting exercise ${id}:`, error);
            throw error;
        }
    }
}

export default ExerciseService;
