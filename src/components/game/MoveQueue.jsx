import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, X } from 'lucide-react';

const DIR_ICONS = {
  up: <ArrowUp className="w-4 h-4" />,
  down: <ArrowDown className="w-4 h-4" />,
  left: <ArrowLeft className="w-4 h-4" />,
  right: <ArrowRight className="w-4 h-4" />,
};

const DIR_ARROWS = {
  up: '⬆',
  down: '⬇',
  left: '⬅',
  right: '➡',
};

export default function MoveQueue({
  queue,
  movesLeft,
  onAddMove,
  onExecute,
  onClear,
  disabled,
  executing,
  playerStuck,
  disabledDirs = {},
}) {
  const canAddBase = !disabled && !executing && movesLeft !== null && queue.length < movesLeft && !playerStuck;
  const canAddDir = (dir) => canAddBase && !disabledDirs[dir];
  const canExecute = !disabled && !executing && queue.length > 0 && movesLeft !== null && (queue.length === movesLeft || playerStuck);
  const canClear = !disabled && !executing && queue.length > 0;

  const btnBase = 'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-150 font-medium select-none';
  const activeBtn = `${btnBase} bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 active:scale-95 shadow-sm cursor-pointer`;
  const fadedBtn = `${btnBase} bg-gray-100 text-gray-300 cursor-not-allowed border-2 border-gray-200 opacity-40`;
  const disabledBtn = `${btnBase} bg-gray-100 text-gray-300 cursor-not-allowed border-2 border-gray-200`;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Move slots remaining */}
      {movesLeft !== null && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Plan Moves
          </span>
          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            {queue.length} / {movesLeft}
          </span>
        </div>
      )}

      {/* Queue display */}
      <div className="min-h-[40px] flex items-center gap-1.5 flex-wrap bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
        {queue.length === 0 ? (
          <span className="text-xs text-gray-400">
            {movesLeft === null ? 'Roll dice first...' : 'Queue your moves below'}
          </span>
        ) : (
          queue.map((dir, i) => (
            <span
              key={i}
              className="w-7 h-7 flex items-center justify-center bg-gray-800 text-white rounded-lg text-sm font-bold shadow-sm"
              title={dir}
            >
              {DIR_ARROWS[dir]}
            </span>
          ))
        )}
      </div>

      {/* D-Pad */}
      <div className="grid grid-cols-3 gap-1.5 w-fit mx-auto">
        <div />
        <button
          className={canAddDir('up') ? activeBtn : (canAddBase && disabledDirs['up'] ? fadedBtn : disabledBtn)}
          onClick={() => canAddDir('up') && onAddMove('up')}
          disabled={!canAddDir('up')}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />

        <button
          className={canAddDir('left') ? activeBtn : (canAddBase && disabledDirs['left'] ? fadedBtn : disabledBtn)}
          onClick={() => canAddDir('left') && onAddMove('left')}
          disabled={!canAddDir('left')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
        </div>

        <button
          className={canAddDir('right') ? activeBtn : (canAddBase && disabledDirs['right'] ? fadedBtn : disabledBtn)}
          onClick={() => canAddDir('right') && onAddMove('right')}
          disabled={!canAddDir('right')}
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div />
        <button
          className={canAddDir('down') ? activeBtn : (canAddBase && disabledDirs['down'] ? fadedBtn : disabledBtn)}
          onClick={() => canAddDir('down') && onAddMove('down')}
          disabled={!canAddDir('down')}
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <div />
      </div>

      {/* MOVE / CLEAR buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => canExecute && onExecute()}
          disabled={!canExecute}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all
            ${canExecute
              ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-md active:scale-[0.98] cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          {executing ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              Moving...
            </span>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              MOVE
            </>
          )}
        </button>
        <button
          onClick={() => canClear && onClear()}
          disabled={!canClear}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5
            ${canClear
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-2 border-gray-300 active:scale-[0.98] cursor-pointer'
              : 'bg-gray-100 text-gray-300 border-2 border-gray-200 cursor-not-allowed'
            }`}
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>
    </div>
  );
}