import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Music, LogOut, Settings, Sparkles } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

export default function PauseModal({ onResume, onRestart, onExit, soundOn, musicOn, onToggleSound, onToggleMusic }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 50);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(circle at 50% 45%, rgba(139, 92, 246, 0.18) 0%, rgba(15, 23, 42, 0.88) 55%, rgba(4, 10, 22, 0.97) 100%)',
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
        @keyframes pauseRaySpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes floatStardust {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          40% { opacity: 0.8; }
          100% { transform: translateY(-130px) scale(1.1); opacity: 0; }
        }
        @keyframes pauseModalPop {
          0% { transform: scale(0.75) translateY(30px); opacity: 0; }
          65% { transform: scale(1.03) translateY(-3px); opacity: 1; }
          85% { transform: scale(0.98) translateY(1px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes gearSpinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes resumeGlowPulse {
          0%, 100% { box-shadow: 0 4px 18px rgba(16, 185, 129, 0.5), 0 0 25px rgba(16, 185, 129, 0.2); }
          50% { box-shadow: 0 6px 28px rgba(16, 185, 129, 0.75), 0 0 45px rgba(16, 185, 129, 0.35); }
        }
      `}</style>

      {/* Rotating Background Rays */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'repeating-conic-gradient(from 0deg, rgba(139, 92, 246, 0.08) 0deg 12deg, transparent 12deg 24deg)',
        animation: 'pauseRaySpin 45s linear infinite',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Floating Stardust Particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        {[
          { left: '22%', bottom: '20%', delay: '0s', dur: '3.5s', size: 6 },
          { left: '38%', bottom: '15%', delay: '1s', dur: '4s', size: 8 },
          { left: '62%', bottom: '24%', delay: '0.5s', dur: '3.6s', size: 7 },
          { left: '78%', bottom: '18%', delay: '1.8s', dur: '4.2s', size: 8 },
        ].map((pt, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: pt.left,
              bottom: pt.bottom,
              width: `${pt.size}px`,
              height: `${pt.size}px`,
              borderRadius: '50%',
              background: '#c084fc',
              boxShadow: '0 0 10px #a855f7',
              animation: `floatStardust ${pt.dur} ${pt.delay} ease-out infinite`
            }}
          />
        ))}
      </div>

      {/* Gamified Plaque Container */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '370px',
        background: 'linear-gradient(180deg, rgba(19, 23, 44, 0.96) 0%, rgba(10, 14, 28, 0.98) 100%)',
        borderRadius: '1.75rem',
        border: '3px solid #8b5cf6',
        boxShadow: '0 0 35px rgba(139, 92, 246, 0.35), 0 25px 60px rgba(0, 0, 0, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.25)',
        padding: '1.6rem 1.25rem 1.25rem 1.25rem',
        textAlign: 'center',
        animation: 'pauseModalPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      }}>

        {/* Top Gear Emblem */}
        <div style={{
          position: 'absolute',
          top: '-32px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #c084fc, #8b5cf6 60%, #5b21b6 100%)',
          border: '3px solid #ffffff',
          boxShadow: '0 8px 22px rgba(139, 92, 246, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Settings size={34} color="#ffffff" strokeWidth={2.5} style={{ animation: 'gearSpinSlow 20s linear infinite', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
        </div>

        {/* Header Ribbon Banner */}
        <div style={{
          marginTop: '1.25rem',
          background: 'linear-gradient(90deg, #5b21b6 0%, #7c3aed 25%, #a855f7 50%, #7c3aed 75%, #5b21b6 100%)',
          padding: '0.45rem 1rem',
          borderRadius: '0.85rem',
          boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          border: '1.5px solid #c084fc',
          marginBottom: '1rem'
        }}>
          <h2 style={{
            fontSize: '1.45rem',
            fontWeight: '900',
            color: '#ffffff',
            textShadow: '0 2px 4px rgba(0,0,0,0.6)',
            letterSpacing: '2px',
            margin: 0,
            textTransform: 'uppercase',
            fontFamily: 'var(--font-display)'
          }}>
            ⏸ Game Paused
          </h2>
        </div>

        {/* Audio controls row */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          padding: '0.65rem 0.75rem',
          background: 'rgba(15, 23, 42, 0.75)',
          borderRadius: '1rem',
          border: '1.5px solid rgba(139, 92, 246, 0.25)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)'
        }}>
          <button
            onClick={onToggleSound}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.85rem',
              borderRadius: '0.8rem',
              border: `2px solid ${soundOn ? 'rgba(56, 189, 248, 0.6)' : 'rgba(239, 68, 68, 0.4)'}`,
              background: soundOn ? 'linear-gradient(145deg, rgba(56, 189, 248, 0.25), rgba(14, 165, 233, 0.1))' : 'rgba(239, 68, 68, 0.12)',
              color: soundOn ? '#38bdf8' : '#ef4444',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: '800',
              transition: 'all 0.2s ease',
              boxShadow: soundOn ? '0 2px 8px rgba(56, 189, 248, 0.2)' : 'none'
            }}
          >
            {soundOn ? <Volume2 size={17} strokeWidth={2.5} /> : <VolumeX size={17} strokeWidth={2.5} />}
            <span>{soundOn ? 'Sound ON' : 'Sound OFF'}</span>
          </button>

          <button
            onClick={onToggleMusic}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.85rem',
              borderRadius: '0.8rem',
              border: `2px solid ${musicOn ? 'rgba(168, 85, 247, 0.6)' : 'rgba(100, 116, 139, 0.4)'}`,
              background: musicOn ? 'linear-gradient(145deg, rgba(168, 85, 247, 0.25), rgba(139, 92, 246, 0.1))' : 'rgba(100, 116, 139, 0.12)',
              color: musicOn ? '#c084fc' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: '800',
              transition: 'all 0.2s ease',
              boxShadow: musicOn ? '0 2px 8px rgba(168, 85, 247, 0.2)' : 'none'
            }}
          >
            <Music size={17} strokeWidth={2.5} />
            <span>{musicOn ? 'Music ON' : 'Music OFF'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {/* Big Green Resume Button */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onResume();
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
              animation: 'resumeGlowPulse 2.5s infinite',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5), inset 0 2px 3px rgba(255,255,255,0.6)',
              letterSpacing: '1px',
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
            <Play size={20} strokeWidth={3} />
            <span>RESUME GAME</span>
          </button>

          {/* Restart Button */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onRestart();
            }}
            style={{
              padding: '0.8rem 1.25rem',
              fontSize: '0.95rem',
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
              boxShadow: '0 4px 15px rgba(56, 189, 248, 0.35), inset 0 1px 2px rgba(255,255,255,0.6)',
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
            <RotateCcw size={17} strokeWidth={2.5} />
            <span>Restart Level</span>
          </button>

          {/* Exit Button */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onExit();
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
            <LogOut size={16} strokeWidth={2.5} />
            <span>Exit to Levels</span>
          </button>
        </div>

      </div>
    </div>
  );
}
