import { API_BASE_URL } from '../config/gameConfig.js';
import { authService } from './authService.js';
import { getClientLevelConfig, getAllClientLevels } from '../data/levels/levelsData.js';

class GameService {
  getAuthHeaders() {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async fetchLevels() {
    try {
      const res = await fetch(`${API_BASE_URL}/levels`);
      if (res.ok) {
        const data = await res.json();
        return data.levels;
      }
    } catch (e) {
      console.warn('Backend unavailable, using client level registry:', e.message);
    }
    return getAllClientLevels(45);
  }

  async fetchLevelById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/levels/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend unavailable, using client level generator:', e.message);
    }
    return getClientLevelConfig(id);
  }

  async startGameSession(levelId) {
    try {
      const res = await fetch(`${API_BASE_URL}/games/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({ levelId })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Starting offline fallback session:', e.message);
    }

    // Offline fallback session token
    return {
      sessionId: 'local_' + Date.now(),
      sessionToken: 'offline_token_' + Math.random().toString(36).substring(2, 9),
      startedAt: Date.now(),
      levelId
    };
  }

  async completeGameSession(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/games/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Offline session completed:', e.message);
    }

    return {
      message: 'Level completed (Offline mode synced locally)',
      verifiedStars: payload.stars || 3,
      playerProgress: null
    };
  }

  async fetchGameHistory() {
    try {
      const res = await fetch(`${API_BASE_URL}/games/history`, {
        headers: this.getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        return data.history || [];
      }
    } catch (e) {}
    return [];
  }

  async fetchDailyChallenge() {
    try {
      const res = await fetch(`${API_BASE_URL}/daily-challenge`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return null;
  }
}

export const gameService = new GameService();
