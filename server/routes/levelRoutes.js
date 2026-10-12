import express from 'express';
import { getAllLevelsMetadata, getLevelConfig } from '../data/levelsData.js';
import { store } from '../data/store.js';

const router = express.Router();

// GET /api/levels
router.get('/', (req, res) => {
  const defaultLevels = getAllLevelsMetadata(45);
  const customLevels = store.getAllCustomLevels();
  res.json({
    total: defaultLevels.length + customLevels.length,
    levels: [...defaultLevels, ...customLevels]
  });
});

// GET /api/levels/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid level ID.' });
  }

  // Check custom levels first
  const customLevels = store.getAllCustomLevels();
  const customMatch = customLevels.find(l => l.id === id);
  if (customMatch) {
    return res.json(customMatch);
  }

  const level = getLevelConfig(id);
  if (!level) {
    return res.status(404).json({ error: `Level ${id} not found.` });
  }

  res.json(level);
});

// Admin Bonus Endpoints: Create/Edit/Delete levels
router.post('/', (req, res) => {
  const { title, difficulty, type, objective, shots, colors, board, targetScore } = req.body;
  if (!title || !shots || !colors) {
    return res.status(400).json({ error: 'Title, shots, and colors are required for custom levels.' });
  }

  const newLevel = store.addCustomLevel({
    title,
    difficulty: difficulty || 'medium',
    type: type || 'classic',
    objective: objective || { type: 'clear_all', description: 'Clear all bubbles' },
    shots: Number(shots) || 20,
    colors: Array.isArray(colors) ? colors : ['red', 'blue', 'green'],
    board: board || [],
    targetScore: Number(targetScore) || 2500,
    starThresholds: [1500, 2500, 3500],
    availableBoosters: ['aimGuide', 'bomb', 'rainbow', 'extraShot']
  });

  res.status(201).json(newLevel);
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const updated = store.updateCustomLevel(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Custom level not found or cannot edit default levels.' });
  }
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const success = store.deleteCustomLevel(id);
  if (!success) {
    return res.status(404).json({ error: 'Custom level not found or cannot delete default levels.' });
  }
  res.json({ message: `Level ${id} removed successfully.` });
});

export default router;
