const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// Get dashboard statistics
router.get('/', authenticateToken, DashboardController.getDashboardStats);

module.exports = router;
