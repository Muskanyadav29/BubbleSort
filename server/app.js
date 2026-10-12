import express from 'express';
import cors from 'cors';
import { GAME_NAME } from './config/config.js';
import authRoutes from './routes/authRoutes.js';
import levelRoutes from './routes/levelRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import dailyChallengeRoutes from './routes/dailyChallengeRoutes.js';
import playerProgressRoutes from './routes/playerProgressRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Base metadata & health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    gameName: GAME_NAME,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/config', (req, res) => {
  res.json({
    gameName: GAME_NAME
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/daily-challenge', dailyChallengeRoutes);
app.use('/api/player', playerProgressRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Endpoint ${req.originalUrl} not found on ${GAME_NAME} server.` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

export default app;
