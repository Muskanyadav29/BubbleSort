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

    // Launcher positioning
    this.launcherPos = { x: BOARD_WIDTH / 2, y: BOARD_HEIGHT - 45 };
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

    // Undo stack
    this.undoStack = [];

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
    this.undoStack = [];
    this.poppedColors = {};
    this.boostersActive = { aimGuide: false };

    this.setState(GAME_STATES.READY);
    soundEngine.init();
  }

  saveSnapshot() {
    // Preserve state for undo
    this.undoStack.push({
      board: this.board.map(r => r.map(c => (c ? { ...c } : null))),
      scoreState: this.scoreManager.getState(),
      shotState: this.shotManager.getState(),
      objectiveProgress: this.objectiveManager.progress,
      poppedColors: { ...this.poppedColors }
    });
    // Keep max 3 undo snapshots
    if (this.undoStack.length > 3) this.undoStack.shift();
  }

  undo() {
    if (this.undoStack.length === 0 || this.state === GAME_STATES.SHOOTING || this.state === GAME_STATES.RESOLVING) {
      return false;
    }

    const prev = this.undoStack.pop();
    this.board = prev.board;
    this.scoreManager.score = prev.scoreState.score;
    this.scoreManager.combo = prev.scoreState.combo;
    this.scoreManager.bubblesPoppedCount = prev.scoreState.bubblesPoppedCount;
    this.shotManager.shotsRemaining = prev.shotState.shotsRemaining;
    this.shotManager.shotsUsed = prev.shotState.shotsUsed;
    this.shotManager.currentBubble = prev.shotState.currentBubble;
    this.shotManager.nextBubble = prev.shotState.nextBubble;
    this.poppedColors = prev.poppedColors;
    this.objectiveManager.progress = prev.objectiveProgress;

    soundEngine.playBooster();
    this.setState(GAME_STATES.READY);
    return true;
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

    this.saveSnapshot();

    const bubbleColor = this.shotManager.currentBubble;
    const consumed = this.shotManager.consumeShot(this.levelConfig.colors);
    if (!consumed) return false;

    // Launch moving projectile
    this.projectile = {
      x: this.launcherPos.x,
      y: this.launcherPos.y - 10,
      vx: Math.cos(this.aimAngle) * this.speed,
      vy: Math.sin(this.aimAngle) * this.speed,
      color: bubbleColor,
      radius: BUBBLE_RADIUS
    };

    soundEngine.playLaunch();
    this.setState(GAME_STATES.SHOOTING);
    return true;
  }

  swapBubbles() {
    if (this.state === GAME_STATES.SHOOTING || this.state === GAME_STATES.RESOLVING) return;
    this.shotManager.swapBubbles();
    soundEngine.playButtonClick();
    this.setState(this.state);
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
    const path = [{ x: this.launcherPos.x, y: this.launcherPos.y }];
    let curX = this.launcherPos.x;
    let curY = this.launcherPos.y;
    let dirX = Math.cos(this.aimAngle);
    let dirY = Math.sin(this.aimAngle);

    const maxSegments = this.boostersActive.aimGuide ? 600 : 380;
    const step = 8;

    for (let dist = 0; dist < maxSegments; dist += step) {
      curX += dirX * step;
      curY += dirY * step;

      // Wall bounce
      if (curX - BUBBLE_RADIUS <= 0) {
        curX = BUBBLE_RADIUS;
        dirX = -dirX;
      } else if (curX + BUBBLE_RADIUS >= BOARD_WIDTH) {
        curX = BOARD_WIDTH - BUBBLE_RADIUS;
        dirX = -dirX;
      }

      path.push({ x: curX, y: curY });

      // Stop if hitting ceiling or board bubbles
      if (curY - BUBBLE_RADIUS <= CEILING_Y || checkBubbleCollision(curX, curY, this.board).collided) {
        break;
      }
    }

    return path;
  }

  // --- RENDERING ---
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    // Ceiling bar
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(0, 0, BOARD_WIDTH, CEILING_Y - 4);
    ctx.fillStyle = '#485460';
    ctx.fillRect(0, CEILING_Y - 4, BOARD_WIDTH, 4);

    // Board Bubbles
    for (let r = 0; r < this.board.length; r++) {
      const cols = getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const bubble = this.board[r] && this.board[r][c];
        if (!bubble) continue;

        const center = getCellCenter(r, c);
        this.drawBubble(ctx, center.x, center.y, bubble.color, bubble.type);
      }
    }

    // Trajectory Guide (Items 13, 14, 48)
    if (this.state === GAME_STATES.READY || this.state === GAME_STATES.AIMING) {
      const trajectory = this.calculateTrajectory();
      ctx.beginPath();
      ctx.setLineDash([6, 8]);
      ctx.strokeStyle = this.boostersActive.aimGuide ? 'rgba(255, 234, 167, 0.9)' : 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = this.boostersActive.aimGuide ? 3.5 : 2.5;

      for (let i = 0; i < trajectory.length; i++) {
        if (i === 0) ctx.moveTo(trajectory[i].x, trajectory[i].y);
        else ctx.lineTo(trajectory[i].x, trajectory[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Collision target indicator circle
      if (trajectory.length > 0) {
        const end = trajectory[trajectory.length - 1];
        ctx.beginPath();
        ctx.arc(end.x, end.y, BUBBLE_RADIUS * 0.75, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Floating Drops
    for (const drop of this.floatingDrops) {
      ctx.save();
      ctx.globalAlpha = drop.opacity;
      ctx.translate(drop.x, drop.y);
      ctx.rotate(drop.rotation);
      this.drawBubble(ctx, 0, 0, drop.bubble.color, drop.bubble.type);
      ctx.restore();
    }

    // Moving Projectile
    if (this.projectile) {
      this.drawBubble(ctx, this.projectile.x, this.projectile.y, this.projectile.color, 'normal');
    }

    // Launcher Cannon & Base
    this.drawLauncher(ctx);

    // Particles
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    // Floating Pop Texts
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

  drawBubble(ctx, x, y, colorKey, type = 'normal') {
    const theme = BUBBLE_THEMES[colorKey] || BUBBLE_THEMES.blue;
    const r = BUBBLE_RADIUS;

    ctx.save();

    // Subtle outer shadow
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 8;

    // Base circle gradient
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    grad.addColorStop(0, theme.light);
    grad.addColorStop(0.7, theme.main);
    grad.addColorStop(1, '#0f172a');

    ctx.beginPath();
    ctx.arc(x, y, r - 1, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Specular highlight gleam
    ctx.beginPath();
    ctx.ellipse(x - r * 0.3, y - r * 0.35, r * 0.35, r * 0.2, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fill();

    // Special icons/emojis for unique types
    if (type === 'bomb' || colorKey === 'bomb') {
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💣', x, y);
    } else if (type === 'rainbow' || colorKey === 'rainbow') {
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌈', x, y);
    } else if (type === 'lightning' || colorKey === 'lightning') {
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡', x, y);
    } else if (type === 'rescue') {
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐣', x, y);
    }

    ctx.restore();
  }

  drawLauncher(ctx) {
    const { x, y } = this.launcherPos;

    ctx.save();

    // Launcher base pedestal
    ctx.beginPath();
    ctx.arc(x, y + 15, 34, Math.PI, 0, false);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    // Aiming barrel rotation
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.aimAngle + Math.PI / 2);

    // Barrel body
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-14, -42, 28, 40, [8, 8, 2, 2]);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Loaded active bubble
    if (!this.projectile) {
      this.drawBubble(ctx, x, y, this.shotManager.currentBubble, 'normal');
    }

    // Next bubble preview circle (bottom-left)
    const nextX = x - 55;
    const nextY = y + 15;
    ctx.beginPath();
    ctx.arc(nextX, nextY, 17, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    this.drawBubble(ctx, nextX, nextY, this.shotManager.nextBubble, 'normal');

    // Swap icon indicator
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⇄', x - 28, y + 18);

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
      objectiveDescription: this.objectiveManager.getProgressDescription(),
      isObjectiveCompleted: this.objectiveManager.isCompleted,
      canUndo: this.undoStack.length > 0 && this.state !== GAME_STATES.SHOOTING && this.state !== GAME_STATES.RESOLVING
    };
  }

  destroy() {
    this.stopLoop();
  }
}
