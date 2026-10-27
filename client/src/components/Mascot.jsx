import React from 'react';

export default function Mascot({ mood = 'happy', message = null, size = 80 }) {
  // Mood badge / glow
  const getGlowColor = () => {
    switch (mood) {
      case 'celebrate': return '#10b981';
      case 'cheering': return '#f59e0b';
      case 'worried': return '#ef4444';
      case 'thinking': return '#8b5cf6';
      default: return '#0ea5e9';
    }
  };

  const getMoodBadge = () => {
    switch (mood) {
      case 'celebrate': return '✨';
      case 'cheering': return '🔥';
      case 'worried': return '⚡';
      case 'thinking': return '💡';
      default: return '⭐';
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
      <div className="animate-float" style={{
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        position: 'relative'
      }}>
        {/* Glow halo */}
        <div style={{
          position: 'absolute',
          inset: -3,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${getGlowColor()} 0%, transparent 70%)`,
          opacity: 0.65,
          filter: 'blur(4px)'
        }} />
        
        {/* 3D Generated Mascot Image */}
        <img
          src="/assets/mascot_avatar.jpg"
          alt="Adventure Mascot"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            border: `2.5px solid ${getGlowColor()}`,
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            display: 'block'
          }}
        />

        {/* Small mood badge tag */}
        <div style={{
          position: 'absolute',
          bottom: -2,
          right: -2,
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: getGlowColor(),
          border: '1.5px solid #ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
        }}>
          {getMoodBadge()}
        </div>
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
          color: '#f8fafc',
          lineHeight: '1.35',
          fontWeight: '600'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}
