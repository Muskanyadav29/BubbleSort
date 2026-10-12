// Centralized configuration module - Single source of truth for game branding and parameters
export const GAME_NAME = import.meta.env.VITE_GAME_NAME || 'BUBBLE BLAST ADVENTURE';
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Visual & Canvas Settings
export const GRID_CONFIG = {
  COLS_EVEN: 8,
  COLS_ODD: 7,
  MAX_ROWS: 12,
  BUBBLE_RADIUS: 24, // responsive radius on 400px board
  BOARD_WIDTH: 400,
  BOARD_HEIGHT: 620
};

// Colors mapping
export const BUBBLE_THEMES = {
  red: { main: '#FF4757', light: '#FFA502', glow: 'rgba(255, 71, 87, 0.6)' },
  blue: { main: '#1E90FF', light: '#70A1FF', glow: 'rgba(30, 144, 255, 0.6)' },
  green: { main: '#2ED573', light: '#7BED9F', glow: 'rgba(46, 213, 115, 0.6)' },
  yellow: { main: '#FFA502', light: '#FFEAA7', glow: 'rgba(255, 165, 2, 0.6)' },
  purple: { main: '#9B59B6', light: '#E056FD', glow: 'rgba(155, 89, 182, 0.6)' },
  orange: { main: '#FF7F50', light: '#FFA07A', glow: 'rgba(255, 127, 80, 0.6)' },
  pink: { main: '#FF6B81', light: '#FFB8B8', glow: 'rgba(255, 107, 129, 0.6)' },
  cyan: { main: '#00D2D3', light: '#48DBFB', glow: 'rgba(0, 210, 211, 0.6)' },
  bomb: { main: '#2C3E50', light: '#E74C3C', glow: 'rgba(231, 76, 60, 0.8)' },
  rainbow: { main: '#F368E0', light: '#00D2D3', glow: 'rgba(243, 104, 224, 0.8)' },
  lightning: { main: '#F1C40F', light: '#F39C12', glow: 'rgba(241, 196, 15, 0.8)' },
  fire: { main: '#E67E22', light: '#D35400', glow: 'rgba(230, 126, 34, 0.8)' },
  rescue: { main: '#FF9FF3', light: '#FECA57', glow: 'rgba(255, 159, 243, 0.9)' }
};
