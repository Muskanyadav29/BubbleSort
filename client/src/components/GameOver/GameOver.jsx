import React from 'react';
import { AlertCircle, RotateCcw, PlusCircle, Grid } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

export default function GameOver({ onRetry, onUseExtraShotBooster, onLevelSelect, extraShotAvailable }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 40,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '350px',
        padding: '1.75rem',
        textAlign: 'center',
        border: '2px solid rgba(239, 68, 68, 0.4)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        <div style={{
          display: 'inline-flex',
          padding: '0.6rem',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ef4444, #f97316)',
          marginBottom: '0.5rem',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
        }}>
          <AlertCircle size={36} color="#fff" />
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fff', marginBottom: '0.25rem' }}>
          OUT OF SHOTS!
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          The objective was not completed before running out of ammo.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {extraShotAvailable && (
            <button
              onClick={() => {
                soundEngine.playBooster();
                onUseExtraShotBooster();
              }}
              className="glow-btn"
              style={{
                padding: '0.75rem',
                fontSize: '0.95rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <PlusCircle size={18} /> Continue with +5 Shots
            </button>
          )}

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onRetry();
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
            <RotateCcw size={18} /> Retry Level
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onLevelSelect();
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
            <Grid size={16} /> Level Select
          </button>
        </div>
      </div>
    </div>
  );
}
