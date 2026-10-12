// Data-driven 40+ Level Configurations for Bubble Blast Adventure

export const BUBBLE_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];

// Helper to generate patterned hex grid layouts
// Offset grid: Row 0 has 8 bubbles, Row 1 has 7 bubbles, Row 2 has 8, etc.
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
        // Surround center
        if (r === 2 && (c === 3 || c === 4)) {
          color = null; // empty around rescue
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

const levelTemplates = [
  // Levels 1 - 5 (Tutorial)
  {
    levelNumber: 1,
    title: "First Aim",
    difficulty: "tutorial",
    type: "classic",
    objective: { type: "clear_all", description: "Match colors and pop all bubbles!" },
    shots: 26,
    colors: ['red', 'blue', 'green'],
    rows: 4,
    pattern: 'stripes',
    targetScore: 600,
    starThresholds: [400, 600, 900],
    availableBoosters: ['aimGuide', 'extraShot'],
    tutorialHint: "Drag or aim with mouse and click to shoot. Connect 3 of the same color to pop!"
  },
  {
    levelNumber: 2,
    title: "Wall Ricochet",
    difficulty: "tutorial",
    type: "classic",
    objective: { type: "clear_all", description: "Use wall bounces to clear tricky spots!" },
    shots: 24,
    colors: ['red', 'blue', 'yellow'],
    rows: 5,
    pattern: 'checker',
    targetScore: 800,
    starThresholds: [500, 800, 1200],
    availableBoosters: ['aimGuide', 'extraShot'],
    tutorialHint: "Bounce bubbles off the side walls to hit covered bubbles!"
  },
  {
    levelNumber: 3,
    title: "Floating Drop",
    difficulty: "tutorial",
    type: "drop",
    objective: { type: "drop_count", count: 6, description: "Drop 6 or more unsupported bubbles!" },
    shots: 22,
    colors: ['red', 'green', 'yellow'],
    rows: 5,
    pattern: 'curtain',
    targetScore: 1000,
    starThresholds: [600, 1000, 1500],
    availableBoosters: ['aimGuide', 'extraShot', 'bomb'],
    tutorialHint: "Popping bubbles that support lower ones will make the floating bubbles fall for big bonuses!"
  },
  {
    levelNumber: 4,
    title: "Dragon Rescue Mission",
    difficulty: "tutorial",
    type: "rescue",
    objective: { type: "rescue", count: 2, description: "Rescue 2 cute Baby Star Critters!" },
    shots: 24,
    colors: ['blue', 'green', 'purple'],
    rows: 6,
    pattern: 'rescue_cage',
    targetScore: 1200,
    starThresholds: [700, 1200, 1800],
    availableBoosters: ['aimGuide', 'bomb', 'extraShot'],
    specialCells: {
      '2,3': { type: 'rescue', name: 'Baby Sprite', color: 'rescue' },
      '3,2': { type: 'rescue', name: 'Baby Sprite', color: 'rescue' }
    },
    tutorialHint: "Clear bubbles surrounding the trapped critters to set them free!"
  },
  {
    levelNumber: 5,
    title: "Rainbow Magic",
    difficulty: "tutorial",
    type: "combo",
    objective: { type: "combo", count: 3, description: "Achieve a x3 Combo streak!" },
    shots: 25,
    colors: ['red', 'blue', 'green', 'yellow'],
    rows: 5,
    pattern: 'diamond',
    targetScore: 1500,
    starThresholds: [900, 1500, 2200],
    availableBoosters: ['rainbow', 'extraShot'],
    specialCells: {
      '1,3': { type: 'rainbow', color: 'rainbow' }
    },
    tutorialHint: "Make consecutive successful matches to boost your combo multiplier!"
  },

  // Levels 6 - 10 (Beginner)
  {
    levelNumber: 6,
    title: "Citrus Grove",
    difficulty: "beginner",
    type: "color_hunt",
    objective: { type: "color_hunt", color: "orange", count: 8, description: "Pop 8 Orange bubbles!" },
    shots: 22,
    colors: ['red', 'orange', 'yellow', 'green'],
    rows: 6,
    pattern: 'full',
    targetScore: 1800,
    starThresholds: [1100, 1800, 2500],
    availableBoosters: ['aimGuide', 'bomb', 'extraShot', 'rainbow']
  },
  {
    levelNumber: 7,
    title: "Bomb Squad",
    difficulty: "beginner",
    type: "classic",
    objective: { type: "clear_all", description: "Use explosive bomb bubbles to clear the cluster!" },
    shots: 20,
    colors: ['blue', 'yellow', 'purple', 'red'],
    rows: 6,
    pattern: 'pyramid',
    targetScore: 2000,
    starThresholds: [1200, 2000, 2800],
    specialCells: {
      '2,3': { type: 'bomb', color: 'bomb' },
      '4,4': { type: 'bomb', color: 'bomb' }
    },
    availableBoosters: ['bomb', 'extraShot']
  },
  {
    levelNumber: 8,
    title: "Double Sanctuary",
    difficulty: "beginner",
    type: "rescue",
    objective: { type: "rescue", count: 3, description: "Rescue 3 Star Sprites!" },
    shots: 23,
    colors: ['green', 'yellow', 'purple', 'orange'],
    rows: 6,
    pattern: 'rescue_cage',
    targetScore: 2200,
    starThresholds: [1300, 2200, 3100],
    specialCells: {
      '1,2': { type: 'rescue', name: 'Star Sprite', color: 'rescue' },
      '2,4': { type: 'rescue', name: 'Star Sprite', color: 'rescue' },
      '4,2': { type: 'rescue', name: 'Star Sprite', color: 'rescue' }
    },
    availableBoosters: ['aimGuide', 'rainbow', 'extraShot']
  },
  {
    levelNumber: 9,
    title: "Precision Strike",
    difficulty: "beginner",
    type: "limited_shots",
    objective: { type: "clear_all", description: "Clear the board with strictly limited shots!" },
    shots: 16,
    colors: ['red', 'blue', 'green'],
    rows: 5,
    pattern: 'curtain',
    targetScore: 2400,
    starThresholds: [1400, 2400, 3200],
    availableBoosters: ['aimGuide', 'extraShot']
  },
  {
    levelNumber: 10,
    title: "Score Maestro",
    difficulty: "beginner",
    type: "score",
    objective: { type: "score", count: 3000, description: "Reach a score of 3,000 points!" },
    shots: 24,
    colors: ['red', 'blue', 'yellow', 'purple', 'green'],
    rows: 6,
    pattern: 'checker',
    targetScore: 3000,
    starThresholds: [2000, 3000, 4200],
    availableBoosters: ['aimGuide', 'bomb', 'rainbow', 'extraShot']
  }
];

// Helper to systematically generate levels 11 through 40+ with diverse difficulties and types
export function getLevelConfig(levelNum) {
  if (levelNum <= levelTemplates.length) {
    const tpl = levelTemplates[levelNum - 1];
    return {
      ...tpl,
      id: tpl.levelNumber,
      board: createPatternBoard(tpl.pattern, tpl.colors, tpl.rows, tpl.specialCells || {}),
      bubbleQueue: generateBubbleQueue(tpl.colors, tpl.shots + 10)
    };
  }

  // Generate levels 11 to 40 and beyond algorithmically
  let difficulty = "easy";
  if (levelNum > 35) difficulty = "expert";
  else if (levelNum > 30) difficulty = "hard";
  else if (levelNum > 20) difficulty = "medium";
  else if (levelNum > 10) difficulty = "easy";

  const numColors = Math.min(BUBBLE_COLORS.length, 3 + Math.floor(levelNum / 8));
  const activeColors = BUBBLE_COLORS.slice(0, numColors);

  const types = ['classic', 'rescue', 'drop', 'color_hunt', 'limited_shots', 'combo', 'score'];
  const levelType = types[(levelNum - 1) % types.length];

  const patterns = ['pyramid', 'inverted_pyramid', 'stripes', 'checker', 'curtain', 'diamond', 'full'];
  const pattern = patterns[(levelNum * 3) % patterns.length];

  const rows = Math.min(9, 5 + Math.floor(levelNum / 10));
  const shots = Math.max(15, 28 - Math.floor(levelNum / 4));

  const specialCells = {};
  if (levelNum % 4 === 0) {
    specialCells['2,3'] = { type: 'bomb', color: 'bomb' };
  }
  if (levelNum % 5 === 0) {
    specialCells['1,4'] = { type: 'rainbow', color: 'rainbow' };
  }
  if (levelNum % 7 === 0) {
    specialCells['3,2'] = { type: 'lightning', color: 'lightning' };
  }

  let objective = { type: "clear_all", description: "Clear all bubbles on the board!" };
  if (levelType === 'rescue') {
    const rescueCount = 2 + (levelNum % 3);
    objective = { type: "rescue", count: rescueCount, description: `Rescue ${rescueCount} trapped Star Critters!` };
    specialCells['2,2'] = { type: 'rescue', name: 'Star Critter', color: 'rescue' };
    specialCells['3,4'] = { type: 'rescue', name: 'Star Critter', color: 'rescue' };
    if (rescueCount >= 3) specialCells['1,5'] = { type: 'rescue', name: 'Star Critter', color: 'rescue' };
    if (rescueCount >= 4) specialCells['4,1'] = { type: 'rescue', name: 'Star Critter', color: 'rescue' };
  } else if (levelType === 'drop') {
    const dropCount = 6 + (levelNum % 6);
    objective = { type: "drop_count", count: dropCount, description: `Drop at least ${dropCount} floating bubbles!` };
  } else if (levelType === 'color_hunt') {
    const targetColor = activeColors[levelNum % activeColors.length];
    const huntCount = 8 + (levelNum % 5) * 2;
    objective = { type: "color_hunt", color: targetColor, count: huntCount, description: `Pop ${huntCount} ${targetColor.toUpperCase()} bubbles!` };
  } else if (levelType === 'combo') {
    const comboTarget = Math.min(6, 3 + Math.floor(levelNum / 12));
    objective = { type: "combo", count: comboTarget, description: `Perform a consecutive x${comboTarget} Combo streak!` };
  } else if (levelType === 'score') {
    const targetScore = 2000 + levelNum * 350;
    objective = { type: "score", count: targetScore, description: `Reach a milestone score of ${targetScore.toLocaleString()} pts!` };
  } else if (levelType === 'limited_shots') {
    objective = { type: "clear_all", description: `Tactical Rush: Clear all bubbles with only ${shots} shots!` };
  }

  const baseScore = 2000 + levelNum * 400;

  return {
    id: levelNum,
    levelNumber: levelNum,
    title: getLevelTitle(levelNum, levelType),
    difficulty,
    type: levelType,
    objective,
    shots,
    colors: activeColors,
    rows,
    targetScore: baseScore,
    starThresholds: [
      Math.floor(baseScore * 0.6),
      baseScore,
      Math.floor(baseScore * 1.5)
    ],
    availableBoosters: ['aimGuide', 'bomb', 'rainbow', 'extraShot', 'shuffle'],
    board: createPatternBoard(pattern, activeColors, rows, specialCells),
    bubbleQueue: generateBubbleQueue(activeColors, shots + 12)
  };
}

function getLevelTitle(num, type) {
  const titles = [
    "Emerald Canopies", "Sapphire Caverns", "Ruby Foothills", "Amber Horizons",
    "Amethyst Glade", "Topaz Peaks", "Celestial Ridge", "Crystal Cascade",
    "Nebula Orbit", "Starlight Sanctuary", "Cosmic Core", "Solar Flare",
    "Aurora Falls", "Glacier Citadel", "Prism Valley", "Thunder Gorge",
    "Mythic Basin", "Dragon Spire", "Twilight Hollow", "Chrono Labyrinth",
    "Infinity Spiral", "Supernova Reach", "Apex Nexus", "Astral Oasis"
  ];
  return titles[(num - 1) % titles.length] + ` - Part ${Math.floor((num - 1) / titles.length) + 1}`;
}

export function generateBubbleQueue(colors, length = 30) {
  const queue = [];
  for (let i = 0; i < length; i++) {
    queue.push(colors[Math.floor(Math.random() * colors.length)]);
  }
  return queue;
}

// Generate full metadata for all 40+ levels
export function getAllLevelsMetadata(count = 45) {
  const list = [];
  for (let i = 1; i <= count; i++) {
    const cfg = getLevelConfig(i);
    list.push({
      id: cfg.id,
      levelNumber: cfg.levelNumber,
      title: cfg.title,
      difficulty: cfg.difficulty,
      type: cfg.type,
      objective: cfg.objective,
      shots: cfg.shots,
      colors: cfg.colors,
      starThresholds: cfg.starThresholds,
      isPublished: true
    });
  }
  return list;
}
