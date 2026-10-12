import express from 'express';
import { store } from '../data/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/achievements
router.get('/', (req, res) => {
  res.json({ achievements: store.data.achievements });
});

// GET /api/achievements/me
router.get('/me', authenticate, (req, res) => {
  const userAchievements = store.getUserAchievements(req.user.id);
  res.json({ achievements: userAchievements });
});

export default router;
