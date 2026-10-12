import React from 'react';
import { Link } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import Mascot from '../components/Mascot';
import { Play, Sparkles, Trophy, ShieldCheck, Zap, Heart, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export default function LandingPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Hero Section */}
      <div className="glass-panel" style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        marginBottom: '3rem',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Glow ambient background decoration */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }} />

        {/* Mascot Greeting */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Mascot mood="happy" message={`Welcome to ${GAME_NAME}! Are you ready to blast spheres?`} size={100} />
        </div>

        {/* Title strictly from GAME_NAME */}
        <h1 style={{
          fontSize: 'clamp(2.4rem, 6vw, 3.8rem)',
          fontWeight: '900',
          letterSpacing: '-0.03em',
          lineHeight: '1.1',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #38bdf8 0%, #c084fc 50%, #f43f5e 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {GAME_NAME}
        </h1>

        {/* Tagline from Section 77 */}
        <div style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#cbd5e1',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <span style={{ color: '#38bdf8' }}>Aim.</span>
          <span style={{ color: '#a855f7' }}>Match.</span>
          <span style={{ color: '#f43f5e' }}>Pop.</span>
          <span style={{ color: '#10b981' }}>Rescue.</span>
        </div>

        <p style={{
          maxWidth: '650px',
          margin: '0 auto 2rem auto',
          color: '#94a3b8',
          fontSize: '1.05rem',
          lineHeight: '1.6'
        }}>
          Embark on an epic puzzle odyssey! Pop vibrant bubbles, unleash explosive bomb boosters, rescue trapped celestial critters, and climb the global leaderboards with certified anti-cheat validation.
        </p>

        {/* CTA Play Now Button (Item 77) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to="/levels"
            className="glow-btn"
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.25rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              textDecoration: 'none'
            }}
            onClick={() => soundEngine.playButtonClick()}
          >
            <Play size={24} fill="#fff" /> PLAY NOW
          </Link>

          <Link
            to="/daily"
            className="arcade-btn"
            style={{
              padding: '0.9rem 1.8rem',
              fontSize: '1.05rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none'
            }}
            onClick={() => soundEngine.playButtonClick()}
          >
            <Zap size={20} /> Daily Quest
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '0.75rem',
            background: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Sparkles size={24} color="#38bdf8" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#fff' }}>
            40+ Playable Stages
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.925rem', lineHeight: '1.5' }}>
            Handcrafted data-driven levels spanning Tutorial to Expert difficulty, featuring Rescue, Drop, Combo Streak, and Color-Hunt objectives.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '0.75rem',
            background: 'rgba(168, 85, 247, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Trophy size={24} color="#a855f7" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#fff' }}>
            Global Leaderboard & Badges
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.925rem', lineHeight: '1.5' }}>
            Compete worldwide! Track high scores, total stars, bubbles popped, and unlock over 10 career achievements.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '0.75rem',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <ShieldCheck size={24} color="#10b981" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#fff' }}>
            Anti-Cheat & Offline Ready
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.925rem', lineHeight: '1.5' }}>
            Server-side mathematical session verification prevents tampering. Full offline support enables puzzle play anywhere, anytime.
          </p>
        </div>

      </div>

      {/* How to Play Overview */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.25rem', color: '#fff' }}>
          Core Gameplay Rules
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#f8fafc', display: 'block' }}>Aim & Shoot</strong>
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Drag or move mouse to aim the trajectory laser. Tap or click to launch your bubble.</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#f8fafc', display: 'block' }}>Match 3 or More</strong>
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Connect three or more same-colored spheres to trigger satisfying popping reactions.</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#f8fafc', display: 'block' }}>Drop Floating Bubbles</strong>
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sever ceiling connections to trigger massive cascading drops and bonus points!</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#f8fafc', display: 'block' }}>Bank Shots & Boosters</strong>
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Bounce shots off side walls and trigger Bomb or Rainbow boosters to conquer challenging levels.</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
