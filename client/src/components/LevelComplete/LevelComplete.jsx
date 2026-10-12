import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, ArrowRight, RotateCcw, Grid } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

export default function LevelComplete({
  levelNumber,
  score,
  stars,
  shotsUsed,
  shotsRemaining,
  bubblesPopped,
  bestCombo,
  onNextLevel,
  onReplay,
  onLevelSelect
}) {
  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 40,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '360px',
        padding: '1.75rem',
        textAlign: 'center',
        border: '2px solid rgba(56, 189, 248, 0.4)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        animation: 'floatAnim 4s ease-in-out infinite'
      }}>
        <div style={{
          display: 'inline-flex',
          padding: '0.6rem',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #06b6d4)',
          marginBottom: '0.5rem',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)'
        }}>
          <Trophy size={36} color="#fff" />
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fff', marginBottom: '0.25rem' }}>
          LEVEL {levelNumber} CLEAR!
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Outstanding shooting performance!
        </p>

        {/* 3 Stars Animation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {[1, 2, 3].map(s => (
            <Star
              key={s}
              size={36}
              fill={s <= stars ? '#f59e0b' : 'none'}
              color={s <= stars ? '#f59e0b' : '#475569'}
              style={{
                filter: s <= stars ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.9))' : 'none',
                transform: s <= stars ? 'scale(1.1)' : 'scale(0.9)',
                transition: 'transform 0.4s ease'
              }}
            />
          ))}
        </div>

        {/* Statistics breakdown */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          borderRadius: '0.75rem',
          padding: '0.85rem',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          textAlign: 'left'
        }}>
          <div>
            <span style={{ color: '#94a3b8' }}>Score:</span>{' '}
            <strong style={{ color: '#38bdf8' }}>{score.toLocaleString()}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Shots Left:</span>{' '}
            <strong style={{ color: '#22c55e' }}>{shotsRemaining}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Popped:</span>{' '}
            <strong style={{ color: '#f43f5e' }}>{bubblesPopped}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Best Combo:</span>{' '}
            <strong style={{ color: '#f59e0b' }}>x{bestCombo}</strong>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onNextLevel();
            }}
            className="glow-btn"
            style={{
              padding: '0.75rem',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            Next Level <ArrowRight size={18} />
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onReplay();
              }}
              className="arcade-btn"
              style={{
                flex: 1,
                padding: '0.6rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem'
              }}
            >
              <RotateCcw size={15} /> Replay
            </button>

            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onLevelSelect();
              }}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.06)',
                color: '#e2e8f0',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem'
              }}
            >
              <Grid size={15} /> Levels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
