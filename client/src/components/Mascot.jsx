import React from 'react';

export default function Mascot({ mood = 'happy', message = null, size = 80 }) {
  // Moods: happy, thinking, celebrate, worried, cheering
  const getFace = () => {
    switch (mood) {
      case 'celebrate':
        return (
          <>
            {/* Joyful curved eyes */}
            <path d="M 28 42 Q 35 32 42 42" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 58 42 Q 65 32 72 42" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Big happy open mouth */}
            <path d="M 40 54 Q 50 68 60 54 Z" fill="#ec4899" stroke="#1e1b4b" strokeWidth="2" />
            {/* Blushing cheeks */}
            <ellipse cx="26" cy="48" rx="5" ry="3" fill="#f43f5e" opacity="0.6" />
            <ellipse cx="74" cy="48" rx="5" ry="3" fill="#f43f5e" opacity="0.6" />
          </>
        );
      case 'worried':
        return (
          <>
            {/* Worried eyes */}
            <ellipse cx="35" cy="42" rx="4" ry="6" fill="#1e1b4b" />
            <ellipse cx="65" cy="42" rx="4" ry="6" fill="#1e1b4b" />
            {/* Nervous mouth */}
            <path d="M 42 58 Q 50 52 58 58" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        );
      case 'thinking':
        return (
          <>
            {/* Pondering wink/glance */}
            <ellipse cx="36" cy="40" rx="5" ry="5" fill="#1e1b4b" />
            <path d="M 58 42 L 70 38" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" />
            {/* Curious little mouth */}
            <circle cx="50" cy="56" r="3" fill="#1e1b4b" />
          </>
        );
      default: // Happy
        return (
          <>
            <circle cx="36" cy="42" r="5" fill="#1e1b4b" />
            <circle cx="38" cy="40" r="1.8" fill="#ffffff" />
            <circle cx="64" cy="42" r="5" fill="#1e1b4b" />
            <circle cx="66" cy="40" r="1.8" fill="#ffffff" />
            {/* Cute smile */}
            <path d="M 42 52 Q 50 60 58 52" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx="28" cy="48" rx="4" ry="2.5" fill="#f43f5e" opacity="0.5" />
            <ellipse cx="72" cy="48" rx="4" ry="2.5" fill="#f43f5e" opacity="0.5" />
          </>
        );
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
      <div className="animate-float" style={{ width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <defs>
            <radialGradient id="spriteGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="70%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </radialGradient>
            <radialGradient id="wingGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fdf4ff" />
              <stop offset="100%" stopColor="#f472b6" />
            </radialGradient>
          </defs>

          {/* Little Star Sprite Wings */}
          <path d="M 18 35 Q 2 20 15 50 Q 18 42 22 40 Z" fill="url(#wingGrad)" opacity="0.85" />
          <path d="M 82 35 Q 98 20 85 50 Q 82 42 78 40 Z" fill="url(#wingGrad)" opacity="0.85" />

          {/* Antenna / Star tip */}
          <path d="M 50 25 Q 50 12 56 10" stroke="#0891b2" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <circle cx="58" cy="9" r="6" fill="#fde047" stroke="#eab308" strokeWidth="1.5" />

          {/* Soft round body */}
          <circle cx="50" cy="50" r="34" fill="url(#spriteGrad)" stroke="#164e63" strokeWidth="2" />

          {/* Highlights */}
          <ellipse cx="40" cy="28" rx="12" ry="6" fill="#ffffff" opacity="0.4" />

          {/* Dynamic Face */}
          {getFace()}
        </svg>
      </div>

      {message && (
        <div className="glass-panel" style={{
          padding: '0.5rem 0.85rem',
          borderRadius: '0.75rem',
          fontSize: '0.85rem',
          maxWidth: '220px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          background: 'rgba(15, 23, 42, 0.85)',
          color: '#f8fafc'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}
