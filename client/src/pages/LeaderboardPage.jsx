import React, { useState, useEffect } from 'react';
import { GAME_NAME } from '../config/gameConfig';
import { leaderboardService } from '../services/leaderboardService';
import { Trophy, Medal, Flame, Star, CheckCircle, Users, Globe, Calendar } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export default function LeaderboardPage({ user }) {
  const [activeTab, setActiveTab] = useState('global');
  const [data, setData] = useState({ topPlayers: [], userRank: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBoard() {
      setLoading(true);
      const res = await leaderboardService.fetchLeaderboard(activeTab);
      setData(res);
      setLoading(false);
    }
    fetchBoard();
  }, [activeTab]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '0.6rem',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
          marginBottom: '0.5rem',
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
        }}>
          <Trophy size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff', marginBottom: '0.3rem' }}>
          Leaderboard
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          See who reigns supreme across {GAME_NAME}!
        </p>

        {/* Category Tabs: Global, Weekly, Friends */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '1.25rem'
        }}>
          {[
            { id: 'global', label: 'Global Hall', icon: <Globe size={16} /> },
            { id: 'weekly', label: 'Weekly Rush', icon: <Calendar size={16} /> },
            { id: 'friends', label: 'Friends', icon: <Users size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playButtonClick();
                setActiveTab(tab.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                border: '1px solid',
                borderColor: activeTab === tab.id ? '#38bdf8' : 'rgba(148, 163, 184, 0.2)',
                background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Rank Card if logged in */}
      {user && (
        <div className="glass-panel" style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(56, 189, 248, 0.1)'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: '700' }}>
              Your Standings
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>
              {user.name}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'right' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Score</span>
              <div style={{ fontWeight: '700', color: '#38bdf8' }}>
                {(user.totalScore || 0).toLocaleString()}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Stars</span>
              <div style={{ fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Star size={14} fill="#f59e0b" /> {user.totalStars || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rankings List */}
      <div className="glass-panel" style={{ padding: '0.5rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.15)', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Rank</th>
              <th style={{ padding: '0.75rem 1rem' }}>Player</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Score</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Stars</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Max Combo</th>
            </tr>
          </thead>
          <tbody>
            {data.topPlayers.map((entry, idx) => {
              const rank = entry.rank || idx + 1;
              let rankBadge = `${rank}`;
              if (rank === 1) rankBadge = '🥇';
              if (rank === 2) rankBadge = '🥈';
              if (rank === 3) rankBadge = '🥉';

              const isMe = user && (user.id === entry.id || user.name === entry.name);

              return (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                    background: isMe ? 'rgba(56, 189, 248, 0.12)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '800', fontSize: '1rem', color: '#f8fafc' }}>
                    {rankBadge}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: isMe ? '#38bdf8' : '#e2e8f0' }}>
                    {entry.name} {isMe && <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>(You)</span>}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#f8fafc' }}>
                    {(entry.score || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#f59e0b' }}>
                    ★ {entry.stars || 0}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#ec4899', fontWeight: '700' }}>
                    x{entry.bestCombo || 1}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
