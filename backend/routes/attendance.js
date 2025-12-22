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
    body('session_id').notEmpty(),
    body('athlete_id').notEmpty(),
    body('status').isIn(['present', 'absent', 'retard', 'excuse'])
  ],
  AttendanceController.createAttendance
);

module.exports = router;
