import React, { useState, useEffect } from 'react';
import { GAME_NAME } from '../config/gameConfig';
import { gameService } from '../services/gameService';
import { User, Star, Trophy, Flame, Target, Award, History, Clock } from 'lucide-react';

export default function DashboardPage({ user }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function loadHistory() {
      const hist = await gameService.fetchGameHistory();
      setHistory(hist);
    }
    loadHistory();
  }, []);

  const completedCount = user?.completedLevels ? Object.keys(user.completedLevels).length : 0;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Player Header Card */}
      <div className="glass-panel" style={{
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)'
          }}>
            <User size={36} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', marginBottom: '0.2rem' }}>
              {user?.name || 'Guest Adventurer'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              {user?.email || `Playing ${GAME_NAME}`}
            </p>
          </div>
        </div>

        <div style={{
          background: 'rgba(56, 189, 248, 0.15)',
          padding: '0.6rem 1.25rem',
          borderRadius: '0.75rem',
          border: '1px solid #38bdf8'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Current Frontier</span>
          <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#38bdf8' }}>
            Level {user?.currentLevel || 1}
          </div>
        </div>
      </div>

      {/* Metrics Grid (Item 61) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '1rem',
        marginBottom: '2.5rem'
      }}>
        
        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <Star size={24} color="#f59e0b" style={{ margin: '0 auto 0.4rem' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>
            {user?.totalStars || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Stars</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <Trophy size={24} color="#38bdf8" style={{ margin: '0 auto 0.4rem' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>
            {(user?.totalScore || 0).toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Score</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <Target size={24} color="#ec4899" style={{ margin: '0 auto 0.4rem' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>
            {user?.bubblesPopped || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Bubbles Popped</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <Flame size={24} color="#f97316" style={{ margin: '0 auto 0.4rem' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>
            x{user?.bestCombo || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Best Combo</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <Award size={24} color="#10b981" style={{ margin: '0 auto 0.4rem' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>
            {completedCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Levels Completed</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <Trophy size={24} color="#eab308" style={{ margin: '0 auto 0.4rem' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>
            {(user?.bestScore || user?.totalScore || 0).toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Best Score</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <Award size={24} color="#8b5cf6" style={{ margin: '0 auto 0.4rem' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>
            {user?.rescuedObjects || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Rescues</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <Star size={24} color="#06b6d4" style={{ margin: '0 auto 0.4rem' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>
            {user?.achievements ? `${user.achievements.length} / 10` : '10 / 10'}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Achievements</span>
        </div>

      </div>

      {/* Game History Table (Item 62) */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={20} color="#38bdf8" /> Recent Game Sessions
        </h2>

        {history.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
            No recorded sessions yet. Play levels in {GAME_NAME} to record your history!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: '#94a3b8', borderBottom: '1px solid rgba(148, 163, 184, 0.15)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.6rem 0.75rem' }}>Level</th>
                  <th style={{ padding: '0.6rem 0.75rem' }}>Score</th>
                  <th style={{ padding: '0.6rem 0.75rem' }}>Stars</th>
                  <th style={{ padding: '0.6rem 0.75rem' }}>Shots Used</th>
                  <th style={{ padding: '0.6rem 0.75rem' }}>Best Combo</th>
                  <th style={{ padding: '0.6rem 0.75rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((sess, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.06)' }}>
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: '700', color: '#38bdf8' }}>Level {sess.levelId}</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#fff', fontWeight: '600' }}>{sess.score.toLocaleString()}</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#f59e0b' }}>{'★'.repeat(sess.stars)}</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#cbd5e1' }}>{sess.shotsUsed}</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#ec4899' }}>x{sess.bestCombo}</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#94a3b8' }}>
                      {new Date(sess.completedAt || sess.startedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
