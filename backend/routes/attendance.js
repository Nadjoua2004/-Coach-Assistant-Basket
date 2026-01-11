const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AttendanceController = require('../controllers/attendanceController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get attendance records
router.get('/', authenticateToken, AttendanceController.getAllAttendance);

// Get attendance statistics
router.get('/stats', authenticateToken, AttendanceController.getAttendanceStats);

// Create attendance record
router.post('/',
  authenticateToken,
  authorizeRole('coach', 'adjoint', 'admin'),
  [
    body('athlete_id').isUUID().withMessage('Invalid athlete_id'),
    body('status').isIn(['present', 'absent', 'retard', 'excuse']).withMessage('Invalid status'),
    body('planning_id').optional({ nullable: true }).isUUID().withMessage('Invalid planning_id'),
    body('session_id').optional({ nullable: true }).isUUID().withMessage('Invalid session_id'),
    body('notes').optional({ nullable: true })
  ],
  AttendanceController.createAttendance
);

module.exports = router;
