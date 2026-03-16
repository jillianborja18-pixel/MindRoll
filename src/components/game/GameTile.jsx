import React from 'react';
import { getSymbol, getTileColor } from './GameEngine';

export default function GameTile({ tile, hasPlayer1, hasPlayer2, size = 'normal' }) {
  const isSmall = size === 'small';
  const tileColor = getTileColor(tile);
  const fontSize = isSmall ? '0.85rem' : '1.1rem';
  const dim = isSmall ? 46 : 56;

  return (
    <div
      style={{
        width: dim,
        height: dim,
        fontSize,
        position: 'relative',
        flexShrink: 0,
      }}
      className={`rounded-xl border-2 flex items-center justify-center transition-all duration-150 select-none
        ${tileColor}
        ${(hasPlayer1 || hasPlayer2) ? 'ring-2 ring-offset-1 ring-gray-700 scale-105 z-10' : 'hover:scale-[1.03]'}
      `}
    >
      <span style={{ lineHeight: 1 }}>{getSymbol(tile.value)}</span>

      {/* Player 1 token */}
      {hasPlayer1 && (
        <div className="absolute -top-2 -left-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center z-20">
          <span className="text-[8px] font-black text-white">1</span>
        </div>
      )}
      {/* Player 2 token */}
      {hasPlayer2 && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center z-20">
          <span className="text-[8px] font-black text-white">2</span>
        </div>
      )}
    </div>
  );
}