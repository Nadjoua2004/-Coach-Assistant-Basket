import ApiService from './api';

class AthleteService {
    /**
     * Get all athletes with optional filters
     * @param {Object} filters - { groupe, sexe, poste, blesse }
     */
    static async getAllAthletes(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (filters.groupe) queryParams.append('groupe', filters.groupe);
            if (filters.sexe) queryParams.append('sexe', filters.sexe);
            if (filters.poste) queryParams.append('poste', filters.poste);
            if (filters.blesse !== undefined) queryParams.append('blesse', filters.blesse);

            const endpoint = `/api/athletes${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            return await ApiService.get(endpoint);
        } catch (error) {
            console.error('Error in AthleteService.getAllAthletes:', error);
            throw error;
        }
    }

    /**
     * Get athlete by ID
     * @param {string} id 
     */
    static async getAthleteById(id) {
        try {
            return await ApiService.get(`/api/athletes/${id}`);
        } catch (error) {
            console.error('Error in AthleteService.getAthleteById:', error);
            throw error;
        }
    }

    /**
     * Create a new athlete
     * @param {Object} athleteData 
     * @param {File} photoFile 
     */
    static async createAthlete(athleteData, photoFile = null) {
        try {
            if (photoFile) {
                const formData = new FormData();
                // Append all athlete data fields to formData
                Object.keys(athleteData).forEach(key => {
                    formData.append(key, athleteData[key]);
                });

                // Append photo
                formData.append('photo', {
                    uri: photoFile.uri,
                    name: photoFile.name || 'athlete_photo.jpg',
                    type: photoFile.type || 'image/jpeg'
                });

                return await ApiService.postFormData('/api/athletes', formData);
            } else {
                return await ApiService.post('/api/athletes', athleteData);
            }
        } catch (error) {
            console.error('Error in AthleteService.createAthlete:', error);
            throw error;
        }
    }

    /**
     * Update an existing athlete
     * @param {string} id 
     * @param {Object} updateData 
     * @param {File} photoFile 
     */
    static async updateAthlete(id, updateData, photoFile = null) {
        try {
            if (photoFile) {
                const formData = new FormData();
                Object.keys(updateData).forEach(key => {
                    formData.append(key, updateData[key]);
                });

                formData.append('photo', {
                    uri: photoFile.uri,
                    name: photoFile.name || 'athlete_photo.jpg',
                    type: photoFile.type || 'image/jpeg'
                });

                return await ApiService.postFormData(`/api/athletes/${id}`, formData);
            } else {
                return await ApiService.put(`/api/athletes/${id}`, updateData);
            }
        } catch (error) {
            console.error('Error in AthleteService.updateAthlete:', error);
            throw error;
        }
    }

    /**
     * Delete an athlete
     * @param {string} id 
     */
    static async deleteAthlete(id) {
        try {
            return await ApiService.delete(`/api/athletes/${id}`);
        } catch (error) {
            console.error('Error in AthleteService.deleteAthlete:', error);
            throw error;
        }
    }
}

export default AthleteService;
