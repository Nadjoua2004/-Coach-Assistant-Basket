const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const AthleteController = require('../controllers/athleteController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Configure multer for file uploads (memory storage for R2)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get athlete profile for current user
router.get('/me', authenticateToken, AthleteController.getMyProfile);

// Get all athletes with filters
router.get('/', authenticateToken, AthleteController.getAllAthletes);

// Get athlete by ID
router.get('/:id', authenticateToken, AthleteController.getAthleteById);

// Create athlete (Coach principal or Admin only)
router.post('/',
  authenticateToken,
  authorizeRole('coach', 'admin', 'joueur', 'parent'),
  upload.single('photo'),
  [
    body('nom').notEmpty().withMessage('Le nom est requis').trim(),
    body('prenom').notEmpty().withMessage('Le prénom est requis').trim(),
    body('sexe').isIn(['M', 'F']).withMessage('Le sexe doit être M ou F'),
    body('date_naissance').isISO8601().withMessage('La date de naissance doit être au format ISO8601'),
    body('poste').isInt({ min: 1, max: 5 }).withMessage('Le poste doit être entre 1 et 5').optional()
  ],
  AthleteController.createAthlete
);

// Update athlete (Coach principal or Admin only, Coach adjoint can edit but not delete)
router.put('/:id',
  authenticateToken,
  authorizeRole('coach', 'adjoint', 'admin', 'joueur', 'parent'),
  upload.single('photo'),
  AthleteController.updateAthlete
);

// Delete athlete (Coach principal or Admin only)
router.delete('/:id',
  authenticateToken,
  authorizeRole('coach', 'admin'),
  AthleteController.deleteAthlete
);

module.exports = router;
