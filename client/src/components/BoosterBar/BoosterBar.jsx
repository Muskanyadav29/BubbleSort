import React from 'react';
import { Crosshair, Bomb, Sparkles, PlusCircle, Shuffle, Lightbulb, ArrowLeftRight, Palette } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';
import { BUBBLE_THEMES } from '../../config/gameConfig';

export default function BoosterBar({
  inventory = {},
  onUseBooster,
  activeBoosters = {},
  onHint,
  onSwap,
  onOpenBubbleSelector,
  nextBubble = 'blue'
}) {
  const nextTheme = BUBBLE_THEMES[nextBubble] || BUBBLE_THEMES.blue;

  const boosters = [
    {
      id: 'aimGuide',
      name: 'Aim Laser',
      shortName: 'Aim',
      icon: <Crosshair size={16} color="#ffffff" strokeWidth={2.6} />,
      color: '#38bdf8',
      lightColor: '#7dd3fc',
      darkColor: '#0284c7',
      bgGrad: 'linear-gradient(145deg, rgba(56, 189, 248, 0.45), rgba(14, 165, 233, 0.18))',
      desc: 'Extends aiming trajectory laser',
      count: inventory.aimGuide !== undefined ? inventory.aimGuide : 3
    },
    {
      id: 'bomb',
      name: 'Bomb',
      shortName: 'Bomb',
      icon: <Bomb size={16} color="#ffffff" strokeWidth={2.6} />,
      color: '#ef4444',
      lightColor: '#f87171',
      darkColor: '#b91c1c',
      bgGrad: 'linear-gradient(145deg, rgba(239, 68, 68, 0.45), rgba(220, 38, 38, 0.18))',
      desc: 'Explosive blast clears surrounding bubbles',
      count: inventory.bomb !== undefined ? inventory.bomb : 2
    },
    {
      id: 'rainbow',
      name: 'Wild Rainbow',
      shortName: 'Wild',
      icon: <Sparkles size={16} color="#ffffff" strokeWidth={2.6} />,
      color: '#a855f7',
      lightColor: '#c084fc',
      darkColor: '#7e22ce',
      bgGrad: 'linear-gradient(145deg, rgba(168, 85, 247, 0.45), rgba(139, 92, 246, 0.18))',
      desc: 'Wild color matches any target',
      count: inventory.rainbow !== undefined ? inventory.rainbow : 2
    },
    {
      id: 'extraShot',
      name: '+5 Shots',
      shortName: '+5',
      icon: <PlusCircle size={16} color="#ffffff" strokeWidth={2.6} />,
      color: '#22c55e',
      lightColor: '#4ade80',
      darkColor: '#15803d',
      bgGrad: 'linear-gradient(145deg, rgba(34, 197, 94, 0.45), rgba(21, 128, 61, 0.18))',
      desc: 'Grants +5 additional ammo shots',
      count: inventory.extraShot !== undefined ? inventory.extraShot : 3
    },
    {
      id: 'shuffle',
      name: 'Shuffle Grid',
      shortName: 'Mix',
      icon: <Shuffle size={16} color="#ffffff" strokeWidth={2.6} />,
      color: '#f59e0b',
      lightColor: '#fbbf24',
      darkColor: '#b45309',
      bgGrad: 'linear-gradient(145deg, rgba(245, 158, 11, 0.45), rgba(217, 119, 6, 0.18))',
      desc: 'Shuffles colors on the grid',
      count: inventory.shuffle !== undefined ? inventory.shuffle : 2
    }
  ];

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(180deg, rgba(8, 18, 38, 0.98) 0%, rgba(4, 10, 22, 0.99) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '2px solid rgba(56, 189, 248, 0.35)',
      boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
      padding: '0.45rem 0.5rem calc(0.45rem + env(safe-area-inset-bottom, 6px)) 0.5rem',
      flexShrink: 0,
      zIndex: 25,
      userSelect: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.35rem',
      boxSizing: 'border-box'
    }}>
      <style>{`
        @keyframes activePulseGlow {
          0%, 100% { filter: drop-shadow(0 0 6px currentColor); transform: scale(1.02); }
          50% { filter: drop-shadow(0 0 14px currentColor); transform: scale(1.05); }
        }
        .booster-btn:active {
          transform: scale(0.93) !important;
        }
      `}</style>

      {/* Row 1: Tactical Controls (Swap, Select Color, Hint) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.4rem',
        width: '100%'
      }}>
        {/* 1. Swap Bubble Button */}
        <button
          className="booster-btn"
          onClick={() => {
            soundEngine.playSwap();
            if (onSwap) onSwap();
          }}
          title="Swap current bubble with reserve bubble (Hotkey: S)"
          style={{
            flex: 1,
            minWidth: 0,
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '0 0.5rem',
            borderRadius: '11px',
            border: '1.5px solid rgba(52, 211, 153, 0.65)',
            background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.35), rgba(6, 95, 70, 0.3))',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
            color: '#6ee7b7',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontSize: '0.78rem',
            fontWeight: '900',
            letterSpacing: '0.2px'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <ArrowLeftRight size={15} color="#34d399" />
          {/* Miniature 3D reserve bubble preview */}
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${nextTheme.light}, ${nextTheme.main} 60%, ${nextTheme.dark} 100%)`,
            border: `1.2px solid ${nextTheme.rim}`,
            boxShadow: `0 0 6px ${nextTheme.glow || 'rgba(0,0,0,0.6)'}`,
            flexShrink: 0
          }} />
          <span style={{ whiteSpace: 'nowrap' }}>Swap</span>
        </button>

        {/* 2. Select Bubble Palette Button */}
        <button
          className="booster-btn"
          onClick={() => {
            soundEngine.playButtonClick();
            if (onOpenBubbleSelector) onOpenBubbleSelector();
          }}
          title="Choose a specific color from palette (Hotkey: C or 1-9)"
          style={{
            flex: 1,
            minWidth: 0,
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '0 0.5rem',
            borderRadius: '11px',
            border: '1.5px solid rgba(56, 189, 248, 0.65)',
            background: 'linear-gradient(145deg, rgba(14, 165, 233, 0.35), rgba(3, 105, 161, 0.3))',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
            color: '#7dd3fc',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontSize: '0.78rem',
            fontWeight: '900',
            letterSpacing: '0.2px'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Palette size={15} color="#38bdf8" />
          <span style={{ whiteSpace: 'nowrap' }}>Select</span>
        </button>

        {/* 3. Strategy Hint Button */}
        <button
          className="booster-btn"
          onClick={() => {
            soundEngine.playButtonClick();
            if (onHint) onHint();
          }}
          title="Strategy hint and aim guidance (Hotkey: H)"
          style={{
            flex: 1,
            minWidth: 0,
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '0 0.5rem',
            borderRadius: '11px',
            border: '1.5px solid rgba(245, 158, 11, 0.65)',
            background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.35), rgba(180, 83, 9, 0.3))',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
            color: '#fcd34d',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontSize: '0.78rem',
            fontWeight: '900',
            letterSpacing: '0.2px'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Lightbulb size={15} color="#fbbf24" />
          <span style={{ whiteSpace: 'nowrap' }}>Hint</span>
        </button>
      </div>

      {/* Row 2: Gamified Power-Up Cards (Mobile Optimized & Proportional) */}
      <div style={{
        display: 'flex',
        gap: '0.35rem',
        justifyContent: 'center',
        alignItems: 'stretch',
        width: '100%'
      }}>
        {boosters.map(b => {
          const isSelected = activeBoosters[b.id];
          const disabled = b.count <= 0 && !isSelected;

          return (
            <button
              key={b.id}
              className="booster-btn"
              onClick={() => {
                soundEngine.playBooster();
                onUseBooster(b.id);
              }}
              disabled={disabled}
              title={`${b.name}: ${b.desc}`}
              style={{
                position: 'relative',
                flex: 1,
                minWidth: 0,
                height: '54px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px 2px 2px 2px',
                borderRadius: '12px',
                border: isSelected
                  ? `2px solid ${b.color}`
                  : `1.5px solid ${disabled ? 'rgba(71, 85, 105, 0.3)' : `${b.color}55`}`,
                background: isSelected
                  ? b.bgGrad
                  : disabled
                  ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(10, 15, 30, 0.8) 100%)'
                  : 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(7, 12, 26, 0.98) 100%)',
                boxShadow: isSelected
                  ? `0 0 16px ${b.color}77, 0 4px 12px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.4)`
                  : '0 3px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.38 : 1,
                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                overflow: 'visible'
              }}
              onMouseEnter={e => {
                if (!disabled) {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
                  e.currentTarget.style.boxShadow = `0 4px 14px ${b.color}55, 0 3px 8px rgba(0,0,0,0.4)`;
                }
              }}
              onMouseLeave={e => {
                if (!disabled) {
                  e.currentTarget.style.transform = isSelected ? 'scale(1.03)' : 'scale(1)';
                  e.currentTarget.style.boxShadow = isSelected
                    ? `0 0 16px ${b.color}77, 0 4px 12px rgba(0,0,0,0.5)`
                    : '0 3px 8px rgba(0,0,0,0.35)';
                }
              }}
            >
              {/* Count Badge Pill */}
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-2px',
                background: `linear-gradient(135deg, ${b.lightColor || b.color}, ${b.darkColor || b.color})`,
                color: '#ffffff',
                fontSize: '0.62rem',
                fontWeight: '900',
                padding: '1px 5px',
                borderRadius: '9999px',
                boxShadow: `0 2px 6px ${b.color}88, inset 0 1px 0 rgba(255,255,255,0.5)`,
                border: '1px solid rgba(255,255,255,0.4)',
                lineHeight: '12px',
                minWidth: '16px',
                textAlign: 'center',
                letterSpacing: '0.1px',
                zIndex: 2
              }}>
                {b.count}
              </span>

              {/* Glossy 3D Circle Icon Badge */}
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 30%, ${b.lightColor || b.color}, ${b.darkColor || b.color} 80%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 2px 8px ${b.color}66, inset 0 1px 2px rgba(255,255,255,0.6)`,
                border: `1.2px solid rgba(255,255,255,0.35)`,
                flexShrink: 0
              }}>
                {b.icon}
              </div>

              {/* Card Single-Line Label */}
              <span style={{
                fontSize: '0.62rem',
                fontWeight: '800',
                color: isSelected ? '#ffffff' : b.lightColor || '#e2e8f0',
                textShadow: isSelected ? `0 0 6px ${b.color}` : '0 1px 2px rgba(0,0,0,0.8)',
                letterSpacing: '0.1px',
                marginTop: '2px',
                whiteSpace: 'nowrap',
                lineHeight: '1',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>
                {b.shortName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
