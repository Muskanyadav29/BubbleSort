import React from 'react';
import { GAME_NAME } from '../config/gameConfig';
import { HelpCircle, Target, Sparkles, Bomb, PlusCircle, Shuffle, ShieldCheck } from 'lucide-react';

export default function HelpPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '1.5rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.6rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            marginBottom: '0.5rem'
          }}>
            <HelpCircle size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', marginBottom: '0.25rem' }}>
            How to Play {GAME_NAME}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Complete rules, booster guides, and mechanics
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#38bdf8', marginBottom: '0.5rem' }}>
              1. The Aiming & Launching Mechanics
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Aim your launcher with precision! The dashed laser guide previews your bubble’s flight path and wall-ricochets.
              Click or tap to shoot. Bouncing off the side walls enables you to slip bubbles through narrow slots and reach high clusters.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#a855f7', marginBottom: '0.5rem' }}>
              2. Matching & Popping Rules
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Whenever your bubble connects to two or more existing bubbles of the same color (forming a group of 3 or more), they instantly pop!
              Consecutive matches increment your Combo Multiplier (x2, x3, x4...), multiplying your score rapidly.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#10b981', marginBottom: '0.5rem' }}>
              3. The Floating Bubble Drop Bonus
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
              All bubbles must remain connected to the ceiling directly or via other bubbles.
              If popping a group cuts off lower bubbles from the ceiling, all disconnected bubbles fall with gravity for major cascade points!
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f59e0b', marginBottom: '0.75rem' }}>
              4. Power Boosters
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <strong style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Target size={16} /> Super Guide
                </strong>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Extends laser trajectory across multiple reflections.</span>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <strong style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Bomb size={16} /> Bomb Bubble
                </strong>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Detonates and obliterates bubbles within a 2-ring radius.</span>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <strong style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Sparkles size={16} /> Rainbow Star
                </strong>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Universal wildcard matches with any adjacent color.</span>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <strong style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <PlusCircle size={16} /> Extra Shot
                </strong>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Restores +5 ammo shots during emergency situations.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
