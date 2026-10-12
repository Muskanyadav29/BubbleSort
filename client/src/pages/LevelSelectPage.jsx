import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { levelManager } from '../game/levelManager';
import { gameService } from '../services/gameService';
import { Lock, Star, Play, Sparkles, Filter } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export default function LevelSelectPage({ user }) {
  const [levels, setLevels] = useState([]);
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [unlockedSet, setUnlockedSet] = useState(new Set([1]));
  const [userStars, setUserStars] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const list = await gameService.fetchLevels();
      setLevels(list);

      // Determine unlocked levels
      const currentUnlocked = levelManager.loadUnlockedLevels();
      const set = new Set(currentUnlocked);

      // Also merge user completed levels if authenticated
      const starsMap = {};
      if (user && user.completedLevels) {
        Object.entries(user.completedLevels).forEach(([lvlId, data]) => {
          set.add(Number(lvlId));
          set.add(Number(lvlId) + 1); // Unlocked next
          starsMap[lvlId] = data.stars || 1;
        });
      } else {
        // Read local storage stars
        try {
          const localStars = JSON.parse(localStorage.getItem('local_level_stars') || '{}');
          Object.assign(starsMap, localStars);
        } catch (e) {}
      }

      setUnlockedSet(set);
      setUserStars(starsMap);
    }
    load();
  }, [user]);

  const handleSelectLevel = (levelId, isUnlocked) => {
    if (!isUnlocked) {
      soundEngine.playLevelFailed();
      return;
    }
    soundEngine.playButtonClick();
    navigate(`/game/${levelId}`);
  };

  const filtered = levels.filter(lvl => {
    if (filterDifficulty === 'all') return true;
    return lvl.difficulty === filterDifficulty;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff', marginBottom: '0.4rem' }}>
          Select Level
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Conquer 40+ stages in {GAME_NAME} to unlock cosmic challenges!
        </p>

        {/* Difficulty Filter Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginTop: '1.25rem'
        }}>
          {['all', 'tutorial', 'beginner', 'easy', 'medium', 'hard', 'expert'].map(diff => (
            <button
              key={diff}
              onClick={() => {
                soundEngine.playButtonClick();
                setFilterDifficulty(diff);
              }}
              style={{
                textTransform: 'capitalize',
                padding: '0.4rem 0.9rem',
                borderRadius: '9999px',
                border: '1px solid',
                borderColor: filterDifficulty === diff ? '#38bdf8' : 'rgba(148, 163, 184, 0.2)',
                background: filterDifficulty === diff ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                color: filterDifficulty === diff ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.825rem',
                fontWeight: '600',
                transition: 'all 0.15s'
              }}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Levels Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '1rem',
        marginBottom: '3rem'
      }}>
        {filtered.map(lvl => {
          const isUnlocked = unlockedSet.has(lvl.levelNumber) || lvl.levelNumber === 1;
          const starsEarned = userStars[lvl.levelNumber] || (isUnlocked && lvl.levelNumber < Math.max(...Array.from(unlockedSet)) ? 2 : 0);

          return (
            <div
              key={lvl.id}
              onClick={() => handleSelectLevel(lvl.levelNumber, isUnlocked)}
              className="glass-panel"
              style={{
                padding: '1rem 0.75rem',
                textAlign: 'center',
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                opacity: isUnlocked ? 1 : 0.45,
                transform: isUnlocked ? 'translateY(0)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                border: isUnlocked ? '1.5px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(148, 163, 184, 0.1)',
                background: isUnlocked ? 'rgba(30, 41, 59, 0.75)' : 'rgba(15, 23, 42, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: '135px'
              }}
              onMouseEnter={e => {
                if (isUnlocked) e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                if (isUnlocked) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: '#94a3b8',
                fontWeight: '700',
                letterSpacing: '0.05em'
              }}>
                Level {lvl.levelNumber < 10 ? `0${lvl.levelNumber}` : lvl.levelNumber}
              </div>

              {/* Center icon / Number */}
              <div style={{ margin: '0.4rem 0' }}>
                {isUnlocked ? (
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
                    color: '#fff',
                    fontWeight: '900',
                    fontSize: '1.1rem'
                  }}>
                    {lvl.levelNumber}
                  </div>
                ) : (
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b'
                  }}>
                    <Lock size={20} />
                  </div>
                )}
              </div>

              {/* Stars Display */}
              <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
                {[1, 2, 3].map(st => (
                  <Star
                    key={st}
                    size={14}
                    fill={st <= starsEarned ? '#f59e0b' : 'none'}
                    color={st <= starsEarned ? '#f59e0b' : '#475569'}
                  />
                ))}
              </div>

              {/* Type tag */}
              <div style={{
                fontSize: '0.65rem',
                color: '#38bdf8',
                textTransform: 'capitalize',
                marginTop: '4px'
              }}>
                {lvl.type.replace('_', ' ')}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
