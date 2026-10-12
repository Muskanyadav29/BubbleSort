import React, { useState, useEffect } from 'react';
import { GAME_NAME } from '../config/gameConfig';
import { leaderboardService } from '../services/leaderboardService';
import { Award, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const list = await leaderboardService.fetchAchievements();
      setAchievements(list);
      setLoading(false);
    }
    load();
  }, []);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '0.6rem',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #a855f7, #ec4899)',
          marginBottom: '0.5rem',
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
        }}>
          <Award size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff', marginBottom: '0.3rem' }}>
          Trophies & Achievements
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Master key milestones across {GAME_NAME} to earn prestige points!
        </p>

        {/* Unlock Counter */}
        <div style={{
          marginTop: '1rem',
          display: 'inline-block',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '0.4rem 1.25rem',
          borderRadius: '9999px',
          color: '#38bdf8',
          fontSize: '0.875rem',
          fontWeight: '700'
        }}>
          Unlocked: {unlockedCount} / {achievements.length}
        </div>
      </div>

      {/* Grid of Achievements */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem',
        marginBottom: '3rem'
      }}>
        {achievements.map(ach => (
          <div
            key={ach.id}
            className="glass-panel"
            style={{
              padding: '1.25rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              border: ach.isUnlocked ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(148, 163, 184, 0.15)',
              background: ach.isUnlocked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.55)',
              opacity: ach.isUnlocked ? 1 : 0.65
            }}
          >
            {/* Icon */}
            <div style={{
              fontSize: '2rem',
              width: '52px',
              height: '52px',
              borderRadius: '0.75rem',
              background: ach.isUnlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {ach.icon}
            </div>

            {/* Details */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: ach.isUnlocked ? '#fff' : '#cbd5e1' }}>
                  {ach.title}
                </h3>
                {ach.isUnlocked ? (
                  <CheckCircle2 size={18} color="#10b981" />
                ) : (
                  <Lock size={16} color="#64748b" />
                )}
              </div>

              <p style={{ fontSize: '0.825rem', color: '#94a3b8', lineHeight: '1.4', marginBottom: '0.5rem' }}>
                {ach.description}
              </p>

              <div style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                color: ach.isUnlocked ? '#10b981' : '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <Sparkles size={13} /> +{ach.points} pts
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
