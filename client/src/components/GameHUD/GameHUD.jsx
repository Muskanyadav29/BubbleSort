import React, { useState, useRef, useEffect } from 'react';
import { Star, ArrowLeft, Volume2, VolumeX, Music, RotateCcw, Home, Settings, Flame, Target } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

export default function GameHUD({
  levelNumber,
  score,
  shotsRemaining,
  combo,
  stars,
  objectiveDescription,
  onBack,
  onRestart,
  onPause,
  soundOn,
  onToggleSound,
  musicOn,
  onToggleMusic
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  // Close settings dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setIsSettingsOpen(false);
      }
    }
    if (isSettingsOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      return () => document.removeEventListener('pointerdown', handleClickOutside);
    }
  }, [isSettingsOpen]);

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(180deg, rgba(8, 16, 34, 0.96) 0%, rgba(4, 10, 22, 0.9) 100%)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
      padding: '0.45rem 0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.35rem',
      zIndex: 30,
      flexShrink: 0,
      userSelect: 'none',
      position: 'relative'
    }}>
      <style>{`
        @keyframes stoneCascade {
          0% { transform: translateY(-8px) scale(0.85); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes pulseGlowGold {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.7)); }
          50% { filter: drop-shadow(0 0 12px rgba(245, 158, 11, 1)); }
        }
      `}</style>

      {/* Primary Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', position: 'relative' }}>
        
        {/* Left: Stage Badge + Back button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              if (onBack) onBack();
            }}
            title="Return to Level Map"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1.5px solid rgba(56, 189, 248, 0.35)',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(15, 23, 42, 0.6))',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <ArrowLeft size={16} color="#38bdf8" />
          </button>

          <div style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(139, 92, 246, 0.25))',
            border: '1.5px solid rgba(56, 189, 248, 0.45)',
            padding: '0.22rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: '900',
            color: '#ffffff',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            Lvl {levelNumber}
          </div>
        </div>

        {/* Center: 3 Stars & Score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
          {/* Star meter */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[1, 2, 3].map(st => (
              <Star
                key={st}
                size={18}
                fill={st <= stars ? '#f59e0b' : 'none'}
                color={st <= stars ? '#fbbf24' : '#475569'}
                strokeWidth={st <= stars ? 2.5 : 1.5}
                style={{
                  filter: st <= stars ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.85))' : 'none',
                  transition: 'all 0.25s ease'
                }}
              />
            ))}
          </div>

          {/* Score Counter */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', letterSpacing: '0.5px' }}>
              SCORE
            </span>
            <span style={{ fontSize: '1rem', fontWeight: '900', color: '#ffffff', letterSpacing: '0.04em', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right: Authentic Chiseled Stone Settings Button & Cascade Dropdown (Matching Reference Image) */}
        <div ref={settingsRef} style={{ position: 'relative' }}>
          {/* Main Stone Gear Button */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              setIsSettingsOpen(!isSettingsOpen);
            }}
            title="Settings & Options"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '9px',
              background: isSettingsOpen
                ? 'linear-gradient(145deg, #60a5fa 0%, #2563eb 50%, #1d4ed8 100%)'
                : 'linear-gradient(145deg, #38bdf8 0%, #1d4ed8 60%, #172554 100%)',
              border: '2px solid #60a5fa',
              borderBottom: '3.5px solid #0f172a',
              boxShadow: isSettingsOpen
                ? '0 0 16px rgba(56, 189, 248, 0.8), 0 4px 10px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.7)'
                : '0 4px 10px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.4)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isSettingsOpen ? 'scale(1.05)' : 'scale(1)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = isSettingsOpen ? 'scale(1.05)' : 'scale(1)'; }}
          >
            <Settings
              size={20}
              color="#ffffff"
              strokeWidth={2.4}
              style={{
                transition: 'transform 0.3s ease',
                transform: isSettingsOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))'
              }}
            />
          </button>

          {/* Vertical Cascade Options (Music, Sound, Restart, Home) */}
          {isSettingsOpen && (
            <div style={{
              position: 'absolute',
              top: '44px',
              right: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              zIndex: 100
            }}>
              {/* 1. Music Toggle Button */}
              <button
                onClick={() => {
                  soundEngine.playButtonClick();
                  if (onToggleMusic) onToggleMusic();
                }}
                title={musicOn ? 'Mute Music' : 'Enable Music'}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '9px',
                  background: musicOn
                    ? 'linear-gradient(145deg, #38bdf8 0%, #1d4ed8 60%, #172554 100%)'
                    : 'linear-gradient(145deg, #475569 0%, #334155 60%, #1e293b 100%)',
                  border: musicOn ? '2px solid #60a5fa' : '2px solid #64748b',
                  borderBottom: '3.5px solid #0f172a',
                  boxShadow: musicOn
                    ? '0 0 12px rgba(56, 189, 248, 0.4), 0 4px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.4)'
                    : '0 4px 10px rgba(0,0,0,0.5)',
                  color: musicOn ? '#ffffff' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  animation: 'stoneCascade 0.22s 0.03s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Music size={18} strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))' }} />
              </button>

              {/* 2. Sound FX Toggle Button */}
              <button
                onClick={() => {
                  soundEngine.playButtonClick();
                  if (onToggleSound) onToggleSound();
                }}
                title={soundOn ? 'Mute Sound FX' : 'Enable Sound FX'}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '9px',
                  background: soundOn
                    ? 'linear-gradient(145deg, #38bdf8 0%, #1d4ed8 60%, #172554 100%)'
                    : 'linear-gradient(145deg, #475569 0%, #334155 60%, #1e293b 100%)',
                  border: soundOn ? '2px solid #60a5fa' : '2px solid #64748b',
                  borderBottom: '3.5px solid #0f172a',
                  boxShadow: soundOn
                    ? '0 0 12px rgba(56, 189, 248, 0.4), 0 4px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.4)'
                    : '0 4px 10px rgba(0,0,0,0.5)',
                  color: soundOn ? '#ffffff' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  animation: 'stoneCascade 0.22s 0.07s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {soundOn ? (
                  <Volume2 size={18} strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))' }} />
                ) : (
                  <VolumeX size={18} strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))' }} />
                )}
              </button>

              {/* 3. Restart / Replay Level Button */}
              <button
                onClick={() => {
                  soundEngine.playButtonClick();
                  setIsSettingsOpen(false);
                  if (onRestart) onRestart();
                }}
                title="Restart Level"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '9px',
                  background: 'linear-gradient(145deg, #38bdf8 0%, #1d4ed8 60%, #172554 100%)',
                  border: '2px solid #60a5fa',
                  borderBottom: '3.5px solid #0f172a',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.4)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  animation: 'stoneCascade 0.22s 0.11s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <RotateCcw size={18} strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))' }} />
              </button>

              {/* 4. Home / Exit to Levels Button */}
              <button
                onClick={() => {
                  soundEngine.playButtonClick();
                  setIsSettingsOpen(false);
                  if (onBack) onBack();
                }}
                title="Exit to Level Map"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '9px',
                  background: 'linear-gradient(145deg, #38bdf8 0%, #1d4ed8 60%, #172554 100%)',
                  border: '2px solid #60a5fa',
                  borderBottom: '3.5px solid #0f172a',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.4)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  animation: 'stoneCascade 0.22s 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Home size={18} strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))' }} />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Sub Bar: Objective & Ammo Left */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(2, 6, 23, 0.65)',
        padding: '0.28rem 0.65rem',
        borderRadius: '0.65rem',
        border: '1px solid rgba(56, 189, 248, 0.15)',
        fontSize: '0.8rem'
      }}>
        {/* Objective */}
        <div style={{ color: '#7dd3fc', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Target size={14} color="#38bdf8" />
          <span>{objectiveDescription}</span>
        </div>

        {/* Combo Streak */}
        {combo >= 2 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            background: 'linear-gradient(135deg, #f97316, #ef4444)',
            padding: '1px 7px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: '900',
            color: '#fff',
            boxShadow: '0 0 10px rgba(249, 115, 22, 0.7)'
          }}>
            <Flame size={12} fill="#fff" />
            <span>x{combo}</span>
          </div>
        )}

        {/* Shots Remaining */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          color: shotsRemaining <= 5 ? '#ef4444' : '#f8fafc',
          fontWeight: '800'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: shotsRemaining <= 5 ? '#ef4444' : '#22c55e',
            boxShadow: shotsRemaining <= 5 ? '0 0 8px #ef4444' : '0 0 4px rgba(34, 197, 94, 0.5)'
          }} />
          <span>{shotsRemaining} <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: '600' }}>shots</span></span>
        </div>
      </div>
    </div>
  );
}
