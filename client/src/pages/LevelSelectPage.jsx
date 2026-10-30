import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { levelManager } from '../game/levelManager';
import { gameService } from '../services/gameService';
import {
  Lock,
  Star,
  Play,
  Settings,
  VolumeX,
  Heart,
  Plus,
  Trophy,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  MapPin
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

  // Load player progression
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

  // Auto-switch realm on mount according to highest unlocked level
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

  // Realm configurations (Using full-resolution 768x1376 roadmaps)
  const REALMS = [
    {
      id: 1,
      name: 'Sky Islands',
      range: '(1-20)',
      minLevel: 1,
      maxLevel: 20,
      bg: '/assets/sky_islands_roadmap.jpg',
      thumb: '/assets/sky_islands_roadmap.jpg',
      themeColor: '#38bdf8',
      glowColor: 'rgba(56, 189, 248, 0.45)'
    },
    {
      id: 2,
      name: 'Desert Realm',
      range: '(21-40)',
      minLevel: 21,
      maxLevel: 40,
      bg: '/assets/desert_realm_roadmap.jpg',
      thumb: '/assets/realm_desert_thumb.jpg',
      themeColor: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.45)'
    },
    {
      id: 3,
      name: 'Frost Peaks',
      range: '(41-60)',
      minLevel: 41,
      maxLevel: 60,
      bg: '/assets/frost_peaks_roadmap.jpg',
      thumb: '/assets/frost_peaks_thumb.jpg',
      themeColor: '#7dd3fc',
      glowColor: 'rgba(125, 211, 252, 0.45)'
    }
  ];

  // 1. Sky Islands (Levels 1-20) - 100% Precise alignment with painted cobblestones on sky_islands_roadmap.jpg
  const SKY_ISLANDS_NODES = [
    { level: 1,  x: 41, y: 95, name: 'Island Meadow' },
    { level: 2,  x: 48, y: 92 },
    { level: 3,  x: 51, y: 88 },
    { level: 4,  x: 45, y: 84 },
    { level: 5,  x: 38, y: 81, milestone: true, name: 'Sunstone Rest' },
    { level: 6,  x: 42, y: 77 },
    { level: 7,  x: 46, y: 73 },
    { level: 8,  x: 49, y: 69 },
    { level: 9,  x: 47, y: 65 },
    { level: 10, x: 42, y: 61, milestone: true, name: 'Hillside Spire' },
    { level: 11, x: 38, y: 57, name: 'Windmill Croft' },
    { level: 12, x: 44, y: 53 },
    { level: 13, x: 51, y: 49 },
    { level: 14, x: 57, y: 45 },
    { level: 15, x: 61, y: 41, milestone: true, name: 'Waterfall Pass' },
    { level: 16, x: 56, y: 36 },
    { level: 17, x: 53, y: 31 },
    { level: 18, x: 58, y: 26 },
    { level: 19, x: 64, y: 21 },
    { level: 20, x: 68, y: 16, isCastle: true, milestone: true, name: 'Sky Castle' }
  ];

  // 2. Desert Realm (Levels 21-40) - Winding up the golden sands to the Great Pyramid Summit
  const DESERT_REALM_NODES = [
    { level: 21, x: 50, y: 93, name: 'Oasis Base' },
    { level: 22, x: 42, y: 89 },
    { level: 23, x: 36, y: 85 },
    { level: 24, x: 44, y: 81 },
    { level: 25, x: 54, y: 77, milestone: true, name: 'Dune Crest' },
    { level: 26, x: 62, y: 73 },
    { level: 27, x: 58, y: 69 },
    { level: 28, x: 48, y: 65 },
    { level: 29, x: 40, y: 61 },
    { level: 30, x: 45, y: 57, milestone: true, name: 'Canyon Passage' },
    { level: 31, x: 55, y: 53 },
    { level: 32, x: 63, y: 49 },
    { level: 33, x: 57, y: 45 },
    { level: 34, x: 46, y: 41 },
    { level: 35, x: 40, y: 37, milestone: true, name: 'Sun Obelisk' },
    { level: 36, x: 48, y: 33 },
    { level: 37, x: 56, y: 29 },
    { level: 38, x: 52, y: 24 },
    { level: 39, x: 44, y: 19 },
    { level: 40, x: 50, y: 14, isCastle: true, milestone: true, name: 'Pyramid Summit' }
  ];

  // 3. Frost Peaks (Levels 41-60) - Glacial path leading up to Citadel Peak
  const FROST_PEAKS_NODES = [
    { level: 41, x: 52, y: 93, name: 'Frozen Lake' },
    { level: 42, x: 44, y: 89 },
    { level: 43, x: 38, y: 85 },
    { level: 44, x: 46, y: 81 },
    { level: 45, x: 56, y: 77, milestone: true, name: 'Ice Shard Arch' },
    { level: 46, x: 63, y: 73 },
    { level: 47, x: 57, y: 69 },
    { level: 48, x: 47, y: 65 },
    { level: 49, x: 41, y: 61 },
    { level: 50, x: 48, y: 57, milestone: true, name: 'Crystal Cavern' },
    { level: 51, x: 58, y: 53 },
    { level: 52, x: 64, y: 49 },
    { level: 53, x: 56, y: 45 },
    { level: 54, x: 45, y: 41 },
    { level: 55, x: 39, y: 37, milestone: true, name: 'Glacier Crevasse' },
    { level: 56, x: 47, y: 33 },
    { level: 57, x: 55, y: 29 },
    { level: 58, x: 51, y: 24 },
    { level: 59, x: 43, y: 19 },
    { level: 60, x: 50, y: 14, isCastle: true, milestone: true, name: 'Citadel Peak' }
  ];

  const getNodesForRealm = () => {
    if (activeRealm === 1) return SKY_ISLANDS_NODES;
    if (activeRealm === 2) return DESERT_REALM_NODES;
    return FROST_PEAKS_NODES;
  };

  const currentNodes = getNodesForRealm();
  const currentRealmConfig = REALMS.find(r => r.id === activeRealm) || REALMS[0];

  // Auto-scroll to center player's current active level on mount & realm switch
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeNode = currentNodes.find(n => n.level === highestUnlocked);
      const targetYPercent = activeNode ? activeNode.y : 90;

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
      }, 150);

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
          50% { transform: translateY(-8px) scale(1.06); }
        }
        @keyframes activeAuraPulse {
          0%, 100% {
            box-shadow: 0 0 16px #38bdf8, 0 0 32px rgba(56, 189, 248, 0.7), inset 0 0 8px rgba(255, 255, 255, 0.9);
            border-color: #ffffff;
          }
          50% {
            box-shadow: 0 0 28px #7dd3fc, 0 0 54px rgba(125, 211, 252, 0.9), inset 0 0 14px rgba(255, 255, 255, 1);
            border-color: #bae6fd;
          }
        }
        @keyframes chestGlow {
          0%, 100% { filter: drop-shadow(0 2px 8px rgba(245, 158, 11, 0.6)); transform: scale(1); }
          50% { filter: drop-shadow(0 4px 16px rgba(251, 191, 36, 0.95)); transform: scale(1.06); }
        }
        .roadmap-scroll::-webkit-scrollbar {
          width: 0px;
          display: none;
        }
      `}</style>

      {/* Casual Mobile Viewport Frame (Exact Reference Proportions) */}
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
            TOP BAR HEADER (100% Matching Reference Mockup)
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
          background: 'linear-gradient(180deg, rgba(6, 18, 38, 0.94) 0%, rgba(6, 18, 38, 0.7) 75%, rgba(6, 18, 38, 0) 100%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          gap: '6px'
        }}>

          {/* 1. Player Profile Capsule with Mascot Avatar, Lv. 1 & XP Bar */}
          <div
            onClick={() => navigate('/dashboard')}
            title="View Player Profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'linear-gradient(180deg, #172554 0%, #0f172a 100%)',
              border: '2px solid #38bdf8',
              borderRadius: '9999px',
              padding: '2px 8px 2px 2px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              gap: '6px'
            }}
          >
            {/* Mascot Avatar Circle */}
            <div style={{
              width: '36px',
              height: '36px',
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
                letterSpacing: '0.3px',
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

          {/* 2. Star Counter Pill (0 / 60) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'linear-gradient(180deg, #172554 0%, #0f172a 100%)',
            border: '2px solid #38bdf8',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            color: '#ffffff',
            fontSize: '0.86rem',
            fontWeight: '900',
            boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
            letterSpacing: '0.3px'
          }}>
            <Star size={16} fill="#f59e0b" color="#fbbf24" />
            <span>{totalStars} / 60</span>
          </div>

          {/* 3. Lives / Heart Counter Pill with '+' Button */}
          <div
            onClick={() => setShowHeartsModal(true)}
            title="Refill Lives"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'linear-gradient(180deg, #172554 0%, #0f172a 100%)',
              border: '2px solid #38bdf8',
              padding: '0.28rem 0.35rem 0.28rem 0.7rem',
              borderRadius: '9999px',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: '900',
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
              cursor: 'pointer'
            }}
          >
            <Heart size={15} fill="#ef4444" color="#f87171" />
            <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>5 Full</span>
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

          {/* 4. Settings / Gear Button */}
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
            LEFT FLOATING WIDGETS (Matching Reference Mockup)
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
          {/* 1. Next Reward Card */}
          <div
            onClick={() => setShowRewardModal(true)}
            style={{
              width: '84px',
              background: 'linear-gradient(180deg, rgba(20, 48, 100, 0.92) 0%, rgba(10, 24, 52, 0.94) 100%)',
              borderRadius: '14px',
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
              color: '#e0f2fe',
              fontSize: '0.62rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              textAlign: 'center',
              lineHeight: '1.1'
            }}>
              NEXT<br />REWARD
            </span>
            <div style={{
              fontSize: '26px',
              lineHeight: '1',
              margin: '3px 0',
              animation: 'chestGlow 2.5s infinite'
            }}>
              🎁
            </div>
            <span style={{
              color: '#93c5fd',
              fontSize: '0.62rem',
              fontWeight: '800',
              textAlign: 'center'
            }}>
              Reach Level {nextMilestone}
            </span>
          </div>

          {/* 2. Daily Challenge Card */}
          <div
            onClick={() => navigate('/daily')}
            style={{
              width: '84px',
              background: 'linear-gradient(180deg, rgba(20, 48, 100, 0.92) 0%, rgba(10, 24, 52, 0.94) 100%)',
              borderRadius: '14px',
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
            {/* Red Notification Dot */}
            <div style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#ef4444',
              border: '1.5px solid #ffffff',
              boxShadow: '0 0 6px rgba(239, 68, 68, 0.8)'
            }} />
            <Trophy size={26} color="#fbbf24" fill="#f59e0b" style={{ margin: '2px 0' }} />
            <span style={{
              color: '#ffffff',
              fontSize: '0.66rem',
              fontWeight: '900',
              textAlign: 'center',
              lineHeight: '1.1'
            }}>
              Daily<br />Challenge
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              marginTop: '3px'
            }}>
              <Clock size={11} color="#93c5fd" />
              <span style={{
                color: '#93c5fd',
                fontSize: '0.6rem',
                fontWeight: '800'
              }}>
                12h 30m
              </span>
            </div>
          </div>
        </div>


        {/* ========================================================
            SCROLLABLE ROADMAP CONTAINER (Natural 1376px Height)
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
          {/* Natural 1376px Track matching 768x1376 Master Artwork */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '1376px',
            backgroundImage: `url(${currentRealmConfig.bg})`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            overflow: 'hidden'
          }}>

            {/* ========================================================
                ROADMAP LEVEL BUTTONS (100% Direct Path Placement)
                ======================================================== */}
            {currentNodes.map(st => {
              const isUnlocked = unlockedSet.has(st.level) || st.level === 1 || st.level === 21 || st.level === 41;
              const isCurrent = st.level === highestUnlocked;
              const stars = userStars[st.level] || (isUnlocked && st.level < highestUnlocked ? 3 : 0);

              const btnSize = isCurrent ? 50 : st.isCastle ? 52 : st.milestone ? 46 : 42;

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
                    justifyContent: 'center',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    if (isUnlocked) e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.12)';
                  }}
                  onMouseLeave={e => {
                    if (isUnlocked) e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                  }}
                >

                  {/* 1. HOVERING LOCATION PIN FOR CURRENT PLAYABLE LEVEL */}
                  {isCurrent && (
                    <div style={{
                      position: 'absolute',
                      top: '-44px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      animation: 'pinBounce 1.8s ease-in-out infinite',
                      zIndex: 40,
                      pointerEvents: 'none'
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        border: '2px solid #ffffff',
                        borderRadius: '9999px',
                        padding: '2px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
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
                        borderTop: '6px solid #0369a1',
                        marginTop: '-1px'
                      }} />
                    </div>
                  )}

                  {/* 2. GOLDEN ROYAL CROWN ABOVE CASTLE LEVEL 20 */}
                  {st.isCastle && (
                    <div style={{
                      position: 'absolute',
                      top: '-22px',
                      fontSize: '22px',
                      filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))',
                      pointerEvents: 'none'
                    }}>
                      👑
                    </div>
                  )}

                  {/* 3. STEPPING STONE PEDESTAL DISC (Matching Reference Mockup) */}
                  <div style={{
                    width: `${btnSize}px`,
                    height: `${btnSize}px`,
                    borderRadius: '50%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCurrent
                      ? 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)'
                      : isUnlocked
                        ? 'linear-gradient(180deg, #38bdf8 0%, #1e40af 100%)'
                        : 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                    border: isCurrent
                      ? '3px solid #ffffff'
                      : isUnlocked
                        ? (st.milestone ? '2.5px solid #fbbf24' : '2px solid #93c5fd')
                        : '2px solid rgba(148, 163, 184, 0.4)',
                    boxShadow: isCurrent
                      ? '0 0 16px #38bdf8, 0 0 32px rgba(56, 189, 248, 0.7), 0 6px 14px rgba(0,0,0,0.6)'
                      : isUnlocked
                        ? '0 6px 14px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.4)'
                        : '0 4px 10px rgba(0,0,0,0.55), inset 0 1px 2px rgba(255,255,255,0.12)',
                    animation: isCurrent ? 'activeAuraPulse 2s infinite' : 'none'
                  }}>

                    {/* Disc Content: Locked Padlock or Unlocked Bold Level Number */}
                    {isUnlocked ? (
                      <span style={{
                        color: '#ffffff',
                        fontSize: isCurrent ? '1.25rem' : '1.15rem',
                        fontWeight: '900',
                        textShadow: '0 2px 4px rgba(0,0,0,0.85)',
                        lineHeight: '1',
                        letterSpacing: '-0.3px'
                      }}>
                        {st.level}
                      </span>
                    ) : (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1px'
                      }}>
                        <Lock size={13} color="#cbd5e1" strokeWidth={2.4} />
                        <span style={{
                          color: '#94a3b8',
                          fontSize: '0.74rem',
                          fontWeight: '900',
                          lineHeight: '1'
                        }}>
                          {st.level}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 4. THREE GOLDEN STARS UNDERNEATH (When Completed) */}
                  {isUnlocked && st.level < highestUnlocked && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      marginTop: '3px',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))'
                    }}>
                      {[1, 2, 3].map(starNum => {
                        const earned = starNum <= stars;
                        return (
                          <Star
                            key={starNum}
                            size={12}
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
            BOTTOM REALM SELECTOR DOCK (100% Matching Reference)
            ======================================================== */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '10px',
          right: '10px',
          zIndex: 45,
          background: 'rgba(6, 18, 38, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '2px solid rgba(2, 132, 199, 0.45)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
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
                    gap: '2px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Miniature 3D Realm Island Thumbnail */}
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
            WebkitBackdropFilter: 'blur(8px)',
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
                marginBottom: '20px'
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
            WebkitBackdropFilter: 'blur(8px)',
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
                Let's Play!
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
