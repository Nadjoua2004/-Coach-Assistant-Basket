const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const ExerciseController = require('../controllers/exerciseController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Configure multer for video uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB for videos
  },
  fileFilter: (req, file, cb) => {
    // Accept video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Get all exercises
router.get('/', authenticateToken, ExerciseController.getAllExercises);

// Get exercise by ID
router.get('/:id', authenticateToken, ExerciseController.getExerciseById);

// Create exercise
router.post('/',
  authenticateToken,
  authorizeRole('coach', 'adjoint', 'admin'),
  upload.single('video'),
  [
    body('name').notEmpty().trim(),
    body('category').notEmpty().trim(),
    body('duration').isInt({ min: 1 }).optional()
  ],
  ExerciseController.createExercise
);

// Update exercise
router.put('/:id',
  authenticateToken,
  authorizeRole('coach', 'adjoint', 'admin'),
  upload.single('video'),
  ExerciseController.updateExercise
);

// Delete exercise (Coach principal or Admin only)
router.delete('/:id',
  authenticateToken,
  authorizeRole('coach', 'admin'),
  ExerciseController.deleteExercise
);

module.exports = router;
