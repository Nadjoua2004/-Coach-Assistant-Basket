const { validationResult } = require('express-validator');
const supabase = require('../config/database');
const { uploadToR2, deleteFromR2 } = require('../config/storage');

class MedicalRecordController {
  /**
   * Get medical record by athlete ID
   */
  static async getMedicalRecord(req, res) {
    try {
      const { athleteId } = req.params;

      const { data: record, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('athlete_id', athleteId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        return res.status(500).json({
          success: false,
          message: 'Error fetching medical record',
          error: error.message
        });
      }

      res.json({
        success: true,
        data: record || null
      });
    } catch (error) {
      console.error('Get medical record error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Create or update medical record
   */
  static async upsertMedicalRecord(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { athleteId } = req.params;
      const recordData = {
        athlete_id: athleteId,
        ...req.body,
        updated_at: new Date().toISOString()
      };

      // Handle PDF upload if provided
      if (req.file) {
        const pdfPath = `medical-records/${athleteId}-${Date.now()}-${req.file.originalname}`;
        const pdfUrl = await uploadToR2(
          req.file.buffer,
          pdfPath,
          req.file.mimetype
        );
        recordData.certificat_pdf_url = pdfUrl;
      }

      // Check if record exists
      const { data: existingRecord } = await supabase
        .from('medical_records')
        .select('id, certificat_pdf_url')
        .eq('athlete_id', athleteId)
        .single();

      let result;
      if (existingRecord) {
        // Update existing record
        // Delete old PDF if new one is uploaded
        if (req.file && existingRecord.certificat_pdf_url) {
          try {
            const oldPdfPath = existingRecord.certificat_pdf_url.split('/').pop();
            await deleteFromR2(`medical-records/${oldPdfPath}`);
          } catch (error) {
            console.error('Error deleting old PDF:', error);
          }
        }

        const { data, error } = await supabase
          .from('medical_records')
          .update(recordData)
          .eq('athlete_id', athleteId)
          .select()
          .single();

        result = { data, error };
      } else {
        // Create new record
        recordData.created_at = new Date().toISOString();
        const { data, error } = await supabase
          .from('medical_records')
          .insert(recordData)
          .select()
          .single();

        result = { data, error };
      }

      if (result.error) {
        return res.status(500).json({
          success: false,
          message: 'Error saving medical record',
          error: result.error.message
        });
      }

      res.json({
        success: true,
        message: existingRecord ? 'Medical record updated successfully' : 'Medical record created successfully',
        data: result.data
      });
    } catch (error) {
      console.error('Upsert medical record error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Delete medical record
   */
  static async deleteMedicalRecord(req, res) {
    try {
      const { athleteId } = req.params;

      // Get record to delete PDF
      const { data: record } = await supabase
        .from('medical_records')
        .select('certificat_pdf_url')
        .eq('athlete_id', athleteId)
        .single();

      // Delete PDF from R2 if exists
      if (record?.certificat_pdf_url) {
        try {
          const pdfPath = record.certificat_pdf_url.split('/').pop();
          await deleteFromR2(`medical-records/${pdfPath}`);
        } catch (error) {
          console.error('Error deleting PDF:', error);
        }
      }

      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('athlete_id', athleteId);

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error deleting medical record',
          error: error.message
        });
      }

      res.json({
        success: true,
        message: 'Medical record deleted successfully'
      });
    } catch (error) {
      console.error('Delete medical record error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = MedicalRecordController;

