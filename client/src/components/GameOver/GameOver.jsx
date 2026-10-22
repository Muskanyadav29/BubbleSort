import React, { useEffect, useState } from 'react';
import { AlertCircle, RotateCcw, PlusCircle, Grid, HeartCrack, Flame, Sparkles } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

export default function GameOver({ onRetry, onUseExtraShotBooster, onLevelSelect, extraShotAvailable }) {
  const [show, setShow] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 80);
    setTimeout(() => setShowButtons(true), 450);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(circle at 50% 45%, rgba(239, 68, 68, 0.22) 0%, rgba(15, 23, 42, 0.88) 55%, rgba(4, 10, 22, 0.97) 100%)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem',
      overflow: 'hidden',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <style>{`
        @keyframes raysSpinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes floatEmber {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          40% { opacity: 0.8; }
          100% { transform: translateY(-140px) scale(1.1); opacity: 0; }
        }
        @keyframes gameOverCardPop {
          0% { transform: scale(0.75) translateY(30px); opacity: 0; }
          65% { transform: scale(1.03) translateY(-3px); opacity: 1; }
          85% { transform: scale(0.98) translateY(1px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes heartbeatShake {
          0%, 100% { transform: scale(1) rotate(0deg); }
          15% { transform: scale(1.12) rotate(-4deg); }
          30% { transform: scale(0.95) rotate(3deg); }
          45% { transform: scale(1.08) rotate(-2deg); }
          60% { transform: scale(0.98) rotate(1deg); }
        }
        @keyframes revivePulseGlow {
          0%, 100% { box-shadow: 0 4px 18px rgba(16, 185, 129, 0.5), 0 0 25px rgba(16, 185, 129, 0.2); }
          50% { box-shadow: 0 6px 28px rgba(16, 185, 129, 0.75), 0 0 45px rgba(16, 185, 129, 0.35); }
        }
      `}</style>

      {/* Rotating Background Ambient Rays */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'repeating-conic-gradient(from 0deg, rgba(239, 68, 68, 0.08) 0deg 12deg, transparent 12deg 24deg)',
        animation: 'raysSpinSlow 50s linear infinite',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Floating Ember Particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        {[
          { left: '25%', bottom: '22%', delay: '0s', dur: '3.4s', size: 6 },
          { left: '40%', bottom: '18%', delay: '1.2s', dur: '3.9s', size: 8 },
          { left: '60%', bottom: '26%', delay: '0.6s', dur: '3.6s', size: 7 },
          { left: '75%', bottom: '15%', delay: '2s', dur: '4.2s', size: 8 },
        ].map((eb, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: eb.left,
              bottom: eb.bottom,
              width: `${eb.size}px`,
              height: `${eb.size}px`,
              borderRadius: '50%',
              background: '#f87171',
              boxShadow: '0 0 10px #ef4444',
              animation: `floatEmber ${eb.dur} ${eb.delay} ease-out infinite`
            }}
          />
        ))}
      </div>

      {/* Gamified Stone/Arcade Plaque */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '380px',
        background: 'linear-gradient(180deg, rgba(23, 23, 38, 0.96) 0%, rgba(12, 14, 28, 0.98) 100%)',
        borderRadius: '1.75rem',
        border: '3px solid #ef4444',
        boxShadow: '0 0 35px rgba(239, 68, 68, 0.35), 0 25px 60px rgba(0, 0, 0, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
        padding: '1.6rem 1.25rem 1.25rem 1.25rem',
        textAlign: 'center',
        animation: 'gameOverCardPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      }}>

        {/* Top Broken Heart Emblem */}
        <div style={{
          position: 'absolute',
          top: '-32px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #fca5a5, #ef4444 60%, #991b1b 100%)',
          border: '3px solid #ffffff',
          boxShadow: '0 8px 22px rgba(239, 68, 68, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'heartbeatShake 3s ease-in-out infinite'
        }}>
          <HeartCrack size={34} color="#ffffff" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />
        </div>

        {/* Header Warning Banner */}
        <div style={{
          marginTop: '1.25rem',
          background: 'linear-gradient(90deg, #7f1d1d 0%, #dc2626 25%, #f87171 50%, #dc2626 75%, #7f1d1d 100%)',
          padding: '0.45rem 1rem',
          borderRadius: '0.85rem',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          border: '1.5px solid #fca5a5',
          marginBottom: '0.65rem'
        }}>
          <h2 style={{
            fontSize: '1.45rem',
            fontWeight: '900',
            color: '#ffffff',
            textShadow: '0 2px 4px rgba(0,0,0,0.6)',
            letterSpacing: '1.5px',
            margin: 0,
            textTransform: 'uppercase',
            fontFamily: 'var(--font-display)'
          }}>
            Out of Shots!
          </h2>
        </div>

        <p style={{
          color: '#cbd5e1',
          fontSize: '0.85rem',
          marginBottom: '1.1rem',
          fontWeight: '600',
          lineHeight: '1.4'
        }}>
          You ran out of ammunition! Revive with extra shots or try again.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          opacity: showButtons ? 1 : 0,
          transform: showButtons ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          {extraShotAvailable && (
            <button
              onClick={() => {
                soundEngine.playBooster();
                onUseExtraShotBooster();
              }}
              style={{
                padding: '0.95rem 1.25rem',
                fontSize: '1.05rem',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                background: 'linear-gradient(180deg, #34d399 0%, #10b981 40%, #059669 100%)',
                border: '2px solid #a7f3d0',
                borderRadius: '9999px',
                color: '#ffffff',
                cursor: 'pointer',
                animation: 'revivePulseGlow 2.5s infinite',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5), inset 0 2px 3px rgba(255,255,255,0.6)',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-display)',
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
              }}
            >
              <PlusCircle size={20} strokeWidth={2.5} />
              <span>Continue with +5 Shots</span>
            </button>
          )}

          {/* Retry Button */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onRetry();
            }}
            style={{
              padding: '0.85rem 1.25rem',
              fontSize: '1rem',
              fontWeight: '800',
              background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
              border: '2px solid #bae6fd',
              borderRadius: '9999px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4), inset 0 1px 2px rgba(255,255,255,0.6)',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            <RotateCcw size={18} strokeWidth={2.5} />
            <span>Retry Level</span>
          </button>

          {/* Level Select Button */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onLevelSelect();
            }}
            style={{
              padding: '0.7rem',
              borderRadius: '0.95rem',
              border: '1.5px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Grid size={16} strokeWidth={2.5} />
            <span>Select Different Level</span>
          </button>
        </div>

      </div>
    </div>
  );
}
