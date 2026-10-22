import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BUBBLE_RADIUS,
  ROW_HEIGHT,
  CEILING_Y,
  getColsInRow,
  getCellCenter,
  findNearestGridCell,
  checkBubbleCollision
} from './collision.js';
import { findMatches } from './matchDetector.js';
import { findFloatingBubbles } from './floatingDetector.js';
import { ScoreManager } from './scoreManager.js';
import { ShotManager } from './shotManager.js';
import { ObjectiveManager } from './objectiveManager.js';
import { soundEngine } from '../utils/soundEngine.js';
import { BUBBLE_THEMES } from '../config/gameConfig.js';

export const GAME_STATES = {
  LOADING: 'LOADING',
  READY: 'READY',
  AIMING: 'AIMING',
  SHOOTING: 'SHOOTING',
  RESOLVING: 'RESOLVING',
  COMBO: 'COMBO',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  LEVEL_FAILED: 'LEVEL_FAILED',
  PAUSED: 'PAUSED'
};

function hexToRgba(hex, alpha = 1) {
  if (!hex || typeof hex !== 'string') return `rgba(255, 255, 255, ${alpha})`;
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const r = parseInt(clean.substring(0, 2), 16) || 255;
  const g = parseInt(clean.substring(2, 4), 16) || 255;
  const b = parseInt(clean.substring(4, 6), 16) || 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export class GameEngine {
  constructor(canvas, onStateChange) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onStateChange = onStateChange;

    this.state = GAME_STATES.LOADING;
    this.board = [];
    this.levelConfig = null;

    // Managers
    this.scoreManager = new ScoreManager();
    this.shotManager = new ShotManager();
    this.objectiveManager = new ObjectiveManager();

    // Launcher positioning (Active bubble center at y = 524, Shots ring at y = 550)
    this.launcherPos = { x: BOARD_WIDTH / 2, y: 524 };
    this.aimAngle = -Math.PI / 2; // Pointing straight up initially
    this.isAiming = false;

    // In-flight projectile
    this.projectile = null;
    this.speed = 14;

    // Visuals & Animations
    this.particles = [];
    this.floatingDrops = [];
    this.floatingTexts = [];
    this.boostersActive = { aimGuide: false };
    this.swapAnimation = null;

    // Atmospheric twinkling celestial background stars
    this.backgroundStars = Array.from({ length: 48 }, () => ({
      x: Math.random() * BOARD_WIDTH,
      y: Math.random() * (BOARD_HEIGHT - 120),
      radius: 0.5 + Math.random() * 1.4,
      baseAlpha: 0.2 + Math.random() * 0.5,
      speed: 1.0 + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.4 ? '#ffffff' : (Math.random() > 0.5 ? '#93c5fd' : '#fef08a')
    }));

    // Floating bioluminescent fireflies rising through the night jungle
    this.fireflies = Array.from({ length: 14 }, () => ({
      x: Math.random() * BOARD_WIDTH,
      y: 360 + Math.random() * 230,
      radius: 1.1 + Math.random() * 1.6,
      speedY: 10 + Math.random() * 16,
      wobbleSpeed: 1.5 + Math.random() * 2.0,
      wobbleAmp: 14 + Math.random() * 18,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.35 + Math.random() * 0.55
    }));

    // Popped statistics
    this.poppedColors = {};

    // Animation frame handle
    this.animFrameId = null;
    this.lastTime = performance.now();

    this.boundLoop = this.loop.bind(this);
    this.startLoop();
  }

  startLoop() {
    if (!this.animFrameId) {
      this.lastTime = performance.now();
      this.animFrameId = requestAnimationFrame(this.boundLoop);
    }
  }

  stopLoop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  setState(newState) {
    this.state = newState;
    if (this.onStateChange) {
      this.onStateChange(this.getPublicState());
    }
  }

  loadLevel(levelConfig) {
    this.levelConfig = levelConfig;

    // Deep clone initial board layout
    this.board = levelConfig.board.map(row =>
      row.map(cell => (cell ? { ...cell } : null))
    );

    this.scoreManager.reset(levelConfig.starThresholds);
    this.shotManager.reset(levelConfig.shots, levelConfig.bubbleQueue);
    this.objectiveManager.reset(levelConfig.objective);

    this.particles = [];
    this.floatingDrops = [];
    this.floatingTexts = [];
    this.poppedColors = {};
    this.boostersActive = { aimGuide: false };
    this.swapAnimation = null;

    this.checkSingleBubbleRule();
    this.setState(GAME_STATES.READY);
    soundEngine.init();
  }

  // Single bubble on canvas detection
  checkSingleBubbleRule() {
    let bubbleCount = 0;
    let lastColor = null;

    for (let r = 0; r < this.board.length; r++) {
      const cols = getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const bubble = this.board[r] && this.board[r][c];
        if (bubble && bubble.color) {
          bubbleCount++;
          lastColor = bubble.color;
        }
      }
    }

    if (bubbleCount === 1 && lastColor && BUBBLE_THEMES[lastColor]) {
      this.shotManager.currentBubble = lastColor;
      this.shotManager.nextBubble = lastColor;
      if (this.shotManager.queue) {
        this.shotManager.queue = this.shotManager.queue.map(() => lastColor);
      }
      this.addFloatingText('🎯 FINAL TARGET!', BOARD_WIDTH / 2, 230, BUBBLE_THEMES[lastColor]?.light || '#FFD700');
    }
  }

  // Aiming Controls
  setAim(targetX, targetY) {
    if (this.state !== GAME_STATES.READY && this.state !== GAME_STATES.AIMING) return;

    // Calculate angle from launcher to pointer
    const dx = targetX - this.launcherPos.x;
    const dy = targetY - this.launcherPos.y;

    // Restrict shooting range: must shoot upward (between -170 deg and -10 deg)
    let angle = Math.atan2(dy, dx);
    const minAngle = -Math.PI + 0.15;
    const maxAngle = -0.15;
    if (angle > 0) {
      angle = (dx < 0) ? minAngle : maxAngle;
    }
    angle = Math.max(minAngle, Math.min(maxAngle, angle));

    this.aimAngle = angle;
    this.setState(GAME_STATES.AIMING);
  }

  shoot() {
    // Prevent double shooting (Item 87)
    if (this.state === GAME_STATES.SHOOTING || this.state === GAME_STATES.RESOLVING || this.state === GAME_STATES.PAUSED) {
      return false;
    }

    if (this.shotManager.shotsRemaining <= 0) {
      return false;
    }

    const bubbleColor = this.shotManager.currentBubble;
    const consumed = this.shotManager.consumeShot(this.getAvailableColors());
    if (!consumed) return false;

    // Launch moving projectile directly from the active loaded bubble position
    this.projectile = {
      x: this.launcherPos.x,
      y: this.launcherPos.y,
      vx: Math.cos(this.aimAngle) * this.speed,
      vy: Math.sin(this.aimAngle) * this.speed,
      color: bubbleColor,
      radius: BUBBLE_RADIUS
    };

    soundEngine.playLaunch();
    this.setState(GAME_STATES.SHOOTING);
    return true;
  }

  isSwapZone(x, y) {
    const baseX = this.launcherPos.x;
    const baseY = this.launcherPos.y + 26;
    const nextX = baseX + 28;
    const nextY = baseY + 14;

    // 1. Next bubble dock area
    if (Math.hypot(x - nextX, y - nextY) <= 26) return true;
    // 2. Circular pedestal area
    if (Math.hypot(x - baseX, y - baseY) <= 34 && y > this.launcherPos.y + 10) return true;
    // 3. Right curved swap arrow zone (as marked in diagram)
    if (Math.hypot(x - (baseX + 34), y - (baseY - 4)) <= 26) return true;
    // 4. Left curved swap arrow zone (as marked in diagram)
    if (Math.hypot(x - (baseX - 32), y - (baseY + 12)) <= 26) return true;

    return false;
  }

  swapBubbles() {
    if (this.state === GAME_STATES.SHOOTING || this.state === GAME_STATES.RESOLVING) return;
    const fromCurrent = this.shotManager.currentBubble;
    const fromNext = this.shotManager.nextBubble;
    this.shotManager.swapBubbles();
    this.swapAnimation = {
      progress: 0,
      duration: 0.22,
      elapsed: 0,
      fromCurrent,
      fromNext
    };
    this.spawnSwapParticles();
    soundEngine.playSwap();
    this.setState(this.state);
  }

  selectBubble(color) {
    if (this.state === GAME_STATES.SHOOTING || this.state === GAME_STATES.RESOLVING) return false;
    if (!BUBBLE_THEMES[color]) return false;
    this.shotManager.setCurrentBubble(color);
    this.spawnSwapParticles();
    soundEngine.playBubbleSelect();
    this.setState(this.state);
    return true;
  }

  cycleBubble() {
    if (this.state === GAME_STATES.SHOOTING || this.state === GAME_STATES.RESOLVING) return;
    const colors = this.getAvailableColors();
    if (colors.length === 0) return;
    const idx = colors.indexOf(this.shotManager.currentBubble);
    const nextIdx = (idx + 1) % colors.length;
    this.selectBubble(colors[nextIdx]);
  }

  getAvailableColors() {
    const set = new Set();
    for (let r = 0; r < this.board.length; r++) {
      const cols = getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const bubble = this.board[r] && this.board[r][c];
        if (bubble && bubble.color && BUBBLE_THEMES[bubble.color] && bubble.type === 'normal') {
          set.add(bubble.color);
        }
      }
    }
    if (set.size === 0) {
      return ['red', 'blue', 'green', 'yellow'];
    }
    return Array.from(set);
  }

  spawnSwapParticles() {
    const lx = this.launcherPos.x;
    const ly = this.launcherPos.y;
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.4;
      const speed = 40 + Math.random() * 70;
      this.particles.push({
        x: lx + (Math.random() - 0.5) * 20,
        y: ly + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.2 + Math.random() * 2,
        shrink: 4.5,
        life: 0.35 + Math.random() * 0.15,
        color: Math.random() > 0.4 ? '#10D05E' : '#38BDF8'
      });
    }
  }

  applyBooster(type) {
    if (this.state === GAME_STATES.SHOOTING || this.state === GAME_STATES.RESOLVING) return false;

    if (type === 'aimGuide') {
      this.boostersActive.aimGuide = true;
      soundEngine.playBooster();
    } else if (type === 'extraShot') {
      this.shotManager.addExtraShots(5);
      soundEngine.playBooster();
      this.addFloatingText('+5 SHOTS!', this.launcherPos.x, this.launcherPos.y - 40, '#2ED573');
    } else if (type === 'bomb') {
      this.shotManager.setSpecialCurrent('bomb');
      soundEngine.playBooster();
    } else if (type === 'rainbow') {
      this.shotManager.setSpecialCurrent('rainbow');
      soundEngine.playBooster();
    } else if (type === 'shuffle') {
      this.shuffleBoard();
      soundEngine.playBooster();
    }

    this.setState(this.state);
    return true;
  }

  shuffleBoard() {
    const presentBubbles = [];
    for (let r = 0; r < this.board.length; r++) {
      for (let c = 0; c < this.board[r].length; c++) {
        if (this.board[r][c] && this.board[r][c].type === 'normal') {
          presentBubbles.push(this.board[r][c].color);
        }
      }
    }
    // Fisher-Yates shuffle
    for (let i = presentBubbles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [presentBubbles[i], presentBubbles[j]] = [presentBubbles[j], presentBubbles[i]];
    }
    let idx = 0;
    for (let r = 0; r < this.board.length; r++) {
      for (let c = 0; c < this.board[r].length; c++) {
        if (this.board[r][c] && this.board[r][c].type === 'normal') {
          this.board[r][c].color = presentBubbles[idx++];
        }
      }
    }
    this.addFloatingText('SHUFFLED!', BOARD_WIDTH / 2, 200, '#FFA502');
  }

  pause() {
    if (this.state !== GAME_STATES.PAUSED) {
      this.prevStateBeforePause = this.state;
      this.setState(GAME_STATES.PAUSED);
    }
  }

  resume() {
    if (this.state === GAME_STATES.PAUSED) {
      this.setState(this.prevStateBeforePause || GAME_STATES.READY);
    }
  }

  // Main Loop
  loop(now) {
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    if (this.state !== GAME_STATES.PAUSED) {
      this.update(dt);
    }
    this.render();

    this.animFrameId = requestAnimationFrame(this.boundLoop);
  }

  update(dt) {
    // 1. Update Projectile Physics
    if (this.projectile) {
      this.projectile.x += this.projectile.vx;
      this.projectile.y += this.projectile.vy;

      // Side Wall Bounces (Item 14)
      if (this.projectile.x - this.projectile.radius <= 0) {
        this.projectile.x = this.projectile.radius;
        this.projectile.vx = -this.projectile.vx;
        soundEngine.playCollision();
      } else if (this.projectile.x + this.projectile.radius >= BOARD_WIDTH) {
        this.projectile.x = BOARD_WIDTH - this.projectile.radius;
        this.projectile.vx = -this.projectile.vx;
        soundEngine.playCollision();
      }

      // Check collision with board bubbles or ceiling
      const ceilingHit = (this.projectile.y - this.projectile.radius <= CEILING_Y);
      const bubbleCollision = checkBubbleCollision(this.projectile.x, this.projectile.y, this.board);

      if (ceilingHit || bubbleCollision.collided) {
        soundEngine.playCollision();
        this.resolveBubbleCollision(this.projectile);
        this.projectile = null;
      }
    }

    // 2. Update Floating Drops
    for (let i = this.floatingDrops.length - 1; i >= 0; i--) {
      const drop = this.floatingDrops[i];
      drop.vy += 800 * dt; // Gravity
      drop.x += drop.vx * dt;
      drop.y += drop.vy * dt;
      drop.rotation += drop.rotSpeed * dt;
      drop.opacity -= 0.6 * dt;

      if (drop.y > BOARD_HEIGHT || drop.opacity <= 0) {
        this.floatingDrops.splice(i, 1);
      }
    }

    // 3. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.size = Math.max(0, p.size - p.shrink * dt);

      if (p.life <= 0 || p.size <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 4. Update Floating Pop Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 45 * dt;
      ft.opacity -= 0.9 * dt;

      if (ft.opacity <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 5. Update Swap Animation
    if (this.swapAnimation) {
      this.swapAnimation.elapsed += dt;
      this.swapAnimation.progress = Math.min(1, this.swapAnimation.elapsed / this.swapAnimation.duration);
      if (this.swapAnimation.elapsed >= this.swapAnimation.duration) {
        this.swapAnimation = null;
      }
    }

    // 6. Update Fireflies
    if (this.fireflies) {
      for (const f of this.fireflies) {
        f.y -= f.speedY * dt;
        if (f.y < 320) {
          f.y = BOARD_HEIGHT + 15;
          f.x = Math.random() * BOARD_WIDTH;
        }
      }
    }
  }

  resolveBubbleCollision(proj) {
    this.setState(GAME_STATES.RESOLVING);

    // Find nearest hexagonal grid cell
    const cell = findNearestGridCell(proj.x, proj.y, this.board);
    if (!cell) {
      this.finalizeTurn();
      return;
    }

    // Ensure board row exists
    while (this.board.length <= cell.r) {
      const cols = getColsInRow(this.board.length);
      this.board.push(new Array(cols).fill(null));
    }

    // Place bubble on board
    this.board[cell.r][cell.c] = {
      color: proj.color,
      type: (proj.color === 'bomb' || proj.color === 'rainbow' || proj.color === 'lightning') ? proj.color : 'normal'
    };

    // Check Matches
    const matchResult = findMatches(this.board, cell.r, cell.c);
    const { matches, isSpecial, specialType } = matchResult;

    if (matches.length > 0) {
      // Pop matching bubbles
      for (const m of matches) {
        const center = getCellCenter(m.r, m.c);
        this.board[m.r][m.c] = null;

        // Spawn particles
        this.spawnPopParticles(center.x, center.y, m.bubble.color);
        // Track colors
        this.poppedColors[m.bubble.color] = (this.poppedColors[m.bubble.color] || 0) + 1;
      }

      // Register score & combo
      const { gained, combo } = this.scoreManager.registerMatch(matches.length, isSpecial);
      soundEngine.playPop(combo);

      if (combo >= 2) {
        soundEngine.playCombo(combo);
        this.addFloatingText(`COMBO x${combo}!`, cell.x, cell.y - 15, '#FFA502');
      } else {
        this.addFloatingText(`+${gained}`, cell.x, cell.y - 10, '#2ED573');
      }

      // Check for trapped rescues touching the match
      this.checkTrappedRescues();

      // Check Floating Bubbles (Item 20)
      const floating = findFloatingBubbles(this.board);
      if (floating.length > 0) {
        for (const fl of floating) {
          const center = getCellCenter(fl.r, fl.c);
          this.board[fl.r][fl.c] = null;
          this.spawnFloatingDrop(center.x, center.y, fl.bubble);
        }
        const dropBonus = this.scoreManager.registerFloatingDrops(floating.length);
        soundEngine.playFallingBubble();
        this.addFloatingText(`DROP +${dropBonus}!`, BOARD_WIDTH / 2, 240, '#1E90FF');
      }
    } else {
      // Shot failed to match: reset combo streak
      this.scoreManager.resetCombo();
    }

    this.finalizeTurn();
  }

  checkTrappedRescues() {
    let rescuedCount = 0;
    for (let r = 0; r < this.board.length; r++) {
      for (let c = 0; c < this.board[r].length; c++) {
        const bubble = this.board[r][c];
        if (bubble && bubble.type === 'rescue') {
          // Check if isolated or rescued
          const neighbors = getCellCenter(r, c);
          // When freed, celebrate rescue!
          const floating = findFloatingBubbles(this.board);
          const isFloating = floating.some(f => f.r === r && f.c === c);
          if (isFloating || this.isRescueExposed(r, c)) {
            this.board[r][c] = null;
            rescuedCount++;
            this.spawnRescueCelebration(neighbors.x, neighbors.y);
          }
        }
      }
    }

    if (rescuedCount > 0) {
      this.scoreManager.registerRescue(rescuedCount);
      soundEngine.playRescue();
      this.addFloatingText('RESCUED! 🎉', BOARD_WIDTH / 2, 180, '#FF9FF3');
    }
  }

  isRescueExposed(r, c) {
    // If it has at least 3 free sides
    let emptyCount = 0;
    const nbrs = [{ r: r - 1, c }, { r: r + 1, c }, { r, c: c - 1 }, { r, c: c + 1 }];
    for (const n of nbrs) {
      if (!this.board[n.r] || !this.board[n.r][n.c]) emptyCount++;
    }
    return emptyCount >= 3;
  }

  finalizeTurn() {
    // Check objective
    const completed = this.objectiveManager.checkStatus({
      board: this.board,
      poppedColors: this.poppedColors,
      droppedCount: this.scoreManager.floatingDroppedCount,
      rescuedCount: this.scoreManager.rescuedCount,
      score: this.scoreManager.score,
      combo: this.scoreManager.maxCombo
    });

    if (completed) {
      soundEngine.playLevelComplete();
      this.setState(GAME_STATES.LEVEL_COMPLETE);
      return;
    }

    // Check failure condition: no shots remaining
    if (this.shotManager.shotsRemaining <= 0) {
      soundEngine.playLevelFailed();
      this.setState(GAME_STATES.LEVEL_FAILED);
      return;
    }

    // Check if only 1 bubble is left on the canvas
    this.checkSingleBubbleRule();

    // Ready for next shot
    this.setState(GAME_STATES.READY);
  }

  spawnPopParticles(x, y, colorKey) {
    const theme = BUBBLE_THEMES[colorKey] || BUBBLE_THEMES.blue;
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 5,
        shrink: 5,
        color: Math.random() > 0.4 ? theme.main : theme.light,
        life: 0.45 + Math.random() * 0.25
      });
    }
  }

  spawnFloatingDrop(x, y, bubble) {
    this.floatingDrops.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 80,
      vy: -60 - Math.random() * 60,
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 6,
      opacity: 1,
      bubble
    });
  }

  spawnRescueCelebration(x, y) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 200;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 4,
        shrink: 4,
        color: ['#FF9FF3', '#FECA57', '#54A0FF', '#1DD1A1'][i % 4],
        life: 0.8
      });
    }
  }

  addFloatingText(text, x, y, color = '#FFFFFF') {
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      opacity: 1
    });
  }

  // Visual Trajectory Guide with wall reflections
  calculateTrajectory() {
    const startX = this.launcherPos.x;
    const startY = this.launcherPos.y;
    let curX = startX;
    let curY = startY;
    let dirX = Math.cos(this.aimAngle);
    let dirY = Math.sin(this.aimAngle);

    const bounces = [];
    let collisionPoint = null;
    let targetCell = null;

    const step = 4;
    const maxDistance = 1400; // ample for reaching the top after bouncing
    const polyline = [{ x: curX, y: curY }];

    for (let dist = 0; dist < maxDistance; dist += step) {
      curX += dirX * step;
      curY += dirY * step;

      // Wall bounce
      if (curX - BUBBLE_RADIUS <= 0) {
        curX = BUBBLE_RADIUS;
        dirX = -dirX;
        bounces.push({ x: curX, y: curY });
        polyline.push({ x: curX, y: curY });
      } else if (curX + BUBBLE_RADIUS >= BOARD_WIDTH) {
        curX = BOARD_WIDTH - BUBBLE_RADIUS;
        dirX = -dirX;
        bounces.push({ x: curX, y: curY });
        polyline.push({ x: curX, y: curY });
      }

      // Stop if hitting ceiling or board bubbles
      const col = checkBubbleCollision(curX, curY, this.board);
      const ceilingHit = (curY - BUBBLE_RADIUS <= CEILING_Y);

      if (ceilingHit || col.collided) {
        collisionPoint = { x: curX, y: curY };
        targetCell = findNearestGridCell(curX, curY, this.board);
        polyline.push({ x: curX, y: curY });
        break;
      }
    }

    if (!collisionPoint && polyline.length > 0) {
      collisionPoint = polyline[polyline.length - 1];
    }

    return { polyline, bounces, collisionPoint, targetCell };
  }

  // Atmospheric enchanted jungle background (Per reference visual, no dinosaur)
  drawEnchantedJungleBackground(ctx) {
    // 1. Deep night sky gradient (midnight navy to deep sapphire & teal)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, BOARD_HEIGHT);
    skyGrad.addColorStop(0, '#030816');
    skyGrad.addColorStop(0.25, '#051226');
    skyGrad.addColorStop(0.55, '#071a35');
    skyGrad.addColorStop(0.78, '#031424');
    skyGrad.addColorStop(1, '#020b14');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    // 2. Cosmic nebula / atmospheric glow in upper-mid sky
    const nebulaGrad = ctx.createRadialGradient(BOARD_WIDTH / 2, 240, 20, BOARD_WIDTH / 2, 240, 240);
    nebulaGrad.addColorStop(0, 'rgba(28, 58, 112, 0.28)');
    nebulaGrad.addColorStop(0.5, 'rgba(14, 116, 144, 0.12)');
    nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 60, BOARD_WIDTH, 380);

    // 3. Twinkling celestial stars
    const nowSec = performance.now() / 1000;
    if (this.backgroundStars) {
      for (const star of this.backgroundStars) {
        const pulse = Math.sin(nowSec * star.speed + star.phase);
        const alpha = Math.max(0.12, Math.min(0.9, star.baseAlpha + pulse * 0.35));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color || '#ffffff';
        ctx.globalAlpha = alpha;
        ctx.fill();

        // Cross flare on bright prominent stars
        if (star.radius > 1.3 && pulse > 0.6) {
          ctx.strokeStyle = star.color || '#ffffff';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(star.x - 3.5, star.y);
          ctx.lineTo(star.x + 3.5, star.y);
          ctx.moveTo(star.x, star.y - 3.5);
          ctx.lineTo(star.x, star.y + 3.5);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // 4. Distant jungle ridges & mountain silhouettes (Layer 1 - deep misty navy)
    ctx.save();
    ctx.fillStyle = '#05182b';
    ctx.beginPath();
    ctx.moveTo(0, 420);
    ctx.bezierCurveTo(60, 395, 120, 430, 180, 410);
    ctx.bezierCurveTo(240, 390, 290, 425, 340, 400);
    ctx.bezierCurveTo(370, 385, 390, 410, BOARD_WIDTH, 415);
    ctx.lineTo(BOARD_WIDTH, BOARD_HEIGHT);
    ctx.lineTo(0, BOARD_HEIGHT);
    ctx.closePath();
    ctx.fill();

    // 5. Midground jungle ridge & exotic tree canopies (Layer 2)
    ctx.fillStyle = '#031120';
    ctx.beginPath();
    ctx.moveTo(0, 452);
    ctx.bezierCurveTo(40, 436, 75, 418, 105, 442);
    ctx.bezierCurveTo(155, 458, 205, 438, 260, 452);
    ctx.bezierCurveTo(310, 442, 355, 428, BOARD_WIDTH, 448);
    ctx.lineTo(BOARD_WIDTH, BOARD_HEIGHT);
    ctx.lineTo(0, BOARD_HEIGHT);
    ctx.closePath();
    ctx.fill();

    // Distant palm crowns on midground ridges
    const drawDistantPalm = (px, py, scale) => {
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#020d18';
      // Trunk
      ctx.beginPath();
      ctx.moveTo(-1, 0);
      ctx.quadraticCurveTo(-4, -18, -6, -32);
      ctx.lineTo(-4, -32);
      ctx.quadraticCurveTo(-2, -18, 1, 0);
      ctx.fill();
      // Fronds radiating out
      for (let a = -2.4; a <= -0.7; a += 0.35) {
        ctx.beginPath();
        ctx.moveTo(-5, -32);
        const fx = -5 + Math.cos(a) * 20;
        const fy = -32 + Math.sin(a) * 16;
        ctx.quadraticCurveTo(-5 + Math.cos(a) * 12, -32 + Math.sin(a) * 18 + 5, fx, fy);
        ctx.strokeStyle = '#020d18';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      ctx.restore();
    };

    drawDistantPalm(35, 440, 0.8);
    drawDistantPalm(190, 445, 0.7);
    drawDistantPalm(365, 435, 0.85);

    // 6. Upward magical cyan beacon beam behind launcher
    const beamGrad = ctx.createLinearGradient(0, 360, 0, 524);
    beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    beamGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.08)');
    beamGrad.addColorStop(0.85, 'rgba(34, 211, 238, 0.18)');
    beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0.35)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(BOARD_WIDTH / 2 - 14, 524);
    ctx.lineTo(BOARD_WIDTH / 2 + 14, 524);
    ctx.lineTo(BOARD_WIDTH / 2 + 38, 360);
    ctx.lineTo(BOARD_WIDTH / 2 - 38, 360);
    ctx.closePath();
    ctx.fillStyle = beamGrad;
    ctx.fill();
    ctx.restore();

    // 7. Foreground dense enchanted jungle flora (Layer 3 - dark deep silhouettes)
    ctx.fillStyle = '#020810';

    // Left Giant Prehistoric Mushroom & Tropical Leaves
    // Mushroom Stem
    ctx.beginPath();
    ctx.moveTo(55, 570);
    ctx.quadraticCurveTo(65, 525, 72, 495);
    ctx.lineTo(82, 495);
    ctx.quadraticCurveTo(76, 525, 75, 570);
    ctx.fill();

    // Mushroom Cap
    ctx.beginPath();
    ctx.ellipse(77, 492, 34, 18, -0.08, 0, Math.PI * 2);
    ctx.fill();

    // Bioluminescent dots on mushroom cap
    ctx.fillStyle = 'rgba(52, 211, 153, 0.55)';
    [
      { dx: -18, dy: -2, r: 2.2 },
      { dx: -6, dy: -6, r: 2.8 },
      { dx: 8, dy: -5, r: 2.4 },
      { dx: 20, dy: 1, r: 1.8 }
    ].forEach(dot => {
      ctx.beginPath();
      ctx.arc(77 + dot.dx, 492 + dot.dy, dot.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Left Foreground Palm Fronds & Ferns
    ctx.fillStyle = '#01050d';
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.bezierCurveTo(25, 485, 45, 505, 55, 530);
    ctx.bezierCurveTo(40, 545, 20, 560, 0, 575);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 460);
    ctx.bezierCurveTo(35, 465, 55, 485, 45, 510);
    ctx.bezierCurveTo(25, 505, 10, 495, 0, 490);
    ctx.closePath();
    ctx.fill();

    // Right Foreground Jungle Plants, Reeds & Ferns
    ctx.beginPath();
    ctx.moveTo(BOARD_WIDTH, 510);
    ctx.bezierCurveTo(370, 490, 345, 520, 335, 545);
    ctx.bezierCurveTo(350, 560, 380, 570, BOARD_WIDTH, 580);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(BOARD_WIDTH, 470);
    ctx.bezierCurveTo(365, 475, 340, 495, 355, 520);
    ctx.bezierCurveTo(375, 515, 390, 500, BOARD_WIDTH, 495);
    ctx.closePath();
    ctx.fill();

    // Ground foliage floor framing bottom
    ctx.beginPath();
    ctx.moveTo(0, 570);
    ctx.quadraticCurveTo(80, 555, 150, 565);
    ctx.quadraticCurveTo(200, 572, 260, 565);
    ctx.quadraticCurveTo(330, 555, BOARD_WIDTH, 570);
    ctx.lineTo(BOARD_WIDTH, BOARD_HEIGHT);
    ctx.lineTo(0, BOARD_HEIGHT);
    ctx.closePath();
    ctx.fill();

    // 8. Floating bioluminescent fireflies rising with gentle wavy paths
    if (this.fireflies) {
      for (const f of this.fireflies) {
        const wobbleX = Math.sin(nowSec * f.wobbleSpeed + f.phase) * f.wobbleAmp;
        const fy = f.y;
        const fx = Math.max(8, Math.min(BOARD_WIDTH - 8, f.x + wobbleX));
        const glowAlpha = Math.max(0.15, Math.min(0.85, f.alpha + Math.sin(nowSec * 3 + f.phase) * 0.3));

        // Firefly soft outer aura
        const fg = ctx.createRadialGradient(fx, fy, 0.5, fx, fy, f.radius * 4);
        fg.addColorStop(0, `rgba(163, 230, 53, ${glowAlpha})`);
        fg.addColorStop(0.5, `rgba(74, 222, 128, ${glowAlpha * 0.4})`);
        fg.addColorStop(1, 'rgba(74, 222, 128, 0)');
        ctx.beginPath();
        ctx.arc(fx, fy, f.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = fg;
        ctx.fill();

        // Bright inner spark
        ctx.beginPath();
        ctx.arc(fx, fy, f.radius * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254, 240, 138, ${glowAlpha})`;
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // --- RENDERING ---
  render() {
    const ctx = this.ctx;
    
    // 1. Enchanted night jungle backdrop (Per reference image, no dinosaur)
    this.drawEnchantedJungleBackground(ctx);

    // Side wall bounce guides
    ctx.save();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.fillRect(0, CEILING_Y, 2, BOARD_HEIGHT - CEILING_Y);
    ctx.fillRect(BOARD_WIDTH - 2, CEILING_Y, 2, BOARD_HEIGHT - CEILING_Y);
    ctx.restore();

    // 2. Ceiling bar (Arcade stone/golden trim)
    const ceilingGrad = ctx.createLinearGradient(0, 0, 0, CEILING_Y);
    ceilingGrad.addColorStop(0, '#1e293b');
    ceilingGrad.addColorStop(0.7, '#334155');
    ceilingGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = ceilingGrad;
    ctx.fillRect(0, 0, BOARD_WIDTH, CEILING_Y - 4);

    // Glowing golden energy barrier
    ctx.save();
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.7)';
    ctx.shadowBlur = 6;
    ctx.fillRect(0, CEILING_Y - 4, BOARD_WIDTH, 3);
    ctx.restore();

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, CEILING_Y - 1, BOARD_WIDTH, 1);

    // 3. Board Bubbles
    for (let r = 0; r < this.board.length; r++) {
      const cols = getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const bubble = this.board[r] && this.board[r][c];
        if (!bubble) continue;

        const center = getCellCenter(r, c);
        this.drawBubble(ctx, center.x, center.y, bubble.color, bubble.type);
      }
    }

    // 4. Trajectory Guide (Color-matched directional beam & glowing 3D beads as per reference screenshot)
    if (this.state === GAME_STATES.READY || this.state === GAME_STATES.AIMING) {
      const { polyline, bounces, collisionPoint, targetCell } = this.calculateTrajectory();
      const activeColor = this.shotManager.currentBubble;
      const activeTheme = BUBBLE_THEMES[activeColor] || BUBBLE_THEMES.red;

      // (A) Directional arrow beam matching the active bubble color
      ctx.save();
      ctx.translate(this.launcherPos.x, this.launcherPos.y);
      ctx.rotate(this.aimAngle);

      // Tapered luminous arrow beam
      const beamGrad = ctx.createLinearGradient(16, 0, 95, 0);
      beamGrad.addColorStop(0, hexToRgba(activeTheme.light, 0.8));
      beamGrad.addColorStop(0.3, hexToRgba(activeTheme.main, 0.45));
      beamGrad.addColorStop(0.75, hexToRgba(activeTheme.main, 0.15));
      beamGrad.addColorStop(1, hexToRgba(activeTheme.main, 0));

      ctx.beginPath();
      ctx.moveTo(16, -8);
      ctx.lineTo(82, -26);
      ctx.lineTo(95, 0);
      ctx.lineTo(82, 26);
      ctx.lineTo(16, 8);
      ctx.closePath();
      ctx.fillStyle = beamGrad;
      ctx.fill();

      // Bright inner core arrow line
      const coreGrad = ctx.createLinearGradient(18, 0, 80, 0);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, hexToRgba(activeTheme.light, 0.9));
      coreGrad.addColorStop(1, hexToRgba(activeTheme.main, 0));
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(80, 0);
      ctx.strokeStyle = coreGrad;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Energy sparkle dots inside the beam
      [
        { x: 38, y: -5, r: 2.0 },
        { x: 52, y: 7, r: 2.4 },
        { x: 68, y: -4, r: 1.8 },
        { x: 74, y: 6, r: 1.6 }
      ].forEach(sp => {
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(activeTheme.light, 0.75);
        ctx.fill();
      });

      ctx.restore();

      // (B) Polyline segments calculation for parametric bead placement
      const segments = [];
      let totalLength = 0;
      for (let i = 0; i < polyline.length - 1; i++) {
        const p1 = polyline[i];
        const p2 = polyline[i + 1];
        const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        segments.push({ p1, p2, len, startDist: totalLength, endDist: totalLength + len });
        totalLength += len;
      }

      // (C) Spherical beaded dots along the trajectory path (matching active bubble color)
      const startDist = 26; // Starts cleanly outside the loaded bubble
      const spacing = 18;   // Spacing matching reference image
      const maxDrawDist = Math.max(0, totalLength - 14);

      for (let d = startDist; d <= maxDrawDist; d += spacing) {
        const seg = segments.find(s => d >= s.startDist && d <= s.endDist);
        if (!seg || seg.len === 0) continue;

        const t = (d - seg.startDist) / seg.len;
        const dotX = seg.p1.x + t * (seg.p2.x - seg.p1.x);
        const dotY = seg.p1.y + t * (seg.p2.y - seg.p1.y);

        // Draw shining 3D sphere bead matching active bubble theme
        ctx.save();
        ctx.shadowColor = activeTheme.glow || activeTheme.main;
        ctx.shadowBlur = this.boostersActive.aimGuide ? 10 : 6;
        const beadRadius = this.boostersActive.aimGuide ? 4.8 : 4.0;

        const beadGrad = ctx.createRadialGradient(
          dotX - beadRadius * 0.35,
          dotY - beadRadius * 0.35,
          0.2,
          dotX,
          dotY,
          beadRadius
        );
        beadGrad.addColorStop(0, '#ffffff');
        beadGrad.addColorStop(0.28, activeTheme.light || '#ffffff');
        beadGrad.addColorStop(0.72, activeTheme.main || '#ff0000');
        beadGrad.addColorStop(1, activeTheme.dark || '#990000');

        ctx.beginPath();
        ctx.arc(dotX, dotY, beadRadius, 0, Math.PI * 2);
        ctx.fillStyle = beadGrad;
        ctx.fill();

        ctx.strokeStyle = activeTheme.rim || activeTheme.dark || '#550000';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      }

      // (D) Wall bounce glow rings
      for (const b of bounces) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, 6.5, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(activeTheme.light, 0.85);
        ctx.lineWidth = 1.8;
        ctx.shadowColor = activeTheme.main;
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.restore();
      }

      // (E) Target ghost bubble preview at landing grid cell
      const ghostPos = targetCell ? { x: targetCell.x, y: targetCell.y } : collisionPoint;
      if (ghostPos) {
        ctx.save();

        // Translucent tinted bubble volume
        ctx.beginPath();
        ctx.arc(ghostPos.x, ghostPos.y, BUBBLE_RADIUS - 1, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(activeTheme.main, 0.22);
        ctx.fill();

        // Glowing translucent glass ring
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.lineWidth = 2.4;
        ctx.shadowColor = activeTheme.main;
        ctx.shadowBlur = 8;
        ctx.stroke();

        // Curved glassy highlight reflection arc
        ctx.beginPath();
        ctx.arc(ghostPos.x, ghostPos.y, BUBBLE_RADIUS - 4, -Math.PI * 0.88, -Math.PI * 0.22);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Final center bead inside ghost bubble matching active bubble color
        const centerBeadGrad = ctx.createRadialGradient(
          ghostPos.x - 1.2,
          ghostPos.y - 1.2,
          0.2,
          ghostPos.x,
          ghostPos.y,
          4.2
        );
        centerBeadGrad.addColorStop(0, '#ffffff');
        centerBeadGrad.addColorStop(0.28, activeTheme.light || '#ffffff');
        centerBeadGrad.addColorStop(0.72, activeTheme.main || '#ff0000');
        centerBeadGrad.addColorStop(1, activeTheme.dark || '#990000');

        ctx.beginPath();
        ctx.arc(ghostPos.x, ghostPos.y, 4.2, 0, Math.PI * 2);
        ctx.fillStyle = centerBeadGrad;
        ctx.fill();

        ctx.strokeStyle = activeTheme.rim || activeTheme.dark;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      }
    }

    // 5. Floating Drops
    for (const drop of this.floatingDrops) {
      ctx.save();
      ctx.globalAlpha = drop.opacity;
      ctx.translate(drop.x, drop.y);
      ctx.rotate(drop.rotation);
      this.drawBubble(ctx, 0, 0, drop.bubble.color, drop.bubble.type);
      ctx.restore();
    }

    // 6. Moving Projectile
    if (this.projectile) {
      this.drawBubble(ctx, this.projectile.x, this.projectile.y, this.projectile.color, 'normal');
    }

    // 7. Launcher Cannon & Base
    this.drawLauncher(ctx);

    // 8. Particles
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    // 9. Floating Pop Texts
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.opacity;
      ctx.font = 'bold 18px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  drawBubble(ctx, x, y, colorKey, type = 'normal', customRadius = BUBBLE_RADIUS) {
    const theme = BUBBLE_THEMES[colorKey] || BUBBLE_THEMES.blue;
    const r = customRadius || BUBBLE_RADIUS;

    ctx.save();

    // 1. Base 3D Sphere with smooth radial gradient (highlight offset towards top-left)
    const grad = ctx.createRadialGradient(
      x - r * 0.3,
      y - r * 0.35,
      r * 0.1,
      x,
      y,
      r
    );
    grad.addColorStop(0, theme.light);
    grad.addColorStop(0.35, theme.main);
    grad.addColorStop(0.82, theme.dark || theme.main);
    grad.addColorStop(1.0, theme.rim || theme.dark);

    ctx.beginPath();
    ctx.arc(x, y, r - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 2. Defined, crisp outer edge contour
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = theme.rim || theme.dark;
    ctx.stroke();

    // 3. Subtle bottom-right inner bounce light (translucent glass/marble volume)
    ctx.beginPath();
    ctx.arc(x, y, r - 2.5, 0.22 * Math.PI, 0.82 * Math.PI);
    ctx.strokeStyle = theme.innerRim || 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 4. Primary glossy specular highlight reflection at top-left
    ctx.beginPath();
    ctx.ellipse(
      x - r * 0.28,
      y - r * 0.32,
      r * 0.36,
      r * 0.18,
      -Math.PI / 4,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.fill();

    // 5. Secondary micro specular shine dot
    ctx.beginPath();
    ctx.arc(x - r * 0.08, y - r * 0.45, r * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();

    // Special items
    if (type === 'bomb' || colorKey === 'bomb') {
      ctx.font = `bold ${Math.round(r * 0.75)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💣', x, y + 1);
    } else if (type === 'rainbow' || colorKey === 'rainbow') {
      ctx.font = `bold ${Math.round(r * 0.75)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⭐', x, y + 1);
    } else if (type === 'lightning' || colorKey === 'lightning') {
      ctx.font = `bold ${Math.round(r * 0.75)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡', x, y + 1);
    } else if (type === 'rescue' || colorKey === 'rescue') {
      this.drawBabyDragonInside(ctx, x, y, r);
    }

    ctx.restore();
  }

  drawBabyDragonInside(ctx, x, y, r) {
    ctx.save();
    // Cute little baby dragon face peeking out (Dragon Pop mechanic)
    const cy = y + 2;
    // Dragon face head
    ctx.beginPath();
    ctx.arc(x, cy, r * 0.52, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#ca8a04';
    ctx.stroke();

    // Tiny cute horns
    ctx.beginPath();
    ctx.moveTo(x - 5, cy - 7);
    ctx.lineTo(x - 8, cy - 13);
    ctx.lineTo(x - 3, cy - 9);
    ctx.fillStyle = '#ea580c';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + 5, cy - 7);
    ctx.lineTo(x + 8, cy - 13);
    ctx.lineTo(x + 3, cy - 9);
    ctx.fillStyle = '#ea580c';
    ctx.fill();

    // Twinkling big black eyes with specular catchlights
    ctx.beginPath();
    ctx.arc(x - 4, cy - 1, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 4, cy - 1, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - 4.8, cy - 1.8, 0.9, 0, Math.PI * 2);
    ctx.arc(x + 3.2, cy - 1.8, 0.9, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Blushing cheeks
    ctx.beginPath();
    ctx.arc(x - 6.5, cy + 3, 2, 0, Math.PI * 2);
    ctx.arc(x + 6.5, cy + 3, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.65)';
    ctx.fill();

    // Tiny smile
    ctx.beginPath();
    ctx.arc(x, cy + 2, 2, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  }

  // Glowing curved swap arrow with animated energy pulses and sleek arrowhead (matching diagram marks)
  drawCurvedArrow(ctx, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey, pulse, rotAngle = 0, cx = 200, cy = 544) {
    ctx.save();
    if (rotAngle !== 0) {
      ctx.translate(cx, cy);
      ctx.rotate(rotAngle);
      ctx.translate(-cx, -cy);
    }

    // 1. Neon Bloom Glow
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey);
    ctx.strokeStyle = '#10D05E';
    ctx.shadowColor = 'rgba(16, 208, 94, 0.9)';
    ctx.shadowBlur = 10 * pulse;
    ctx.lineWidth = 3.6;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // 2. Bright Core Stroke with Cyan Gradient
    ctx.save();
    const grad = ctx.createLinearGradient(sx, sy, ex, ey);
    grad.addColorStop(0, '#34D399');
    grad.addColorStop(0.5, '#6EE7B7');
    grad.addColorStop(1, '#00F5D4');
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // 3. Electric racing light dashes
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey);
    ctx.setLineDash([8, 12]);
    ctx.lineDashOffset = -(Date.now() / 20) % 20;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // 4. Sharp gaming arrowhead pointing along curve tangent
    const dx = ex - cp2x;
    const dy = ey - cp2y;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(2.5, 0); // sharp tip
    ctx.lineTo(-10.5, -6.5);
    ctx.lineTo(-7.5, 0); // sleek inward chevron notch
    ctx.lineTo(-10.5, 6.5);
    ctx.closePath();

    ctx.fillStyle = '#10D05E';
    ctx.shadowColor = 'rgba(16, 208, 94, 0.95)';
    ctx.shadowBlur = 8 * pulse;
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();

    ctx.restore();
  }

  // Shooter Launcher Base Ring, Dual Curved Exchange Arrows & Loaded Bubbles
  drawLauncher(ctx) {
    const lx = this.launcherPos.x;
    const ly = this.launcherPos.y;
    const baseX = lx;
    const baseY = ly + 26; // Center of the shots counter ring
    const nextX = baseX + 28;
    const nextY = baseY + 14;
    const nextR = 17;

    const pulse = 0.88 + 0.12 * Math.sin(Date.now() / 260);

    // Calculate positions during swap animation
    let currentDrawX = lx;
    let currentDrawY = ly;
    let nextDrawX = nextX;
    let nextDrawY = nextY;
    let arrowRot = 0;

    if (this.swapAnimation) {
      const p = Math.min(1, this.swapAnimation.elapsed / this.swapAnimation.duration);
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      arrowRot = ease * Math.PI;

      // Active bubble curves into dock
      currentDrawX = lx + (nextX - lx) * ease + Math.sin(ease * Math.PI) * 16;
      currentDrawY = ly + (nextY - ly) * ease;

      // Reserve bubble curves into active launcher
      nextDrawX = nextX + (lx - nextX) * ease - Math.sin(ease * Math.PI) * 16;
      nextDrawY = nextY + (ly - nextY) * ease;
    }

    ctx.save();

    // 1. Ambient Dais Shadow & Energy Well
    ctx.save();
    const underGlow = ctx.createRadialGradient(baseX, baseY + 6, 8, baseX, baseY + 8, 46);
    underGlow.addColorStop(0, 'rgba(8, 14, 28, 0.85)');
    underGlow.addColorStop(0.65, 'rgba(15, 23, 42, 0.4)');
    underGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = underGlow;
    ctx.beginPath();
    ctx.arc(baseX, baseY + 8, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Pedestal Base Ring with remaining shot counter
    ctx.save();
    ctx.beginPath();
    ctx.arc(baseX, baseY, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8, 14, 28, 0.92)';
    ctx.fill();

    // Warning state when shots are low (<= 5)
    const isLowAmmo = this.shotManager.shotsRemaining <= 5;
    ctx.lineWidth = 3.2;
    if (isLowAmmo) {
      ctx.strokeStyle = '#EF4444';
      ctx.shadowColor = 'rgba(239, 68, 68, 0.9)';
      ctx.shadowBlur = 10 * pulse;
    } else {
      ctx.strokeStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 8;
    }
    ctx.stroke();

    // Subtle inner tech bezel ring
    ctx.beginPath();
    ctx.arc(baseX, baseY, 26, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Remaining shots number & "SHOTS" label
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Label
    ctx.font = '800 8px "Inter", sans-serif';
    ctx.fillStyle = isLowAmmo ? '#FCA5A5' : 'rgba(226, 232, 240, 0.8)';
    ctx.fillText('SHOTS', baseX, baseY - 8);

    // Number
    ctx.font = '900 23px "Outfit", "Inter", -apple-system, sans-serif';
    ctx.fillStyle = isLowAmmo ? '#F87171' : '#FFFFFF';
    ctx.shadowColor = isLowAmmo ? 'rgba(239, 68, 68, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = isLowAmmo ? 6 : 4;
    ctx.fillText(this.shotManager.shotsRemaining, baseX, baseY + 7);
    ctx.restore();

    // 3. Next Bubble preview docked on lower-right
    // Docking socket ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(nextX, nextY, nextR + 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Drop shadow under next bubble
    ctx.beginPath();
    ctx.arc(nextX + 1, nextY + 2, nextR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();
    ctx.restore();

    // Render Next Bubble
    const nextBubbleColor = this.swapAnimation ? this.swapAnimation.fromNext : this.shotManager.nextBubble;
    this.drawBubble(ctx, nextDrawX, nextDrawY, nextBubbleColor, 'normal', nextR);

    // 4. CURVED SWAP ARROWS (Matching user diagram marks)
    // Right Arrow: curves clockwise down from active bubble to reserve bubble
    this.drawCurvedArrow(
      ctx,
      lx + 23, ly - 6,   // sx, sy
      lx + 46, ly + 6,   // cp1x, cp1y
      nextX + 34, nextY - 6, // cp2x, cp2y
      nextX + 16, nextY + 12, // ex, ey
      pulse,
      arrowRot,
      baseX, baseY
    );

    // Left Arrow: curves clockwise up from bottom-left to active bubble
    this.drawCurvedArrow(
      ctx,
      baseX - 16, baseY + 32, // sx, sy
      baseX - 44, baseY + 18, // cp1x, cp1y
      lx - 46, ly + 20,       // cp2x, cp2y
      lx - 24, ly + 2,        // ex, ey
      pulse,
      arrowRot,
      baseX, baseY
    );

    // 5. Loaded Active Bubble seated at top of pedestal
    if (!this.projectile) {
      const activeColor = this.swapAnimation ? this.swapAnimation.fromCurrent : this.shotManager.currentBubble;
      const activeTheme = BUBBLE_THEMES[activeColor] || BUBBLE_THEMES.red;

      // Color aura under active bubble
      ctx.save();
      const aura = ctx.createRadialGradient(currentDrawX, currentDrawY, 6, currentDrawX, currentDrawY, 38);
      aura.addColorStop(0, hexToRgba(activeTheme.light, 0.55));
      aura.addColorStop(0.5, hexToRgba(activeTheme.main, 0.22));
      aura.addColorStop(1, hexToRgba(activeTheme.main, 0));
      ctx.beginPath();
      ctx.arc(currentDrawX, currentDrawY, 38, 0, Math.PI * 2);
      ctx.fillStyle = aura;
      ctx.fill();
      ctx.restore();

      // Subtle floating hover when ready
      const hoverY = (this.state === GAME_STATES.READY || this.state === GAME_STATES.AIMING) && !this.swapAnimation
        ? Math.sin(Date.now() / 320) * 1.5
        : 0;

      // Render 3D glossy active bubble
      this.drawBubble(ctx, currentDrawX, currentDrawY + hoverY, activeColor, 'normal', BUBBLE_RADIUS);
    }

    ctx.restore();
  }

  getPublicState() {
    return {
      gameState: this.state,
      score: this.scoreManager.score,
      stars: this.scoreManager.getStars(),
      combo: this.scoreManager.combo,
      maxCombo: this.scoreManager.maxCombo,
      shotsRemaining: this.shotManager.shotsRemaining,
      shotsUsed: this.shotManager.shotsUsed,
      currentBubble: this.shotManager.currentBubble,
      nextBubble: this.shotManager.nextBubble,
      availableColors: this.getAvailableColors(),
      objectiveDescription: this.objectiveManager.getProgressDescription(),
      isObjectiveCompleted: this.objectiveManager.isCompleted,
      canUndo: false
    };
  }

  destroy() {
    this.stopLoop();
  }
}
