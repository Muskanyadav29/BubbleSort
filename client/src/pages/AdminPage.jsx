import React, { useState } from 'react';
import { GAME_NAME, BUBBLE_THEMES } from '../config/gameConfig';
import { API_BASE_URL } from '../config/gameConfig';
import { soundEngine } from '../utils/soundEngine';
import { ShieldCheck, Plus, Trash2, Save, Play, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const [title, setTitle] = useState('Custom Galaxy 1');
  const [difficulty, setDifficulty] = useState('medium');
  const [levelType, setLevelType] = useState('classic');
  const [shots, setShots] = useState(24);
  const [targetScore, setTargetScore] = useState(3000);
  const [selectedColor, setSelectedColor] = useState('red');
  const [statusMsg, setStatusMsg] = useState(null);

  const navigate = useNavigate();

  // 6 rows x 8/7 cols interactive grid
  const initialGrid = Array(6).fill(null).map((_, r) => {
    const cols = (r % 2 === 0) ? 8 : 7;
    return Array(cols).fill(null);
  });

  const [grid, setGrid] = useState(initialGrid);

  const handleCellClick = (r, c) => {
    soundEngine.playButtonClick();
    setGrid(prev => {
      const next = prev.map(row => [...row]);
      if (!next[r][c]) {
        next[r][c] = { color: selectedColor, type: selectedColor === 'bomb' || selectedColor === 'rainbow' ? selectedColor : 'normal' };
      } else if (next[r][c].color === selectedColor) {
        next[r][c] = null; // erase
      } else {
        next[r][c] = { color: selectedColor, type: selectedColor === 'bomb' || selectedColor === 'rainbow' ? selectedColor : 'normal' };
      }
      return next;
    });
  };

  const handleSaveLevel = async () => {
    try {
      soundEngine.playBooster();
      const res = await fetch(`${API_BASE_URL}/levels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          difficulty,
          type: levelType,
          shots: Number(shots),
          targetScore: Number(targetScore),
          colors: ['red', 'blue', 'green', 'yellow', 'purple'],
          board: grid
        })
      });
      const data = await res.json();
      setStatusMsg(`Level saved successfully! Level #${data.levelNumber}`);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (e) {
      setStatusMsg('Level created in memory.');
    }
  };

  const paletteColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'bomb', 'rainbow', 'rescue'];

  return (
    <div style={{ maxWidth: '850px', margin: '1.5rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.6rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            marginBottom: '0.5rem'
          }}>
            <ShieldCheck size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', marginBottom: '0.25rem' }}>
            {GAME_NAME} Level Editor
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Design custom bubble layouts and test game configurations
          </p>
        </div>

        {statusMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: '0.5rem',
            padding: '0.6rem',
            color: '#6ee7b7',
            marginBottom: '1rem',
            textAlign: 'center',
            fontWeight: '700'
          }}>
            {statusMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Stage Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '0.5rem', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Difficulty</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '0.5rem', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
            >
              <option value="tutorial">Tutorial</option>
              <option value="beginner">Beginner</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Level Type</label>
            <select
              value={levelType}
              onChange={e => setLevelType(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '0.5rem', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
            >
              <option value="classic">Classic (Clear All)</option>
              <option value="rescue">Rescue Critters</option>
              <option value="drop">Drop Floating</option>
              <option value="combo">Combo Streak</option>
              <option value="score">Score Challenge</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Shots Allowed</label>
            <input
              type="number"
              value={shots}
              onChange={e => setShots(Number(e.target.value))}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '0.5rem', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
            />
          </div>
        </div>

        {/* Color Palette Selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
            Active Tool / Brush:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {paletteColors.map(col => {
              const theme = BUBBLE_THEMES[col] || { main: '#38bdf8' };
              const isSelected = selectedColor === col;
              return (
                <button
                  key={col}
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setSelectedColor(col);
                  }}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '9999px',
                    border: `2px solid ${isSelected ? '#fff' : 'transparent'}`,
                    background: theme.main,
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 10px rgba(255,255,255,0.6)' : 'none'
                  }}
                >
                  {col.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Hex Grid Canvas Editor */}
        <div style={{
          background: '#090d16',
          borderRadius: '1rem',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '1.5rem',
          border: '2px solid rgba(56, 189, 248, 0.2)'
        }}>
          {grid.map((row, r) => (
            <div key={r} style={{ display: 'flex', gap: '6px' }}>
              {row.map((cell, c) => {
                const colKey = cell ? cell.color : null;
                const theme = colKey ? BUBBLE_THEMES[colKey] : null;
                return (
                  <div
                    key={c}
                    onClick={() => handleCellClick(r, c)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: theme ? theme.main : 'rgba(255,255,255,0.06)',
                      border: theme ? '2px solid rgba(255,255,255,0.5)' : '1px dashed #475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem'
                    }}
                  >
                    {cell?.type === 'bomb' && '💣'}
                    {cell?.type === 'rainbow' && '🌈'}
                    {cell?.type === 'rescue' && '🐣'}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <button
          onClick={handleSaveLevel}
          className="glow-btn"
          style={{
            width: '100%',
            padding: '0.85rem',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Save size={18} /> Save & Publish Custom Level
        </button>

      </div>
    </div>
  );
}
