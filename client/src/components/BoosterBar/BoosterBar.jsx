import React from 'react';
import { Crosshair, Bomb, Sparkles, PlusCircle, Shuffle } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

export default function BoosterBar({ inventory = {}, onUseBooster, activeBoosters = {} }) {
  const boosters = [
    {
      id: 'aimGuide',
      name: 'Super Guide',
      icon: <Crosshair size={18} color="#38bdf8" />,
      color: '#38bdf8',
      desc: 'Extends aiming trajectory laser',
      count: inventory.aimGuide !== undefined ? inventory.aimGuide : 3
    },
    {
      id: 'bomb',
      name: 'Bomb Bubble',
      icon: <Bomb size={18} color="#ef4444" />,
      color: '#ef4444',
      desc: 'Explosive blast clears surrounding bubbles',
      count: inventory.bomb !== undefined ? inventory.bomb : 2
    },
    {
      id: 'rainbow',
      name: 'Rainbow Star',
      icon: <Sparkles size={18} color="#a855f7" />,
      color: '#a855f7',
      desc: 'Wild color matches any target',
      count: inventory.rainbow !== undefined ? inventory.rainbow : 2
    },
    {
      id: 'extraShot',
      name: '+5 Shots',
      icon: <PlusCircle size={18} color="#22c55e" />,
      color: '#22c55e',
      desc: 'Grants +5 additional ammo shots',
      count: inventory.extraShot !== undefined ? inventory.extraShot : 3
    },
    {
      id: 'shuffle',
      name: 'Shuffle',
      icon: <Shuffle size={18} color="#f59e0b" />,
      color: '#f59e0b',
      desc: 'Shuffles colors on the grid',
      count: inventory.shuffle !== undefined ? inventory.shuffle : 2
    }
  ];

  return (
    <div className="glass-panel" style={{
      maxWidth: '440px',
      margin: '0.4rem auto 0 auto',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.85rem',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      border: '1px solid rgba(148, 163, 184, 0.15)'
    }}>
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
              background: isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.6)',
              border: `1.5px solid ${isSelected ? b.color : 'rgba(148, 163, 184, 0.2)'}`,
              borderRadius: '0.65rem',
              padding: '0.4rem 0.55rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              cursor: b.count > 0 || isSelected ? 'pointer' : 'not-allowed',
              opacity: b.count > 0 || isSelected ? 1 : 0.45,
              transition: 'all 0.15s ease'
            }}
          >
            {/* Badge Count */}
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              background: b.color,
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: '800',
              padding: '1px 5px',
              borderRadius: '9999px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.4)'
            }}>
              {b.count}
            </span>

            {b.icon}
            <span style={{ fontSize: '0.65rem', color: '#cbd5e1', fontWeight: '600' }}>
              {b.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
