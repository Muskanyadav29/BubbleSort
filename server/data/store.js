import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllLevelsMetadata, getLevelConfig } from './levelsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATIC_DB_FILE = path.join(__dirname, 'db.json');
const DB_FILE = process.env.VERCEL ? path.join('/tmp', 'db.json') : STATIC_DB_FILE;

const INITIAL_ACHIEVEMENTS = [
  { id: 'first_pop', title: 'First Pop', description: 'Pop your very first bubble cluster!', icon: '🎯', points: 50, requirement: { type: 'bubbles_popped', count: 1 } },
  { id: 'bubble_beginner', title: 'Bubble Beginner', description: 'Complete 5 levels successfully.', icon: '🌟', points: 100, requirement: { type: 'levels_completed', count: 5 } },
  { id: 'perfect_aim', title: 'Perfect Aim', description: 'Complete a level using under 8 shots.', icon: '🏹', points: 150, requirement: { type: 'shot_efficiency', maxShots: 8 } },
  { id: 'combo_master', title: 'Combo Master', description: 'Reach a streak of x5 Combo!', icon: '🔥', points: 200, requirement: { type: 'best_combo', count: 5 } },
  { id: 'bubble_hunter', title: 'Bubble Hunter', description: 'Pop a total of 500 bubbles.', icon: '⚡', points: 250, requirement: { type: 'bubbles_popped', count: 500 } },
  { id: 'rescue_hero', title: 'Rescue Hero', description: 'Rescue 10 trapped Star Critters.', icon: '🐣', points: 300, requirement: { type: 'rescued_objects', count: 10 } },
  { id: 'star_collector', title: 'Star Collector', description: 'Earn 30 total stars across levels.', icon: '⭐', points: 350, requirement: { type: 'total_stars', count: 30 } },
  { id: 'booster_expert', title: 'Booster Expert', description: 'Use 10 boosters in tactical gameplay.', icon: '🧨', points: 200, requirement: { type: 'boosters_used', count: 10 } },
  { id: 'level_master', title: 'Level Master', description: 'Complete 40 levels of adventure.', icon: '👑', points: 1000, requirement: { type: 'levels_completed', count: 40 } },
  { id: 'bubble_legend', title: 'Bubble Legend', description: 'Reach 50,000 career points.', icon: '🏆', points: 1500, requirement: { type: 'total_score', count: 50000 } }
];

class MemoryStore {
  constructor() {
    this.data = {
      users: [],
      gameSessions: [],
      achievements: INITIAL_ACHIEVEMENTS,
      userAchievements: [],
      dailyChallenges: [],
      customLevels: []
    };
    this.load();
  }

