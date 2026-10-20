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

// Colors mapping with defined 3D spherical gradients & crisp outer rims
export const BUBBLE_THEMES = {
  red: { main: '#FF2A4D', light: '#FFA3B5', dark: '#B3001F', rim: '#6E0013', innerRim: 'rgba(255, 170, 185, 0.55)', glow: 'rgba(255, 42, 77, 0.6)' },
  blue: { main: '#1A8CFF', light: '#85C5FF', dark: '#0052B3', rim: '#003370', innerRim: 'rgba(140, 205, 255, 0.55)', glow: 'rgba(26, 140, 255, 0.6)' },
  green: { main: '#10D05E', light: '#8EF8B8', dark: '#088037', rim: '#045223', innerRim: 'rgba(150, 250, 185, 0.55)', glow: 'rgba(16, 208, 94, 0.6)' },
  yellow: { main: '#FFB800', light: '#FFF2A8', dark: '#B37800', rim: '#734D00', innerRim: 'rgba(255, 245, 170, 0.6)', glow: 'rgba(255, 184, 0, 0.6)' },
  purple: { main: '#A845F5', light: '#E4B4FF', dark: '#6B16B3', rim: '#450975', innerRim: 'rgba(230, 185, 255, 0.55)', glow: 'rgba(168, 69, 245, 0.6)' },
  orange: { main: '#FF6E14', light: '#FFBE8F', dark: '#B34500', rim: '#732C00', innerRim: 'rgba(255, 195, 140, 0.55)', glow: 'rgba(255, 110, 20, 0.6)' },
  pink: { main: '#FF3D8B', light: '#FFA8CE', dark: '#B30D56', rim: '#700434', innerRim: 'rgba(255, 175, 215, 0.55)', glow: 'rgba(255, 61, 139, 0.6)' },
  cyan: { main: '#00C8D6', light: '#8AFAFF', dark: '#007A82', rim: '#004C52', innerRim: 'rgba(145, 250, 255, 0.55)', glow: 'rgba(0, 200, 214, 0.6)' },
  bomb: { main: '#334155', light: '#94A3B8', dark: '#0F172A', rim: '#020617', innerRim: 'rgba(239, 68, 68, 0.7)', glow: 'rgba(239, 68, 68, 0.8)' },
  rainbow: { main: '#EC4899', light: '#FDF2F8', dark: '#8B5CF6', rim: '#581C87', innerRim: 'rgba(255, 255, 255, 0.75)', glow: 'rgba(236, 72, 153, 0.8)' },
  lightning: { main: '#FACC15', light: '#FEF9C3', dark: '#A16207', rim: '#713F12', innerRim: 'rgba(254, 240, 138, 0.75)', glow: 'rgba(250, 204, 21, 0.8)' },
  fire: { main: '#EA580C', light: '#FED7AA', dark: '#9A3412', rim: '#6C220B', innerRim: 'rgba(254, 215, 170, 0.65)', glow: 'rgba(234, 88, 12, 0.8)' },
  rescue: { main: '#F43F5E', light: '#FFE4E6', dark: '#9F1239', rim: '#4C0519', innerRim: 'rgba(255, 255, 255, 0.75)', glow: 'rgba(244, 63, 94, 0.8)' }
};
