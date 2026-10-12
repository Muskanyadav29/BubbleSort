import express from 'express';
import { store } from '../data/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/player/progress
router.get('/', authenticate, (req, res) => {
  const user = req.user;
  res.json({
    currentLevel: user.currentLevel,
    completedLevels: user.completedLevels,
    totalStars: user.totalStars,
    totalScore: user.totalScore,
    bestCombo: user.bestCombo,
    bubblesPopped: user.bubblesPopped,
    rescuedObjects: user.rescuedObjects,
    boosterInventory: user.boosterInventory,
    achievements: store.getUserAchievements(user.id)
  });
});

// POST /api/player/claim-booster (e.g. daily gift or level bonus)
router.post('/claim-booster', authenticate, (req, res) => {
  const { boosterType } = req.body;
  const user = store.findUserById(req.user.id);
  if (user && boosterType && user.boosterInventory[boosterType] !== undefined) {
    user.boosterInventory[boosterType]++;
    store.updateUser(user.id, user);
    return res.json({ success: true, boosterInventory: user.boosterInventory });
  }
  res.status(400).json({ error: 'Invalid booster type.' });
});

export default router;
