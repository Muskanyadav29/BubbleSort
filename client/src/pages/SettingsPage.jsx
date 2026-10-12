import React, { useState } from 'react';
import { GAME_NAME } from '../config/gameConfig';
import { soundEngine } from '../utils/soundEngine';
import { Volume2, VolumeX, Music, Settings, Keyboard, Smartphone, Check } from 'lucide-react';

export default function SettingsPage() {
  const [soundOn, setSoundOn] = useState(soundEngine.soundEnabled);
  const [musicOn, setMusicOn] = useState(soundEngine.musicEnabled);
  const [saved, setSaved] = useState(false);

  const handleToggleSound = () => {
    const next = !soundOn;
    soundEngine.setSoundEnabled(next);
    setSoundOn(next);
    if (next) soundEngine.playButtonClick();
    flashSaved();
  };

  const handleToggleMusic = () => {
    const next = !musicOn;
    soundEngine.setMusicEnabled(next);
    setMusicOn(next);
    flashSaved();
  };

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: '650px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{
        padding: '2rem',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.6rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            marginBottom: '0.5rem'
          }}>
            <Settings size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', marginBottom: '0.25rem' }}>
            {GAME_NAME} Settings
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Customize your audio preferences and gameplay controls
          </p>
        </div>

        {saved && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            color: '#6ee7b7',
            fontSize: '0.85rem',
            textAlign: 'center',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem'
          }}>
            <Check size={16} /> Preferences updated and persisted!
          </div>
        )}

        {/* Audio Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '1rem',
            borderRadius: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {soundOn ? <Volume2 size={22} color="#38bdf8" /> : <VolumeX size={22} color="#ef4444" />}
              <div>
                <strong style={{ display: 'block', color: '#fff', fontSize: '0.95rem' }}>Sound Effects</strong>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Pops, bounces, explosions, and fanfare</span>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                border: 'none',
                background: soundOn ? '#0284c7' : '#475569',
                color: '#fff',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {soundOn ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '1rem',
            borderRadius: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Music size={22} color={musicOn ? '#c084fc' : '#64748b'} />
              <div>
                <strong style={{ display: 'block', color: '#fff', fontSize: '0.95rem' }}>Background Music</strong>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Synthesized ambient melodies</span>
              </div>
            </div>
            <button
              onClick={handleToggleMusic}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                border: 'none',
                background: musicOn ? '#9333ea' : '#475569',
                color: '#fff',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {musicOn ? 'PLAYING' : 'MUTED'}
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Keyboard size={18} color="#38bdf8" /> Controls & Shortcuts
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.85rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.6rem 0.8rem', borderRadius: '0.5rem' }}>
              <span style={{ color: '#94a3b8' }}>Aim & Shoot:</span> <strong style={{ color: '#fff' }}>Mouse Move + Click</strong>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.6rem 0.8rem', borderRadius: '0.5rem' }}>
              <span style={{ color: '#94a3b8' }}>Quick Launch:</span> <strong style={{ color: '#fff' }}>Spacebar</strong>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.6rem 0.8rem', borderRadius: '0.5rem' }}>
              <span style={{ color: '#94a3b8' }}>Restart Level:</span> <strong style={{ color: '#fff' }}>Key 'R'</strong>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.6rem 0.8rem', borderRadius: '0.5rem' }}>
              <span style={{ color: '#94a3b8' }}>Pause Game:</span> <strong style={{ color: '#fff' }}>Escape Key</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
