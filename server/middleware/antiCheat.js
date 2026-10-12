import { getLevelConfig } from '../data/levelsData.js';
import { store } from '../data/store.js';

export function validateGameSessionSubmission(req, res, next) {
  const {
    sessionId,
    sessionToken,
    levelId,
    shotsUsed,
    bubblesPopped,
    score,
    stars,
    bestCombo,
    boostersUsed
  } = req.body;

  if (!sessionId || !sessionToken || levelId === undefined) {
    return res.status(400).json({ error: 'Missing mandatory session verification credentials.' });
  }

  // 1. Session lookup
  const session = store.findSession(sessionId, sessionToken);
  if (!session) {
    return res.status(403).json({ error: 'Invalid or forged game session token.' });
  }

  // 2. Prevent duplicate completions / replay attacks
  if (session.completed || session.status === 'completed') {
    return res.status(409).json({ error: 'Game session has already been finalized. Duplicate submission blocked.' });
  }

  // 3. Verify user ownership if session belongs to registered user
  if (session.userId && (!req.user || req.user.id !== session.userId)) {
    return res.status(403).json({ error: 'Session ownership verification failed.' });
  }

  // 4. Timing verification
  const now = Date.now();
  const timeElapsedMs = now - session.startedAt;
  const minRealisticTimeMs = 2500; // Even quick pops take at least 2.5s
  if (timeElapsedMs < minRealisticTimeMs) {
    return res.status(400).json({
      error: 'Anti-cheat alert: Completion time is impossibly fast (' + Math.round(timeElapsedMs / 1000) + 's).'
    });
  }

  // 5. Level verification & max shots
  const levelNum = Number(levelId);
  const levelConfig = getLevelConfig(levelNum);
  if (!levelConfig) {
    return res.status(400).json({ error: 'Invalid level identifier.' });
  }

  // Allow shots within level allowance plus extra-shot booster allowance
  const extraShotsAllowed = (boostersUsed || []).filter(b => b === 'extraShot').length * 5;
  const maxAllowedShots = levelConfig.shots + extraShotsAllowed;
  if (shotsUsed > maxAllowedShots + 1) {
    return res.status(400).json({
      error: `Anti-cheat alert: Excessive shots reported (${shotsUsed} > allowed ${maxAllowedShots}).`
    });
  }

  // 6. Plausible score calculation verification
  // Typical score formula: bubblePop * 10, cluster matches, combos, drops * 20, rescue * 100
  // An impossible score like 999999999 without popping bubbles must be rejected!
  const maxPossibleScoreFromPops = (bubblesPopped || 0) * 250;
  const maxPossibleBonus = 15000;
  const upperPlausibleBound = Math.max(1000, maxPossibleScoreFromPops + maxPossibleBonus);

  if (score > upperPlausibleBound * 3) {
    return res.status(400).json({
      error: `Anti-cheat alert: Reported score (${score}) deviates beyond mathematical threshold for bubbles popped (${bubblesPopped}).`
    });
  }

  // 7. Verify stars match performance criteria
  let calculatedStars = 1;
  if (score >= levelConfig.starThresholds[2]) {
    calculatedStars = 3;
  } else if (score >= levelConfig.starThresholds[1]) {
    calculatedStars = 2;
  }

  // Attach verified session and calculated values
  req.verifiedSession = session;
  req.verifiedStars = Math.max(1, Math.min(3, stars || calculatedStars));
  next();
}
