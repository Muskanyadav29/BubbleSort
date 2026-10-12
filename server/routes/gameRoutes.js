import express from 'express';
import crypto from 'crypto';
import { store } from '../data/store.js';
import { optionalAuthenticate, authenticate } from '../middleware/auth.js';
import { validateGameSessionSubmission } from '../middleware/antiCheat.js';

const router = express.Router();

// POST /api/games/start
router.post('/start', optionalAuthenticate, (req, res) => {
  const { levelId } = req.body;
  if (levelId === undefined) {
    return res.status(400).json({ error: 'levelId is required to start a game session.' });
  }

  const sessionToken = crypto.randomBytes(24).toString('hex');
  const userId = req.user ? req.user.id : (req.body.guestId || 'guest_' + Date.now());

  const session = store.createGameSession({
    userId,
    levelId: Number(levelId),
    sessionToken
  });

  res.json({
    sessionId: session.sessionId,
    sessionToken: session.sessionToken,
    startedAt: session.startedAt,
    levelId: session.levelId,
    message: 'Game session initialized.'
  });
});

// POST /api/games/complete (with server-side anti-cheat validation)
router.post('/complete', optionalAuthenticate, validateGameSessionSubmission, (req, res) => {
  const {
    shotsUsed,
    bubblesPopped,
    score,
    bestCombo,
    boostersUsed,
    completed,
    rescuedObjects
  } = req.body;

  const session = req.verifiedSession;
  const verifiedStars = req.verifiedStars;

  const finalizedSession = store.completeSession(session.sessionId, {
    shotsUsed: Number(shotsUsed) || 0,
    bubblesPopped: Number(bubblesPopped) || 0,
    score: Number(score) || 0,
    stars: verifiedStars,
    bestCombo: Number(bestCombo) || 0,
    boostersUsed: Array.isArray(boostersUsed) ? boostersUsed : [],
    completed: Boolean(completed)
  });

  let newlyUnlockedAchievements = [];
  let updatedUserData = null;

  // If user is authenticated, update persistent progress & check achievements
  if (req.user) {
    const user = store.findUserById(req.user.id);
    if (user) {
      const prevLevelRecord = user.completedLevels[session.levelId] || { stars: 0, score: 0 };
      const newStars = Math.max(prevLevelRecord.stars, verifiedStars);
      const newScore = Math.max(prevLevelRecord.score, Number(score));

      // Calculate star differential
      const addedStars = newStars - prevLevelRecord.stars;
      const addedScore = Number(score);

      user.completedLevels[session.levelId] = {
        stars: newStars,
        score: newScore,
        completedAt: new Date().toISOString()
      };

      user.totalScore = (user.totalScore || 0) + addedScore;
      user.totalStars = (user.totalStars || 0) + addedStars;
      user.bubblesPopped = (user.bubblesPopped || 0) + (Number(bubblesPopped) || 0);
      user.bestCombo = Math.max(user.bestCombo || 0, Number(bestCombo) || 0);
      user.rescuedObjects = (user.rescuedObjects || 0) + (Number(rescuedObjects) || 0);
      user.boostersUsedCount = (user.boostersUsedCount || 0) + (boostersUsed ? boostersUsed.length : 0);

      // Advance currentLevel if completed highest level
      if (completed && session.levelId >= user.currentLevel) {
        user.currentLevel = session.levelId + 1;
      }

      // Deduct used boosters from inventory if present
      if (boostersUsed && Array.isArray(boostersUsed)) {
        for (const boosterKey of boostersUsed) {
          if (user.boosterInventory[boosterKey] && user.boosterInventory[boosterKey] > 0) {
            user.boosterInventory[boosterKey]--;
          }
        }
      }

      store.updateUser(user.id, user);

      // Check achievements
      newlyUnlockedAchievements = store.checkAndAwardAchievements(user.id);

      updatedUserData = {
        currentLevel: user.currentLevel,
        totalScore: user.totalScore,
        totalStars: user.totalStars,
        completedLevels: user.completedLevels,
        boosterInventory: user.boosterInventory
      };
    }
  }

  res.json({
    message: completed ? 'Level completed and verified!' : 'Game ended.',
    session: finalizedSession,
    verifiedStars,
    newlyUnlockedAchievements,
    playerProgress: updatedUserData
  });
});

// GET /api/games/history
router.get('/history', authenticate, (req, res) => {
  const history = store.getUserHistory(req.user.id);
  res.json({ history });
});

// GET /api/games/:id
router.get('/:id', optionalAuthenticate, (req, res) => {
  const session = store.findSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found.' });
  }
  res.json(session);
});

export default router;
