import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, ArrowRight, RotateCcw, Grid, Sparkles, Zap, Award } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

const AnimatedNumber = ({ value, duration = 1200 }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return <span>{display.toLocaleString()}</span>;
};

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
  const [showStars, setShowStars] = useState([false, false, false]);
  const [showStats, setShowStats] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    // Multi-stage confetti celebration
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6, x: 0.25 }, colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#34d399'] });
    setTimeout(() => {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5, x: 0.5 }, colors: ['#10b981', '#34d399', '#38bdf8', '#a855f7'] });
    }, 280);
    setTimeout(() => {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6, x: 0.75 }, colors: ['#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'] });
    }, 560);

    // Staggered star reveal animations
    setTimeout(() => setShowStars(p => [true, p[1], p[2]]), 350);
    setTimeout(() => setShowStars(p => [p[0], true, p[2]]), 700);
    setTimeout(() => setShowStars(p => [p[0], p[1], true]), 1050);

    setTimeout(() => setShowStats(true), 1300);
    setTimeout(() => setShowButtons(true), 1600);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(circle at 50% 45%, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.85) 55%, rgba(4, 10, 22, 0.96) 100%)',
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
        @keyframes sunburstSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes floatSparks {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          40% { opacity: 0.8; }
          100% { transform: translateY(-160px) scale(1.1); opacity: 0; }
        }
        @keyframes modalPopJuicy {
          0% { transform: scale(0.7) translateY(40px); opacity: 0; }
          65% { transform: scale(1.04) translateY(-4px); opacity: 1; }
          85% { transform: scale(0.98) translateY(1px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes starPopBurst {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          60% { transform: scale(1.35) rotate(10deg); opacity: 1; }
          80% { transform: scale(0.92) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes crownPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.6)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 22px rgba(245, 158, 11, 0.9)); }
        }
        @keyframes bannerSheen {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* Rotating Sunburst Celebration Beams in Background */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'repeating-conic-gradient(from 0deg, rgba(251, 191, 36, 0.1) 0deg 12deg, transparent 12deg 24deg)',
        animation: 'sunburstSpin 40s linear infinite',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Floating Sparkles & Light Motes */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        {[
          { left: '20%', bottom: '20%', delay: '0s', dur: '3.2s', size: 6 },
          { left: '35%', bottom: '15%', delay: '1s', dur: '3.8s', size: 8 },
          { left: '65%', bottom: '25%', delay: '0.5s', dur: '3.5s', size: 7 },
          { left: '80%', bottom: '18%', delay: '1.8s', dur: '4s', size: 9 },
          { left: '50%', bottom: '10%', delay: '2.2s', dur: '3s', size: 5 },
        ].map((sp, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: sp.left,
              bottom: sp.bottom,
              width: `${sp.size}px`,
              height: `${sp.size}px`,
              borderRadius: '50%',
              background: '#fef08a',
              boxShadow: '0 0 12px #facc15',
              animation: `floatSparks ${sp.dur} ${sp.delay} ease-out infinite`
            }}
          />
        ))}
      </div>

      {/* Gamified Fantasy Modal Card */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '380px',
        background: 'linear-gradient(180deg, rgba(17, 27, 49, 0.96) 0%, rgba(9, 15, 30, 0.98) 100%)',
        borderRadius: '1.75rem',
        border: '3px solid #f59e0b',
        boxShadow: '0 0 35px rgba(245, 158, 11, 0.35), 0 25px 60px rgba(0, 0, 0, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.25)',
        padding: '1.5rem 1.25rem 1.25rem 1.25rem',
        textAlign: 'center',
        animation: 'modalPopJuicy 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      }}>

        {/* Top Trophy Crest Badge */}
        <div style={{
          position: 'absolute',
          top: '-32px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #fef08a, #f59e0b 60%, #b45309 100%)',
          border: '3px solid #ffffff',
          boxShadow: '0 8px 20px rgba(245, 158, 11, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'crownPulse 2.5s ease-in-out infinite'
        }}>
          <Trophy size={32} color="#78350f" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
        </div>

        {/* Header Ribbon Banner */}
        <div style={{
          marginTop: '1.25rem',
          background: 'linear-gradient(90deg, #b45309 0%, #f59e0b 25%, #fef08a 50%, #f59e0b 75%, #b45309 100%)',
          backgroundSize: '200% auto',
          animation: 'bannerSheen 3s linear infinite',
          padding: '0.45rem 1rem',
          borderRadius: '0.85rem',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          border: '1.5px solid #fef08a',
          marginBottom: '0.75rem'
        }}>
          <h2 style={{
            fontSize: '1.45rem',
            fontWeight: '900',
            color: '#78350f',
            textShadow: '0 1px 2px rgba(255,255,255,0.8)',
            letterSpacing: '1.5px',
            margin: 0,
            textTransform: 'uppercase',
            fontFamily: 'var(--font-display)'
          }}>
            🎉 Level {levelNumber} Cleared!
          </h2>
        </div>

        {/* 3 Juicy 3D Golden Stars */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.9rem',
          marginBottom: '1rem',
          minHeight: '62px'
        }}>
          {[1, 2, 3].map((s, i) => {
            const earned = s <= stars;
            const visible = showStars[i];
            const isCenter = s === 2;
            const starSize = isCenter ? 52 : 44;

            return (
              <div
                key={s}
                style={{
                  position: 'relative',
                  transform: visible ? (isCenter ? 'scale(1.1) translateY(-4px)' : 'scale(1)') : 'scale(0)',
                  opacity: visible ? 1 : 0,
                  animation: visible ? 'starPopBurst 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {earned && visible && (
                  <div style={{
                    position: 'absolute',
                    inset: '-8px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(251, 191, 36, 0.5) 0%, transparent 70%)',
                    zIndex: -1
                  }} />
                )}
                <Star
                  size={starSize}
                  fill={earned ? '#f59e0b' : '#1e293b'}
                  color={earned ? '#fbbf24' : '#334155'}
                  strokeWidth={earned ? 2.5 : 1.5}
                  style={{
                    filter: earned
                      ? 'drop-shadow(0 0 14px rgba(245, 158, 11, 0.9)) drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
                      : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Gamified Mission Statistics Plaque */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(20, 30, 55, 0.85) 100%)',
          borderRadius: '1.15rem',
          padding: '0.85rem 0.9rem',
          marginBottom: '1.1rem',
          border: '1.5px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 6px 18px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          opacity: showStats ? 1 : 0,
          transform: showStats ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.65rem'
          }}>
            {[
              { label: 'Score', value: <AnimatedNumber value={score} />, color: '#38bdf8', icon: <Zap size={14} color="#38bdf8" /> },
              { label: 'Ammo Left', value: `${shotsRemaining} Shots`, color: '#22c55e', icon: <span>🎯</span> },
              { label: 'Bubbles Popped', value: bubblesPopped, color: '#f43f5e', icon: <span>💥</span> },
              { label: 'Best Combo', value: `x${bestCombo}`, color: '#fbbf24', icon: <Sparkles size={14} color="#fbbf24" /> },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.55rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>{stat.icon}</span>
                <div style={{ textAlign: 'left', minWidth: 0 }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {stat.label}
                  </div>
                  <div style={{ color: stat.color, fontWeight: '900', fontSize: '0.95rem', letterSpacing: '0.2px' }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Juicy Chunky 3D Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          opacity: showButtons ? 1 : 0,
          transform: showButtons ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          {/* Big Green Next Level Button */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onNextLevel();
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
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5), inset 0 2px 3px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.4)',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-display)',
              textShadow: '0 1px 3px rgba(0,0,0,0.4)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.7), inset 0 2px 3px rgba(255,255,255,0.7)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5), inset 0 2px 3px rgba(255,255,255,0.6)';
            }}
          >
            <span>NEXT LEVEL</span>
            <ArrowRight size={20} strokeWidth={3} />
          </button>

          {/* Replay & Levels Secondary Buttons */}
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onReplay();
              }}
              style={{
                flex: 1,
                padding: '0.7rem',
                fontSize: '0.85rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.22) 0%, rgba(180, 83, 9, 0.22) 100%)',
                border: '1.5px solid rgba(245, 158, 11, 0.5)',
                borderRadius: '0.95rem',
                color: '#fcd34d',
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <RotateCcw size={16} strokeWidth={2.5} />
              <span>Replay</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onLevelSelect();
              }}
              style={{
                flex: 1,
                padding: '0.7rem',
                fontSize: '0.85rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.18) 0%, rgba(3, 105, 161, 0.18) 100%)',
                border: '1.5px solid rgba(56, 189, 248, 0.45)',
                borderRadius: '0.95rem',
                color: '#7dd3fc',
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Grid size={16} strokeWidth={2.5} />
              <span>Levels</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
