const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const SessionController = require('../controllers/sessionController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get all sessions
router.get('/', authenticateToken, SessionController.getAllSessions);

// Get session by ID
router.get('/:id', authenticateToken, SessionController.getSessionById);

// Export session to PDF
router.get('/:id/export-pdf', authenticateToken, SessionController.exportSessionToPDF);

// Create session
router.post('/',
  authenticateToken,
  authorizeRole('coach', 'adjoint', 'admin'),
  [
    body('title').notEmpty().trim(),
    body('objective').notEmpty().trim(),
    body('total_duration').isInt({ min: 1 })
  ],
  SessionController.createSession
);

// Update session
router.put('/:id',
  authenticateToken,
  authorizeRole('coach', 'adjoint', 'admin'),
  SessionController.updateSession
);

// Delete session (Coach principal or Admin only)
router.delete('/:id',
  authenticateToken,
  authorizeRole('coach', 'admin'),
  SessionController.deleteSession
);

module.exports = router;
