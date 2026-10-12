import express from 'express';
import { getLevelConfig } from '../data/levelsData.js';
import { store } from '../data/store.js';
import { optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

// Generate deterministic daily challenge based on YYYY-MM-DD
function getTodayChallenge() {
  const today = new Date().toISOString().slice(0, 10);
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const seedLevel = ((dayOfYear * 7) % 35) + 5;

  const baseLevel = getLevelConfig(seedLevel);
  return {
    date: today,
    challengeNumber: dayOfYear,
    title: `Daily Nebula Quest #${dayOfYear}`,
    objective: { type: 'rescue', count: 4, description: 'Rescue 4 Celestial Sprites!' },
    shots: 22,
    colors: ['red', 'blue', 'green', 'yellow', 'purple'],
    targetScore: 4000,
    reward: {
      coins: 500,
      booster: 'rainbow',
      stars: 3
    },
    board: baseLevel.board,
    bubbleQueue: baseLevel.bubbleQueue
  };
}

// GET /api/daily-challenge
router.get('/', (req, res) => {
  const challenge = getTodayChallenge();
  res.json(challenge);
});

// POST /api/daily-challenge/complete
router.post('/complete', optionalAuthenticate, (req, res) => {
  const { score, completed } = req.body;
  if (req.user && completed) {
    const user = store.findUserById(req.user.id);
    if (user) {
      user.boosterInventory.rainbow = (user.boosterInventory.rainbow || 0) + 1;
      user.totalScore = (user.totalScore || 0) + (Number(score) || 1000);
      store.updateUser(user.id, user);
    }
  }

  res.json({
    message: 'Daily challenge completed!',
    rewardGranted: { coins: 500, booster: 'rainbow' }
  });
});

export default router;
