// Game Engine - Core logic for the RPS dice board game

const RPS = { ROCK: 'rock', PAPER: 'paper', SCISSORS: 'scissors' };
const SPECIALS = { SWAP: 'swap', TRAP: 'trap', LOCK: 'lock', BONUS: 'bonus', REROLL: 'reroll' };

// Dice face positions: [top, bottom, front, back, left, right]
// Standard dice rotation rules
export function createRandomDice() {
  const faces = [RPS.ROCK, RPS.ROCK, RPS.PAPER, RPS.PAPER, RPS.SCISSORS, RPS.SCISSORS];
  // Shuffle
  for (let i = faces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [faces[i], faces[j]] = [faces[j], faces[i]];
  }
  // [top, bottom, front, back, left, right]
  return faces;
}

export function rollDiceForward(faces) {
  const [top, bottom, front, back, left, right] = faces;
  return [back, front, top, bottom, left, right];
}

export function rollDiceBackward(faces) {
  const [top, bottom, front, back, left, right] = faces;
  return [front, back, bottom, top, left, right];
}

export function rollDiceLeft(faces) {
  const [top, bottom, front, back, left, right] = faces;
  return [right, left, front, back, top, bottom];
}

export function rollDiceRight(faces) {
  const [top, bottom, front, back, left, right] = faces;
  return [left, right, front, back, bottom, top];
}

export function getBottomFace(faces) {
  return faces[1]; // bottom is index 1
}

export function resolveRPS(attacker, defender) {
  if (attacker === defender) return 'draw';
  if (
    (attacker === RPS.ROCK && defender === RPS.SCISSORS) ||
    (attacker === RPS.PAPER && defender === RPS.ROCK) ||
    (attacker === RPS.SCISSORS && defender === RPS.PAPER)
  ) return 'win';
  return 'lose';
}

export function rollDiceNumber() {
  return Math.floor(Math.random() * 4) + 3; // 3-6
}

export function generateBoard(size) {
  const board = [];
  const rpsTypes = [RPS.ROCK, RPS.PAPER, RPS.SCISSORS];
  const allSpecials = [SPECIALS.SWAP, SPECIALS.TRAP, SPECIALS.LOCK, SPECIALS.BONUS, SPECIALS.REROLL];

  // Pick 3-5 random special types for this game
  const shuffled = [...allSpecials].sort(() => Math.random() - 0.5);
  const numSpecials = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5
  const gameSpecials = shuffled.slice(0, numSpecials);

  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      // ~15% chance for special tile
      if (Math.random() < 0.15) {
        const special = gameSpecials[Math.floor(Math.random() * gameSpecials.length)];
        row.push({ type: 'special', value: special });
      } else {
        const rps = rpsTypes[Math.floor(Math.random() * rpsTypes.length)];
        row.push({ type: 'rps', value: rps });
      }
    }
    board.push(row);
  }

  // Ensure at least one of each chosen special type exists on the board
  const existingSpecials = new Set();
  board.forEach(row => row.forEach(t => {
    if (t.type === 'special') existingSpecials.add(t.value);
  }));

  for (const sp of gameSpecials) {
    if (!existingSpecials.has(sp)) {
      let placed = false;
      for (let attempts = 0; attempts < 100 && !placed; attempts++) {
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * size);
        if (board[r][c].type === 'rps') {
          board[r][c] = { type: 'special', value: sp };
          placed = true;
        }
      }
    }
  }

  return board;
}

export function getSymbol(value) {
  switch (value) {
    case 'rock': return '✊';
    case 'paper': return '✋';
    case 'scissors': return '✌️';
    case 'swap': return '🔀';
    case 'trap': return '⚠️';
    case 'lock': return '🔒';
    case 'bonus': return '⭐';
    case 'reroll': return '🎲';
    default: return '?';
  }
}

export function getReplacementTile() {
  const rpsTypes = [RPS.ROCK, RPS.PAPER, RPS.SCISSORS];
  const allSpecials = [SPECIALS.SWAP, SPECIALS.TRAP, SPECIALS.LOCK, SPECIALS.BONUS, SPECIALS.REROLL];
  // 75% RPS, 25% special
  if (Math.random() < 0.75) {
    return { type: 'rps', value: rpsTypes[Math.floor(Math.random() * 3)] };
  }
  return { type: 'special', value: allSpecials[Math.floor(Math.random() * allSpecials.length)] };
}

export function getTileColor(tile) {
  if (tile.type === 'rps') {
    return 'bg-gray-200 border-gray-300';
  }
  switch (tile.value) {
    case 'swap': return 'bg-yellow-200 border-yellow-400';
    case 'trap': return 'bg-red-200 border-red-400';
    case 'lock': return 'bg-gray-300 border-gray-500';
    case 'bonus': return 'bg-green-200 border-green-400';
    case 'reroll': return 'bg-orange-200 border-orange-400';
    default: return 'bg-gray-100';
  }
}

export function getAIMove(aiPos, board, difficulty, movesLeft, options = {}) {
  const size = board.length;
  const directions = ['up', 'down', 'left', 'right'];
  const validMoves = [];

  directions.forEach(dir => {
    if (options.blockUp && dir === 'up') return;
    let nr = aiPos.row, nc = aiPos.col;
    if (dir === 'up') nr--;
    if (dir === 'down') nr++;
    if (dir === 'left') nc--;
    if (dir === 'right') nc++;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
      const tile = board[nr][nc];
      if (tile.type === 'special' && tile.value === 'lock') return;
      validMoves.push({ dir, row: nr, col: nc });
    }
  });

  if (validMoves.length === 0) return null;

  if (difficulty === 'hard') {
    const scored = validMoves.map(m => {
      const tile = board[m.row][m.col];
      let score = 0;
      if (tile.type === 'special') {
        if (tile.value === 'bonus') score += 10;
        if (tile.value === 'reroll') score += 5;
        if (tile.value === 'trap') score -= 3;
      }
      score += Math.random() * 3;
      return { ...m, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored[0].dir;
  }

  return validMoves[Math.floor(Math.random() * validMoves.length)].dir;
}

export { RPS, SPECIALS };