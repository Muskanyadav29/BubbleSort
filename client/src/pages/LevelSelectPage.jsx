import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { levelManager } from '../game/levelManager';
import { gameService } from '../services/gameService';
import { Lock, Star, Play, Sparkles, Home, Volume2, VolumeX, Key, ArrowRight, Shield, Award } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export default function LevelSelectPage({ user }) {
  const [levels, setLevels] = useState([]);
  const [activeRealm, setActiveRealm] = useState(1); // 1: Sky Sanctuary, 2: Waterfall Oasis, 3: Dragon Peaks, 4: Celestial Citadel
  const [unlockedSet, setUnlockedSet] = useState(new Set([1]));
  const [userStars, setUserStars] = useState({});
  const [soundOn, setSoundOn] = useState(soundEngine.soundEnabled);
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const list = await gameService.fetchLevels();
      setLevels(list);

      // Determine unlocked levels
      const currentUnlocked = levelManager.loadUnlockedLevels();
      const set = new Set(currentUnlocked);

      // Merge user completed levels if authenticated
      const starsMap = {};
      if (user && user.completedLevels) {
        Object.entries(user.completedLevels).forEach(([lvlId, data]) => {
          set.add(Number(lvlId));
          set.add(Number(lvlId) + 1);
          starsMap[lvlId] = data.stars || 1;
        });
      } else {
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

  // Auto-scroll to current level on load
  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 320;
        }
      }, 100);
    }
  }, [activeRealm]);

  const handleSelectLevel = (levelId, isUnlocked) => {
    if (!isUnlocked) {
      soundEngine.playLevelFailed();
      return;
    }
    soundEngine.playButtonClick();
    navigate(`/game/${levelId}`);
  };

  // Find highest unlocked level
  const highestUnlocked = Math.max(...Array.from(unlockedSet), 1);

  // Total stars calculated
  const totalStars = Object.values(userStars).reduce((sum, s) => sum + (Number(s) || 0), 0);

  // Relic keys collected (levels 4, 5, 6, 7, 8)
  const keysCollected = [4, 5, 6, 7, 8].filter(lvl => unlockedSet.has(lvl + 1)).length;

  // Key configurations for stepping stones
  const KEY_CONFIGS = {
    4: { color: '#38bdf8', gem: '#0284c7', glow: 'rgba(56, 189, 248, 0.7)', label: 'Sapphire Key', type: 'sapphire' },
    5: { color: '#c084fc', gem: '#7e22ce', glow: 'rgba(192, 132, 252, 0.7)', label: 'Amethyst Key', type: 'amethyst' },
    6: { color: '#4ade80', gem: '#15803d', glow: 'rgba(74, 222, 128, 0.7)', label: 'Emerald Key', type: 'emerald' },
    7: { color: '#f87171', gem: '#b91c1c', glow: 'rgba(248, 113, 113, 0.7)', label: 'Winged Ruby Key', type: 'ruby' },
    8: { color: '#f472b6', gem: '#be185d', glow: 'rgba(244, 114, 182, 0.7)', label: 'Diamond Key', type: 'diamond' }
  };

  // Stepping stones coordinate layout (in % x, % y) mimicking Image 2's serpentine path
  const STEPPING_STONES_REALM_1 = [
    { level: 1, x: 50, y: 88, isBase: true },
    { level: 2, x: 58, y: 77, isRune: true },
    { level: 3, x: 44, y: 66, hasAvatar: highestUnlocked <= 3 },
    { level: 4, x: 56, y: 55, hasKey: true, keyId: 4 },
    { level: 5, x: 64, y: 45, hasKey: true, keyId: 5 },
    { level: 6, x: 52, y: 36, hasKey: true, keyId: 6 },
    { level: 7, x: 42, y: 28, hasKey: true, keyId: 7 },
    { level: 8, x: 53, y: 20, hasKey: true, keyId: 8 }
  ];

  // Realm 2 (Waterfall Oasis & Fossil Ruins)
  const STEPPING_STONES_REALM_2 = [
    { level: 9, x: 50, y: 88 },
    { level: 10, x: 42, y: 78 },
    { level: 11, x: 56, y: 68 },
    { level: 12, x: 44, y: 58 },
    { level: 13, x: 62, y: 48, hasKey: true, keyId: 4 },
    { level: 14, x: 48, y: 38 },
    { level: 15, x: 58, y: 28, hasKey: true, keyId: 7 },
    { level: 16, x: 50, y: 18 }
  ];

  const currentStones = activeRealm === 1 ? STEPPING_STONES_REALM_1 : STEPPING_STONES_REALM_2;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      height: '100dvh',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at 50% 20%, #7dc5f8 0%, #a2d6fa 40%, #cce7fd 75%, #bae6fd 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'stretch',
      userSelect: 'none'
    }}>
      <style>{`
        @keyframes cloudFloatLeft {
          0% { transform: translateX(0); }
          50% { transform: translateX(-35px); }
          100% { transform: translateX(0); }
        }
        @keyframes cloudFloatRight {
          0% { transform: translateX(0); }
          50% { transform: translateX(35px); }
          100% { transform: translateX(0); }
        }
        @keyframes keyHoverFloat {
          0%, 100% { transform: translateY(0) rotate(-22deg) scale(1); filter: drop-shadow(0 4px 10px rgba(251, 191, 36, 0.8)); }
          50% { transform: translateY(-8px) rotate(-16deg) scale(1.08); filter: drop-shadow(0 8px 18px rgba(251, 191, 36, 1)); }
        }
        @keyframes avatarBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes runicPortalSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes waterfallStream {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 40; }
        }
        @keyframes beaconPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 0.2; }
        }
      `}</style>

      {/* Casual Mobile Viewport Frame */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 0 60px rgba(0, 0, 0, 0.45)',
        background: 'linear-gradient(180deg, #60a5fa 0%, #93c5fd 35%, #bfdbfe 70%, #dbeafe 100%)'
      }}>

        {/* Top Floating Realm Header Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          padding: '0.65rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0) 100%)',
          pointerEvents: 'auto'
        }}>
          {/* Back Home Button */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              navigate('/');
            }}
            title="Return to Home"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #38bdf8 0%, #1d4ed8 100%)',
              border: '2px solid #60a5fa',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
          >
            <Home size={18} strokeWidth={2.5} />
          </button>

          {/* Center Badges: Total Stars & Keys Found */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Stars Count Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(15, 23, 42, 0.7))',
              border: '1.5px solid #fbbf24',
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              color: '#fef08a',
              fontSize: '0.85rem',
              fontWeight: '900',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              letterSpacing: '0.3px'
            }}>
              <Star size={16} fill="#f59e0b" color="#fbbf24" />
              <span>{totalStars}</span>
            </div>

            {/* Keys Count Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(15, 23, 42, 0.7))',
              border: '1.5px solid #38bdf8',
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              color: '#bae6fd',
              fontSize: '0.85rem',
              fontWeight: '900',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              letterSpacing: '0.3px'
            }}>
              <Key size={15} color="#38bdf8" />
              <span>{keysCollected} / 5</span>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !soundOn;
              soundEngine.setSoundEnabled(next);
              setSoundOn(next);
            }}
            title={soundOn ? 'Mute Sound FX' : 'Enable Sound FX'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #38bdf8 0%, #1d4ed8 100%)',
              border: '2px solid #60a5fa',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
          >
            {soundOn ? <Volume2 size={17} strokeWidth={2.5} /> : <VolumeX size={17} strokeWidth={2.5} />}
          </button>
        </div>

        {/* Top-Left Floating Arcade CRT Preview Window (Matching Image 2 & 3) */}
        <div
          onClick={() => handleSelectLevel(highestUnlocked, true)}
          title="Click to play current level"
          style={{
            position: 'absolute',
            top: '56px',
            left: '14px',
            zIndex: 35,
            width: '84px',
            height: '92px',
            background: 'linear-gradient(180deg, #334155 0%, #1e293b 40%, #0f172a 100%)',
            borderRadius: '12px',
            border: '2.5px solid #64748b',
            boxShadow: '0 6px 16px rgba(0,0,0,0.4), inset 0 2px 2px rgba(255,255,255,0.4)',
            padding: '5px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {/* Inner Monitor Display */}
          <div style={{
            width: '100%',
            flex: 1,
            background: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #090d16 100%)',
            borderRadius: '7px',
            border: '1.5px solid #0f172a',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Miniature Bubbles */}
            <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
              <div style={{ width: '13px', height: '13px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #fca5a5, #ef4444)' }} />
              <div style={{ width: '13px', height: '13px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #93c5fd, #3b82f6)' }} />
              <div style={{ width: '13px', height: '13px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #fde047, #eab308)' }} />
            </div>
            <div style={{ display: 'flex', gap: '3px', marginTop: '2px' }}>
              <div style={{ width: '13px', height: '13px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #86efac, #22c55e)' }} />
              <div style={{ width: '13px', height: '13px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #d8b4fe, #a855f7)' }} />
            </div>
            <span style={{ fontSize: '0.62rem', fontWeight: '900', color: '#f8fafc', marginTop: '4px', letterSpacing: '0.5px' }}>
              LVL {highestUnlocked}
            </span>
          </div>
        </div>

        {/* Realm Navigation Tabs (Bottom floating pills) */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          display: 'flex',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          padding: '4px',
          borderRadius: '9999px',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
        }}>
          {[
            { id: 1, name: 'Sanctuary (1-8)' },
            { id: 2, name: 'Waterfalls (9-16)' }
          ].map(realm => (
            <button
              key={realm.id}
              onClick={() => {
                soundEngine.playButtonClick();
                setActiveRealm(realm.id);
              }}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                border: 'none',
                background: activeRealm === realm.id
                  ? 'linear-gradient(135deg, #0284c7, #38bdf8)'
                  : 'transparent',
                color: activeRealm === realm.id ? '#ffffff' : '#94a3b8',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeRealm === realm.id ? '0 2px 8px rgba(2, 132, 199, 0.5)' : 'none'
              }}
            >
              {realm.name}
            </button>
          ))}
        </div>

        {/* Scrollable Sky Realm Canvas Container */}
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            width: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            paddingBottom: '60px',
            scrollBehavior: 'smooth'
          }}>

          {/* SVG Map Illustration of Floating Sky Islands & Stepping Stones */}
          <div style={{ position: 'relative', width: '100%', minHeight: '940px' }}>

            <svg
              viewBox="0 0 460 940"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                overflow: 'visible'
              }}
            >
              <defs>
                {/* Island Grass Gradient */}
                <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="35%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>

                {/* Island Earthen Cliff Gradient */}
                <linearGradient id="cliffGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a16207" />
                  <stop offset="40%" stopColor="#78350f" />
                  <stop offset="100%" stopColor="#451a03" />
                </linearGradient>

                {/* Stepping Stone Pillar Gradient */}
                <linearGradient id="stoneTopGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4a373" />
                  <stop offset="60%" stopColor="#bc6c25" />
                  <stop offset="100%" stopColor="#8c4915" />
                </linearGradient>

                <linearGradient id="stoneCliffGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8c4915" />
                  <stop offset="70%" stopColor="#582f0e" />
                  <stop offset="100%" stopColor="#331800" />
                </linearGradient>

                {/* Ancient Stone Ring Gradient */}
                <radialGradient id="sanctuaryRing" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0891b2" />
                  <stop offset="40%" stopColor="#0284c7" />
                  <stop offset="85%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </radialGradient>

                {/* Golden Key Gradient */}
                <linearGradient id="goldKeyGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="40%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>

                {/* Cloud Glow Filter */}
                <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Distant Floating Clouds (Background Layer) */}
              <g opacity="0.65" style={{ animation: 'cloudFloatLeft 28s ease-in-out infinite' }}>
                <path d="M-40,240 Q10,190 70,230 Q130,200 180,240 Q210,270 170,290 L-40,290 Z" fill="#ffffff" filter="url(#softGlow)" />
                <path d="M300,480 Q360,430 420,460 Q480,440 520,490 L300,520 Z" fill="#ffffff" filter="url(#softGlow)" />
                <path d="M-20,700 Q50,650 120,680 Q190,660 230,710 L-20,740 Z" fill="#ffffff" filter="url(#softGlow)" />
              </g>

              {/* 2. Waterfalls cascading from clouds (Realm 2 feature or background) */}
              <path d="M110,610 Q112,680 110,750" stroke="#7dd3fc" strokeWidth="4" strokeDasharray="8 4" opacity="0.6" style={{ animation: 'waterfallStream 2s linear infinite' }} />
              <path d="M360,420 Q362,490 360,560" stroke="#7dd3fc" strokeWidth="3" strokeDasharray="6 3" opacity="0.5" style={{ animation: 'waterfallStream 2.5s linear infinite' }} />

              {/* 3. THE SUMMIT SANCTUARY (Large Floating Sky Island at Top) */}
              <g transform="translate(230, 115)">
                {/* Craggy Island Underside (Brown cliffs) */}
                <polygon points="-160,0 -130,55 -90,95 -30,120 40,110 100,85 145,50 160,0" fill="url(#cliffGrad)" />
                {/* Cliff facets / rock cracks */}
                <polygon points="-110,20 -80,65 -40,85 -20,110 0,60" fill="#3b1d06" opacity="0.4" />
                <polygon points="50,20 80,65 110,40" fill="#3b1d06" opacity="0.35" />

                {/* Lush Turf Grass Top Rim */}
                <ellipse cx="0" cy="0" rx="162" ry="62" fill="url(#grassGrad)" />
                {/* Hanging vines */}
                <path d="M-130,20 Q-125,50 -128,70" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M-90,30 Q-86,65 -90,85" stroke="#15803d" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <path d="M120,20 Q124,55 120,75" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />

                {/* Ancient Stone Ring Platform */}
                <ellipse cx="0" cy="-2" rx="124" ry="46" fill="#475569" stroke="#334155" strokeWidth="4" />
                {/* Inner Runic Stone Disc */}
                <ellipse cx="0" cy="-3" rx="112" ry="40" fill="#1e293b" />

                {/* Cyan Runic Swirls & Ring in Center */}
                <ellipse cx="0" cy="-3" rx="60" ry="22" fill="url(#sanctuaryRing)" stroke="#38bdf8" strokeWidth="2.5" />
                {/* Glowing Core Portal Swirl */}
                <g style={{ animation: 'runicPortalSpin 30s linear infinite', transformOrigin: '0px -3px' }}>
                  <circle cx="0" cy="-3" r="18" fill="none" stroke="#67e8f9" strokeWidth="2" strokeDasharray="6 4" />
                  <circle cx="0" cy="-3" r="10" fill="none" stroke="#a5f3fc" strokeWidth="2" strokeDasharray="4 3" />
                </g>

                {/* 6 Keyhole Pedestals around the Sanctuary Ring */}
                {[
                  { cx: -85, cy: -2 },
                  { cx: -55, cy: -24 },
                  { cx: 55, cy: -24 },
                  { cx: 85, cy: -2 },
                  { cx: 48, cy: 18 },
                  { cx: -48, cy: 18 }
                ].map((ped, idx) => (
                  <g key={idx} transform={`translate(${ped.cx}, ${ped.cy})`}>
                    <ellipse cx="0" cy="0" rx="13" ry="8" fill="#d97706" stroke="#fef08a" strokeWidth="1.5" />
                    <ellipse cx="0" cy="-2" rx="10" ry="6" fill="#fef08a" />
                    {/* Keyhole slot */}
                    <rect x="-1.5" y="-5" width="3" height="6" fill="#78350f" rx="1" />
                    <circle cx="0" cy="-5" r="2.5" fill="#78350f" />
                  </g>
                ))}

                {/* Left Monolith Pillar with glowing rune */}
                <g transform="translate(-142, -55)">
                  <polygon points="-12,50 -8,-25 8,-35 12,50" fill="#334155" stroke="#1e293b" strokeWidth="2" />
                  <path d="M-2,0 Q3,10 -1,22 Q4,30 0,40" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" filter="url(#softGlow)" />
                </g>

                {/* Right Monolith Pillar with glowing rune */}
                <g transform="translate(142, -55)">
                  <polygon points="-12,50 -8,-35 8,-25 12,50" fill="#334155" stroke="#1e293b" strokeWidth="2" />
                  <path d="M2,0 Q-3,10 1,22 Q-4,30 0,40" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" filter="url(#softGlow)" />
                </g>

                {/* Floating Bonsai Island on Right */}
                <g transform="translate(165, 45)">
                  <polygon points="-18,0 -12,25 0,38 14,22 18,0" fill="url(#cliffGrad)" />
                  <ellipse cx="0" cy="0" rx="20" ry="9" fill="url(#grassGrad)" />
                  {/* Bonsai Trunk & Foliage */}
                  <path d="M-2,-2 Q4,-12 8,-22" stroke="#78350f" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <circle cx="10" cy="-24" r="14" fill="#15803d" />
                  <circle cx="6" cy="-26" r="11" fill="#22c55e" />
                </g>
              </g>

              {/* 4. Dashed Magic Path Connecting Stepping Stones */}
              <path
                d="M230,830 Q270,725 200,620 Q260,520 290,420 Q240,340 190,265 Q240,200 230,175"
                fill="none"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="4"
                strokeDasharray="8 6"
                strokeLinecap="round"
              />

              {/* 5. STEPPING STONES RENDERED */}
              {currentStones.map((st) => {
                const posX = (st.x / 100) * 460;
                const posY = (st.y / 100) * 940;
                const isUnlocked = unlockedSet.has(st.level) || st.level === 1;
                const starsEarned = userStars[st.level] || (isUnlocked && st.level < highestUnlocked ? 2 : 0);
                const isCurrent = st.level === highestUnlocked;
                const keyData = st.hasKey ? KEY_CONFIGS[st.keyId] : null;

                return (
                  <g
                    key={st.level}
                    transform={`translate(${posX}, ${posY})`}
                    style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
                    onClick={() => handleSelectLevel(st.level, isUnlocked)}
                  >
                    {/* Stepping Stone Cliff Underbelly (Earth column) */}
                    <polygon
                      points="-32,0 -24,30 -12,50 0,62 14,48 26,28 32,0"
                      fill="url(#stoneCliffGrad)"
                    />
                    <polygon points="-20,10 -10,38 0,55 -6,22" fill="#261202" opacity="0.4" />

                    {/* Stepping Stone Top Cap */}
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="33"
                      ry="16"
                      fill={isUnlocked ? 'url(#stoneTopGrad)' : '#475569'}
                      stroke={isUnlocked ? '#fde047' : '#334155'}
                      strokeWidth={isUnlocked ? 2.5 : 1.5}
                    />

                    {/* Inner Carved Rune Ring */}
                    <ellipse
                      cx="0"
                      cy="-1"
                      rx="24"
                      ry="11"
                      fill={isUnlocked ? (st.isRune ? '#0891b2' : '#ca8a04') : '#334155'}
                    />

                    {/* Base Level 1: Golden Sun Pedestal & Milestone Plaque */}
                    {st.isBase && (
                      <g>
                        <ellipse cx="0" cy="-2" rx="16" ry="8" fill="#fef08a" stroke="#d97706" strokeWidth="1.5" />
                        {/* Paw Sigil */}
                        <circle cx="0" cy="-2" r="3.5" fill="#78350f" />
                        <circle cx="-4" cy="-5" r="1.5" fill="#78350f" />
                        <circle cx="0" cy="-6" r="1.5" fill="#78350f" />
                        <circle cx="4" cy="-5" r="1.5" fill="#78350f" />

                        {/* Milestone Number Plaque "1" hanging on stone */}
                        <rect x="-10" y="8" width="20" height="15" rx="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
                        <text x="0" y="19" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="900" fontFamily="sans-serif">1</text>
                      </g>
                    )}

                    {/* Level 2: Cyan Glowing Rune */}
                    {st.isRune && (
                      <g>
                        <ellipse cx="0" cy="-2" rx="15" ry="7" fill="#67e8f9" />
                        <circle cx="0" cy="-2" r="4" fill="#0e7490" />
                      </g>
                    )}

                    {/* Regular Level Number Badge (if not level 1 or key) */}
                    {!st.isBase && !st.hasKey && (
                      <g>
                        <ellipse cx="0" cy="-2" rx="14" ry="7" fill={isUnlocked ? '#fef08a' : '#1e293b'} />
                        <text
                          x="0"
                          y="2"
                          textAnchor="middle"
                          fill={isUnlocked ? '#78350f' : '#64748b'}
                          fontSize="11"
                          fontWeight="900"
                          fontFamily="sans-serif"
                        >
                          {st.level}
                        </text>
                      </g>
                    )}

                    {/* RADIANT HOVERING RELIC KEYS (Levels 4, 5, 6, 7, 8 - as shown in Image 2) */}
                    {st.hasKey && keyData && (
                      <g transform="translate(0, -18)" style={{ animation: 'keyHoverFloat 3.5s ease-in-out infinite' }}>
                        {/* Key Aura Glow */}
                        <circle cx="0" cy="0" r="24" fill={keyData.glow} opacity="0.4" filter="url(#softGlow)" />
                        
                        {/* Golden Key Stem & Teeth */}
                        <path d="M-6,2 L22,2 L22,8 L16,8 L16,2" stroke="url(#goldKeyGrad)" strokeWidth="4" strokeLinecap="round" />
                        <rect x="18" y="4" width="4" height="6" fill="#f59e0b" />
                        <rect x="12" y="4" width="3" height="5" fill="#f59e0b" />

                        {/* Winged Accents for Ruby Key (Level 7) */}
                        {keyData.type === 'ruby' && (
                          <g fill="#fef08a" stroke="#d97706" strokeWidth="1">
                            <path d="M-10,-4 Q-18,-14 -6,-16 Q-8,-6 -10,-4 Z" />
                            <path d="M-10,4 Q-18,14 -6,16 Q-8,6 -10,4 Z" />
                          </g>
                        )}

                        {/* Horned Accents for Amethyst Key (Level 5) */}
                        {keyData.type === 'amethyst' && (
                          <g fill="#fef08a" stroke="#d97706" strokeWidth="1">
                            <path d="M-8,-8 Q-16,-18 0,-14 Z" />
                            <path d="M-8,8 Q-16,18 0,14 Z" />
                          </g>
                        )}

                        {/* Key Golden Bow Ring */}
                        <circle cx="-10" cy="2" r="12" fill="url(#goldKeyGrad)" stroke="#b45309" strokeWidth="1.5" />

                        {/* Inset Sparkling Colored Gemstone in Center of Key */}
                        <polygon
                          points="-10,-5 -4,2 -10,9 -16,2"
                          fill={keyData.gem}
                          stroke="#ffffff"
                          strokeWidth="1.2"
                        />
                        <polygon
                          points="-10,-3 -6,2 -10,6 -14,2"
                          fill={keyData.color}
                        />

                        {/* Level Tag under Key */}
                        <rect x="-10" y="24" width="20" height="13" rx="3" fill="rgba(15, 23, 42, 0.85)" stroke={keyData.color} strokeWidth="1" />
                        <text x="0" y="34" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800" fontFamily="sans-serif">
                          {st.level}
                        </text>
                      </g>
                    )}

                    {/* 3 Golden Stars above completed levels */}
                    {starsEarned > 0 && (
                      <g transform="translate(0, -18)">
                        {[
                          { dx: -12, dy: 0, active: starsEarned >= 1 },
                          { dx: 0, dy: -4, active: starsEarned >= 2 },
                          { dx: 12, dy: 0, active: starsEarned >= 3 }
                        ].map((starInfo, sIdx) => (
                          <polygon
                            key={sIdx}
                            points="0,-5 1.5,-1.5 5,-1.5 2,1 3.5,4.5 0,2.5 -3.5,4.5 -2,1 -5,-1.5 -1.5,-1.5"
                            transform={`translate(${starInfo.dx}, ${starInfo.dy}) scale(1.1)`}
                            fill={starInfo.active ? '#f59e0b' : '#334155'}
                            stroke={starInfo.active ? '#fef08a' : '#1e293b'}
                            strokeWidth="0.8"
                          />
                        ))}
                      </g>
                    )}

                    {/* Locked Indicator for future levels */}
                    {!isUnlocked && (
                      <g transform="translate(0, -2)">
                        <circle cx="0" cy="0" r="8" fill="#1e293b" />
                        <path d="M-3,0 L3,0 L3,4 L-3,4 Z" fill="#64748b" />
                        <path d="M-2,0 L-2,-2 Q0,-4 2,-2 L2,0" stroke="#64748b" strokeWidth="1.2" fill="none" />
                      </g>
                    )}

                    {/* PLAYER AVATAR MARKER ("You Are Here!" pin pointing down to current level) */}
                    {isCurrent && (
                      <g transform="translate(0, -42)" style={{ animation: 'avatarBounce 2s ease-in-out infinite' }}>
                        {/* Pulsing Target Aura Ring */}
                        <circle cx="0" cy="38" r="16" fill="none" stroke="#38bdf8" strokeWidth="2" style={{ animation: 'beaconPulse 2s infinite' }} />

                        {/* Speech Bubble Avatar Box */}
                        <rect x="-17" y="-17" width="34" height="34" rx="8" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
                        {/* Downward pointer triangle */}
                        <polygon points="-5,17 5,17 0,24" fill="#ffffff" />
                        <polygon points="-6,17 0,25 6,17" stroke="#0284c7" strokeWidth="2" fill="#ffffff" />

                        {/* Cute Adventure Dino / Avatar Face inside */}
                        <g transform="translate(0, 0)">
                          <circle cx="0" cy="0" r="12" fill="#22c55e" />
                          <circle cx="-4" cy="-2" r="2.5" fill="#ffffff" />
                          <circle cx="-4" cy="-2" r="1.2" fill="#0f172a" />
                          <circle cx="4" cy="-2" r="2.5" fill="#ffffff" />
                          <circle cx="4" cy="-2" r="1.2" fill="#0f172a" />
                          {/* Smile */}
                          <path d="M-4,3 Q0,6 4,3" stroke="#14532d" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                          {/* Cheeks */}
                          <circle cx="-7" cy="2" r="1.5" fill="#f87171" opacity="0.6" />
                          <circle cx="7" cy="2" r="1.5" fill="#f87171" opacity="0.6" />
                        </g>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* 6. Foreground Drifting Clouds & Mist (Bottom Framing) */}
              <g opacity="0.85" style={{ animation: 'cloudFloatRight 32s ease-in-out infinite' }}>
                <path d="M-60,880 Q40,820 160,860 Q280,810 400,850 Q500,820 540,880 L540,960 L-60,960 Z" fill="#ffffff" filter="url(#softGlow)" />
              </g>
            </svg>

          </div>
        </div>

      </div>
    </div>
  );
}
