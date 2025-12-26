import ApiService from './api';

class AuthService {
  /**
   * Register new user
   */
  static async register(email, password, name, role) {
    try {
      const response = await ApiService.post('/api/auth/register', {
        email,
        password,
        name,
        role,
      });

      if (response.success && response.data.token) {
        await ApiService.setToken(response.data.token);
        return {
          success: true,
          user: response.data.user,
        };
      }

      throw new Error('Registration failed');
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed',
      };
    }
  }

  /**
   * Login user
   */
  static async login(email, password) {
    try {
      const response = await ApiService.post('/api/auth/login', {
        email,
        password,
      });

      if (response.success && response.data.token) {
        await ApiService.setToken(response.data.token);
        return {
          success: true,
          user: response.data.user,
        };
      }

      throw new Error('Login failed');
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Invalid email or password',
      };
    }
  }

  /**
   * Logout user
   */
  static async logout() {
    await ApiService.removeToken();
  }

  /**
   * Get current user
   */
  static async getCurrentUser() {
    try {
      const response = await ApiService.get('/api/auth/me');
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(email) {
    try {
      const response = await ApiService.post('/api/auth/forgot-password', {
        email,
      });
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send reset email',
      };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(token, password) {
    try {
      const response = await ApiService.post('/api/auth/reset-password', {
        token,
        password,
      });
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: error.message || 'Failed to reset password',
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated() {
    const token = await ApiService.getToken();
    if (!token) return false;

    const user = await this.getCurrentUser();
    return user !== null;
  }
}

export default AuthService;

