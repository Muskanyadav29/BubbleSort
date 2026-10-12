import React from 'react';
import { Link } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      padding: '2rem 1rem 1.5rem',
      borderTop: '1px solid rgba(148, 163, 184, 0.1)',
      background: 'rgba(15, 23, 42, 0.8)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="#38bdf8" />
          <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#f8fafc' }}>
            {GAME_NAME}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
          <Link to="/levels" style={{ color: '#94a3b8', textDecoration: 'none' }}>Levels</Link>
          <Link to="/leaderboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Leaderboard</Link>
          <Link to="/achievements" style={{ color: '#94a3b8', textDecoration: 'none' }}>Achievements</Link>
          <Link to="/settings" style={{ color: '#94a3b8', textDecoration: 'none' }}>Settings</Link>
          <Link to="/help" style={{ color: '#94a3b8', textDecoration: 'none' }}>How to Play</Link>
        </div>

        <p style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          Crafted with <Heart size={14} color="#f43f5e" fill="#f43f5e" /> for the Full Stack Developer Challenge.
          &copy; {new Date().getFullYear()} {GAME_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
