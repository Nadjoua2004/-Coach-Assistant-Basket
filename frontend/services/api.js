import API_URL from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@coach_assistant_token';

class ApiService {
  /**
   * Get stored token
   */
  static async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Store token
   */
  static async setToken(token) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  /**
   * Remove token
   */
  static async removeToken() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  /**
   * Make API request
   */
  static async request(endpoint, options = {}) {
    const token = await this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);

      // Handle non-JSON responses (crashes)
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server error (${response.status}): ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        // Suppress "Access token required" log for startup check if it's expected
        if (response.status === 401 && endpoint === '/api/auth/me' && !token) {
          // Expected, don't log as error
        } else {
          console.error(`API Error [${endpoint}]:`, data.message || 'Request failed');
        }
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error.message !== 'Access token required') {
        console.error(`API Request failed [${endpoint}]:`, error.message);
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  static async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  static async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  static async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  static async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * POST with FormData (for file uploads)
   */
  static async postFormData(endpoint, formData) {
    const token = await this.getToken();

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}

export default ApiService;

