import { getHexNeighbors, getColsInRow } from './collision.js';

// Floating Bubble Detection: Finds all bubbles not anchored to the ceiling (Row 0)
export function findFloatingBubbles(board, maxRows = 12) {
  const visited = new Set();
  const queue = [];

  // 1. Seed queue with all bubbles anchored in row 0 (the ceiling)
  if (board[0]) {
    const colsInRow0 = getColsInRow(0);
    for (let c = 0; c < colsInRow0; c++) {
      if (board[0][c]) {
        queue.push({ r: 0, c });
        visited.add(`0,${c}`);
      }
    }
  }

  // 2. BFS traverse all connected bubbles attached to ceiling
  while (queue.length > 0) {
    const curr = queue.shift();
    const nbrs = getHexNeighbors(curr.r, curr.c, maxRows);

    for (const n of nbrs) {
      const key = `${n.r},${n.c}`;
      if (!visited.has(key) && board[n.r] && board[n.r][n.c]) {
        visited.add(key);
        queue.push({ r: n.r, c: n.c });
      }
    }
  }

  // 3. Any existing bubble on the board NOT visited is floating!
  const floating = [];
  for (let r = 0; r < board.length; r++) {
    const cols = getColsInRow(r);
    for (let c = 0; c < cols; c++) {
      if (board[r] && board[r][c] && !visited.has(`${r},${c}`)) {
        floating.push({
          r,
          c,
          bubble: board[r][c]
        });
      }
    }
  }

  return floating;
}
