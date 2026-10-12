import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { gameService } from '../services/gameService';
import { Calendar, Play, Gift, Flame, Trophy, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export default function DailyChallengePage() {
  const [challenge, setChallenge] = useState(null);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const data = await gameService.fetchDailyChallenge();
      setChallenge(data);

      const today = new Date().toISOString().slice(0, 10);
      const done = localStorage.getItem(`daily_done_${today}`);
      if (done) setCompleted(true);
    }
    load();
  }, []);

  if (!challenge) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        Loading today's challenge in {GAME_NAME}...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '650px', margin: '1.5rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{
        padding: '2.5rem 2rem',
        textAlign: 'center',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        
        <div style={{
          display: 'inline-flex',
          padding: '0.75rem',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          marginBottom: '0.75rem',
          boxShadow: '0 0 25px rgba(245, 158, 11, 0.5)'
        }}>
          <Calendar size={36} color="#fff" />
        </div>

        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#f59e0b', fontWeight: '800', letterSpacing: '0.1em' }}>
          Date: {challenge.date}
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', margin: '0.4rem 0 1rem' }}>
          {challenge.title}
        </h1>

        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          borderRadius: '1rem',
          padding: '1.25rem',
          marginBottom: '1.75rem',
          textAlign: 'left',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Mission Target</span>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#38bdf8' }}>
              {challenge.objective.description}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Ammunition</span>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ef4444' }}>
              {challenge.shots} Shots Allocated
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Score Milestone</span>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#10b981' }}>
              {challenge.targetScore.toLocaleString()} pts
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Daily Bounty</span>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Gift size={16} /> +500 Coins, 1 Rainbow Star
            </div>
          </div>
        </div>

        {completed ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: '0.75rem',
            padding: '1rem',
            color: '#6ee7b7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: '700'
          }}>
            <CheckCircle2 size={20} /> You have already completed today's daily challenge!
          </div>
        ) : (
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              navigate(`/game/${challenge.challengeNumber % 35 + 5}`);
            }}
            className="glow-btn"
            style={{
              padding: '0.9rem 2.5rem',
              fontSize: '1.15rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Play size={22} fill="#fff" /> Start Daily Challenge
          </button>
        )}

      </div>
    </div>
  );
}
