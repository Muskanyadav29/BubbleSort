import { API_BASE_URL } from '../config/gameConfig.js';
import { authService } from './authService.js';

class LeaderboardService {
  async fetchLeaderboard(type = 'global') {
    try {
      const token = authService.getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/leaderboard?type=${type}`, { headers });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Leaderboard offline fallback:', e.message);
    }

    return {
      type,
      topPlayers: [
        { rank: 1, name: 'CosmicMaster', score: 98450, stars: 120, levelsCompleted: 40, bestCombo: 14 },
        { rank: 2, name: 'StarStriker', score: 85200, stars: 110, levelsCompleted: 37, bestCombo: 11 },
        { rank: 3, name: 'NovaKnight', score: 72100, stars: 96, levelsCompleted: 32, bestCombo: 10 },
        { rank: 4, name: 'BloopFriend', score: 61500, stars: 82, levelsCompleted: 28, bestCombo: 8 },
        { rank: 5, name: 'PioneerG', score: 49300, stars: 68, levelsCompleted: 23, bestCombo: 7 }
      ],
      userRank: null
    };
  }

  async fetchAchievements() {
    try {
      const token = authService.getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = token ? `${API_BASE_URL}/achievements/me` : `${API_BASE_URL}/achievements`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        return data.achievements || [];
      }
    } catch (e) {}

    return [
      { id: 'first_pop', title: 'First Pop', description: 'Pop your very first bubble cluster!', icon: '🎯', points: 50, isUnlocked: true },
      { id: 'bubble_beginner', title: 'Bubble Beginner', description: 'Complete 5 levels successfully.', icon: '🌟', points: 100, isUnlocked: false },
      { id: 'perfect_aim', title: 'Perfect Aim', description: 'Complete a level using under 8 shots.', icon: '🏹', points: 150, isUnlocked: false },
      { id: 'combo_master', title: 'Combo Master', description: 'Reach a streak of x5 Combo!', icon: '🔥', points: 200, isUnlocked: false },
      { id: 'bubble_hunter', title: 'Bubble Hunter', description: 'Pop a total of 500 bubbles.', icon: '⚡', points: 250, isUnlocked: false },
      { id: 'rescue_hero', title: 'Rescue Hero', description: 'Rescue 10 trapped Star Critters.', icon: '🐣', points: 300, isUnlocked: false },
      { id: 'star_collector', title: 'Star Collector', description: 'Earn 30 total stars across levels.', icon: '⭐', points: 350, isUnlocked: false },
      { id: 'booster_expert', title: 'Booster Expert', description: 'Use 10 boosters in tactical gameplay.', icon: '🧨', points: 200, isUnlocked: false },
      { id: 'level_master', title: 'Level Master', description: 'Complete 40 levels of adventure.', icon: '👑', points: 1000, isUnlocked: false },
      { id: 'bubble_legend', title: 'Bubble Legend', description: 'Reach 50,000 career points.', icon: '🏆', points: 1500, isUnlocked: false }
    ];
  }
}

export const leaderboardService = new LeaderboardService();
