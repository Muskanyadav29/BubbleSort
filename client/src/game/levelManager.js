import { getClientLevelConfig, getAllClientLevels } from '../data/levels/levelsData.js';

export class LevelManager {
  constructor() {
    this.currentLevelId = 1;
    this.unlockedLevels = this.loadUnlockedLevels();
  }

  loadUnlockedLevels() {
    try {
      const stored = localStorage.getItem('unlocked_levels');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return [1]; // Level 1 is always unlocked initially
  }

  saveUnlockedLevels() {
    try {
      localStorage.setItem('unlocked_levels', JSON.stringify(this.unlockedLevels));
    } catch (e) {}
  }

  isUnlocked(levelId) {
    return this.unlockedLevels.includes(Number(levelId));
  }

  unlockLevel(levelId) {
    const num = Number(levelId);
    if (!this.unlockedLevels.includes(num)) {
      this.unlockedLevels.push(num);
      this.unlockedLevels.sort((a, b) => a - b);
      this.saveUnlockedLevels();
    }
  }

  loadLevel(levelId) {
    this.currentLevelId = Number(levelId);
    return getClientLevelConfig(this.currentLevelId);
  }

  getAllLevelsList() {
    return getAllClientLevels(45);
  }

  getNextLevelId() {
    return this.currentLevelId + 1;
  }
}

export const levelManager = new LevelManager();
