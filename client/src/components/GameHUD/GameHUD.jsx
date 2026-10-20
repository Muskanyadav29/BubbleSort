import React from 'react';
import { Star, ArrowLeft, Volume2, VolumeX, Music, Maximize2, Minimize2, Pause, Flame, Target } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

export default function GameHUD({
  levelNumber,
  score,
  shotsRemaining,
  combo,
  stars,
  objectiveDescription,
  onBack,
  onPause,
  soundOn,
  onToggleSound,
  musicOn,
  onToggleMusic,
  isFullscreen,
  onToggleFullscreen
}) {
  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.85) 100%)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
      padding: '0.4rem 0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.3rem',
      zIndex: 20,
      flexShrink: 0,
      userSelect: 'none'
    }}>
      {/* Primary Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        
        {/* Left: Back Arrow + Stage Badge */}
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
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            <ArrowLeft size={16} />
          </button>

          <div style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(139, 92, 246, 0.2))',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: '800',
            color: '#38bdf8',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap'
          }}>
            Lvl {levelNumber}
          </div>
        </div>

        {/* Center: 3 Stars & Score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          {/* Star meter */}
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {[1, 2, 3].map(st => (
              <Star
                key={st}
                size={18}
                fill={st <= stars ? '#f59e0b' : 'none'}
                color={st <= stars ? '#f59e0b' : '#475569'}
                style={{
                  filter: st <= stars ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.8))' : 'none',
                  transition: 'all 0.25s ease'
                }}
              />
            ))}
          </div>

          {/* Score Counter */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700' }}>
              Score
            </span>
            <span style={{ fontSize: '1rem', fontWeight: '900', color: '#f8fafc', letterSpacing: '0.03em' }}>
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Controls (Sound, Music, Fullscreen, Pause) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {/* SFX Toggle */}
          <button
            onClick={onToggleSound}
            title={soundOn ? 'Mute Sound FX' : 'Enable Sound FX'}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '0.4rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: soundOn ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: soundOn ? '#38bdf8' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Music Toggle */}
          <button
            onClick={onToggleMusic}
            title={musicOn ? 'Mute Music' : 'Enable Music'}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '0.4rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: musicOn ? 'rgba(168, 85, 247, 0.18)' : 'rgba(255, 255, 255, 0.05)',
              color: musicOn ? '#c084fc' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Music size={14} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Full Screen' : 'Play Full Screen'}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '0.4rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: isFullscreen ? 'rgba(34, 197, 94, 0.18)' : 'rgba(255, 255, 255, 0.05)',
              color: isFullscreen ? '#4ade80' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Pause Button */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              if (onPause) onPause();
            }}
            title="Pause Game (Esc)"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '0.45rem',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            <Pause size={15} />
          </button>
        </div>

      </div>

      {/* Sub Bar: Objective, Shots Remaining & Combo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(2, 6, 23, 0.55)',
        padding: '0.25rem 0.6rem',
        borderRadius: '0.5rem',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '0.78rem'
      }}>
        {/* Objective */}
        <div style={{ color: '#38bdf8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
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
            padding: '1px 6px',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            fontWeight: '800',
            color: '#fff',
            boxShadow: '0 0 8px rgba(249, 115, 22, 0.6)'
          }}>
            <Flame size={12} fill="#fff" />
            <span>x{combo}</span>
          </div>
        )}

        {/* Shots Remaining */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          color: shotsRemaining <= 5 ? '#ef4444' : '#f8fafc',
          fontWeight: '700'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: shotsRemaining <= 5 ? '#ef4444' : '#22c55e',
            boxShadow: shotsRemaining <= 5 ? '0 0 6px #ef4444' : 'none'
          }} />
          <span>{shotsRemaining} <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>left</span></span>
        </div>
      </div>
    </div>
  );
}
