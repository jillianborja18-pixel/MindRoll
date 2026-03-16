import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Home, HelpCircle, Dices } from 'lucide-react';
import { createPageUrl } from '@/utils';

import {
  createRandomDice, rollDiceForward, rollDiceBackward,
  rollDiceLeft, rollDiceRight, getBottomFace,
  resolveRPS, rollDiceNumber, generateBoard, getSymbol,
  getAIMove, getReplacementTile, SPECIALS
} from '../components/game/GameEngine';

import GameBoard from '../components/game/GameBoard';
import PlayerHUD from '../components/game/PlayerHUD';
import MatchHistory from '../components/game/MatchHistory';
import MoveQueue from '../components/game/MoveQueue';
import BattleAnimation from '../components/game/BattleAnimation';
import SpecialTilesModal from '../components/game/SpecialTilesModal';
import DiceMemorization from '../components/game/DiceMemorization';
import GameOverModal from '../components/game/GameOverModal';
import Dice3D from '../components/game/Dice3D';

// Apply a single direction to dice + position
function applyMove(direction, pos, dice, boardSize) {
  let nr = pos.row, nc = pos.col;
  let newDice = [...dice];
  if (direction === 'up')    { nr--; newDice = rollDiceForward(newDice); }
  if (direction === 'down')  { nr++; newDice = rollDiceBackward(newDice); }
  if (direction === 'left')  { nc--; newDice = rollDiceLeft(newDice); }
  if (direction === 'right') { nc++; newDice = rollDiceRight(newDice); }
  if (nr < 0 || nr >= boardSize || nc < 0 || nc >= boardSize) {
    return null; // invalid
  }
  return { pos: { row: nr, col: nc }, dice: newDice };
}

