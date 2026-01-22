const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Register new user
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('role').isIn(['joueur', 'parent'])
], AuthController.register);

// Admin: Create any user | Coach/Adjoint: Create 'joueur' users only
router.post('/users', [
  authenticateToken,
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('role').isIn(['coach', 'adjoint', 'admin', 'joueur', 'parent'])
], AuthController.adminCreateUser);

// Admin: Get all users | Coach/Adjoint: Get 'joueur' users only
router.get('/users', authenticateToken, AuthController.getAllUsers);

// Admin: Delete user
router.delete('/users/:id', authenticateToken, AuthController.deleteUser);

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], AuthController.login);

// Get current user
router.get('/me', authenticateToken, AuthController.getMe);

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail()
], AuthController.forgotPassword);

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], AuthController.resetPassword);

module.exports = router;
