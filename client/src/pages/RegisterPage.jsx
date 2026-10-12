import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { authService } from '../services/authService';
import { soundEngine } from '../utils/soundEngine';
import { UserPlus, AlertCircle } from 'lucide-react';

export default function RegisterPage({ onLoginSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      soundEngine.playLevelFailed();
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      soundEngine.playLevelFailed();
      return;
    }

    setLoading(true);

    try {
      soundEngine.playButtonClick();
      const res = await authService.register(name, email, password, confirmPassword);
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
      navigate('/levels');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      soundEngine.playLevelFailed();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '2.5rem auto', padding: '0 1rem' }}>
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
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            marginBottom: '0.5rem',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            <UserPlus size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', marginBottom: '0.25rem' }}>
            Create Account
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Join the cosmic leaderboard of {GAME_NAME}
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '600' }}>
              Player Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="StarShooter99"
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
              placeholder="At least 6 characters"
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
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#38bdf8', fontWeight: '600', textDecoration: 'none' }}>
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}
