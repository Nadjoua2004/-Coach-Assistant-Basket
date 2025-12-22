const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('role').isIn(['coach', 'adjoint', 'admin', 'joueur', 'parent'])
], AuthController.register);

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], AuthController.login);

// Get current user
router.get('/me', authenticateToken, AuthController.getMe);

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], AuthController.forgotPassword);

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], AuthController.resetPassword);

module.exports = router;
