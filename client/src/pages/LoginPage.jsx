import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { authService } from '../services/authService';
import { soundEngine } from '../utils/soundEngine';
import { LogIn, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      soundEngine.playButtonClick();
      const res = await authService.login(email, password);
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
      soundEngine.playLevelFailed();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{
        padding: '2.25rem 2rem',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.6rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            marginBottom: '0.5rem',
            boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
          }}>
            <LogIn size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', marginBottom: '0.25rem' }}>
            Sign In to {GAME_NAME}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Resume your puzzle progress and leaderboard ranking
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '0.5rem',
            padding: '0.65rem 0.85rem',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '600' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="player@example.com"
              style={{
                width: '100%',
                padding: '0.7rem 0.85rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '600' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.7rem 0.85rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glow-btn"
            style={{
              padding: '0.85rem',
              fontSize: '1rem',
              marginTop: '0.5rem'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: '#38bdf8', fontWeight: '600', textDecoration: 'none' }}>
            Register Now
          </Link>
        </div>

      </div>
    </div>
  );
}
