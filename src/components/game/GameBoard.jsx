import React from 'react';
import GameTile from './GameTile';

export default function GameBoard({ board, player1Pos, player2Pos, boardSize }) {
  const isSmall = boardSize === 8;

  return (
    <div
      className="w-full"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
        gap: isSmall ? 4 : 6,
        maxWidth: isSmall ? 440 : 420,
      }}
    >
      {board.map((row, r) =>
        row.map((tile, c) => (
          <GameTile
            key={`${r}-${c}`}
            tile={tile}
            size={isSmall ? 'small' : 'normal'}
            hasPlayer1={player1Pos.row === r && player1Pos.col === c}
            hasPlayer2={player2Pos.row === r && player2Pos.col === c}
          />
        ))
      )}
    </div>
  );
}