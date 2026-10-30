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
  Clock,
  Compass,
  Zap
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

// Build a smooth cubic Bezier path through an array of node coordinates
function buildSvgCurve(nodes, width = 800, height = 2000) {
  if (!nodes || nodes.length < 2) return '';
  const pts = nodes.map(n => ({
    x: (n.x / 100) * width,
    y: (n.y / 100) * height
  }));

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 5;
    const cp1y = p1.y + (p2.y - p0.y) / 5;
    const cp2x = p2.x - (p3.x - p1.x) / 5;
    const cp2y = p2.y - (p3.y - p1.y) / 5;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

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

  // Automatically switch activeRealm to where player's highest unlocked level is
  useEffect(() => {
    if (highestUnlocked >= 41) {
      setActiveRealm(3);
    } else if (highestUnlocked >= 21) {
      setActiveRealm(2);
    } else {
      setActiveRealm(1);
    }
  }, [highestUnlocked]);

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
      thumb: '/assets/sky_islands_roadmap.jpg',
      themeColor: '#38bdf8',
      roadGrad: ['#38bdf8', '#0284c7'],
      glowColor: 'rgba(56, 189, 248, 0.45)'
    },
    {
      id: 2,
      name: 'Desert Realm',
      range: '(21-40)',
      minLevel: 21,
      maxLevel: 40,
      thumb: '/assets/realm_desert_thumb.jpg',
      themeColor: '#f59e0b',
      roadGrad: ['#fde68a', '#d97706'],
      glowColor: 'rgba(245, 158, 11, 0.45)'
    },
    {
      id: 3,
      name: 'Frost Peaks',
      range: '(41-60)',
      minLevel: 41,
      maxLevel: 60,
      thumb: '/assets/frost_peaks_roadmap.jpg',
      themeColor: '#7dd3fc',
      roadGrad: ['#e0f2fe', '#0284c7'],
      glowColor: 'rgba(125, 211, 252, 0.45)'
    }
  ];

  // 1. Sky Islands (Levels 1-20) - Generous vertical spacing (~95px apart)
  const SKY_ISLANDS_NODES = [
    { level: 1,  x: 48, y: 94, name: 'Meadow Rise' },
    { level: 2,  x: 64, y: 89 },
    { level: 3,  x: 74, y: 84 },
    { level: 4,  x: 62, y: 79 },
    { level: 5,  x: 40, y: 75, milestone: true, name: 'Sunstone Altar' },
    { level: 6,  x: 26, y: 70 },
    { level: 7,  x: 34, y: 65 },
    { level: 8,  x: 56, y: 61 },
    { level: 9,  x: 74, y: 56 },
    { level: 10, x: 64, y: 51, milestone: true, name: 'Windmill Spire' },
    { level: 11, x: 42, y: 47 },
    { level: 12, x: 26, y: 42 },
    { level: 13, x: 34, y: 37 },
    { level: 14, x: 56, y: 32 },
    { level: 15, x: 72, y: 28, milestone: true, name: 'Cloud Haven' },
    { level: 16, x: 62, y: 23 },
    { level: 17, x: 42, y: 19 },
    { level: 18, x: 28, y: 14 },
    { level: 19, x: 44, y: 10 },
    { level: 20, x: 58, y: 5, isCastle: true, milestone: true, name: 'Sky Citadel' }
  ];

  // 2. Desert Realm (Levels 21-40)
  const DESERT_REALM_NODES = [
    { level: 21, x: 50, y: 94, name: 'Oasis Base' },
    { level: 22, x: 66, y: 89 },
    { level: 23, x: 74, y: 84 },
    { level: 24, x: 58, y: 79 },
    { level: 25, x: 38, y: 75, milestone: true, name: 'Scarab Gate' },
    { level: 26, x: 24, y: 70 },
    { level: 27, x: 36, y: 65 },
    { level: 28, x: 58, y: 61 },
    { level: 29, x: 72, y: 56 },
    { level: 30, x: 60, y: 51, milestone: true, name: 'Canyon Vault' },
    { level: 31, x: 40, y: 47 },
    { level: 32, x: 26, y: 42 },
    { level: 33, x: 36, y: 37 },
    { level: 34, x: 58, y: 32 },
    { level: 35, x: 74, y: 28, milestone: true, name: 'Sun Obelisk' },
    { level: 36, x: 62, y: 23 },
    { level: 37, x: 42, y: 19 },
    { level: 38, x: 28, y: 14 },
    { level: 39, x: 46, y: 10 },
    { level: 40, x: 56, y: 5, isCastle: true, milestone: true, name: 'Great Pyramid' }
  ];

  // 3. Frost Peaks (Levels 41-60)
  const FROST_PEAKS_NODES = [
    { level: 41, x: 50, y: 94, name: 'Glacial Shore' },
    { level: 42, x: 66, y: 89 },
    { level: 43, x: 74, y: 84 },
    { level: 44, x: 58, y: 79 },
    { level: 45, x: 38, y: 75, milestone: true, name: 'Frost Sanctuary' },
    { level: 46, x: 24, y: 70 },
    { level: 47, x: 34, y: 65 },
    { level: 48, x: 56, y: 61 },
    { level: 49, x: 72, y: 56 },
    { level: 50, x: 62, y: 51, milestone: true, name: 'Aurora Spire' },
    { level: 51, x: 42, y: 47 },
    { level: 52, x: 28, y: 42 },
    { level: 53, x: 36, y: 37 },
    { level: 54, x: 58, y: 32 },
    { level: 55, x: 72, y: 28, milestone: true, name: 'Crystal Cavern' },
    { level: 56, x: 60, y: 23 },
    { level: 57, x: 40, y: 19 },
    { level: 58, x: 26, y: 14 },
    { level: 59, x: 46, y: 10 },
    { level: 60, x: 56, y: 5, isCastle: true, milestone: true, name: 'Ice Palace' }
  ];

  const getNodesForRealm = () => {
    if (activeRealm === 1) return SKY_ISLANDS_NODES;
    if (activeRealm === 2) return DESERT_REALM_NODES;
    return FROST_PEAKS_NODES;
  };

  const currentNodes = getNodesForRealm();
  const currentRealmConfig = REALMS.find(r => r.id === activeRealm) || REALMS[0];

  // Generate SVG curve path connecting all nodes
  const roadPathD = buildSvgCurve(currentNodes, 800, 2000);

  // Auto-scroll to center player's current active level on mount & realm switch
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeNode = currentNodes.find(n => n.level === highestUnlocked);
      const targetYPercent = activeNode ? activeNode.y : 88;

      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          const scrollHeight = scrollContainerRef.current.scrollHeight;
          const clientHeight = scrollContainerRef.current.clientHeight;
          const targetScrollTop = (targetYPercent / 100) * scrollHeight - clientHeight / 2;
          scrollContainerRef.current.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth'
          });
        }
      }, 180);

      return () => clearTimeout(timer);
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
          50% { transform: translateY(-10px) scale(1.08); }
        }
        @keyframes activeAuraPulse {
          0%, 100% {
            box-shadow: 0 0 20px #f59e0b, 0 0 40px rgba(245, 158, 11, 0.75), inset 0 0 14px rgba(254, 240, 138, 0.9);
            border-color: #fef08a;
          }
          50% {
            box-shadow: 0 0 35px #fbbf24, 0 0 70px rgba(251, 191, 36, 0.95), inset 0 0 22px rgba(255, 255, 255, 1);
            border-color: #ffffff;
          }
        }
        @keyframes energyDashAnim {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -52; }
        }
        @keyframes chestGlow {
          0%, 100% { filter: drop-shadow(0 2px 10px rgba(245, 158, 11, 0.8)); transform: scale(1); }
          50% { filter: drop-shadow(0 4px 20px rgba(251, 191, 36, 1)); transform: scale(1.08); }
        }
        @keyframes playPillPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 6px 20px rgba(34, 197, 94, 0.6); }
          50% { transform: scale(1.04); box-shadow: 0 8px 28px rgba(34, 197, 94, 0.9); }
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
        boxShadow: '0 0 60px rgba(0, 0, 0, 0.8)',
        background: activeRealm === 1 ? '#041022' : activeRealm === 2 ? '#451a03' : '#03192e'
      }}>

        {/* ========================================================
            TOP BAR HEADER (Professional Game Status)
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
          background: 'linear-gradient(180deg, rgba(6, 18, 38, 0.95) 0%, rgba(6, 18, 38, 0.75) 75%, rgba(6, 18, 38, 0) 100%)',
          backdropFilter: 'blur(10px)',
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
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
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
            LEFT FLOATING WIDGETS
            ======================================================== */}
        <div style={{
          position: 'absolute',
          top: '64px',
          left: '12px',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'auto'
        }}>
          {/* 1. Next Reward Chest Card */}
          <div
            onClick={() => setShowRewardModal(true)}
            style={{
              width: '82px',
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
              Reward
            </span>
            <div style={{
              fontSize: '28px',
              lineHeight: '1',
              margin: '2px 0',
              animation: 'chestGlow 2.5s infinite'
            }}>
              🎁
            </div>
            <span style={{
              color: '#93c5fd',
              fontSize: '0.58rem',
              fontWeight: '800',
              textAlign: 'center'
            }}>
              Lv. {nextMilestone}
            </span>
          </div>

          {/* 2. Daily Challenge Card */}
          <div
            onClick={() => navigate('/daily')}
            style={{
              width: '82px',
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
            <Trophy size={24} color="#fbbf24" fill="#f59e0b" style={{ margin: '2px 0' }} />
            <span style={{
              color: '#ffffff',
              fontSize: '0.6rem',
              fontWeight: '900',
              textAlign: 'center',
              lineHeight: '1.1'
            }}>
              Daily Quest
            </span>
          </div>
        </div>


        {/* ========================================================
            SCROLLABLE ROADMAP CONTAINER (Spacious 2000px Track)
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
          {/* Spacious 2000px Track: ~95px between levels for crystal-clear tap targets */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '2000px',
            background: activeRealm === 1
              ? '#031428'
              : activeRealm === 2
                ? '#3b1a06'
                : '#020a1a',
            overflow: 'hidden'
          }}>

            {/* Realm Background Image with High-Depth Gradients */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${currentRealmConfig.thumb})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              opacity: 0.85
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: activeRealm === 1
                  ? 'linear-gradient(180deg, rgba(8, 29, 61, 0.45) 0%, rgba(2, 6, 23, 0.75) 100%)'
                  : activeRealm === 2
                    ? 'linear-gradient(180deg, rgba(78, 29, 6, 0.4) 0%, rgba(30, 10, 2, 0.8) 100%)'
                    : 'linear-gradient(180deg, rgba(2, 40, 75, 0.45) 0%, rgba(2, 10, 25, 0.8) 100%)',
                pointerEvents: 'none'
              }} />
            </div>

            {/* Dynamic Smooth Winding Road SVG Weaving Through Every Level Center */}
            <svg
              viewBox="0 0 800 2000"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="roadBaseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentRealmConfig.roadGrad[0]} stopOpacity="0.95" />
                  <stop offset="100%" stopColor={currentRealmConfig.roadGrad[1]} stopOpacity="0.85" />
                </linearGradient>

                <filter id="roadGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="10" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Outer Wide Glowing Aura */}
              <path
                d={roadPathD}
                fill="none"
                stroke={currentRealmConfig.glowColor}
                strokeWidth="68"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#roadGlowFilter)"
              />

              {/* 2. Dark Contrasting Road Bed Border */}
              <path
                d={roadPathD}
                fill="none"
                stroke="rgba(15, 23, 42, 0.85)"
                strokeWidth="48"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 3. Main Luminous Road Body */}
              <path
                d={roadPathD}
                fill="none"
                stroke="url(#roadBaseGrad)"
                strokeWidth="36"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 4. Center Animated Energy Pulse Line */}
              <path
                d={roadPathD}
                fill="none"
                stroke="#ffffff"
                strokeWidth="4.5"
                strokeDasharray="14 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  animation: 'energyDashAnim 2.8s linear infinite',
                  filter: 'drop-shadow(0 0 6px #ffffff)'
                }}
              />
            </svg>


            {/* ========================================================
                ROADMAP LEVEL BUTTONS (56px-66px Touch Friendly)
                ======================================================== */}
            {currentNodes.map(st => {
              const isUnlocked = unlockedSet.has(st.level) || st.level === 1 || st.level === 21 || st.level === 41;
              const isCurrent = st.level === highestUnlocked;
              const stars = userStars[st.level] || (isUnlocked && st.level < highestUnlocked ? 3 : 0);

              const isDesert = activeRealm === 2;
              const isFrost = activeRealm === 3;

              // Large, prominent button dimensions
              const btnSize = isCurrent ? 66 : st.milestone ? 60 : 56;

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

                  {/* 1. HOVERING BOUNCING LOCATION PIN FOR CURRENT LEVEL */}
                  {isCurrent && (
                    <div style={{
                      position: 'absolute',
                      top: '-48px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      animation: 'pinBounce 1.8s ease-in-out infinite',
                      zIndex: 40
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                        border: '2px solid #ffffff',
                        borderRadius: '9999px',
                        padding: '2px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: '900',
                        letterSpacing: '0.4px',
                        textTransform: 'uppercase'
                      }}>
                        <Play size={10} fill="#ffffff" color="#ffffff" />
                        PLAY
                      </div>
                      <div style={{
                        width: 0,
                        height: 0,
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '6px solid #15803d',
                        marginTop: '-1px'
                      }} />
                    </div>
                  )}

                  {/* 2. SUMMIT CROWN / CREST FOR MILESTONE LEVEL */}
                  {st.milestone && !isCurrent && (
                    <div style={{
                      position: 'absolute',
                      top: '-24px',
                      fontSize: st.isCastle ? '24px' : '18px',
                      filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.7))'
                    }}>
                      {st.isCastle ? (isDesert ? '🏛️' : isFrost ? '🏰' : '👑') : '⭐'}
                    </div>
                  )}

                  {/* 3. STEPPING STONE PEDESTAL DISC */}
                  <div style={{
                    width: `${btnSize}px`,
                    height: `${btnSize}px`,
                    borderRadius: '50%',
                    position: 'relative',
                    display: 'flex',
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
                              ? 'linear-gradient(180deg, #38bdf8 0%, #0369a1 100%)'
                              : 'linear-gradient(180deg, #38bdf8 0%, #1e40af 100%)')
                        : 'linear-gradient(180deg, #334155 0%, #0f172a 100%)',
                    border: isCurrent
                      ? '3.5px solid #ffffff'
                      : isUnlocked
                        ? (st.milestone ? '3px solid #fbbf24' : '2.5px solid #93c5fd')
                        : '2px solid #475569',
                    boxShadow: isCurrent
                      ? '0 0 24px #f59e0b, 0 8px 18px rgba(0,0,0,0.7)'
                      : isUnlocked
                        ? '0 6px 14px rgba(0,0,0,0.6), inset 0 2px 3px rgba(255,255,255,0.35)'
                        : '0 4px 10px rgba(0,0,0,0.5)',
                    animation: isCurrent ? 'activeAuraPulse 2s infinite' : 'none'
                  }}>

                    {/* Inner Disc Fill */}
                    <div style={{
                      width: '82%',
                      height: '82%',
                      borderRadius: '50%',
                      background: isCurrent
                        ? (isDesert
                            ? 'radial-gradient(circle at 35% 30%, #fbbf24 0%, #b45309 80%)'
                            : isFrost
                              ? 'radial-gradient(circle at 35% 30%, #a5f3fc 0%, #0284c7 80%)'
                              : 'radial-gradient(circle at 35% 30%, #38bdf8 0%, #0284c7 80%)')
                        : isUnlocked
                          ? (isDesert
                              ? 'radial-gradient(circle at 35% 30%, #f59e0b 0%, #78350f 80%)'
                              : isFrost
                                ? 'radial-gradient(circle at 35% 30%, #38bdf8 0%, #0369a1 80%)'
                                : 'radial-gradient(circle at 35% 30%, #38bdf8 0%, #1e3a8a 80%)')
                          : 'radial-gradient(circle at 35% 30%, #1e293b 0%, #090d16 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                    }}>

                      {/* Locked Padlock Icon */}
                      {!isUnlocked ? (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '1px'
                        }}>
                          <Lock size={16} color="#cbd5e1" strokeWidth={2.6} />
                          <span style={{
                            color: '#94a3b8',
                            fontSize: '0.74rem',
                            fontWeight: '900',
                            lineHeight: '1'
                          }}>
                            {st.level}
                          </span>
                        </div>
                      ) : (
                        /* Large, Bold Level Number */
                        <span style={{
                          color: '#ffffff',
                          fontSize: isCurrent ? '1.35rem' : '1.18rem',
                          fontWeight: '900',
                          textShadow: '0 2px 4px rgba(0,0,0,0.85)',
                          lineHeight: '1',
                          letterSpacing: '-0.4px'
                        }}>
                          {st.level}
                        </span>
                      )}

                    </div>
                  </div>

                  {/* 4. THREE GOLDEN STARS UNDERNEATH (13px, Crisp & Glowing) */}
                  {isUnlocked && (
                    <div style={{
                      display: 'flex',
                      gap: '3px',
                      marginTop: '4px',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.9))'
                    }}>
                      {[1, 2, 3].map(starNum => {
                        const earned = stars >= starNum;
                        return (
                          <Star
                            key={starNum}
                            size={13}
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
            QUICK PLAY FLOATING ACTION PILL
            ======================================================== */}
        <div style={{
          position: 'absolute',
          bottom: '76px',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 42,
          pointerEvents: 'none'
        }}>
          <button
            onClick={() => handleSelectLevel(highestUnlocked, true)}
            style={{
              pointerEvents: 'auto',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: '2px solid #86efac',
              padding: '0.55rem 1.4rem',
              borderRadius: '9999px',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              animation: 'playPillPulse 2.4s infinite',
              letterSpacing: '0.4px',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)'
            }}
          >
            <Play size={16} fill="#ffffff" color="#ffffff" />
            <span>PLAY LEVEL {highestUnlocked}</span>
          </button>
        </div>


        {/* ========================================================
            BOTTOM REALM SELECTOR DOCK
            ======================================================== */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          right: '10px',
          zIndex: 45,
          background: 'rgba(6, 18, 38, 0.94)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '2px solid rgba(2, 132, 199, 0.45)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
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
              cursor: 'pointer'
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
                    border: isActive ? `2px solid ${realm.themeColor}` : '1px solid rgba(255,255,255,0.08)',
                    background: isActive
                      ? 'linear-gradient(180deg, rgba(2, 132, 199, 0.9) 0%, rgba(30, 58, 138, 0.95) 100%)'
                      : 'rgba(15, 23, 42, 0.65)',
                    boxShadow: isActive ? `0 0 16px ${realm.themeColor}88` : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    gap: '2px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '38px',
                    height: '26px',
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
              cursor: 'pointer'
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
