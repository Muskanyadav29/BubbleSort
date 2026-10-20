import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import { GameEngine, GAME_STATES } from '../game/gameEngine';
import { levelManager } from '../game/levelManager';
import { gameService } from '../services/gameService';
import { soundEngine } from '../utils/soundEngine';

import GameHUD from '../components/GameHUD/GameHUD';
import BoosterBar from '../components/BoosterBar/BoosterBar';
import LevelComplete from '../components/LevelComplete/LevelComplete';
import GameOver from '../components/GameOver/GameOver';
import PauseModal from '../components/PauseModal/PauseModal';
import Mascot from '../components/Mascot';

export default function GamePage({ user, onProgressUpdate }) {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const sessionRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [levelConfig, setLevelConfig] = useState(null);
  const [engineState, setEngineState] = useState({
    gameState: GAME_STATES.LOADING,
    score: 0,
    stars: 1,
    combo: 0,
    shotsRemaining: 20,
    shotsUsed: 0,
    currentBubble: 'blue',
    nextBubble: 'red',
    objectiveDescription: 'Loading level...',
    canUndo: false
  });

  const [mascotMood, setMascotMood] = useState('happy');
  const [mascotMessage, setMascotMessage] = useState(null);
  const [activeBoosters, setActiveBoosters] = useState({});
  const [inventory, setInventory] = useState(
    user?.boosterInventory || { aimGuide: 3, bomb: 3, rainbow: 2, extraShot: 3, shuffle: 2 }
  );

  const [soundOn, setSoundOn] = useState(soundEngine.soundEnabled);
  const [musicOn, setMusicOn] = useState(soundEngine.musicEnabled);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen API toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Initialize Level & Game Engine
  useEffect(() => {
    let isMounted = true;
    const num = Number(levelId) || 1;

    async function init() {
      setLoading(true);
      const cfg = await gameService.fetchLevelById(num);
      if (!isMounted) return;

      setLevelConfig(cfg);

      // Start backend verified game session
      const sess = await gameService.startGameSession(num);
      sessionRef.current = sess;

      if (canvasRef.current) {
        if (engineRef.current) {
          engineRef.current.destroy();
        }

        const engine = new GameEngine(canvasRef.current, state => {
          setEngineState({ ...state });

          // Mascot reactions based on state
          if (state.gameState === GAME_STATES.LEVEL_COMPLETE) {
            setMascotMood('celebrate');
            setMascotMessage('Spectacular! You conquered the level!');
          } else if (state.gameState === GAME_STATES.LEVEL_FAILED) {
            setMascotMood('worried');
            setMascotMessage('Out of shots! Retry or use a booster!');
          } else if (state.combo >= 2) {
            setMascotMood('cheering');
            setMascotMessage(`Combo streak x${state.combo}! Keep it up!`);
          } else if (state.shotsRemaining <= 3) {
            setMascotMood('worried');
            setMascotMessage('Careful! Only a few shots left!');
          }
        });

        engine.loadLevel(cfg);
        engineRef.current = engine;
      }

      setLoading(false);
      setMascotMood('happy');
      setMascotMessage(cfg.tutorialHint || `Level ${num}: ${cfg.title}`);
    }

    init();

    return () => {
      isMounted = false;
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [levelId]);

  // Handle Game Completion
  useEffect(() => {
    if (engineState.gameState === GAME_STATES.LEVEL_COMPLETE) {
      handleFinalizeSession(true);
    }
  }, [engineState.gameState]);

  const handleFinalizeSession = async (completed) => {
    const num = Number(levelId) || 1;
    const sess = sessionRef.current || {};

    const payload = {
      sessionId: sess.sessionId,
      sessionToken: sess.sessionToken,
      levelId: num,
      shotsUsed: engineState.shotsUsed,
      bubblesPopped: engineState.bubblesPoppedCount || 10,
      score: engineState.score,
      stars: engineState.stars,
      bestCombo: engineState.maxCombo || 1,
      boostersUsed: Object.keys(activeBoosters),
      completed,
      rescuedObjects: 0
    };

    // Unlock next level locally
    if (completed) {
      levelManager.unlockLevel(num + 1);
      // Persist local stars
      try {
        const localStars = JSON.parse(localStorage.getItem('local_level_stars') || '{}');
        localStars[num] = Math.max(localStars[num] || 0, engineState.stars);
        localStorage.setItem('local_level_stars', JSON.stringify(localStars));
      } catch (e) {}
    }

    const res = await gameService.completeGameSession(payload);
    if (onProgressUpdate && res.playerProgress) {
      onProgressUpdate(res.playerProgress);
    }
  };

  // Canvas Mouse & Touch Handlers
  const handlePointerMove = (e) => {
    if (!engineRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const targetX = (clientX - rect.left) * scaleX;
    const targetY = (clientY - rect.top) * scaleY;

    engineRef.current.setAim(targetX, targetY);
  };

  const handlePointerUp = (e) => {
    if (!engineRef.current || !canvasRef.current) return;

    // Check if the user clicked/tapped the swap zone around the launcher preview
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

    if (clientX !== undefined && clientY !== undefined) {
      const targetX = (clientX - rect.left) * scaleX;
      const targetY = (clientY - rect.top) * scaleY;

      // Check if user clicked/tapped the swap zone (next bubble or pedestal ring)
      if (engineRef.current?.isSwapZone && engineRef.current.isSwapZone(targetX, targetY)) {
        handleSwap();
        return;
      }
    }

    engineRef.current.shoot();
  };

  const handleSwap = () => {
    if (engineRef.current) {
      engineRef.current.swapBubbles();
      setMascotMessage('Swapped active bubble!');
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!engineRef.current) return;
      if (e.code === 'Space') {
        e.preventDefault();
        engineRef.current.shoot();
      } else if (e.code === 'KeyS' || e.code === 'KeyC') {
        handleSwap();
      } else if (e.code === 'KeyR') {
        handleRestart();
      } else if (e.code === 'KeyZ') {
        handleUndo();
      } else if (e.code === 'KeyH') {
        handleHint();
      } else if (e.code === 'Escape') {
        if (engineState.gameState === GAME_STATES.PAUSED) {
          engineRef.current.resume();
        } else {
          engineRef.current.pause();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engineState.gameState]);

  const handleRestart = () => {
    if (!engineRef.current || !levelConfig) return;
    engineRef.current.loadLevel(levelConfig);
    setMascotMood('happy');
    setMascotMessage('Let’s try again! You can do it!');
  };

  const handleUndo = () => {
    if (engineRef.current) {
      engineRef.current.undo();
      setMascotMessage('Undid last shot!');
    }
  };

  const handleHint = () => {
    setMascotMood('thinking');
    setMascotMessage('Hint: Aim for high floating anchor points or bank off the side wall!');
    soundEngine.playBooster();
  };

  const handleUseBooster = (type) => {
    if (!engineRef.current) return;

    if (inventory[type] && inventory[type] > 0) {
      const success = engineRef.current.applyBooster(type);
      if (success) {
        setInventory(prev => ({ ...prev, [type]: prev[type] - 1 }));
        setActiveBoosters(prev => ({ ...prev, [type]: true }));
      }
    }
  };

  const handleNextLevel = () => {
    const nextId = Number(levelId) + 1;
    navigate(`/game/${nextId}`);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      height: '100dvh',
      overflow: 'hidden',
      background: 'radial-gradient(circle at 50% 20%, #151b32 0%, #0a0e1c 60%, #030611 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'stretch',
      userSelect: 'none'
    }}>
      
      {/* Mobile App Viewport Shell */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 80px rgba(0,0,0,0.85)'
      }}>

        {/* Top Mobile App Header */}
        <GameHUD
          levelNumber={levelId}
          score={engineState.score}
          shotsRemaining={engineState.shotsRemaining}
          combo={engineState.combo}
          stars={engineState.stars}
          objectiveDescription={engineState.objectiveDescription}
          onBack={() => navigate('/levels')}
          onPause={() => engineRef.current?.pause()}
          soundOn={soundOn}
          onToggleSound={() => {
            const next = !soundOn;
            soundEngine.setSoundEnabled(next);
            setSoundOn(next);
          }}
          musicOn={musicOn}
          onToggleMusic={() => {
            const next = !musicOn;
            soundEngine.setMusicEnabled(next);
            setMusicOn(next);
          }}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />

        {/* Center Game Playfield Area (Canvas scales with object-fit) */}
        <div style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          touchAction: 'none'
        }}>
          
          <canvas
            ref={canvasRef}
            width={400}
            height={620}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              cursor: 'crosshair'
            }}
            onMouseDown={handlePointerMove}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerMove}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          />

          {/* Modal: Level Complete */}
          {engineState.gameState === GAME_STATES.LEVEL_COMPLETE && (
            <LevelComplete
              levelNumber={levelId}
              score={engineState.score}
              stars={engineState.stars}
              shotsUsed={engineState.shotsUsed}
              shotsRemaining={engineState.shotsRemaining}
              bubblesPopped={engineState.bubblesPoppedCount || 12}
              bestCombo={engineState.maxCombo || 1}
              onNextLevel={handleNextLevel}
              onReplay={handleRestart}
              onLevelSelect={() => navigate('/levels')}
            />
          )}

          {/* Modal: Game Over */}
          {engineState.gameState === GAME_STATES.LEVEL_FAILED && (
            <GameOver
              extraShotAvailable={inventory.extraShot > 0}
              onUseExtraShotBooster={() => {
                handleUseBooster('extraShot');
                engineRef.current?.setState(GAME_STATES.READY);
              }}
              onRetry={handleRestart}
              onLevelSelect={() => navigate('/levels')}
            />
          )}

          {/* Modal: Paused */}
          {engineState.gameState === GAME_STATES.PAUSED && (
            <PauseModal
              onResume={() => engineRef.current?.resume()}
              onRestart={handleRestart}
              onExit={() => navigate('/levels')}
              soundOn={soundOn}
              musicOn={musicOn}
              onToggleSound={() => {
                const next = !soundOn;
                soundEngine.setSoundEnabled(next);
                setSoundOn(next);
              }}
              onToggleMusic={() => {
                const next = !musicOn;
                soundEngine.setMusicEnabled(next);
                setMusicOn(next);
              }}
            />
          )}
        </div>

        {/* Bottom Control Dock: Undo, Swap, Boosters, Hint */}
        <BoosterBar
          inventory={inventory}
          onUseBooster={handleUseBooster}
          activeBoosters={activeBoosters}
          canUndo={engineState.canUndo}
          onUndo={handleUndo}
          onHint={handleHint}
          onSwap={handleSwap}
          nextBubble={engineState.nextBubble || 'blue'}
        />

      </div>
    </div>
  );
}
