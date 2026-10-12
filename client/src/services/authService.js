import { API_BASE_URL } from '../config/gameConfig.js';

class AuthService {
  getToken() {
    return localStorage.getItem('bubble_auth_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('bubble_auth_token', token);
    } else {
      localStorage.removeItem('bubble_auth_token');
    }
  }

  getStoredUser() {
    try {
      const userStr = localStorage.getItem('bubble_user_profile');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  }

  setStoredUser(user) {
    if (user) {
      localStorage.setItem('bubble_user_profile', JSON.stringify(user));
    } else {
      localStorage.removeItem('bubble_user_profile');
    }
  }

  async register(name, email, password, confirmPassword) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register');
    this.setToken(data.token);
    this.setStoredUser(data.user);
    return data;
  }

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to log in');
    this.setToken(data.token);
    this.setStoredUser(data.user);
    return data;
  }

  async fetchMe() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        this.logout();
        return null;
      }
      const data = await res.json();
      this.setStoredUser(data.user);
      return data.user;
    } catch (e) {
      return this.getStoredUser();
    }
  }

  logout() {
    this.setToken(null);
    this.setStoredUser(null);
  }
}

export const authService = new AuthService();
