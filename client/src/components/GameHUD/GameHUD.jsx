import React from 'react';
import { Star, RotateCcw, Lightbulb, Pause, Flame, Target } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

export default function GameHUD({
  levelNumber,
  score,
  shotsRemaining,
  combo,
  stars,
  objectiveDescription,
  canUndo,
  onUndo,
  onHint,
  onPause
}) {
  return (
    <div className="glass-panel" style={{
      padding: '0.65rem 1rem',
      borderRadius: '1rem',
      marginBottom: '0.5rem',
      maxWidth: '440px',
      margin: '0 auto 0.5rem auto',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      border: '1px solid rgba(148, 163, 184, 0.2)'
    }}>
      {/* Top row: Level, Stars, Score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
            Stage
          </span>
          <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#38bdf8' }}>
            Level {levelNumber}
          </div>
        </div>

        {/* 3 Stars */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1, 2, 3].map(st => (
            <Star
              key={st}
              size={22}
              fill={st <= stars ? '#f59e0b' : 'none'}
              color={st <= stars ? '#f59e0b' : '#475569'}
              style={{
                filter: st <= stars ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.7))' : 'none',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
            Score
          </span>
          <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#f8fafc' }}>
            {score.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Middle row: Shots remaining, Combo & Objective */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '0.4rem 0.75rem',
        borderRadius: '0.65rem',
        marginBottom: '0.5rem'
      }}>
        {/* Shots Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Target size={18} color="#ef4444" />
          <span style={{ fontSize: '1rem', fontWeight: '700', color: shotsRemaining <= 5 ? '#ef4444' : '#f8fafc' }}>
            {shotsRemaining} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>shots</span>
          </span>
        </div>

        {/* Combo Badge */}
        {combo >= 2 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            background: 'linear-gradient(135deg, #f97316, #ef4444)',
            padding: '0.2rem 0.5rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '800',
            color: '#fff',
            boxShadow: '0 0 8px rgba(249, 115, 22, 0.6)'
          }}>
            <Flame size={14} fill="#fff" />
            <span>x{combo}</span>
          </div>
        )}

        {/* Objective */}
        <div style={{ fontSize: '0.825rem', color: '#38bdf8', fontWeight: '600' }}>
          {objectiveDescription}
        </div>
      </div>

      {/* Control Buttons: Undo, Hint, Pause */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => {
            soundEngine.playButtonClick();
            onUndo();
          }}
          disabled={!canUndo}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
            padding: '0.45rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            background: canUndo ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.04)',
            color: canUndo ? '#38bdf8' : '#64748b',
            cursor: canUndo ? 'pointer' : 'not-allowed',
            fontWeight: '600',
            fontSize: '0.85rem'
          }}
          title="Undo last shot"
        >
          <RotateCcw size={15} /> Undo
        </button>

        <button
          onClick={() => {
            soundEngine.playButtonClick();
            onHint();
          }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
            padding: '0.45rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            background: 'rgba(245, 158, 11, 0.12)',
            color: '#fbbf24',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85rem'
          }}
          title="Get tactical angle hint"
        >
          <Lightbulb size={15} /> Hint
        </button>

        <button
          onClick={() => {
            soundEngine.playButtonClick();
            onPause();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.45rem 0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)',
            color: '#e2e8f0',
            cursor: 'pointer'
          }}
          title="Pause Game"
        >
          <Pause size={16} />
        </button>
      </div>
    </div>
  );
}
