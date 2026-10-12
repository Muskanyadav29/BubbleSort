// Hexagonal close-packed grid coordinate conversions & Collision physics

export const BOARD_WIDTH = 400;
export const BOARD_HEIGHT = 620;
export const BUBBLE_RADIUS = 22;
export const ROW_HEIGHT = Math.floor(BUBBLE_RADIUS * Math.sqrt(3)); // ~38px
export const CEILING_Y = 32;

export function getColsInRow(row) {
  return (row % 2 === 0) ? 8 : 7;
}

export function getCellCenter(row, col) {
  const cols = getColsInRow(row);
  const totalRowWidth = (8 * BUBBLE_RADIUS * 2);
  const marginX = (BOARD_WIDTH - totalRowWidth) / 2 + BUBBLE_RADIUS;
  const x = (row % 2 === 0)
    ? marginX + col * (BUBBLE_RADIUS * 2)
    : marginX + BUBBLE_RADIUS + col * (BUBBLE_RADIUS * 2);
  const y = CEILING_Y + row * ROW_HEIGHT;
  return { x, y };
}

export function getHexNeighbors(row, col, maxRows = 12) {
  const neighbors = [];
  const isEven = (row % 2 === 0);

  // Left and Right
  const colsInThisRow = getColsInRow(row);
  if (col > 0) neighbors.push({ r: row, c: col - 1 });
  if (col < colsInThisRow - 1) neighbors.push({ r: row, c: col + 1 });

  // Above
  if (row > 0) {
    const colsAbove = getColsInRow(row - 1);
    const leftC = isEven ? col - 1 : col;
    const rightC = isEven ? col : col + 1;
    if (leftC >= 0 && leftC < colsAbove) neighbors.push({ r: row - 1, c: leftC });
    if (rightC >= 0 && rightC < colsAbove) neighbors.push({ r: row - 1, c: rightC });
  }

  // Below
  if (row < maxRows - 1) {
    const colsBelow = getColsInRow(row + 1);
    const leftC = isEven ? col - 1 : col;
    const rightC = isEven ? col : col + 1;
    if (leftC >= 0 && leftC < colsBelow) neighbors.push({ r: row + 1, c: leftC });
    if (rightC >= 0 && rightC < colsBelow) neighbors.push({ r: row + 1, c: rightC });
  }

  return neighbors;
}

// Find closest valid empty cell on the board when moving bubble hits ceiling or another bubble
export function findNearestGridCell(x, y, board, maxRows = 12) {
  let bestCell = null;
  let minDistance = Infinity;

  for (let r = 0; r < maxRows; r++) {
    const cols = getColsInRow(r);
    for (let c = 0; c < cols; c++) {
      // Must be empty
      if (board[r] && board[r][c]) continue;

      // Must be adjacent to an existing bubble OR be in top ceiling row
      const neighbors = getHexNeighbors(r, c, maxRows);
      const isTopRow = (r === 0);
      const hasAdjacentBubble = neighbors.some(n => board[n.r] && board[n.r][n.c]);

      if (isTopRow || hasAdjacentBubble) {
        const center = getCellCenter(r, c);
        const dist = Math.hypot(x - center.x, y - center.y);
        if (dist < minDistance) {
          minDistance = dist;
          bestCell = { r, c, ...center };
        }
      }
    }
  }

  return bestCell;
}

// Check collision against board bubbles
export function checkBubbleCollision(bulletX, bulletY, board, maxRows = 12) {
  for (let r = 0; r < board.length; r++) {
    const cols = getColsInRow(r);
    for (let c = 0; c < cols; c++) {
      const bubble = board[r] && board[r][c];
      if (!bubble) continue;

      const center = getCellCenter(r, c);
      const dist = Math.hypot(bulletX - center.x, bulletY - center.y);
      if (dist < BUBBLE_RADIUS * 1.85) {
        return { collided: true, hitBubble: bubble, hitRow: r, hitCol: c };
      }
    }
  }
  return { collided: false };
}
