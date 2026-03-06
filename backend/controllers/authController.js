const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const supabase = require('../config/database');
const { uploadToR2 } = require('../config/storage');

class AuthController {
  /**
   * Update profile
   */
  static async updateProfile(req, res) {
    try {
      const { name, email, phone, club_role } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (email) updateData.email = email.toLowerCase();

      // These might be extra fields if we add them to users table, or stored in metadata
      // For now let's stick to what's in schema.sql for users
      // Note: Admin/Coach specific fields could go to a profiles table if needed
      // but let's assume we can update name/email/photo_url for now.

      if (req.file) {
        const fileName = `users/${req.user.userId}-${Date.now()}-${req.file.originalname}`;
        const photoUrl = await uploadToR2(
          req.file.buffer,
          fileName,
          req.file.mimetype
        );
        updateData.photo_url = photoUrl;
      }

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', req.user.userId)
        .select('id, email, name, role, photo_url')
        .single();

      if (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la mise à jour du profil'
        });
      }

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

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
   * Forgot password - Generates 6-digit OTP and sends via Resend
   */
  static async forgotPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email } = req.body;
      const normalizedEmail = email.toLowerCase();

      // Check if user exists
      const { data: user } = await supabase
        .from('users')
        .select('id, name')
        .eq('email', normalizedEmail)
        .single();

      if (!user) {
        // Return success even if user not found for security
        return res.json({
          success: true,
          message: 'Si cet email est enregistré, un code de vérification a été envoyé.'
        });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Save OTP to password_resets table
      const { error: resetError } = await supabase
        .from('password_resets')
        .insert({
          email: normalizedEmail,
          otp,
          expires_at: expiresAt.toISOString()
        });

      if (resetError) {
        console.error('Error saving reset OTP:', resetError);
        return res.status(500).json({ success: false, message: 'Erreur lors de la génération du code' });
      }

      // Send email via Resend
      if (process.env.RESEND_API_KEY) {
        try {
          const { Resend } = require('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);

          await resend.emails.send({
            from: 'Coach Assistant <onboarding@resend.dev>',
            to: normalizedEmail,
            subject: 'Votre code de réinitialisation - Coach Assistant',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #f97316; text-align: center;">Réinitialisation de mot de passe</h2>
                <p>Bonjour ${user.name},</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de vérification (valide pendant 15 minutes) :</p>
                <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; border-radius: 8px;">
                  ${otp}
                </div>
                <p style="margin-top: 20px;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b; text-align: center;">Coach Assistant Basket &copy; 2024</p>
              </div>
            `
          });
          console.log(`✅ OTP sent to ${normalizedEmail}: ${otp}`);
        } catch (emailError) {
          console.error('Resend Email Error:', emailError);
          // Don't fail the request, but log it. In local dev, we use the logged OTP.
        }
      } else {
        console.log(`⚠️ RESEND_API_KEY missing. OTP for ${normalizedEmail}: ${otp}`);
      }

      res.json({
        success: true,
        message: 'Un code de vérification a été envoyé à votre adresse email.'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  /**
   * Verify OTP
   */
  static async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;
      const normalizedEmail = email.toLowerCase();

      const { data, error } = await supabase
        .from('password_resets')
        .select('*')
        .eq('email', normalizedEmail)
        .eq('otp', otp)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Code invalide ou expiré'
        });
      }

      res.json({
        success: true,
        message: 'Code vérifié avec succès'
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  /**
   * Reset password - Verifies OTP and updates user password
   */
  static async resetPassword(req, res) {
    try {
      const { email, otp, password } = req.body;
      const normalizedEmail = email.toLowerCase();

      // 1. Double check OTP validity
      const { data: resetData, error: resetError } = await supabase
        .from('password_resets')
        .select('*')
        .eq('email', normalizedEmail)
        .eq('otp', otp)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (resetError || !resetData || resetData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Code invalide ou expiré'
        });
      }

      // 2. Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3. Update user password
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('email', normalizedEmail);

      if (updateError) {
        console.error('Error updating password:', updateError);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la mise à jour du mot de passe'
        });
      }

      // 4. Delete used OTPs for this email
      await supabase
        .from('password_resets')
        .delete()
        .eq('email', normalizedEmail);

      res.json({
        success: true,
        message: 'Votre mot de passe a été réinitialisé avec succès.'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
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