export default function Game() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode') || 'ai';
  const difficulty = params.get('difficulty') || 'normal';
  const boardSize = difficulty === 'hard' ? 8 : 6;
  const winTarget = difficulty === 'hard' ? 10 : 5;

  // Phases: 'memorize1' | 'memorize2' | 'playing' | 'gameover'
  const [phase, setPhase] = useState(() => {
    if (mode === 'player') return 'memorize1';
    return 'memorize1';
  });
  const [board, setBoard] = useState(() => generateBoard(boardSize));
  const [p1Dice, setP1Dice] = useState(() => createRandomDice());
  const [p2Dice, setP2Dice] = useState(() => createRandomDice());
  const [p1Pos, setP1Pos] = useState({ row: 0, col: 0 });
  const [p2Pos, setP2Pos] = useState({ row: boardSize - 1, col: boardSize - 1 });
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [movesLeft, setMovesLeft] = useState(null);       // null = haven't rolled yet
  const [moveQueue, setMoveQueue] = useState([]);          // queued directions
  const [executing, setExecuting] = useState(false);       // playing out the queue
  const [timer, setTimer] = useState(20);
  const [logs, setLogs] = useState(['⚡ Game started!']);
  const [battle, setBattle] = useState(null);
  const [showSpecialModal, setShowSpecialModal] = useState(false);
  const [winner, setWinner] = useState(null);
  const [p1Locked, setP1Locked] = useState(false);
  const [p2Locked, setP2Locked] = useState(false);
  const [diceRolling, setDiceRolling] = useState(false);
  const [p1HasMoved, setP1HasMoved] = useState(false);
  const [p2HasMoved, setP2HasMoved] = useState(false);
  // For 3D dice animation per move step
  const [rollAnim, setRollAnim] = useState({ active: false, dir: null });
  // Turn label shown above board
  const [turnLabel, setTurnLabel] = useState('');
  // Current dice shown in side panel (tracks animation)
  const [displayDice, setDisplayDice] = useState(null);

  const timerRef = useRef(null);
  const aiRef = useRef(null);
  const battlePendingEndTurn = useRef(false);
  const movesUsedRef = useRef(0);

  const addLog = useCallback((msg) => setLogs(prev => [...prev, msg]), []);

  // Update turn label whenever turn changes
  useEffect(() => {
    if (phase !== 'playing') return;
    if (currentTurn === 1) setTurnLabel('👤 Player 1 Turn');
    else if (mode === 'ai') setTurnLabel('🤖 AI Turn');
    else setTurnLabel('👤 Player 2 Turn');
    setDisplayDice(currentTurn === 1 ? p1Dice : p2Dice);
  }, [currentTurn, phase]);

  // Also sync display dice when dice state updates
  useEffect(() => {
    if (phase === 'playing') {
      setDisplayDice(currentTurn === 1 ? p1Dice : p2Dice);
    }
  }, [p1Dice, p2Dice]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing' || movesLeft === null || battle || executing) return;
    const isAI = mode === 'ai' && currentTurn === 2;
    if (isAI) return; // AI doesn't use player timer
    clearInterval(timerRef.current);
    setTimer(20);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          addLog(`⏱ Player ${currentTurn} timed out`);
          doEndTurn();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, movesLeft, battle, executing, currentTurn]);

  // ── End Turn ───────────────────────────────────────────────────────────────
  const doEndTurn = useCallback(() => {
    clearInterval(timerRef.current);
    setMovesLeft(null);
    setMoveQueue([]);
    setTimer(20);
    setExecuting(false);
    battlePendingEndTurn.current = false;
    movesUsedRef.current = 0;
    if (currentTurn === 1) setP1HasMoved(true); else setP2HasMoved(true);
    setCurrentTurn(prev => {
      const next = prev === 1 ? 2 : 1;
      addLog(`── ${next === 1 ? 'Player 1' : (mode === 'ai' ? 'AI' : 'Player 2')}'s turn ──`);
      return next;
    });
  }, [addLog, mode, currentTurn]);

  // ── Win check ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    if (p1Score >= winTarget) {
      setWinner(1); setPhase('gameover');
      addLog(`🏆 Player 1 wins with ${p1Score} points!`);
    } else if (p2Score >= winTarget) {
      setWinner(2); setPhase('gameover');
      const lbl = mode === 'ai' ? 'AI' : 'Player 2';
      addLog(`🏆 ${lbl} wins with ${p2Score} points!`);
    }
  }, [p1Score, p2Score, phase]);

  // ── Memorization ──────────────────────────────────────────────────────────
  const handleMemoReady = () => {
    if (phase === 'memorize1') {

      if (mode === 'player') {
        setPhase('memorize2');
      } else {
        setPhase('playing');
      }

    } else if (phase === 'memorize2') {

      setPhase('playing');

    }
  };
  // ── Roll Dice ─────────────────────────────────────────────────────────────
  const handleRollDice = useCallback(() => {
    if (movesLeft !== null || phase !== 'playing' || battle || executing) return;

    const locked = currentTurn === 1 ? p1Locked : p2Locked;
    if (locked) {
      const lbl = currentTurn === 1 ? 'Player 1' : (mode === 'ai' ? 'AI' : 'Player 2');
      addLog(`🔒 ${lbl} is locked — skip turn!`);
      if (currentTurn === 1) setP1Locked(false); else setP2Locked(false);
      doEndTurn();
      return;
    }

    setDiceRolling(true);
    setTimeout(() => {
      const moves = rollDiceNumber();
      setMovesLeft(moves);
      setDiceRolling(false);
      movesUsedRef.current = 0;
      const lbl = currentTurn === 1 ? 'Player 1' : (mode === 'ai' ? 'AI' : 'Player 2');
      addLog(`🎲 ${lbl} rolled +${moves} moves`);
    }, 700);
  }, [movesLeft, phase, battle, executing, currentTurn, p1Locked, p2Locked, addLog, doEndTurn, mode]);

  // ── Add move to queue ─────────────────────────────────────────────────────
  const handleAddMove = useCallback((dir) => {
    if (movesLeft === null || executing || battle) return;
    const isFirstTurn = currentTurn === 1 ? !p1HasMoved : !p2HasMoved;
    if (isFirstTurn && dir === 'up') return;
    const startPos = currentTurn === 1 ? { ...p1Pos } : { ...p2Pos };
    const startDice = currentTurn === 1 ? [...p1Dice] : [...p2Dice];

    setMoveQueue(prev => {
      if (prev.length >= movesLeft) return prev;
      let simPos = { ...startPos };
      let simDice = [...startDice];
      for (const qDir of prev) {
        const r = applyMove(qDir, simPos, simDice, boardSize);
        if (r) { simPos = r.pos; simDice = r.dice; }
      }

      const result = applyMove(dir, simPos, simDice, boardSize);
      if (!result) return prev;

      const destTile = board[result.pos.row][result.pos.col];
      if (destTile.type === 'special' && destTile.value === 'lock') return prev;
      return [...prev, dir];
    });
  }, [movesLeft, executing, battle, currentTurn, p1Pos, p2Pos, p1Dice, p2Dice, boardSize, board, p1HasMoved, p2HasMoved]);

  // ── Process tile at landing ───────────────────────────────────────────────
  const processTile = useCallback((playerNum, pos, dice, afterBattleCb) => {
    const tile = board[pos.row][pos.col];

    if (tile.type === 'special') {
      const lbl = playerNum === 1 ? 'Player 1' : (mode === 'ai' ? 'AI' : 'Player 2');
      addLog(`✨ ${lbl} landed on ${tile.value.toUpperCase()}`);
      // Helper to replace the used special tile
      const replaceTile = () => {
        setBoard(prev => {
          const nb = prev.map(row => row.map(t => ({ ...t })));
          nb[pos.row][pos.col] = getReplacementTile();
          return nb;
        });
      };

      if (tile.value === SPECIALS.BONUS) {
        if (playerNum === 1) setP1Score(s => s + 1);
        else setP2Score(s => s + 1);
        addLog('⭐ +1 Bonus point!');
        replaceTile();
      } else if (tile.value === SPECIALS.TRAP) {
        if (playerNum === 1) setP2Locked(true); else setP1Locked(true);
        const oppLabel = playerNum === 1 ? (mode === 'ai' ? 'AI' : 'Player 2') : 'Player 1';
        addLog(`⚠️ ${oppLabel} is trapped and cannot move next turn!`);
        replaceTile();
      } else if (tile.value === SPECIALS.SWAP) {
        setBoard(generateBoard(boardSize));
        addLog('🔀 Board shuffled!');
      } else if (tile.value === SPECIALS.REROLL) {
        replaceTile();
        const extra = rollDiceNumber();
        const newMoves = Math.min(6 - movesUsedRef.current, extra);
        if (newMoves > 0) {
          setMovesLeft(newMoves);
          addLog(`🎲 Reroll! +${newMoves} extra moves`);
          afterBattleCb?.('reroll');
        } else {
          addLog('🎲 Reroll! Max moves (6) already reached.');
          afterBattleCb?.('special');
        }
        return;
      }
      afterBattleCb?.('special');
      return;
    }

    // RPS battle
    const bottom = getBottomFace(dice);
    const tileSymbol = tile.value;
    const result = resolveRPS(bottom, tileSymbol);
    const pts = result === 'win' ? 1 : 0;

    setBattle({ playerSymbol: bottom, tileSymbol, result, playerNum });
    battlePendingEndTurn.current = true;

    if (pts > 0) {
      if (playerNum === 1) setP1Score(s => s + pts);
      else setP2Score(s => s + pts);
    }

    const lbl = playerNum === 1 ? 'Player 1' : (mode === 'ai' ? 'AI' : 'Player 2');
    const ptsStr = pts === 1 ? '+1' : '0';
    addLog(`${getSymbol(bottom)} ${lbl} vs ${getSymbol(tileSymbol)} = ${result.toUpperCase()} (${ptsStr})`);
  }, [board, boardSize, addLog, mode]);

  // ── Execute queue ─────────────────────────────────────────────────────────
  const executeQueue = useCallback((queue, playerNum, startPos, startDice) => {
    if (queue.length === 0) {
      doEndTurn();
      return;
    }
    setExecuting(true);

    let currentPos = { ...startPos };
    let currentDice = [...startDice];
    let stepIndex = 0;

    const stepDelay = 350;

    const doStep = () => {
      if (stepIndex >= queue.length) {
        movesUsedRef.current += queue.length;
        processTile(playerNum, currentPos, currentDice, (specialType) => {
          if (specialType === 'reroll') {
            setExecuting(false);
          } else {
            doEndTurn();
          }
        });
        if (!battlePendingEndTurn.current) {
          doEndTurn();
        }
        return;
      }

      const dir = queue[stepIndex];
      const result = applyMove(dir, currentPos, currentDice, boardSize);

      if (!result) {
        stepIndex++;
        doStep();
        return;
      }

      // Safety: skip lock tiles
      const destTile = board[result.pos.row]?.[result.pos.col];
      if (destTile?.type === 'special' && destTile?.value === 'lock') {
        stepIndex++;
        doStep();
        return;
      }

      currentPos = result.pos;
      currentDice = result.dice;
      stepIndex++;

      setRollAnim({ active: true, dir });

      if (playerNum === 1) {
        setP1Pos({ ...currentPos });
        setP1Dice([...currentDice]);
      } else {
        setP2Pos({ ...currentPos });
        setP2Dice([...currentDice]);
      }
      setDisplayDice([...currentDice]);

      setTimeout(() => {
        setRollAnim({ active: false, dir: null });
        setTimeout(doStep, 80);
      }, stepDelay);
    };

    doStep();
  }, [boardSize, board, processTile, doEndTurn]);

  // ── Per-direction disabled state for D-pad ──────────────────────────────
  const disabledDirs = useMemo(() => {
    const dirs = { up: true, down: true, left: true, right: true };
    if (movesLeft === null || executing || battle || moveQueue.length >= movesLeft) return dirs;

    const isFirstTurn = currentTurn === 1 ? !p1HasMoved : !p2HasMoved;
    const startPos = currentTurn === 1 ? { ...p1Pos } : { ...p2Pos };
    const startDice = currentTurn === 1 ? [...p1Dice] : [...p2Dice];

    let simPos = { ...startPos };
    let simDice = [...startDice];
    for (const qDir of moveQueue) {
      const r = applyMove(qDir, simPos, simDice, boardSize);
      if (r) { simPos = r.pos; simDice = r.dice; }
    }

    for (const dir of ['up', 'down', 'left', 'right']) {
      if (isFirstTurn && dir === 'up') continue;
      const r = applyMove(dir, simPos, simDice, boardSize);
      if (!r) continue;
      const t = board[r.pos.row][r.pos.col];
      if (t.type === 'special' && t.value === 'lock') continue;
      dirs[dir] = false;
    }

    return dirs;
  }, [movesLeft, executing, battle, moveQueue, currentTurn, p1Pos, p2Pos, p1Dice, p2Dice, boardSize, board, p1HasMoved, p2HasMoved]);

  // ── Player stuck detection ────────────────────────────────────────────────
  const playerIsStuck = useMemo(() => {
    if (movesLeft === null || executing || battle) return false;
    if (moveQueue.length >= movesLeft) return false;
    const isFirstTurn = currentTurn === 1 ? !p1HasMoved : !p2HasMoved;
    const startPos = currentTurn === 1 ? { ...p1Pos } : { ...p2Pos };
    const startDice = currentTurn === 1 ? [...p1Dice] : [...p2Dice];
    let simPos = { ...startPos };
    let simDice = [...startDice];
    for (const qDir of moveQueue) {
      const r = applyMove(qDir, simPos, simDice, boardSize);
      if (r) { simPos = r.pos; simDice = r.dice; }
    }
    for (const dir of ['up', 'down', 'left', 'right']) {
      if (isFirstTurn && dir === 'up') continue;
      const r = applyMove(dir, simPos, simDice, boardSize);
      if (!r) continue;
      const t = board[r.pos.row][r.pos.col];
      if (t.type === 'special' && t.value === 'lock') continue;
      return false;
    }
    return true;
  }, [movesLeft, executing, battle, moveQueue, currentTurn, p1Pos, p2Pos, p1Dice, p2Dice, boardSize, board, p1HasMoved, p2HasMoved]);

  // ── MOVE button ───────────────────────────────────────────────────────────
  const handleExecuteQueue = useCallback(() => {
    if (moveQueue.length === 0 || executing || battle) return;
    if (moveQueue.length < movesLeft && !playerIsStuck) return;
    const playerNum = currentTurn;
    const pos = currentTurn === 1 ? { ...p1Pos } : { ...p2Pos };
    const dice = currentTurn === 1 ? [...p1Dice] : [...p2Dice];
    setMoveQueue([]);
    executeQueue(moveQueue, playerNum, pos, dice);
  }, [moveQueue, executing, battle, currentTurn, p1Pos, p2Pos, p1Dice, p2Dice, executeQueue, movesLeft, playerIsStuck]);

  // ── Battle complete ───────────────────────────────────────────────────────
  const handleBattleComplete = useCallback(() => {
    setBattle(null);
    battlePendingEndTurn.current = false;
    doEndTurn();
  }, [doEndTurn]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (phase !== 'playing') return;
      const isAI = mode === 'ai' && currentTurn === 2;
      if (isAI || executing || battle) return;

      switch (e.key) {
        case 'ArrowUp':    e.preventDefault(); handleAddMove('up');    break;
        case 'ArrowDown':  e.preventDefault(); handleAddMove('down');  break;
        case 'ArrowLeft':  e.preventDefault(); handleAddMove('left');  break;
        case 'ArrowRight': e.preventDefault(); handleAddMove('right'); break;
        case ' ':          e.preventDefault(); handleRollDice();       break;
        case 'Enter':      e.preventDefault(); handleExecuteQueue();   break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, currentTurn, mode, executing, battle, handleAddMove, handleRollDice, handleExecuteQueue]);

  // ── AI Turn ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing' || mode !== 'ai' || currentTurn !== 2) return;
    if (executing || battle) return;

    if (movesLeft === null) {
      aiRef.current = setTimeout(() => {
        addLog('🤖 AI is thinking…');
        handleRollDice();
      }, 900);
      return () => clearTimeout(aiRef.current);
    }

    if (movesLeft > 0 && !executing) {
      aiRef.current = setTimeout(() => {
        const startPos = { row: p2Pos.row, col: p2Pos.col };
        const startDice = [...p2Dice];
        let tempPos = { ...startPos };
        let tempDice = [...startDice];
        const aiQueue = [];

        for (let i = 0; i < movesLeft; i++) {
          const dir = getAIMove(tempPos, board, difficulty, movesLeft - i, { blockUp: !p2HasMoved && i === 0 });
          if (!dir) break;
          const result = applyMove(dir, tempPos, tempDice, boardSize);
          if (!result) break;
          aiQueue.push(dir);
          tempPos = result.pos;
          tempDice = result.dice;
        }

        if (aiQueue.length === 0) {
          addLog('🤖 AI cannot move, skipping…');
          doEndTurn();
          return;
        }

        const arrowMap = { up: '⬆', down: '⬇', left: '⬅', right: '➡' };
        addLog(`🤖 AI moving: ${aiQueue.map(d => arrowMap[d]).join(' ')}`);
        setTimeout(() => {
          executeQueue(aiQueue, 2, startPos, startDice);
        }, 400);
      }, 900);
      return () => clearTimeout(aiRef.current);
    }
  }, [phase, mode, currentTurn, movesLeft, executing, battle, p2HasMoved]);

  // ── Restart ───────────────────────────────────────────────────────────────
  const handleRestart = () => {
    window.location.href = createPageUrl('Game') + `?mode=${mode}&difficulty=${difficulty}`;
  };

  // ── Render: Memorization ──────────────────────────────────────────────────
  if (phase === 'memorize1') {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-4">
        <DiceMemorization
          faces={p1Dice}
          playerNum={1}
          onReady={handleMemoReady}
        />
      </div>
    );
  }
  if (phase === 'memorize2') {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-4">
        <DiceMemorization
          faces={p2Dice}
          playerNum={mode === 'ai' ? 'AI' : 2}
          onReady={handleMemoReady}
        />
      </div>
    );
  }
  const isAITurn = mode === 'ai' && currentTurn === 2;
  const canRoll = movesLeft === null && !battle && !executing && !isAITurn && phase === 'playing';

  const shownDice = displayDice || (currentTurn === 1 ? p1Dice : p2Dice);

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 md:p-4">
      <div className="max-w-5xl mx-auto">

        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>
          <div className="flex flex-col items-center">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {difficulty} · {mode === 'ai' ? 'VS AI' : 'VS Player'}
            </div>
            <div className={`text-sm font-black tracking-wide mt-0.5 
              ${currentTurn === 1 ? 'text-blue-600' : 'text-red-500'}`}>
              {turnLabel || (currentTurn === 1 ? '👤 Player 1 Turn' : (mode === 'ai' ? '🤖 AI Turn' : '👤 Player 2 Turn'))}
            </div>
          </div>
          <div className="w-16" />
        </div>

        {/* ── HUD ── */}
        <div className="mb-3">
          <PlayerHUD
            player1Score={p1Score}
            player2Score={p2Score}
            currentTurn={currentTurn}
            timer={timer}
            movesLeft={movesLeft}
            winTarget={winTarget}
            mode={mode}
          />
        </div>

        {/* ── Main Layout ── */}
        <div className="flex flex-col lg:flex-row gap-3">

          {/* Board */}
          <div className="flex-1 flex justify-center items-start">
            <GameBoard
              board={board}
              player1Pos={p1Pos}
              player2Pos={p2Pos}
              boardSize={boardSize}
            />
          </div>

          {/* Side Panel */}
          <div className="lg:w-72 space-y-3">

            {/* Dice + Roll button */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <
// @ts-ignore
                  Dice3D
                    faces={shownDice}
                    spinning={diceRolling}
                    rolling={rollAnim.active}
                    rollDir={rollAnim.dir}
                    size={80}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {isAITurn ? '🤖 AI Dice' : `Player ${currentTurn} Dice`}
                  </div>
                  <button
                    onClick={handleRollDice}
                    disabled={!canRoll}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all
                      ${canRoll
                        ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-md active:scale-[0.98] cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <Dices className="w-4 h-4" />
                    {diceRolling ? 'Rolling…' : movesLeft !== null ? `+${movesLeft} moves` : 'Roll Dice'}
                  </button>
                  {movesLeft !== null && (
                    <div className="text-center">
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                        {moveQueue.length}/{movesLeft} queued
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Move Queue / D-Pad */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-3 shadow-sm">
            <MoveQueue
                queue={moveQueue}
                movesLeft={movesLeft}
                onAddMove={handleAddMove}
                onExecute={handleExecuteQueue}
                onClear={() => setMoveQueue([])}
                disabled={isAITurn || movesLeft === null || battle !== null}
                executing={executing}
                playerStuck={playerIsStuck}
                disabledDirs={disabledDirs}
              />
            </div>

            {/* Match Log */}
            <MatchHistory logs={logs} />

            {/* Special Tiles */}
            <button
              onClick={() => setShowSpecialModal(true)}
              className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-700 bg-white/60 rounded-xl py-2 border border-gray-200 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Special Tiles Guide
            </button>
          </div>
        </div>
      </div>

      {/* Battle Animation */}
      <BattleAnimation battle={battle} onComplete={handleBattleComplete} />

      {/* Special Tiles Modal */}
      <SpecialTilesModal open={showSpecialModal} onClose={() => setShowSpecialModal(false)} />

      {/* Game Over */}
      {phase === 'gameover' && winner && (
        <GameOverModal
          winner={winner}
          p1Score={p1Score}
          p2Score={p2Score}
          mode={mode}
          onRestart={handleRestart}
          onHome={() => navigate(createPageUrl('Home'))}
        />
      )}
    </div>
  );
}
