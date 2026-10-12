import { getHexNeighbors, getColsInRow } from './collision.js';

// Connected component BFS flood-fill for same-colored bubbles and special bubbles
export function findMatches(board, startR, startC, maxRows = 12) {
  if (!board[startR] || !board[startR][startC]) {
    return { matches: [], isSpecial: false, specialType: null };
  }

  const startBubble = board[startR][startC];

  // 1. Bomb Bubble handling: Radius burst
  if (startBubble.type === 'bomb' || startBubble.color === 'bomb') {
    const burstBubbles = [];
    const queue = [{ r: startR, c: startC, depth: 0 }];
    const visited = new Set([`${startR},${startC}`]);

    while (queue.length > 0) {
      const { r, c, depth } = queue.shift();
      if (board[r] && board[r][c]) {
        burstBubbles.push({ r, c, bubble: board[r][c] });
      }
      if (depth < 2) {
        const nbrs = getHexNeighbors(r, c, maxRows);
        for (const n of nbrs) {
          const key = `${n.r},${n.c}`;
          if (!visited.has(key)) {
            visited.add(key);
            queue.push({ r: n.r, c: n.c, depth: depth + 1 });
          }
        }
      }
    }
    return { matches: burstBubbles, isSpecial: true, specialType: 'bomb' };
  }

  // 2. Lightning Bubble handling: Clears entire horizontal row
  if (startBubble.type === 'lightning' || startBubble.color === 'lightning') {
    const rowMatches = [];
    const cols = getColsInRow(startR);
    for (let c = 0; c < cols; c++) {
      if (board[startR] && board[startR][c]) {
        rowMatches.push({ r: startR, c, bubble: board[startR][c] });
      }
    }
    return { matches: rowMatches, isSpecial: true, specialType: 'lightning' };
  }

  // 3. Rainbow Bubble handling: Match with neighbors of first color found or wild burst
  let targetColor = startBubble.color;
  if (targetColor === 'rainbow') {
    const nbrs = getHexNeighbors(startR, startC, maxRows);
    for (const n of nbrs) {
      if (board[n.r] && board[n.r][n.c] && board[n.r][n.c].color !== 'rainbow') {
        targetColor = board[n.r][n.c].color;
        break;
      }
    }
  }

  // 4. Standard Color BFS Match
  const matches = [];
  const visited = new Set();
  const queue = [{ r: startR, c: startC }];
  visited.add(`${startR},${startC}`);

  while (queue.length > 0) {
    const curr = queue.shift();
    const currBubble = board[curr.r] && board[curr.r][curr.c];
    if (!currBubble) continue;

    matches.push({ r: curr.r, c: curr.c, bubble: currBubble });

    const nbrs = getHexNeighbors(curr.r, curr.c, maxRows);
    for (const n of nbrs) {
      const key = `${n.r},${n.c}`;
      if (!visited.has(key)) {
        const neighborBubble = board[n.r] && board[n.r][n.c];
        if (neighborBubble) {
          // Normal color match or rainbow wild
          if (neighborBubble.color === targetColor || neighborBubble.color === 'rainbow' || targetColor === 'rainbow') {
            visited.add(key);
            queue.push({ r: n.r, c: n.c });
          }
        }
      }
    }
  }

  // A match is successful if >= 3 connected bubbles or special triggered
  const isMatchValid = matches.length >= 3;
  return {
    matches: isMatchValid ? matches : [],
    isSpecial: false,
    specialType: null
  };
}
