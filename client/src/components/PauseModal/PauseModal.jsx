import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Music, LogOut } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

export default function PauseModal({ onResume, onRestart, onExit, soundOn, musicOn, onToggleSound, onToggleMusic }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '340px',
        padding: '1.75rem',
        textAlign: 'center',
        border: '1px solid rgba(148, 163, 184, 0.25)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fff', marginBottom: '1.25rem' }}>
          GAME PAUSED
        </h2>

        {/* Audio controls row */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '0.75rem',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '0.75rem'
        }}>
          <button
            onClick={onToggleSound}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.1)',
              background: soundOn ? 'rgba(56, 189, 248, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: soundOn ? '#38bdf8' : '#ef4444',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />} Sound
          </button>

          <button
            onClick={onToggleMusic}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.1)',
              background: musicOn ? 'rgba(168, 85, 247, 0.2)' : 'rgba(100, 116, 139, 0.2)',
              color: musicOn ? '#a855f7' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}
          >
            <Music size={16} /> Music
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onResume();
            }}
            className="glow-btn"
            style={{
              padding: '0.75rem',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Play size={18} /> Resume Game
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onRestart();
            }}
            className="arcade-btn"
            style={{
              padding: '0.75rem',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <RotateCcw size={18} /> Restart Level
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onExit();
            }}
            style={{
              padding: '0.65rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <LogOut size={16} /> Exit to Levels
          </button>
        </div>
      </div>
    </div>
  );
}
