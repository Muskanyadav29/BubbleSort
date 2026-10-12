import express from 'express';
import { store } from '../data/store.js';
import { optionalAuthenticate, authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/leaderboard?type=global|weekly|friends
router.get('/', optionalAuthenticate, (req, res) => {
  const type = req.query.type || 'global';
  const currentUserId = req.user ? req.user.id : null;
  const board = store.getLeaderboard(type, currentUserId);
  res.json(board);
});

// GET /api/leaderboard/me
router.get('/me', authenticate, (req, res) => {
  const board = store.getLeaderboard('global', req.user.id);
  res.json({
    userRank: board.userRank,
    player: {
      name: req.user.name,
      score: req.user.totalScore,
      stars: req.user.totalStars,
      levelsCompleted: Object.keys(req.user.completedLevels || {}).length,
      bestCombo: req.user.bestCombo
    }
  });
});

export default router;
