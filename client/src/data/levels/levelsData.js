// Data-driven 40+ Levels for client-side gameplay & offline mode

export const BUBBLE_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];

function createPatternBoard(patternType, availableColors, rows = 6, specialCells = {}) {
  const board = [];
  for (let r = 0; r < rows; r++) {
    const cols = (r % 2 === 0) ? 8 : 7;
    const rowBubbles = [];
    for (let c = 0; c < cols; c++) {
      const specialKey = `${r},${c}`;
      if (specialCells[specialKey]) {
        rowBubbles.push(specialCells[specialKey]);
        continue;
      }

      let color = null;
      if (patternType === 'full') {
        color = availableColors[(r * 2 + c) % availableColors.length];
      } else if (patternType === 'pyramid') {
        const mid = cols / 2;
        if (Math.abs(c - mid) <= r + 1) {
          color = availableColors[(r + c) % availableColors.length];
        }
      } else if (patternType === 'inverted_pyramid') {
        const mid = cols / 2;
        if (Math.abs(c - mid) <= (rows - r)) {
          color = availableColors[(r + c) % availableColors.length];
        }
      } else if (patternType === 'stripes') {
        color = availableColors[r % availableColors.length];
      } else if (patternType === 'checker') {
        color = availableColors[(r + c) % availableColors.length];
      } else if (patternType === 'curtain') {
        if (c < 2 || c >= cols - 2 || r < 3) {
          color = availableColors[(r * 3 + c) % availableColors.length];
        }
      } else if (patternType === 'diamond') {
        const mid = Math.floor(cols / 2);
        const dist = Math.abs(c - mid) + Math.abs(r - Math.floor(rows / 2));
        if (dist <= 3) {
          color = availableColors[(r + c) % availableColors.length];
        }
      } else if (patternType === 'rescue_cage') {
        if (r === 2 && (c === 3 || c === 4)) {
          color = null;
        } else {
          color = availableColors[(r + c) % availableColors.length];
        }
      } else {
        color = availableColors[(r + c * 2) % availableColors.length];
      }

      rowBubbles.push(color ? { color, type: 'normal' } : null);
    }
    board.push(rowBubbles);
  }
  return board;
}

export function generateBubbleQueue(colors, length = 35) {
  const queue = [];
  for (let i = 0; i < length; i++) {
    queue.push(colors[Math.floor(Math.random() * colors.length)]);
  }
  return queue;
}

export function getClientLevelConfig(levelNum) {
  const num = Number(levelNum) || 1;
  let difficulty = "tutorial";
  if (num > 35) difficulty = "expert";
  else if (num > 30) difficulty = "hard";
  else if (num > 20) difficulty = "medium";
  else if (num > 10) difficulty = "easy";
  else if (num > 5) difficulty = "beginner";

  const numColors = Math.min(BUBBLE_COLORS.length, 3 + Math.floor(num / 7));
  const activeColors = BUBBLE_COLORS.slice(0, numColors);

  const types = ['classic', 'rescue', 'drop', 'color_hunt', 'limited_shots', 'combo', 'score'];
  const levelType = types[(num - 1) % types.length];

  const patterns = ['stripes', 'checker', 'pyramid', 'inverted_pyramid', 'curtain', 'diamond', 'full', 'rescue_cage'];
  const pattern = patterns[(num * 3) % patterns.length];

  const rows = Math.min(9, 4 + Math.floor(num / 8));
  const shots = Math.max(16, 28 - Math.floor(num / 4));

  const specialCells = {};
  if (num % 4 === 0) {
    specialCells['2,3'] = { type: 'bomb', color: 'bomb' };
  }
  if (num % 5 === 0) {
    specialCells['1,4'] = { type: 'rainbow', color: 'rainbow' };
  }
  if (num % 6 === 0) {
    specialCells['3,2'] = { type: 'lightning', color: 'lightning' };
  }

  let objective = { type: "clear_all", description: "Clear all bubbles on the board!" };
  if (levelType === 'rescue') {
    const rescueCount = 2 + (num % 3);
    objective = { type: "rescue", count: rescueCount, description: `Rescue ${rescueCount} trapped Star Critters!` };
    specialCells['2,2'] = { type: 'rescue', name: 'Star Critter', color: 'rescue' };
    specialCells['3,4'] = { type: 'rescue', name: 'Star Critter', color: 'rescue' };
    if (rescueCount >= 3) specialCells['1,5'] = { type: 'rescue', name: 'Star Critter', color: 'rescue' };
    if (rescueCount >= 4) specialCells['4,1'] = { type: 'rescue', name: 'Star Critter', color: 'rescue' };
  } else if (levelType === 'drop') {
    const dropCount = 6 + (num % 6);
    objective = { type: "drop_count", count: dropCount, description: `Drop at least ${dropCount} floating bubbles!` };
  } else if (levelType === 'color_hunt') {
    const targetColor = activeColors[num % activeColors.length];
    const huntCount = 8 + (num % 5) * 2;
    objective = { type: "color_hunt", color: targetColor, count: huntCount, description: `Pop ${huntCount} ${targetColor.toUpperCase()} bubbles!` };
  } else if (levelType === 'combo') {
    const comboTarget = Math.min(5, 3 + Math.floor(num / 12));
    objective = { type: "combo", count: comboTarget, description: `Perform a consecutive x${comboTarget} Combo streak!` };
  } else if (levelType === 'score') {
    const targetScore = 2000 + num * 350;
    objective = { type: "score", count: targetScore, description: `Reach milestone score of ${targetScore.toLocaleString()} pts!` };
  } else if (levelType === 'limited_shots') {
    objective = { type: "clear_all", description: `Clear all bubbles with limited ${shots} shots!` };
  }

  const baseScore = 1500 + num * 350;

  return {
    id: num,
    levelNumber: num,
    title: `Realm of Spheres - Level ${num}`,
    difficulty,
    type: levelType,
    objective,
    shots,
    colors: activeColors,
    rows,
    targetScore: baseScore,
    starThresholds: [
      Math.floor(baseScore * 0.55),
      baseScore,
      Math.floor(baseScore * 1.4)
    ],
    availableBoosters: ['aimGuide', 'bomb', 'rainbow', 'extraShot', 'shuffle'],
    board: createPatternBoard(pattern, activeColors, rows, specialCells),
    bubbleQueue: generateBubbleQueue(activeColors, shots + 12)
  };
}

export function getAllClientLevels(total = 45) {
  const levels = [];
  for (let i = 1; i <= total; i++) {
    levels.push(getClientLevelConfig(i));
  }
  return levels;
}
