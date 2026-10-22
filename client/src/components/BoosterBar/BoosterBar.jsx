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
      icon: <Crosshair size={22} color="#fff" strokeWidth={2.5} />,
      color: '#38bdf8',
      lightColor: '#7dd3fc',
      darkColor: '#0284c7',
      bgGrad: 'linear-gradient(145deg, rgba(56, 189, 248, 0.35), rgba(14, 165, 233, 0.12))',
      desc: 'Extends aiming trajectory laser',
      count: inventory.aimGuide !== undefined ? inventory.aimGuide : 3,
      emoji: '🎯'
    },
    {
      id: 'bomb',
      name: 'Bomb',
      icon: <Bomb size={22} color="#fff" strokeWidth={2.5} />,
      color: '#ef4444',
      lightColor: '#f87171',
      darkColor: '#b91c1c',
      bgGrad: 'linear-gradient(145deg, rgba(239, 68, 68, 0.35), rgba(220, 38, 38, 0.12))',
      desc: 'Explosive blast clears surrounding bubbles',
      count: inventory.bomb !== undefined ? inventory.bomb : 2,
      emoji: '💣'
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      icon: <Sparkles size={22} color="#fff" strokeWidth={2.5} />,
      color: '#a855f7',
      lightColor: '#c084fc',
      darkColor: '#7e22ce',
      bgGrad: 'linear-gradient(145deg, rgba(168, 85, 247, 0.35), rgba(139, 92, 246, 0.12))',
      desc: 'Wild color matches any target',
      count: inventory.rainbow !== undefined ? inventory.rainbow : 2,
      emoji: '🌈'
    },
    {
      id: 'extraShot',
      name: '+5 Shots',
      icon: <PlusCircle size={22} color="#fff" strokeWidth={2.5} />,
      color: '#22c55e',
      lightColor: '#4ade80',
      darkColor: '#15803d',
      bgGrad: 'linear-gradient(145deg, rgba(34, 197, 94, 0.35), rgba(21, 128, 61, 0.12))',
      desc: 'Grants +5 additional ammo shots',
      count: inventory.extraShot !== undefined ? inventory.extraShot : 3,
      emoji: '🚀'
    },
    {
      id: 'shuffle',
      name: 'Shuffle',
      icon: <Shuffle size={22} color="#fff" strokeWidth={2.5} />,
      color: '#f59e0b',
      lightColor: '#fbbf24',
      darkColor: '#b45309',
      bgGrad: 'linear-gradient(145deg, rgba(245, 158, 11, 0.35), rgba(217, 119, 6, 0.12))',
      desc: 'Shuffles colors on the grid',
      count: inventory.shuffle !== undefined ? inventory.shuffle : 2,
      emoji: '🔀'
    }
  ];

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(180deg, rgba(7, 16, 34, 0.94) 0%, rgba(4, 10, 22, 0.98) 100%)',
      backdropFilter: 'blur(20px)',
      borderTop: '2px solid rgba(56, 189, 248, 0.25)',
      boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      padding: '0.65rem 0.65rem calc(0.75rem + env(safe-area-inset-bottom, 12px)) 0.65rem',
      flexShrink: 0,
      zIndex: 25,
      userSelect: 'none'
    }}>
      <style>{`
        @keyframes cardGlowPulse {
          0%, 100% { transform: scale(1.03); filter: drop-shadow(0 0 8px currentColor); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 16px currentColor); }
        }
        @keyframes subtleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>

      {/* Row 1: Tactical Controls (Swap, Select Color, Hint) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '0.65rem'
      }}>
        {/* Swap Bubble Button */}
        <button
          onClick={() => {
            soundEngine.playSwap();
            if (onSwap) onSwap();
          }}
          title="Swap loaded bubble with reserve bubble"
          style={{
            flex: 1,
            maxWidth: '135px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '0.55rem 0.65rem',
            borderRadius: '0.85rem',
            border: '1.5px solid rgba(52, 211, 153, 0.45)',
            background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.22), rgba(6, 95, 70, 0.15))',
            boxShadow: '0 3px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
            color: '#6ee7b7',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            fontSize: '0.8rem',
            fontWeight: '800',
            letterSpacing: '0.3px'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <ArrowLeftRight size={15} color="#34d399" />
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${nextTheme.light}, ${nextTheme.main} 60%, ${nextTheme.dark} 100%)`,
            border: `1px solid ${nextTheme.rim}`,
            boxShadow: `0 0 8px ${nextTheme.glow || 'rgba(0,0,0,0.6)'}`
          }} />
          <span>Swap</span>
        </button>

        {/* Select Bubble Button */}
        <button
          onClick={() => {
            soundEngine.playButtonClick();
            if (onOpenBubbleSelector) onOpenBubbleSelector();
          }}
          title="Select specific color for active bubble"
          style={{
            flex: 1,
            maxWidth: '135px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '0.55rem 0.65rem',
            borderRadius: '0.85rem',
            border: '1.5px solid rgba(56, 189, 248, 0.45)',
            background: 'linear-gradient(145deg, rgba(14, 165, 233, 0.22), rgba(3, 105, 161, 0.15))',
            boxShadow: '0 3px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
            color: '#7dd3fc',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            fontSize: '0.8rem',
            fontWeight: '800',
            letterSpacing: '0.3px'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Palette size={15} color="#38bdf8" />
          <span>Select</span>
        </button>

        {/* Bank Shot Hint Button */}
        <button
          onClick={() => {
            soundEngine.playButtonClick();
            if (onHint) onHint();
          }}
          title="Highlight optimal wall bounce angle"
          style={{
            flex: 1,
            maxWidth: '135px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '0.55rem 0.65rem',
            borderRadius: '0.85rem',
            border: '1.5px solid rgba(245, 158, 11, 0.45)',
            background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.22), rgba(180, 83, 9, 0.15))',
            boxShadow: '0 3px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
            color: '#fcd34d',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            fontSize: '0.8rem',
            fontWeight: '800',
            letterSpacing: '0.3px'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Lightbulb size={15} color="#fbbf24" />
          <span>Hint</span>
        </button>
      </div>

      {/* Row 2: Gamified Power-Up Cards (Taller, Reachable & Chunky) */}
      <div style={{
        display: 'flex',
        gap: '0.45rem',
        justifyContent: 'center',
        alignItems: 'stretch'
      }}>
        {boosters.map(b => {
          const isSelected = activeBoosters[b.id];
          const disabled = b.count <= 0 && !isSelected;

          return (
            <button
              key={b.id}
              onClick={() => {
                soundEngine.playBooster();
                onUseBooster(b.id);
              }}
              disabled={disabled}
              title={`${b.name}: ${b.desc}`}
              style={{
                position: 'relative',
                flex: 1,
                minHeight: '76px',
                maxWidth: '82px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.3rem 0.45rem 0.3rem',
                borderRadius: '1rem',
                border: isSelected
                  ? `2.5px solid ${b.color}`
                  : `1.5px solid ${disabled ? 'rgba(71, 85, 105, 0.3)' : `${b.color}55`}`,
                background: isSelected
                  ? b.bgGrad
                  : disabled
                  ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(10, 15, 30, 0.8) 100%)'
                  : 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(7, 12, 26, 0.95) 100%)',
                boxShadow: isSelected
                  ? `0 0 20px ${b.color}77, 0 6px 16px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.4)`
                  : '0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.4 : 1,
                transform: isSelected ? 'scale(1.04) translateY(-2px)' : 'scale(1)',
                transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                userSelect: 'none',
                overflow: 'visible'
              }}
              onMouseEnter={e => {
                if (!disabled) {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)';
                  e.currentTarget.style.boxShadow = `0 6px 18px ${b.color}44, 0 4px 12px rgba(0,0,0,0.4)`;
                }
              }}
              onMouseLeave={e => {
                if (!disabled) {
                  e.currentTarget.style.transform = isSelected ? 'scale(1.04) translateY(-2px)' : 'scale(1)';
                  e.currentTarget.style.boxShadow = isSelected
                    ? `0 0 20px ${b.color}77, 0 6px 16px rgba(0,0,0,0.5)`
                    : '0 4px 12px rgba(0,0,0,0.35)';
                }
              }}
            >
              {/* Top-Right Count Badge Pill */}
              <span style={{
                position: 'absolute',
                top: '-7px',
                right: '-5px',
                background: `linear-gradient(135deg, ${b.lightColor || b.color}, ${b.darkColor || b.color})`,
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: '900',
                padding: '2px 7px',
                borderRadius: '9999px',
                boxShadow: `0 2px 8px ${b.color}88, inset 0 1px 0 rgba(255,255,255,0.5)`,
                border: '1.5px solid rgba(255,255,255,0.35)',
                lineHeight: '13px',
                minWidth: '20px',
                textAlign: 'center',
                letterSpacing: '0.2px'
              }}>
                {b.count}
              </span>

              {/* Glossy 3D Circle Icon Badge */}
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 30%, ${b.lightColor || b.color}, ${b.darkColor || b.color} 80%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 3px 10px ${b.color}66, inset 0 1px 2px rgba(255,255,255,0.6)`,
                border: `1.5px solid rgba(255,255,255,0.3)`,
                transition: 'transform 0.2s ease',
                flexShrink: 0
              }}>
                {b.icon}
              </div>

              {/* Card Label */}
              <span style={{
                fontSize: '0.72rem',
                fontWeight: '800',
                color: isSelected ? '#ffffff' : b.lightColor || '#e2e8f0',
                textShadow: isSelected ? `0 0 8px ${b.color}` : '0 1px 2px rgba(0,0,0,0.8)',
                letterSpacing: '0.3px',
                marginTop: '3px',
                whiteSpace: 'nowrap',
                lineHeight: '1'
              }}>
                {b.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
