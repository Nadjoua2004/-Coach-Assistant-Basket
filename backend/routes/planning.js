const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const PlanningController = require('../controllers/planningController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get planning (all events)
router.get('/', authenticateToken, PlanningController.getAllPlanning);

// Create planning event
router.post('/',
  authenticateToken,
  authorizeRole('coach', 'adjoint', 'admin'),
  [
    body('date').isISO8601(),
    body('heure').notEmpty(),
    body('duree').isInt({ min: 1 }),
    body('lieu').notEmpty().trim(),
    body('theme').notEmpty().trim()
  ],
  PlanningController.createPlanningEvent
);

// Update planning event
router.put('/:id',
  authenticateToken,
  authorizeRole('coach', 'adjoint', 'admin'),
  PlanningController.updatePlanningEvent
);

// Delete planning event
router.delete('/:id',
  authenticateToken,
  authorizeRole('coach', 'admin'),
  PlanningController.deletePlanningEvent
);

// Participants routes
router.get('/:id/participants',
  authenticateToken,
  PlanningController.getParticipants
);

router.post('/:id/participants',
  authenticateToken,
  authorizeRole('coach', 'adjoint', 'admin'),
  PlanningController.addParticipant
);

router.delete('/:id/participants/:athlete_id',
  authenticateToken,
  authorizeRole('coach', 'adjoint', 'admin'),
  PlanningController.removeParticipant
);

module.exports = router;
