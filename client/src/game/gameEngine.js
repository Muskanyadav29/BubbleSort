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
    // Check next bubble dock (baseX + 28, baseY + 16)
    if (Math.hypot(x - (baseX + 28), y - (baseY + 16)) <= 28) return true;
    // Check circular pedestal area (baseX, baseY)
    if (Math.hypot(x - baseX, y - baseY) <= 32 && y > this.launcherPos.y + 10) return true;
    return false;
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

  // --- RENDERING ---
  render() {
    const ctx = this.ctx;
    
    // 1. Deep arcade game backdrop
    const bgGrad = ctx.createLinearGradient(0, 0, 0, BOARD_HEIGHT);
    bgGrad.addColorStop(0, '#080d1a');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#060913');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    // 2. Ceiling bar (Arcade stone/golden trim)
    const ceilingGrad = ctx.createLinearGradient(0, 0, 0, CEILING_Y);
    ceilingGrad.addColorStop(0, '#1e293b');
    ceilingGrad.addColorStop(0.7, '#334155');
    ceilingGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = ceilingGrad;
    ctx.fillRect(0, 0, BOARD_WIDTH, CEILING_Y - 4);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, CEILING_Y - 4, BOARD_WIDTH, 3);
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

    // 4. Trajectory Guide (Golden beads & light beam as per reference screenshot)
    if (this.state === GAME_STATES.READY || this.state === GAME_STATES.AIMING) {
      const { polyline, bounces, collisionPoint, targetCell } = this.calculateTrajectory();

      // (A) Golden directional light cone emitting from the active bubble
      ctx.save();
      ctx.translate(this.launcherPos.x, this.launcherPos.y);
      ctx.rotate(this.aimAngle);
      const coneGrad = ctx.createLinearGradient(14, 0, 80, 0);
      coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.5)');
      coneGrad.addColorStop(0.35, 'rgba(250, 204, 21, 0.25)');
      coneGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.beginPath();
      ctx.moveTo(16, -7);
      ctx.lineTo(80, -25);
      ctx.lineTo(80, 25);
      ctx.lineTo(16, 7);
      ctx.closePath();
      ctx.fillStyle = coneGrad;
      ctx.fill();
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

      // (C) Golden beaded dots along the trajectory path
      const startDist = 26; // Starts cleanly outside the loaded bubble
      const spacing = 18;   // Spacing matching the reference screenshot
      const maxDrawDist = Math.max(0, totalLength - 14);

      for (let d = startDist; d <= maxDrawDist; d += spacing) {
        const seg = segments.find(s => d >= s.startDist && d <= s.endDist);
        if (!seg || seg.len === 0) continue;

        const t = (d - seg.startDist) / seg.len;
        const dotX = seg.p1.x + t * (seg.p2.x - seg.p1.x);
        const dotY = seg.p1.y + t * (seg.p2.y - seg.p1.y);

        // Draw shining golden bead / pearl
        ctx.save();
        ctx.shadowColor = 'rgba(251, 191, 36, 0.85)';
        ctx.shadowBlur = this.boostersActive.aimGuide ? 10 : 5;
        const beadRadius = this.boostersActive.aimGuide ? 4.8 : 4.0;

        const beadGrad = ctx.createRadialGradient(
          dotX - beadRadius * 0.35,
          dotY - beadRadius * 0.35,
          0.3,
          dotX,
          dotY,
          beadRadius
        );
        beadGrad.addColorStop(0, '#ffffff');
        beadGrad.addColorStop(0.3, '#fef08a');
        beadGrad.addColorStop(0.75, '#f59e0b');
        beadGrad.addColorStop(1, '#b45309');

        ctx.beginPath();
        ctx.arc(dotX, dotY, beadRadius, 0, Math.PI * 2);
        ctx.fillStyle = beadGrad;
        ctx.fill();

        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 0.75;
        ctx.stroke();
        ctx.restore();
      }

      // (D) Wall bounce glow rings
      for (const b of bounces) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, 6.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
        ctx.lineWidth = 1.6;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.restore();
      }

      // (E) Target ghost bubble preview at landing grid cell
      const ghostPos = targetCell ? { x: targetCell.x, y: targetCell.y } : collisionPoint;
      if (ghostPos) {
        ctx.save();
        const activeColor = this.shotManager.currentBubble;
        const activeTheme = BUBBLE_THEMES[activeColor] || BUBBLE_THEMES.blue;

        // Faint tinted bubble volume
        ctx.beginPath();
        ctx.arc(ghostPos.x, ghostPos.y, BUBBLE_RADIUS - 1, 0, Math.PI * 2);
        ctx.fillStyle = activeTheme.main || '#38bdf8';
        ctx.globalAlpha = 0.16;
        ctx.fill();

        // Glowing translucent glass ring
        ctx.globalAlpha = 0.82;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = activeTheme.light || '#ffffff';
        ctx.shadowBlur = 8;
        ctx.stroke();

        // Curved glassy highlight reflection arc
        ctx.beginPath();
        ctx.arc(ghostPos.x, ghostPos.y, BUBBLE_RADIUS - 4, -Math.PI * 0.88, -Math.PI * 0.22);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Final golden center bead inside ghost bubble
        ctx.shadowColor = 'rgba(251, 191, 36, 0.9)';
        ctx.shadowBlur = 7;
        const beadGrad = ctx.createRadialGradient(
          ghostPos.x - 1.2,
          ghostPos.y - 1.2,
          0.3,
          ghostPos.x,
          ghostPos.y,
          4.2
        );
        beadGrad.addColorStop(0, '#ffffff');
        beadGrad.addColorStop(0.3, '#fef08a');
        beadGrad.addColorStop(0.75, '#f59e0b');
        beadGrad.addColorStop(1, '#b45309');

        ctx.beginPath();
        ctx.arc(ghostPos.x, ghostPos.y, 4.2, 0, Math.PI * 2);
        ctx.fillStyle = beadGrad;
        ctx.fill();

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

  // Shooter Launcher Base Ring & Loaded Bubbles (matching reference screenshot)
  drawLauncher(ctx) {
    const lx = this.launcherPos.x;
    const ly = this.launcherPos.y;
    const baseX = lx;
    const baseY = ly + 26; // Center of the shots counter ring

    ctx.save();

    // 1. Glowing Shooter Base Ring with remaining shot counter
    ctx.save();
    ctx.beginPath();
    ctx.arc(baseX, baseY, 30, 0, Math.PI * 2);
    // Dark glass circle fill
    ctx.fillStyle = 'rgba(8, 14, 28, 0.85)';
    ctx.fill();

    // Glowing white circular rim
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowBlur = 9;
    ctx.stroke();
    ctx.restore();

    // Remaining shots number (e.g. "25") in bold white text
    ctx.save();
    ctx.font = '900 24px "Inter", "Arial Rounded MT Bold", -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(this.shotManager.shotsRemaining, baseX, baseY + 6);
    ctx.restore();

    // 2. Next Bubble preview docked on the lower-right of the shooter ring
    const nextX = baseX + 26;
    const nextY = baseY + 14;
    const nextR = 17;

    // Subtle docking drop shadow under next bubble
    ctx.save();
    ctx.beginPath();
    ctx.arc(nextX + 1, nextY + 2, nextR + 1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();
    ctx.restore();

    // Next bubble inside dock (clean 3D bubble without badge, matching reference image)
    this.drawBubble(ctx, nextX, nextY, this.shotManager.nextBubble, 'normal', nextR);

    // 3. Loaded Active Bubble seated at the top of the ring
    if (!this.projectile) {
      // Golden aura behind active bubble
      ctx.save();
      const aura = ctx.createRadialGradient(lx, ly, 6, lx, ly, 38);
      aura.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
      aura.addColorStop(0.5, 'rgba(255, 180, 0, 0.22)');
      aura.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.beginPath();
      ctx.arc(lx, ly, 38, 0, Math.PI * 2);
      ctx.fillStyle = aura;
      ctx.fill();
      ctx.restore();

      // Render the loaded active bubble with full 3D shine
      this.drawBubble(ctx, lx, ly, this.shotManager.currentBubble, 'normal', BUBBLE_RADIUS);
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
      objectiveDescription: this.objectiveManager.getProgressDescription(),
      isObjectiveCompleted: this.objectiveManager.isCompleted,
      canUndo: this.undoStack.length > 0 && this.state !== GAME_STATES.SHOOTING && this.state !== GAME_STATES.RESOLVING
    };
  }

  destroy() {
    this.stopLoop();
  }
}
