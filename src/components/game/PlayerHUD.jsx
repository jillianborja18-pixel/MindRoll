import React from 'react';
import { Timer, Footprints } from 'lucide-react';

export default function PlayerHUD({
  player1Score,
  player2Score,
  currentTurn,
  timer,
  movesLeft,
  winTarget,
  mode
}) {
  return (
    <div className="flex items-center justify-between gap-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 px-3 py-2.5 shadow-sm">

      {/* Player 1 */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200
        ${currentTurn === 1 ? 'bg-blue-100 ring-2 ring-blue-400 shadow-sm' : 'bg-gray-50'}`}>
        <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-[10px] font-black text-white">P1</span>
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Player 1</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-black ${player1Score < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {player1Score}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">/{winTarget}</span>
          </div>
        </div>
        {currentTurn === 1 && (
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        )}
      </div>

      {/* Center */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-lg
            ${timer <= 5 ? 'bg-red-100' : 'bg-gray-100'}`}>
            <Timer className={`w-3.5 h-3.5 ${timer <= 5 ? 'text-red-500' : 'text-gray-500'}`} />
            <span className={`font-mono font-bold text-sm tabular-nums ${timer <= 5 ? 'text-red-600' : 'text-gray-700'}`}>
              {String(timer).padStart(2, '0')}s
            </span>
          </div>
          {movesLeft !== null && (
            <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">
              <Footprints className="w-3.5 h-3.5" />
              <span className="text-sm font-bold">+{movesLeft}</span>
            </div>
          )}
        </div>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">VS</span>
      </div>

      {/* Player 2 / AI */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200
        ${currentTurn === 2 ? 'bg-red-100 ring-2 ring-red-400 shadow-sm' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-end leading-none">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            {mode === 'ai' ? 'AI' : 'Player 2'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] text-gray-400 font-medium">/{winTarget}</span>
            <span className={`text-xl font-black ${player2Score < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {player2Score}
            </span>
          </div>
        </div>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm
          ${mode === 'ai' ? 'bg-gray-700' : 'bg-red-500'}`}>
          <span className="text-[10px] font-black text-white">{mode === 'ai' ? 'AI' : 'P2'}</span>
        </div>
        {currentTurn === 2 && (
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        )}
      </div>
    </div>
  );
}
