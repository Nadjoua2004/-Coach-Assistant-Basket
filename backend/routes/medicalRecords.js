const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const MedicalRecordController = require('../controllers/medicalRecordController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF only
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Get medical record by athlete ID
router.get('/:athleteId', authenticateToken, MedicalRecordController.getMedicalRecord);

// Create or update medical record
router.post('/:athleteId',
  authenticateToken,
  authorizeRole('coach', 'adjoint', 'admin', 'joueur'),
  upload.single('certificate'),
  [
    body('allergies').optional().trim(),
    body('blessures_cours').optional().trim(),
    body('antecedents').optional().trim(),
    body('certificat_date').optional().isISO8601()
  ],
  MedicalRecordController.upsertMedicalRecord
);

// Delete medical record
router.delete('/:athleteId',
  authenticateToken,
  authorizeRole('coach', 'admin'),
  MedicalRecordController.deleteMedicalRecord
);

module.exports = router;