  load() {
    try {
      const sourceFile = fs.existsSync(DB_FILE) ? DB_FILE : STATIC_DB_FILE;
      if (fs.existsSync(sourceFile)) {
        const raw = fs.readFileSync(sourceFile, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...this.data,
          ...parsed,
          achievements: INITIAL_ACHIEVEMENTS // always ensure up-to-date
        };
      }
      this.save();
    } catch (err) {
      console.warn('Using fresh database state:', err.message);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err.message);
    }
  }

  // Users
  findUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userData) {
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      currentLevel: 1,
      totalScore: 0,
      totalStars: 0,
      bubblesPopped: 0,
      bestCombo: 0,
      rescuedObjects: 0,
      boostersUsedCount: 0,
      completedLevels: {}, // { "1": { stars: 3, score: 1200, completedAt: '...' } }
      boosterInventory: {
        aimGuide: 3,
        bomb: 3,
        rainbow: 2,
        extraShot: 3,
        shuffle: 2
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return user;
  }

  // Game Sessions
  createGameSession({ userId, levelId, sessionToken }) {
    const session = {
      sessionId: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      userId,
      levelId: Number(levelId),
      sessionToken,
      startedAt: Date.now(),
      completedAt: null,
      shotsUsed: 0,
      bubblesPopped: 0,
      score: 0,
      stars: 0,
      bestCombo: 0,
      boostersUsed: [],
      completed: false,
      status: 'active'
    };
    this.data.gameSessions.push(session);
    this.save();
    return session;
  }

  findSession(sessionId, sessionToken) {
    return this.data.gameSessions.find(
      s => s.sessionId === sessionId && (!sessionToken || s.sessionToken === sessionToken)
    );
  }

  completeSession(sessionId, details) {
    const session = this.data.gameSessions.find(s => s.sessionId === sessionId);
    if (!session) return null;
    Object.assign(session, details, {
      completedAt: Date.now(),
      completed: true,
      status: 'completed'
    });
    this.save();
    return session;
  }

  getUserHistory(userId) {
    return this.data.gameSessions
      .filter(s => s.userId === userId && s.completed)
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 30);
  }

  // Leaderboard
  getLeaderboard(type = 'global', currentUserId = null) {
    // Generate enriched leaderboard based on users
    const allRankings = this.data.users
      .map(user => {
        const completedCount = Object.keys(user.completedLevels || {}).length;
        return {
          id: user.id,
          name: user.name,
          score: user.totalScore || 0,
          stars: user.totalStars || 0,
          levelsCompleted: completedCount,
          bestCombo: user.bestCombo || 0
        };
      })
      .sort((a, b) => b.score - a.score || b.stars - a.stars);

    // If few users, include mock friendly challengers for vibrant leaderboard experience
    if (allRankings.length < 5) {
      const bots = [
        { id: 'bot_1', name: 'CosmicBlaster', score: 48200, stars: 78, levelsCompleted: 26, bestCombo: 9 },
        { id: 'bot_2', name: 'StarPioneer', score: 36400, stars: 62, levelsCompleted: 21, bestCombo: 8 },
        { id: 'bot_3', name: 'NebulaQueen', score: 28900, stars: 54, levelsCompleted: 18, bestCombo: 7 },
        { id: 'bot_4', name: 'ArcadeAce', score: 19500, stars: 40, levelsCompleted: 14, bestCombo: 6 },
        { id: 'bot_5', name: 'BloopFriend', score: 12400, stars: 28, levelsCompleted: 10, bestCombo: 5 }
      ];
      for (const bot of bots) {
        if (!allRankings.some(r => r.name === bot.name)) {
          allRankings.push(bot);
        }
      }
      allRankings.sort((a, b) => b.score - a.score || b.stars - a.stars);
    }

    const ranked = allRankings.map((entry, idx) => ({
      rank: idx + 1,
      ...entry
    }));

    let userRank = null;
    if (currentUserId) {
      userRank = ranked.find(r => r.id === currentUserId) || null;
    }

    return {
      type,
      topPlayers: ranked.slice(0, 50),
      userRank
    };
  }

  // Achievements
  checkAndAwardAchievements(userId) {
    const user = this.findUserById(userId);
    if (!user) return [];

    const unlocked = this.data.userAchievements.filter(ua => ua.userId === userId);
    const unlockedIds = new Set(unlocked.map(ua => ua.achievementId));
    const newlyUnlocked = [];

    const completedCount = Object.keys(user.completedLevels || {}).length;

    for (const ach of INITIAL_ACHIEVEMENTS) {
      if (unlockedIds.has(ach.id)) continue;

      let meets = false;
      const req = ach.requirement;
      if (req.type === 'bubbles_popped' && user.bubblesPopped >= req.count) meets = true;
      if (req.type === 'levels_completed' && completedCount >= req.count) meets = true;
      if (req.type === 'best_combo' && user.bestCombo >= req.count) meets = true;
      if (req.type === 'rescued_objects' && user.rescuedObjects >= req.count) meets = true;
      if (req.type === 'total_stars' && user.totalStars >= req.count) meets = true;
      if (req.type === 'total_score' && user.totalScore >= req.count) meets = true;
      if (req.type === 'boosters_used' && (user.boostersUsedCount || 0) >= req.count) meets = true;

      if (meets) {
        const entry = {
          id: 'ua_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          userId,
          achievementId: ach.id,
          unlockedAt: new Date().toISOString()
        };
        this.data.userAchievements.push(entry);
        newlyUnlocked.push(ach);
      }
    }

    if (newlyUnlocked.length > 0) {
      this.save();
    }
    return newlyUnlocked;
  }

  getUserAchievements(userId) {
    const unlocked = this.data.userAchievements
      .filter(ua => ua.userId === userId)
      .map(ua => ua.achievementId);

    return INITIAL_ACHIEVEMENTS.map(ach => ({
      ...ach,
      isUnlocked: unlocked.includes(ach.id)
    }));
  }

  // Custom Levels (Admin Panel)
  getAllCustomLevels() {
    return this.data.customLevels || [];
  }

  addCustomLevel(levelData) {
    const nextId = 1000 + (this.data.customLevels.length + 1);
    const newLvl = {
      ...levelData,
      id: nextId,
      levelNumber: nextId,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    this.data.customLevels.push(newLvl);
    this.save();
    return newLvl;
  }

  updateCustomLevel(id, updates) {
    const idx = this.data.customLevels.findIndex(l => l.id === Number(id));
    if (idx === -1) return null;
    this.data.customLevels[idx] = { ...this.data.customLevels[idx], ...updates };
    this.save();
    return this.data.customLevels[idx];
  }

  deleteCustomLevel(id) {
    const idx = this.data.customLevels.findIndex(l => l.id === Number(id));
    if (idx === -1) return false;
    this.data.customLevels.splice(idx, 1);
    this.save();
    return true;
  }
}

export const store = new MemoryStore();
