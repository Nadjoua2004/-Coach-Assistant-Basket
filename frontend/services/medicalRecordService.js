import ApiService from './api';

class MedicalRecordService {
    /**
     * Get medical record for an athlete
     */
    static async getRecord(athleteId) {
        try {
            return await ApiService.get(`/api/medical-records/${athleteId}`);
        } catch (error) {
            console.error('Error in MedicalRecordService.getRecord:', error);
            throw error;
        }
    }

    /**
     * Update medical record for an athlete
     */
    static async updateRecord(athleteId, recordData, certificatePdf = null) {
        try {
            const formData = new FormData();

            Object.keys(recordData).forEach(key => {
                if (recordData[key] !== null && recordData[key] !== undefined) {
                    formData.append(key, typeof recordData[key] === 'boolean' ? recordData[key].toString() : recordData[key]);
                }
            });

            if (certificatePdf) {
                formData.append('certificate', {
                    uri: certificatePdf.uri,
                    name: certificatePdf.name || 'medical_certificate.pdf',
                    type: certificatePdf.mimeType || 'application/pdf'
                });
            }

            return await ApiService.postFormData(`/api/medical-records/${athleteId}`, formData);
        } catch (error) {
            console.error('Error in MedicalRecordService.updateRecord:', error);
            throw error;
        }
    }
}

export default MedicalRecordService;
