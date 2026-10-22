import React from 'react';
import { X, RefreshCw, ArrowLeftRight, Check, Sparkles } from 'lucide-react';
import { BUBBLE_THEMES } from '../../config/gameConfig';
import { soundEngine } from '../../utils/soundEngine';

export default function BubbleSelector({
  isOpen,
  onClose,
  availableColors = [],
  currentBubble = 'red',
  nextBubble = 'blue',
  onSelectBubble,
  onSwap,
  onCycle
}) {
  if (!isOpen) return null;

  const currentTheme = BUBBLE_THEMES[currentBubble] || BUBBLE_THEMES.red;
  const nextTheme = BUBBLE_THEMES[nextBubble] || BUBBLE_THEMES.blue;

  // Filter valid colors or fallback to default palette
  const colorsToShow = availableColors.length > 0 
    ? availableColors 
    : ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        background: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0 0.75rem 0.75rem 0.75rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Selector Container Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(10, 15, 30, 0.98) 100%)',
          border: '1.5px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '1.25rem',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(56, 189, 248, 0.15)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          userSelect: 'none',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, rgba(16, 208, 94, 0.25), rgba(6, 182, 212, 0.25))',
              border: '1px solid rgba(16, 208, 94, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#f8fafc', margin: 0, letterSpacing: '0.02em' }}>
                SELECT BUBBLE
              </h3>
              <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0 }}>
                Tap any bubble to equip it immediately into your shooter
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            title="Close"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Current & Next Quick Exchange Preview */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: '0.85rem',
          padding: '0.55rem 0.75rem',
          gap: '0.5rem'
        }}>
          {/* Active Bubble */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${currentTheme.light}, ${currentTheme.main} 60%, ${currentTheme.dark} 100%)`,
              border: `2px solid ${currentTheme.rim}`,
              boxShadow: `0 0 10px ${currentTheme.glow || 'rgba(0,0,0,0.5)'}`
            }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: '800', letterSpacing: '0.05em' }}>
                LOADED (ACTIVE)
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#f8fafc', textTransform: 'capitalize' }}>
                {currentBubble} Bubble
              </span>
            </div>
          </div>

          {/* Center Swap Arrow Button */}
          <button
            onClick={() => {
              soundEngine.playSwap();
              onSwap();
            }}
            title="Swap with Reserve Bubble"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'linear-gradient(135deg, rgba(16, 208, 94, 0.25), rgba(6, 182, 212, 0.25))',
              border: '1.5px solid rgba(16, 208, 94, 0.5)',
              borderRadius: '9999px',
              padding: '0.35rem 0.65rem',
              color: '#34d399',
              fontSize: '0.72rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(16, 208, 94, 0.25)'
            }}
          >
            <ArrowLeftRight size={13} />
            <span>SWAP</span>
          </button>

          {/* Reserve Bubble */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', letterSpacing: '0.05em' }}>
                RESERVE
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#f8fafc', textTransform: 'capitalize' }}>
                {nextBubble}
              </span>
            </div>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${nextTheme.light}, ${nextTheme.main} 60%, ${nextTheme.dark} 100%)`,
              border: `1.5px solid ${nextTheme.rim}`,
              boxShadow: `0 0 8px ${nextTheme.glow || 'rgba(0,0,0,0.4)'}`
            }} />
          </div>
        </div>

        {/* Color Palette Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(68px, 1fr))',
          gap: '0.6rem',
          padding: '0.2rem 0'
        }}>
          {colorsToShow.map((colorKey, idx) => {
            const theme = BUBBLE_THEMES[colorKey] || BUBBLE_THEMES.red;
            const isCurrent = currentBubble === colorKey;
            const isNext = nextBubble === colorKey;

            return (
              <button
                key={colorKey}
                onClick={() => {
                  onSelectBubble(colorKey);
                  onClose();
                }}
                style={{
                  background: isCurrent 
                    ? 'rgba(56, 189, 248, 0.2)' 
                    : isNext 
                    ? 'rgba(168, 85, 247, 0.15)' 
                    : 'rgba(30, 41, 59, 0.45)',
                  border: isCurrent 
                    ? '2px solid #38bdf8' 
                    : isNext 
                    ? '1.5px solid rgba(168, 85, 247, 0.6)' 
                    : '1px solid rgba(148, 163, 184, 0.18)',
                  borderRadius: '0.85rem',
                  padding: '0.55rem 0.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                  boxShadow: isCurrent ? '0 0 16px rgba(56, 189, 248, 0.35)' : 'none'
                }}
              >
                {/* 3D Bubble Sphere */}
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 35%, ${theme.light}, ${theme.main} 60%, ${theme.dark} 100%)`,
                  border: `2px solid ${theme.rim}`,
                  boxShadow: `0 4px 10px rgba(0,0,0,0.5), 0 0 12px ${theme.glow || 'transparent'}`,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Glossy top-left highlight */}
                  <div style={{
                    position: 'absolute',
                    top: '5px',
                    left: '8px',
                    width: '12px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.85)',
                    transform: 'rotate(-30deg)'
                  }} />

                  {isCurrent && (
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.85)',
                      borderRadius: '50%',
                      padding: '2px',
                      color: '#38bdf8',
                      display: 'flex'
                    }}>
                      <Check size={13} strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Color Label */}
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  color: isCurrent ? '#38bdf8' : '#f8fafc',
                  textTransform: 'capitalize',
                  letterSpacing: '0.02em'
                }}>
                  {colorKey}
                </span>

                {/* Status Pill */}
                {isCurrent && (
                  <span style={{
                    fontSize: '0.58rem',
                    fontWeight: '800',
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.25)',
                    padding: '1px 5px',
                    borderRadius: '9999px',
                    lineHeight: 1.2
                  }}>
                    ACTIVE
                  </span>
                )}
                {!isCurrent && isNext && (
                  <span style={{
                    fontSize: '0.58rem',
                    fontWeight: '800',
                    color: '#c084fc',
                    background: 'rgba(168, 85, 247, 0.25)',
                    padding: '1px 5px',
                    borderRadius: '9999px',
                    lineHeight: 1.2
                  }}>
                    NEXT
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(148, 163, 184, 0.12)',
          paddingTop: '0.65rem'
        }}>
          <button
            onClick={() => {
              onCycle();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '0.6rem',
              padding: '0.4rem 0.75rem',
              color: '#e2e8f0',
              fontSize: '0.74rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} />
            <span>Cycle Next (Key C)</span>
          </button>

          <span style={{ fontSize: '0.66rem', color: '#64748b' }}>
            Shortcut: S to swap, C to cycle
          </span>
        </div>
      </div>
    </div>
  );
}
