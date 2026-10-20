import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { soundEngine } from '../utils/soundEngine';
import {
  Sparkles,
  Trophy,
  Award,
  Calendar,
  Grid,
  User,
  Volume2,
  VolumeX,
  Music,
  Menu,
  X,
  LogOut,
  ShieldAlert
} from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(soundEngine.soundEnabled);
  const [musicOn, setMusicOn] = useState(soundEngine.musicEnabled);
  const navigate = useNavigate();

  const toggleSound = () => {
    const next = !soundOn;
    soundEngine.setSoundEnabled(next);
    setSoundOn(next);
  };

  const toggleMusic = () => {
    const next = !musicOn;
    soundEngine.setMusicEnabled(next);
    setMusicOn(next);
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 px-4 py-3 mx-2 mt-2 mb-4" style={{ borderRadius: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Brand Name from GAME_NAME */}
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: '#fff' }}
          onClick={() => soundEngine.playButtonClick()}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(244, 63, 94, 0.6)'
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #38bdf8, #c084fc, #f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {GAME_NAME}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'none', md: 'flex', gap: '1.25rem', alignItems: 'center' }} className="desktop-links">
          <Link to="/" className="nav-link" onClick={() => soundEngine.playButtonClick()}>
            Home
          </Link>
          <Link to="/levels" className="nav-link" onClick={() => soundEngine.playButtonClick()}>
            <Grid size={18} /> Levels
          </Link>
          <Link to="/leaderboard" className="nav-link" onClick={() => soundEngine.playButtonClick()}>
            <Trophy size={18} /> Leaderboard
          </Link>
          <Link to="/achievements" className="nav-link" onClick={() => soundEngine.playButtonClick()}>
            <Award size={18} /> Achievements
          </Link>
          <Link to="/daily" className="nav-link" onClick={() => soundEngine.playButtonClick()}>
            <Calendar size={18} /> Daily
          </Link>
          <Link to="/profile" className="nav-link" onClick={() => soundEngine.playButtonClick()}>
            <User size={18} /> Profile
          </Link>
          <Link to="/admin" className="nav-link" onClick={() => soundEngine.playButtonClick()}>
            <ShieldAlert size={18} /> Editor
          </Link>
        </div>

        {/* Audio Toggles & User Account */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundOn ? 'Sound FX On' : 'Sound FX Muted'}
            style={{
              background: soundOn ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${soundOn ? '#38bdf8' : '#ef4444'}`,
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: soundOn ? '#38bdf8' : '#ef4444'
            }}
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Music Toggle */}
          <button
            onClick={toggleMusic}
            title={musicOn ? 'BGM Music Playing' : 'BGM Music Muted'}
            style={{
              background: musicOn ? 'rgba(168, 85, 247, 0.15)' : 'rgba(100, 116, 139, 0.15)',
              border: `1px solid ${musicOn ? '#a855f7' : '#64748b'}`,
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: musicOn ? '#a855f7' : '#64748b'
            }}
          >
            <Music size={18} />
          </button>

          {/* User Profile or Login */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '9999px',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onClick={() => soundEngine.playButtonClick()}
              >
                <User size={16} color="#38bdf8" />
                <span>{user.name || 'Player'}</span>
              </Link>
              <button
                onClick={() => {
                  soundEngine.playButtonClick();
                  onLogout();
                }}
                title="Log Out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="glow-btn"
              style={{
                padding: '0.4rem 1rem',
                fontSize: '0.875rem',
                textDecoration: 'none',
                display: 'inline-block'
              }}
              onClick={() => soundEngine.playButtonClick()}
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <Link to="/levels" className="mobile-nav-link" onClick={() => { soundEngine.playButtonClick(); setMobileMenuOpen(false); }}>
            <Grid size={18} /> Levels
          </Link>
          <Link to="/daily" className="mobile-nav-link" onClick={() => { soundEngine.playButtonClick(); setMobileMenuOpen(false); }}>
            <Calendar size={18} /> Daily Challenge
          </Link>
          <Link to="/leaderboard" className="mobile-nav-link" onClick={() => { soundEngine.playButtonClick(); setMobileMenuOpen(false); }}>
            <Trophy size={18} /> Leaderboard
          </Link>
          <Link to="/achievements" className="mobile-nav-link" onClick={() => { soundEngine.playButtonClick(); setMobileMenuOpen(false); }}>
            <Award size={18} /> Achievements
          </Link>
          <Link to="/dashboard" className="mobile-nav-link" onClick={() => { soundEngine.playButtonClick(); setMobileMenuOpen(false); }}>
            <User size={18} /> Player Dashboard
          </Link>
          <Link to="/admin" className="mobile-nav-link" onClick={() => { soundEngine.playButtonClick(); setMobileMenuOpen(false); }}>
            <ShieldAlert size={18} /> Level Editor
          </Link>
        </div>
      )}

      <style>{`
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.925rem;
          font-weight: 500;
          transition: color 0.15s;
        }
        .nav-link:hover {
          color: #f8fafc;
        }
        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #e2e8f0;
          text-decoration: none;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          background: rgba(255,255,255,0.04);
        }
        @media (min-width: 768px) {
          .desktop-links {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
