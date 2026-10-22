import React from 'react';
import { Crosshair, Bomb, Sparkles, PlusCircle, Shuffle, RotateCcw, Lightbulb, ArrowLeftRight, Palette } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';
import { BUBBLE_THEMES } from '../../config/gameConfig';

export default function BoosterBar({
  inventory = {},
  onUseBooster,
  activeBoosters = {},
  canUndo = false,
  onUndo,
  onHint,
  onSwap,
  onOpenBubbleSelector,
  nextBubble = 'blue'
}) {
  const nextTheme = BUBBLE_THEMES[nextBubble] || BUBBLE_THEMES.blue;

  const boosters = [
    {
      id: 'aimGuide',
      name: 'Guide',
      icon: <Crosshair size={16} color="#38bdf8" />,
      color: '#38bdf8',
      desc: 'Extends aiming trajectory laser',
      count: inventory.aimGuide !== undefined ? inventory.aimGuide : 3
    },
    {
      id: 'bomb',
      name: 'Bomb',
      icon: <Bomb size={16} color="#ef4444" />,
      color: '#ef4444',
      desc: 'Explosive blast clears surrounding bubbles',
      count: inventory.bomb !== undefined ? inventory.bomb : 2
    },
    {
      id: 'rainbow',
      name: 'Star',
      icon: <Sparkles size={16} color="#a855f7" />,
      color: '#a855f7',
      desc: 'Wild color matches any target',
      count: inventory.rainbow !== undefined ? inventory.rainbow : 2
    },
    {
      id: 'extraShot',
      name: '+5',
      icon: <PlusCircle size={16} color="#22c55e" />,
      color: '#22c55e',
      desc: 'Grants +5 additional ammo shots',
      count: inventory.extraShot !== undefined ? inventory.extraShot : 3
    },
    {
      id: 'shuffle',
      name: 'Shuffle',
      icon: <Shuffle size={16} color="#f59e0b" />,
      color: '#f59e0b',
      desc: 'Shuffles colors on the grid',
      count: inventory.shuffle !== undefined ? inventory.shuffle : 2
    }
  ];

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(0deg, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.88) 100%)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(148, 163, 184, 0.15)',
      padding: '0.35rem 0.4rem calc(0.4rem + env(safe-area-inset-bottom, 0px)) 0.4rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.25rem',
      flexShrink: 0,
      zIndex: 20,
      userSelect: 'none'
    }}>
      {/* Undo Button */}
      <button
        onClick={() => {
          soundEngine.playButtonClick();
          if (onUndo) onUndo();
        }}
        disabled={!canUndo}
        title="Undo last shot"
        style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1px',
          padding: '0.3rem 0.45rem',
          borderRadius: '0.55rem',
          border: `1.5px solid ${canUndo ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
          background: canUndo ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
          color: canUndo ? '#38bdf8' : '#64748b',
          cursor: canUndo ? 'pointer' : 'not-allowed',
          minWidth: '42px',
          transition: 'all 0.15s ease'
        }}
      >
        <RotateCcw size={15} />
        <span style={{ fontSize: '0.62rem', fontWeight: '700' }}>Undo</span>
      </button>

      {/* Swap Bubble Button (matching on-canvas curved arrows) */}
      <button
        onClick={() => {
          soundEngine.playSwap();
          if (onSwap) onSwap();
        }}
        title="Swap active bubble with reserve (Key S or C, or tap the arrows on the shooter)"
        style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1px',
          padding: '0.3rem 0.45rem',
          borderRadius: '0.55rem',
          border: '1.5px solid rgba(16, 208, 94, 0.45)',
          background: 'rgba(16, 208, 94, 0.12)',
          color: '#34d399',
          cursor: 'pointer',
          minWidth: '44px',
          position: 'relative',
          transition: 'all 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <ArrowLeftRight size={13} color="#10D05E" />
          {/* Mini Next Bubble Preview */}
          <div style={{
            width: '13px',
            height: '13px',
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${nextTheme.light}, ${nextTheme.main} 60%, ${nextTheme.dark} 100%)`,
            border: `1px solid ${nextTheme.rim}`,
            boxShadow: `0 0 6px ${nextTheme.glow || 'rgba(0,0,0,0.5)'}`
          }} />
        </div>
        <span style={{ fontSize: '0.62rem', fontWeight: '800' }}>Swap</span>
      </button>

      {/* Select / Change Bubble Button */}
      <button
        onClick={() => {
          soundEngine.playButtonClick();
          if (onOpenBubbleSelector) onOpenBubbleSelector();
        }}
        title="Change or select different bubble color"
        style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1px',
          padding: '0.3rem 0.45rem',
          borderRadius: '0.55rem',
          border: '1.5px solid rgba(56, 189, 248, 0.45)',
          background: 'rgba(56, 189, 248, 0.12)',
          color: '#38bdf8',
          cursor: 'pointer',
          minWidth: '44px',
          position: 'relative',
          transition: 'all 0.15s ease'
        }}
      >
        <Palette size={14} color="#38bdf8" />
        <span style={{ fontSize: '0.62rem', fontWeight: '800' }}>Select</span>
      </button>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 1px' }} />

      {/* 5 Boosters */}
      <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around', alignItems: 'center', gap: '2px' }}>
        {boosters.map(b => {
          const isSelected = activeBoosters[b.id];
          return (
            <button
              key={b.id}
              onClick={() => {
                soundEngine.playBooster();
                onUseBooster(b.id);
              }}
              disabled={b.count <= 0 && !isSelected}
              title={`${b.name}: ${b.desc}`}
              style={{
                position: 'relative',
                background: isSelected ? 'rgba(56, 189, 248, 0.28)' : 'rgba(15, 23, 42, 0.7)',
                border: `1.5px solid ${isSelected ? b.color : 'rgba(148, 163, 184, 0.2)'}`,
                borderRadius: '0.55rem',
                padding: '0.3rem 0.35rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px',
                cursor: b.count > 0 || isSelected ? 'pointer' : 'not-allowed',
                opacity: b.count > 0 || isSelected ? 1 : 0.4,
                transition: 'all 0.15s ease',
                flex: 1,
                maxWidth: '48px'
              }}
            >
              {/* Badge Count */}
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: b.color,
                color: '#fff',
                fontSize: '0.6rem',
                fontWeight: '900',
                padding: '0 4px',
                borderRadius: '9999px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                lineHeight: '13px'
              }}>
                {b.count}
              </span>

              {b.icon}
              <span style={{ fontSize: '0.6rem', color: '#cbd5e1', fontWeight: '700', whiteSpace: 'nowrap' }}>
                {b.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 1px' }} />

      {/* Hint Button */}
      <button
        onClick={() => {
          soundEngine.playButtonClick();
          if (onHint) onHint();
        }}
        title="Get bank shot angle hint"
        style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1px',
          padding: '0.3rem 0.45rem',
          borderRadius: '0.55rem',
          border: '1.5px solid rgba(245, 158, 11, 0.4)',
          background: 'rgba(245, 158, 11, 0.12)',
          color: '#fbbf24',
          cursor: 'pointer',
          minWidth: '42px'
        }}
      >
        <Lightbulb size={15} />
        <span style={{ fontSize: '0.62rem', fontWeight: '700' }}>Hint</span>
      </button>

    </div>
  );
}
