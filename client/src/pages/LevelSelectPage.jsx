import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { levelManager } from '../game/levelManager';
import { gameService } from '../services/gameService';
import {
  Lock,
  Star,
  Play,
  Sparkles,
  Home,
  Volume2,
  VolumeX,
  Settings,
  Heart,
  Plus,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Gift,
  X,
  Award,
  Clock
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export default function LevelSelectPage({ user }) {
  const [levels, setLevels] = useState([]);
  const [activeRealm, setActiveRealm] = useState(1); // 1: Sky Islands, 2: Desert Realm, 3: Frost Peaks
  const [unlockedSet, setUnlockedSet] = useState(new Set([1]));
  const [userStars, setUserStars] = useState({});
  const [soundOn, setSoundOn] = useState(soundEngine.soundEnabled);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);

  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  // Load level progress
  useEffect(() => {
    async function load() {
      const list = await gameService.fetchLevels();
      setLevels(list);

      const currentUnlocked = levelManager.loadUnlockedLevels();
      const set = new Set(currentUnlocked);

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

  // Highest unlocked level overall
  const highestUnlocked = Math.max(...Array.from(unlockedSet), 1);

  // Total stars calculated
  const totalStars = Object.values(userStars).reduce((sum, s) => sum + (Number(s) || 0), 0);

  // Next Milestone Level Calculation
  const nextMilestone = Math.min(60, Math.ceil(highestUnlocked / 5) * 5 || 5);

  // Realm configurations
  const REALMS = [
    {
      id: 1,
      name: 'Sky Islands',
      range: '(1-20)',
      minLevel: 1,
      maxLevel: 20,
      thumb: '/assets/sky_islands_roadmap.jpg'
    },
    {
      id: 2,
      name: 'Desert Realm',
      range: '(21-40)',
      minLevel: 21,
      maxLevel: 40,
      thumb: '/assets/realm_desert_thumb.jpg'
    },
    {
      id: 3,
      name: 'Frost Peaks',
      range: '(41-60)',
      minLevel: 41,
      maxLevel: 60,
      thumb: '/assets/frost_peaks_roadmap.jpg'
    }
  ];

  // 1. Sky Islands (Levels 1-20) Road Coordinates
  const SKY_ISLANDS_NODES = [
    { level: 1,  x: 38, y: 94 },
    { level: 2,  x: 45, y: 91 },
    { level: 3,  x: 48, y: 87 },
    { level: 4,  x: 42, y: 84 },
    { level: 5,  x: 37, y: 81, milestone: true },
    { level: 6,  x: 41, y: 77 },
    { level: 7,  x: 46, y: 73 },
    { level: 8,  x: 49, y: 69 },
    { level: 9,  x: 47, y: 65 },
    { level: 10, x: 42, y: 61, milestone: true },
    { level: 11, x: 38, y: 57 }, // Windmill
    { level: 12, x: 44, y: 53 },
    { level: 13, x: 51, y: 50 }, // Bridge
    { level: 14, x: 57, y: 47 },
    { level: 15, x: 61, y: 43, milestone: true },
    { level: 16, x: 56, y: 39 },
    { level: 17, x: 53, y: 34 },
    { level: 18, x: 58, y: 29 },
    { level: 19, x: 64, y: 24 },
    { level: 20, x: 68, y: 19, isCastle: true, milestone: true }
  ];

  // 2. Desert Realm (Levels 21-40) Road Coordinates (Leading up to Pyramid Summit)
  const DESERT_REALM_NODES = [
    { level: 21, x: 50, y: 93, label: 'Oasis Base' },
    { level: 22, x: 42, y: 89 },
    { level: 23, x: 36, y: 85 },
    { level: 24, x: 44, y: 81 },
    { level: 25, x: 54, y: 77, milestone: true },
    { level: 26, x: 62, y: 73 },
    { level: 27, x: 56, y: 69 },
    { level: 28, x: 46, y: 65 },
    { level: 29, x: 38, y: 61 },
    { level: 30, x: 32, y: 56, milestone: true }, // Sand Canyon Gate
    { level: 31, x: 40, y: 52 },
    { level: 32, x: 50, y: 48 },
    { level: 33, x: 60, y: 44 },
    { level: 34, x: 65, y: 39 },
    { level: 35, x: 58, y: 35, milestone: true }, // Obelisk Crossing
    { level: 36, x: 48, y: 31 },
    { level: 37, x: 42, y: 26 },
    { level: 38, x: 48, y: 21 },
    { level: 39, x: 56, y: 16 },
    { level: 40, x: 50, y: 10, isCastle: true, milestone: true } // The Great Sun Pyramid
  ];

  // 3. Frost Peaks (Levels 41-60) Road Coordinates (Leading up to Ice Palace)
  const FROST_PEAKS_NODES = [
    { level: 41, x: 52, y: 93, label: 'Frozen Lake' },
    { level: 42, x: 60, y: 89 },
    { level: 43, x: 66, y: 85 },
    { level: 44, x: 58, y: 81 },
    { level: 45, x: 48, y: 77, milestone: true },
    { level: 46, x: 38, y: 73 },
    { level: 47, x: 34, y: 69 },
    { level: 48, x: 42, y: 65 },
    { level: 49, x: 52, y: 61 },
    { level: 50, x: 62, y: 56, milestone: true }, // Glacier Bridge
    { level: 51, x: 66, y: 52 },
    { level: 52, x: 58, y: 48 },
    { level: 53, x: 48, y: 44 },
    { level: 54, x: 38, y: 40 },
    { level: 55, x: 34, y: 35, milestone: true }, // Crystal Cavern
    { level: 56, x: 42, y: 31 },
    { level: 57, x: 52, y: 26 },
    { level: 58, x: 60, y: 21 },
    { level: 59, x: 56, y: 16 },
    { level: 60, x: 50, y: 10, isCastle: true, milestone: true } // Ice Crystal Citadel
  ];

  const getNodesForRealm = () => {
    if (activeRealm === 1) return SKY_ISLANDS_NODES;
    if (activeRealm === 2) return DESERT_REALM_NODES;
    return FROST_PEAKS_NODES;
  };

  const currentNodes = getNodesForRealm();

  // Auto-scroll to center player's current active level on mount & realm switch
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeNode = currentNodes.find(n => n.level === highestUnlocked);
      const targetYPercent = activeNode ? activeNode.y : 85;
      
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const scrollHeight = scrollContainerRef.current.scrollHeight;
          const clientHeight = scrollContainerRef.current.clientHeight;
          const targetScrollTop = (targetYPercent / 100) * scrollHeight - clientHeight / 2;
          scrollContainerRef.current.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth'
          });
        }
      }, 150);
    }
  }, [activeRealm, highestUnlocked]);

  const handleSelectLevel = (levelId, isUnlocked) => {
    if (!isUnlocked) {
      soundEngine.playLevelFailed();
      return;
    }
    soundEngine.playButtonClick();
    navigate(`/game/${levelId}`);
  };

  const handlePrevRealm = () => {
    soundEngine.playButtonClick();
    setActiveRealm(prev => (prev > 1 ? prev - 1 : REALMS.length));
  };

  const handleNextRealm = () => {
    soundEngine.playButtonClick();
    setActiveRealm(prev => (prev < REALMS.length ? prev + 1 : 1));
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      height: '100dvh',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at 50% 15%, #0d2847 0%, #06152b 50%, #020814 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'stretch',
      userSelect: 'none',
      fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)'
    }}>
      <style>{`
        @keyframes pinBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-9px) scale(1.08); }
        }
        @keyframes activeAuraPulse {
          0%, 100% {
            box-shadow: 0 0 15px #f59e0b, 0 0 30px rgba(245, 158, 11, 0.7), inset 0 0 10px rgba(254, 240, 138, 0.8);
            border-color: #fef08a;
          }
          50% {
            box-shadow: 0 0 25px #fbbf24, 0 0 50px rgba(251, 191, 36, 0.9), inset 0 0 16px rgba(255, 255, 255, 0.95);
            border-color: #ffffff;
          }
        }
        @keyframes chestGlow {
          0%, 100% { filter: drop-shadow(0 2px 8px rgba(245, 158, 11, 0.7)); }
          50% { filter: drop-shadow(0 4px 16px rgba(251, 191, 36, 1)); }
        }
        @keyframes auroraWave {
          0% { opacity: 0.4; transform: scaleY(1) rotate(0deg); }
          50% { opacity: 0.8; transform: scaleY(1.3) rotate(2deg); }
          100% { opacity: 0.4; transform: scaleY(1) rotate(0deg); }
        }
        @keyframes snowDrift {
          0% { transform: translateY(-20px) translateX(0); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(800px) translateX(40px); opacity: 0; }
        }
        .roadmap-scroll::-webkit-scrollbar {
          width: 0px;
          display: none;
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
        boxShadow: '0 0 60px rgba(0, 0, 0, 0.6)',
        background: activeRealm === 1 ? '#041022' : activeRealm === 2 ? '#451a03' : '#03192e'
      }}>

        {/* ========================================================
            TOP BAR HEADER (Matching Reference Image 100%)
            ======================================================== */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 45,
          padding: '0.65rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(6, 18, 38, 0.92) 0%, rgba(6, 18, 38, 0.6) 75%, rgba(6, 18, 38, 0) 100%)',
          backdropFilter: 'blur(8px)',
          gap: '6px'
        }}>

          {/* Player Profile Capsule with Level Badge & XP Bar */}
          <div
            onClick={() => navigate('/dashboard')}
            title="View Player Profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)',
              border: '2px solid #38bdf8',
              borderRadius: '9999px',
              padding: '2px 8px 2px 2px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
              cursor: 'pointer',
              gap: '6px'
            }}
          >
            {/* Cute Cat/Mascot Avatar Circle */}
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #67e8f9',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
              background: '#0284c7',
              flexShrink: 0
            }}>
              <img
                src="/assets/mascot_avatar.jpg"
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Level Label & Progress Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '55px' }}>
              <span style={{
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: '900',
                letterSpacing: '0.4px',
                lineHeight: '1',
                textShadow: '0 1px 2px rgba(0,0,0,0.6)'
              }}>
                Lv. {highestUnlocked}
              </span>
              {/* Blue Gradient Progress Bar */}
              <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '9999px',
                overflow: 'hidden',
                border: '1px solid rgba(56, 189, 248, 0.4)'
              }}>
                <div style={{
                  width: `${Math.min(100, ((highestUnlocked % 5 || 1) / 5) * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #38bdf8, #60a5fa)',
                  borderRadius: '9999px'
                }} />
              </div>
            </div>
          </div>

          {/* Star Counter Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            border: '2px solid #0284c7',
            padding: '0.32rem 0.65rem',
            borderRadius: '9999px',
            color: '#fef08a',
            fontSize: '0.85rem',
            fontWeight: '900',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            letterSpacing: '0.3px'
          }}>
            <Star size={16} fill="#f59e0b" color="#fbbf24" />
            <span>{totalStars} / {Math.max(15, currentNodes.length * 3)}</span>
          </div>

          {/* Lives / Heart Counter Pill with '+' Button */}
          <div
            onClick={() => setShowHeartsModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
              border: '2px solid #0284c7',
              padding: '0.25rem 0.35rem 0.25rem 0.65rem',
              borderRadius: '9999px',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: '900',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              cursor: 'pointer'
            }}
          >
            <Heart size={15} fill="#ef4444" color="#f87171" />
            <span style={{ fontSize: '0.78rem', fontWeight: '800' }}>5 Full</span>
            <div style={{
              width: '19px',
              height: '19px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e, #15803d)',
              border: '1px solid #86efac',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '2px'
            }}>
              <Plus size={12} strokeWidth={3} color="#ffffff" />
            </div>
          </div>

          {/* Settings / Gear Button */}
          <button
            onClick={() => {
              const next = !soundOn;
              soundEngine.setSoundEnabled(next);
              soundEngine.setMusicEnabled(next);
              setSoundOn(next);
            }}
            title={soundOn ? 'Mute Audio' : 'Unmute Audio'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #0284c7 0%, #1e40af 100%)',
              border: '2px solid #38bdf8',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
              flexShrink: 0
            }}
          >
            {soundOn ? <Settings size={18} strokeWidth={2.4} /> : <VolumeX size={18} strokeWidth={2.4} />}
          </button>
        </div>


        {/* ========================================================
            LEFT FLOATING WIDGETS (Matching Reference Image)
            ======================================================== */}
        <div style={{
          position: 'absolute',
          top: '64px',
          left: '12px',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          pointerEvents: 'auto'
        }}>

          {/* 1. "Next Reward" Chest Card */}
          <div
            onClick={() => setShowRewardModal(true)}
            style={{
              width: '84px',
              background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
              borderRadius: '12px',
              border: '2px solid #38bdf8',
              boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
              padding: '6px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span style={{
              color: '#ffffff',
              fontSize: '0.62rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              textAlign: 'center',
              marginBottom: '2px'
            }}>
              Next Reward
            </span>

            {/* Glowing 3D Golden Treasure Chest Icon */}
            <div style={{
              fontSize: '28px',
              lineHeight: '1',
              margin: '3px 0',
              animation: 'chestGlow 2.5s infinite'
            }}>
              🎁
            </div>

            <span style={{
              color: '#93c5fd',
              fontSize: '0.58rem',
              fontWeight: '800',
              textAlign: 'center',
              letterSpacing: '0.2px'
            }}>
              Reach Level {nextMilestone}
            </span>
          </div>

          {/* 2. "Daily Challenge" Trophy Card */}
          <div
            onClick={() => navigate('/daily')}
            style={{
              width: '84px',
              background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
              borderRadius: '12px',
              border: '2px solid #38bdf8',
              boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
              padding: '6px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {/* Red Notification Badge */}
            <div style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#ef4444',
              border: '1.5px solid #ffffff'
            }} />

            {/* Golden Trophy Icon */}
            <Trophy size={26} color="#fbbf24" fill="#f59e0b" style={{ margin: '2px 0' }} />

            <span style={{
              color: '#ffffff',
              fontSize: '0.62rem',
              fontWeight: '900',
              textAlign: 'center',
              lineHeight: '1.2',
              marginTop: '2px'
            }}>
              Daily<br />Challenge
            </span>

            {/* Countdown Timer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              color: '#93c5fd',
              fontSize: '0.56rem',
              fontWeight: '800',
              marginTop: '3px'
            }}>
              <Clock size={10} />
              <span>12h 30m</span>
            </div>
          </div>
        </div>


        {/* ========================================================
            SCROLLABLE ROADMAP CONTAINER
            ======================================================== */}
        <div
          ref={scrollContainerRef}
          className="roadmap-scroll"
          style={{
            flex: 1,
            width: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            scrollBehavior: 'smooth'
          }}
        >
          {/* Maintained exact 9:16 aspect ratio (768x1376) without vertical distortion */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '768 / 1376',
            minHeight: '100%',
            height: 'auto',
            background: activeRealm === 1
              ? '#031428'
              : activeRealm === 2
                ? '#3b1a06'
                : '#020a1a',
            overflow: 'hidden'
          }}>

            {/* ========================================================
                PHASE 1: SKY ISLANDS BACKGROUND
                ======================================================== */}
            {activeRealm === 1 && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'url(/assets/sky_islands_roadmap.jpg)',
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center top'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(8, 29, 61, 0.1) 0%, rgba(2, 6, 23, 0.2) 100%)',
                  pointerEvents: 'none'
                }} />
              </div>
            )}

            {/* ========================================================
                PHASE 2: DESERT REALM — Professional AI-Generated Background
                ======================================================== */}
            {activeRealm === 2 && (
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                {/* Full-bleed background image */}
                <img
                  src="/assets/desert_realm_roadmap.jpg"
                  alt="Desert Realm"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    display: 'block'
                  }}
                />
                {/* Warm amber cinematic vignette overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(60, 20, 0, 0.55) 100%)',
                  pointerEvents: 'none'
                }} />
                {/* Road path SVG overlay — golden sandy trail */}
                <svg
                  viewBox="0 0 768 1376"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="desertRoadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.85" />
                    </linearGradient>
                  </defs>
                  {/* Outer road glow */}
                  <path
                    d="M 384,1280 Q 280,1180 320,1080 Q 380,980 480,900 Q 520,800 380,720 Q 240,640 320,540 Q 420,440 480,360 Q 450,280 384,240"
                    fill="none"
                    stroke="rgba(253,230,138,0.35)"
                    strokeWidth="70"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Main sandy road */}
                  <path
                    d="M 384,1280 Q 280,1180 320,1080 Q 380,980 480,900 Q 520,800 380,720 Q 240,640 320,540 Q 420,440 480,360 Q 450,280 384,240"
                    fill="none"
                    stroke="url(#desertRoadGrad)"
                    strokeWidth="44"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Center dashed divider */}
                  <path
                    d="M 384,1280 Q 280,1180 320,1080 Q 380,980 480,900 Q 520,800 380,720 Q 240,640 320,540 Q 420,440 480,360 Q 450,280 384,240"
                    fill="none"
                    stroke="rgba(120,53,15,0.75)"
                    strokeWidth="4"
                    strokeDasharray="18 14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {/* Floating heat shimmer particles */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      bottom: `${10 + (i * 7) % 40}%`,
                      left: `${(i * 8.5) % 90}%`,
                      width: `${6 + (i % 3) * 3}px`,
                      height: `${6 + (i % 3) * 3}px`,
                      borderRadius: '50%',
                      background: 'rgba(253, 230, 138, 0.6)',
                      boxShadow: '0 0 12px rgba(245,158,11,0.8)',
                      pointerEvents: 'none',
                      animation: `floatAnim ${3 + (i % 4)}s ease-in-out infinite`,
                      animationDelay: `${i * 0.35}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* ========================================================
                PHASE 3: FROST PEAKS — Professional AI-Generated Background
                ======================================================== */}
            {activeRealm === 3 && (
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                {/* Full-bleed background image */}
                <img
                  src="/assets/frost_peaks_roadmap.jpg"
                  alt="Frost Peaks"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    display: 'block'
                  }}
                />
                {/* Deep blue arctic vignette overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(2,8,30,0.60) 100%)',
                  pointerEvents: 'none'
                }} />
                {/* Road path SVG overlay — icy glacial trail */}
                <svg
                  viewBox="0 0 768 1376"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="frostRoadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.98" />
                      <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.88" />
                    </linearGradient>
                  </defs>
                  {/* Outer icy glow */}
                  <path
                    d="M 384,1280 Q 520,1180 460,1080 Q 360,980 340,900 Q 420,800 540,720 Q 640,640 520,540 Q 380,440 420,360 Q 480,280 384,240"
                    fill="none"
                    stroke="rgba(165,243,252,0.3)"
                    strokeWidth="72"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Main ice road */}
                  <path
                    d="M 384,1280 Q 520,1180 460,1080 Q 360,980 340,900 Q 420,800 540,720 Q 640,640 520,540 Q 380,440 420,360 Q 480,280 384,240"
                    fill="none"
                    stroke="url(#frostRoadGrad)"
                    strokeWidth="46"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Center dashed divider */}
                  <path
                    d="M 384,1280 Q 520,1180 460,1080 Q 360,980 340,900 Q 420,800 540,720 Q 640,640 520,540 Q 380,440 420,360 Q 480,280 384,240"
                    fill="none"
                    stroke="rgba(2,132,199,0.8)"
                    strokeWidth="4"
                    strokeDasharray="16 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {/* Drifting Animated Snowflakes Falling */}
                {Array.from({ length: 22 }).map((_, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      position: 'absolute',
                      top: '-20px',
                      left: `${(sIdx * 4.6) % 95}%`,
                      width: `${3 + (sIdx % 4) * 2}px`,
                      height: `${3 + (sIdx % 4) * 2}px`,
                      borderRadius: '50%',
                      background: '#ffffff',
                      boxShadow: '0 0 8px #a5f3fc',
                      opacity: 0.75,
                      pointerEvents: 'none',
                      animation: `snowDrift ${4 + (sIdx % 5)}s linear infinite`,
                      animationDelay: `${sIdx * 0.35}s`
                    }}
                  />
                ))}
              </div>
            )}


            {/* ========================================================
                ROADMAP LEVEL NODES (Stepping Stone Pedestals)
                ======================================================== */}
            {currentNodes.map(st => {
              const isUnlocked = unlockedSet.has(st.level) || st.level === 1 || st.level === 21 || st.level === 41;
              const isCurrent = st.level === highestUnlocked;
              const stars = userStars[st.level] || (isUnlocked && st.level < highestUnlocked ? 3 : 0);

              // Realm-specific pedestal disc styling
              const isDesert = activeRealm === 2;
              const isFrost = activeRealm === 3;

              return (
                <div
                  key={st.level}
                  onClick={() => handleSelectLevel(st.level, isUnlocked)}
                  style={{
                    position: 'absolute',
                    left: `${st.x}%`,
                    top: `${st.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    zIndex: isCurrent ? 35 : 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                  onMouseEnter={e => {
                    if (isUnlocked) e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.12)';
                  }}
                  onMouseLeave={e => {
                    if (isUnlocked) e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                  }}
                >

                  {/* 1. HOVERING LOCATION PIN FOR CURRENT LEVEL */}
                  {isCurrent && (
                    <div style={{
                      position: 'absolute',
                      top: '-44px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      animation: 'pinBounce 2s ease-in-out infinite',
                      zIndex: 40
                    }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50% 50% 50% 0',
                        transform: 'rotate(-45deg)',
                        background: isDesert
                          ? 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)'
                          : isFrost
                            ? 'linear-gradient(135deg, #a5f3fc 0%, #0284c7 100%)'
                            : 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                        border: '2.5px solid #ffffff',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          width: '9px',
                          height: '9px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)'
                        }} />
                      </div>
                    </div>
                  )}

                  {/* 2. SUMMIT CROWN / CREST FOR MILESTONE LEVEL (Level 20, 40, 60) */}
                  {st.isCastle && (
                    <div style={{
                      position: 'absolute',
                      top: '-26px',
                      fontSize: '20px',
                      filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))'
                    }}>
                      {isDesert ? '🏛️' : isFrost ? '❄️' : '👑'}
                    </div>
                  )}

                  {/* 3. STEPPING STONE PEDESTAL DISC */}
                  <div style={{
                    width: isCurrent ? '46px' : '39px',
                    height: isCurrent ? '46px' : '39px',
                    borderRadius: '50%',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCurrent
                      ? (isDesert
                          ? 'linear-gradient(180deg, #fef08a 0%, #d97706 100%)'
                          : isFrost
                            ? 'linear-gradient(180deg, #e0f2fe 0%, #0284c7 100%)'
                            : 'linear-gradient(180deg, #fde047 0%, #d97706 100%)')
                      : isUnlocked
                        ? (isDesert
                            ? 'linear-gradient(180deg, #d97706 0%, #78350f 100%)'
                            : isFrost
                              ? 'linear-gradient(180deg, #7dd3fc 0%, #0369a1 100%)'
                              : 'linear-gradient(180deg, #64748b 0%, #334155 100%)')
                        : (isDesert
                            ? 'linear-gradient(180deg, #78350f 0%, #451a03 100%)'
                            : isFrost
                              ? 'linear-gradient(180deg, #0f172a 0%, #082f49 100%)'
                              : 'linear-gradient(180deg, #334155 0%, #0f172a 100%)'),
                    border: isCurrent
                      ? '3px solid #ffffff'
                      : isUnlocked
                        ? (isDesert ? '2.5px solid #fbbf24' : isFrost ? '2.5px solid #a5f3fc' : '2.5px solid #94a3b8')
                        : '2px solid #475569',
                    boxShadow: isCurrent
                      ? '0 0 18px #f59e0b, 0 6px 14px rgba(0,0,0,0.6)'
                      : '0 4px 10px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.25)',
                    animation: isCurrent ? 'activeAuraPulse 2.2s infinite' : 'none'
                  }}>

                    {/* Inner Disc Fill */}
                    <div style={{
                      width: '85%',
                      height: '85%',
                      borderRadius: '50%',
                      background: isCurrent
                        ? (isDesert
                            ? 'radial-gradient(circle at 40% 35%, #fbbf24 0%, #b45309 70%, #78350f 100%)'
                            : isFrost
                              ? 'radial-gradient(circle at 40% 35%, #a5f3fc 0%, #0284c7 70%, #0369a1 100%)'
                              : 'radial-gradient(circle at 40% 35%, #38bdf8 0%, #0284c7 70%, #0369a1 100%)')
                        : isUnlocked
                          ? (isDesert
                              ? 'radial-gradient(circle at 40% 35%, #92400e 0%, #451a03 100%)'
                              : isFrost
                                ? 'radial-gradient(circle at 40% 35%, #0369a1 0%, #0c4a6e 100%)'
                                : 'radial-gradient(circle at 40% 35%, #334155 0%, #1e293b 80%, #0f172a 100%)')
                          : 'radial-gradient(circle at 40% 35%, #1e293b 0%, #090d16 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)'
                    }}>

                      {/* Locked Padlock Icon */}
                      {!isUnlocked ? (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0px'
                        }}>
                          <Lock size={12} color="#cbd5e1" strokeWidth={2.6} />
                          <span style={{
                            color: '#94a3b8',
                            fontSize: '0.64rem',
                            fontWeight: '900',
                            fontFamily: 'system-ui',
                            lineHeight: '1'
                          }}>
                            {st.level}
                          </span>
                        </div>
                      ) : (
                        /* Level Number */
                        <span style={{
                          color: '#ffffff',
                          fontSize: isCurrent ? '0.98rem' : '0.88rem',
                          fontWeight: '900',
                          fontFamily: 'system-ui',
                          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                          lineHeight: '1',
                          letterSpacing: '-0.3px'
                        }}>
                          {st.level}
                        </span>
                      )}

                    </div>
                  </div>

                  {/* 4. THREE GOLDEN STARS UNDERNEATH */}
                  {isUnlocked && (
                    <div style={{
                      display: 'flex',
                      gap: '2px',
                      marginTop: '3px',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))'
                    }}>
                      {[1, 2, 3].map(starNum => {
                        const earned = stars >= starNum;
                        return (
                          <Star
                            key={starNum}
                            size={11}
                            fill={earned ? '#f59e0b' : '#334155'}
                            color={earned ? '#fef08a' : '#1e293b'}
                            strokeWidth={1.5}
                          />
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        </div>


        {/* ========================================================
            BOTTOM REALM SELECTOR DOCK (Matching Reference Image)
            ======================================================== */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '10px',
          right: '10px',
          zIndex: 45,
          background: 'rgba(6, 18, 38, 0.88)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '2px solid rgba(2, 132, 199, 0.45)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.65)',
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px'
        }}>

          {/* Left Navigation Arrow Button */}
          <button
            onClick={handlePrevRealm}
            title="Previous Realm"
            style={{
              width: '32px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(30, 58, 138, 0.4)',
              border: 'none',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <ChevronLeft size={22} strokeWidth={2.8} />
          </button>

          {/* Three Realm Options */}
          <div style={{
            display: 'flex',
            gap: '6px',
            flex: 1,
            justifyContent: 'center'
          }}>
            {REALMS.map(realm => {
              const isActive = activeRealm === realm.id;
              return (
                <button
                  key={realm.id}
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setActiveRealm(realm.id);
                  }}
                  style={{
                    flex: 1,
                    maxWidth: '120px',
                    padding: '4px 6px',
                    borderRadius: '16px',
                    border: isActive ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    background: isActive
                      ? 'linear-gradient(180deg, rgba(2, 132, 199, 0.9) 0%, rgba(30, 58, 138, 0.95) 100%)'
                      : 'rgba(15, 23, 42, 0.65)',
                    boxShadow: isActive ? '0 0 16px rgba(56, 189, 248, 0.6)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    gap: '2px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Miniature 3D Realm Island Thumbnail */}
                  <div style={{
                    width: '36px',
                    height: '28px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: isActive ? '1.5px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                    background: '#0f172a'
                  }}>
                    <img
                      src={realm.thumb}
                      alt={realm.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Realm Name & Level Range */}
                  <span style={{
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    fontSize: '0.68rem',
                    fontWeight: '900',
                    lineHeight: '1.1',
                    textAlign: 'center',
                    letterSpacing: '0.2px'
                  }}>
                    {realm.name}
                  </span>
                  <span style={{
                    color: isActive ? '#bae6fd' : '#64748b',
                    fontSize: '0.58rem',
                    fontWeight: '800'
                  }}>
                    {realm.range}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Navigation Arrow Button */}
          <button
            onClick={handleNextRealm}
            title="Next Realm"
            style={{
              width: '32px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(30, 58, 138, 0.4)',
              border: 'none',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <ChevronRight size={22} strokeWidth={2.8} />
          </button>
        </div>


        {/* ========================================================
            MODAL: NEXT REWARD PREVIEW
            ======================================================== */}
        {showRewardModal && (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '320px',
              background: 'linear-gradient(180deg, #1e3a8a 0%, #0f172a 100%)',
              border: '2px solid #38bdf8',
              borderRadius: '20px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowRewardModal(false)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>

              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎁</div>
              <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: '900', margin: '0 0 6px 0' }}>
                Milestone Reward
              </h3>
              <p style={{ color: '#93c5fd', fontSize: '0.85rem', textAlign: 'center', margin: '0 0 16px 0' }}>
                Reach <strong>Level {nextMilestone}</strong> to unlock this legendary treasure chest!
              </p>

              <div style={{
                display: 'flex',
                gap: '12px',
                width: '100%',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <div style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid #38bdf8',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '20px' }}>🪙</span>
                  <span style={{ color: '#fef08a', fontSize: '0.75rem', fontWeight: '900' }}>+250 Coins</span>
                </div>
                <div style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid #38bdf8',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '20px' }}>💣</span>
                  <span style={{ color: '#fca5a5', fontSize: '0.75rem', fontWeight: '900' }}>+2 Bombs</span>
                </div>
              </div>

              <button
                onClick={() => setShowRewardModal(false)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                  border: 'none',
                  borderRadius: '9999px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: '900',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.6)'
                }}
              >
                Keep Playing!
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL: HEARTS / LIVES REFILL
            ======================================================== */}
        {showHeartsModal && (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '300px',
              background: 'linear-gradient(180deg, #1e3a8a 0%, #0f172a 100%)',
              border: '2px solid #ef4444',
              borderRadius: '20px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowHeartsModal(false)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>

              <Heart size={44} fill="#ef4444" color="#f87171" style={{ marginBottom: '8px' }} />
              <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: '900', margin: '0 0 6px 0' }}>
                Lives: 5 / 5 Full
              </h3>
              <p style={{ color: '#93c5fd', fontSize: '0.82rem', textAlign: 'center', margin: '0 0 16px 0' }}>
                Your energy is at maximum capacity! Go conquer the next realm island!
              </p>

              <button
                onClick={() => setShowHeartsModal(false)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  borderRadius: '9999px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: '900',
                  cursor: 'pointer'
                }}
              >
                Let’s Play!
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
