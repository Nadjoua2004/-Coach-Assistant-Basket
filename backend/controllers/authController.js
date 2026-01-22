const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const supabase = require('../config/database');

class AuthController {
  /**
   * Register new user
   */
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }
      let { email, password, name, role } = req.body;
      email = email.toLowerCase();

      // Restrict roles for public registration
      if (!['joueur', 'parent'].includes(role)) {
        return res.status(403).json({
          success: false,
          message: 'Seuls les rôles Joueur et Parent peuvent s\'inscrire publiquement.'
        });
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email,
          password: hashedPassword,
          name,
          role,
          created_at: new Date().toISOString()
        })
        .select('id, email, name, role')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({
          success: false,
          message: `Erreur base de données: ${error.message}`,
          error: error.message
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  /**
   * Login user
   */
  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      let { email, password } = req.body;
      email = email.toLowerCase();
      console.log(`📡 LOGIN ATTEMPT: [${email}]`);

      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, password, name, role')
        .eq('email', email)
        .single();

      if (error || !user) {
        console.log(`❌ USER NOT FOUND: [${email}]`);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      console.log(`✅ USER FOUND: ${user.email} (Role: ${user.role})`);

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log(`❌ PASSWORD MISMATCH for: [${email}]`);
        console.log(`   Expected length: ${user.password.length}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      console.log(`✨ LOGIN SUCCESS: [${email}]`);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Remove password from response
      delete user.password;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  /**
   * Get current user
   */
  static async getMe(req, res) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, role, created_at')
        .eq('id', req.user.id)
        .single();

      if (error || !user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email } = req.body;

      // Check if user exists
      const { data: user } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .single();

      // Always return success for security (don't reveal if email exists)
      if (user) {
        // Generate reset token
        const resetToken = jwt.sign(
          { userId: user.id, type: 'password-reset' },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        // TODO: Send email with reset link
        // For now, just log it (in production, use email service)
        console.log(`Password reset token for ${email}: ${resetToken}`);
      }

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { token, password } = req.body;

      // Verify reset token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type !== 'password-reset') {
        return res.status(400).json({
          success: false,
          message: 'Invalid reset token'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password
      const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', decoded.userId);

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error updating password'
        });
      }

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  /**
   * Admin: Create a new user (any role)
   */
  static async adminCreateUser(req, res) {
    try {
      // Check if requester is admin, coach, or adjoint
      const allowedRoles = ['admin', 'coach', 'adjoint'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé. Seul un administrateur peut créer des utilisateurs.'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation: ' + errors.array().map(e => `${e.param || e.path}: ${e.msg}`).join(', '),
          errors: errors.array()
        });
      }

      let { email, password, name, role } = req.body;
      email = email.toLowerCase();

      // Coaches and adjoints can only create 'joueur' users
      if (req.user.role !== 'admin' && role !== 'joueur') {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé. Les coaches et adjoints ne peuvent créer que des joueurs.'
        });
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Cet utilisateur existe déjà.'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email,
          password: hashedPassword,
          name,
          role,
          created_at: new Date().toISOString()
        })
        .select('id, email, name, role')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({
          success: false,
          message: `Erreur base de données: ${error.message}`
        });
      }

      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: newUser
      });
    } catch (error) {
      console.error('Admin create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la création de l\'utilisateur'
      });
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la création de l\'utilisateur'
      });
    }
  }

  /**
   * Admin: Get all users
   * Coach/Adjoint: Get only 'joueur' users
   */
  static async getAllUsers(req, res) {
    try {
      // Check if requester is admin, coach, or adjoint
      const allowedRoles = ['admin', 'coach', 'adjoint'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      let query = supabase
        .from('users')
        .select('id, name, email, role, created_at');

      // Coaches and adjoints can only see 'joueur' users
      if (req.user.role !== 'admin') {
        query = query.eq('role', 'joueur');
      }

      const { data: users, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération des utilisateurs',
          error: error.message
        });
      }

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  /**
   * Admin: Delete user
   */
  static async deleteUser(req, res) {
    try {
      // Check if requester is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      const userIdToDelete = req.params.id;

      // Prevent self-deletion
      if (userIdToDelete === req.user.userId) {
        return res.status(400).json({
          success: false,
          message: 'Vous ne pouvez pas supprimer votre propre compte.'
        });
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userIdToDelete);

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la suppression',
          error: error.message
        });
      }

      res.json({
        success: true,
        message: 'Utilisateur supprimé avec succès'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }
}

module.exports = AuthController;

