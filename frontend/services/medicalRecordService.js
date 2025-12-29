import ApiService from './api';

class MedicalRecordService {
    /**
     * Get medical record for an athlete
     * @param {string} athleteId 
     */
    static async getMedicalRecord(athleteId) {
        try {
            return await ApiService.get(`/api/medical-records/${athleteId}`);
        } catch (error) {
            console.error('Error in MedicalRecordService.getMedicalRecord:', error);
            throw error;
        }
    }

    /**
     * Create or update medical record for an athlete
     * @param {string} athleteId 
     * @param {Object} recordData 
     * @param {File} certificatePdf 
     */
    static async upsertMedicalRecord(athleteId, recordData, certificatePdf = null) {
        try {
            if (certificatePdf) {
                const formData = new FormData();
                Object.keys(recordData).forEach(key => {
                    if (recordData[key] !== null && recordData[key] !== undefined) {
                        formData.append(key, recordData[key]);
                    }
                });

                formData.append('certificate', {
                    uri: certificatePdf.uri,
                    name: certificatePdf.name || 'medical_certificate.pdf',
                    type: certificatePdf.type || 'application/pdf'
                });

                return await ApiService.postFormData(`/api/medical-records/${athleteId}`, formData);
            } else {
                // Even if no PDF, the controller uses upload.single('certificate'), so we might still need FormData or adjust backend
                // For simplicity, let's assume we use FormData for consistency if file upload is involved
                const formData = new FormData();
                Object.keys(recordData).forEach(key => {
                    if (recordData[key] !== null && recordData[key] !== undefined) {
                        formData.append(key, recordData[key]);
                    }
                });
                return await ApiService.postFormData(`/api/medical-records/${athleteId}`, formData);
            }
        } catch (error) {
            console.error('Error in MedicalRecordService.upsertMedicalRecord:', error);
            throw error;
        }
    }

    /**
     * Delete medical record
     * @param {string} athleteId 
     */
    static async deleteMedicalRecord(athleteId) {
        try {
            return await ApiService.delete(`/api/medical-records/${athleteId}`);
        } catch (error) {
            console.error('Error in MedicalRecordService.deleteMedicalRecord:', error);
            throw error;
        }
    }
}

export default MedicalRecordService;
