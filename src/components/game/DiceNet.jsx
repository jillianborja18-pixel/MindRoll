// @ts-nocheck
import React, { useState } from 'react';
import { getSymbol } from './GameEngine';

// Cross-shaped planar dice net
// Layout:
//         [TOP]      ← index 0
// [LEFT] [FRONT] [RIGHT]  ← indices 4, 2, 5
//        [BOTTOM]    ← index 1
//         [BACK]     ← index 3

// Two shades per RPS type so players can distinguish each pair
const faceShadeColors = {
  rock: [
    { bg: '#9ca3af', border: '#545a66', label: '#343d4b' },  // Dark Gray
    { bg: '#d1d5db', border: '#858b96', label: '#636975' },  // Light Gray
  ],
  paper: [
    { bg: '#5294df', border: '#166af1', label: '#0f41cc' },  // Blue
    { bg: '#bfdbfe', border: '#6599d3', label: '#3b82f6' },  // Light Blue
  ],
  scissors: [
    { bg: '#c084fc', border: '#8c2de5', label: '#5c19d0' },  // Dark Purple
    { bg: '#e9d5ff', border: '#b269fa', label: '#8722e6' },  // Light Purple
  ],
};

function getFaceColor(faces, index) {
  const symbol = faces[index];
  let count = 0;
  for (let i = 0; i < index; i++) {
    if (faces[i] === symbol) count++;
  }
  const shades = faceShadeColors[symbol];
  return shades ? shades[Math.min(count, shades.length - 1)] : { bg: '#f5f5f5', border: '#d4d4d4', label: '#737373' };
}

function FaceCard({ symbol, label, colors, size = 72 }) {
  const col = colors || { bg: '#f5f5f5', border: '#d4d4d4', label: '#737373' };
  return (
    <div
      style={{
        width: size,
        height: size,
        background: col.bg,
        border: `2px solid ${col.border}`,
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: size * 0.38, lineHeight: 1 }}>{getSymbol(symbol)}</span>
      <span style={{ fontSize: 9, fontWeight: 700, color: col.label, letterSpacing: 1, textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  );
}

export default function DiceNet({ faces, onFold }) {
  // faces = [top, bottom, front, back, left, right]
  const [top, bottom, front, back, left, right] = faces;
  const [folding, setFolding] = useState(false);
  const [done, setDone] = useState(false);

  const handleFold = () => {
    setFolding(true);
    // After fold animation (2.2s), call onFold
    setTimeout(() => {
      setDone(true);
      setTimeout(() => onFold(), 300);
    }, 2200);
  };

  const size = 68;
  const gap = 6;
  const cell = size + gap;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>
        Memorize Your Dice Net
      </h2>
      <p style={{ fontSize: 13, color: '#6b7280', margin: 0, textAlign: 'center', maxWidth: 320 }}>
        The <strong>bottom face</strong> determines your symbol in battle. Study this layout carefully!
      </p>

      {/* Net container */}
      <div
        style={{
          position: 'relative',
          width: cell * 3 + gap,
          height: cell * 4 + gap,
          transition: done ? 'opacity 0.3s' : undefined,
          opacity: done ? 0 : 1,
        }}
      >
        {/* TOP — row 0, col 1 */}
        <div
          style={{
            position: 'absolute',
            left: cell,
            top: 0,
            transformOrigin: 'bottom center',
            transition: folding ? 'transform 0.6s ease-in 0s, opacity 0.6s ease-in 0s' : undefined,
            transform: folding ? 'rotateX(-90deg) translateZ(34px)' : 'rotateX(0deg)',
            opacity: folding ? 0 : 1,
          }}
        >
        <FaceCard symbol={top} label="Top" colors={getFaceColor(faces, 0)} size={size} />
        </div>

        {/* LEFT — row 1, col 0 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: cell,
            transformOrigin: 'right center',
            transition: folding ? 'transform 0.6s ease-in 0.1s, opacity 0.6s ease-in 0.1s' : undefined,
            transform: folding ? 'rotateY(90deg) translateZ(34px)' : 'rotateY(0deg)',
            opacity: folding ? 0 : 1,
          }}
        >
          <FaceCard symbol={left} label="Left" colors={getFaceColor(faces, 4)} size={size} />
        </div>

        {/* FRONT — row 1, col 1 (center) */}
        <div
          style={{
            position: 'absolute',
            left: cell,
            top: cell,
          }}
        >
          <FaceCard symbol={front} label="Front" colors={getFaceColor(faces, 2)} size={size} />
        </div>

        {/* RIGHT — row 1, col 2 */}
        <div
          style={{
            position: 'absolute',
            left: cell * 2,
            top: cell,
            transformOrigin: 'left center',
            transition: folding ? 'transform 0.6s ease-in 0.1s, opacity 0.6s ease-in 0.1s' : undefined,
            transform: folding ? 'rotateY(-90deg) translateZ(34px)' : 'rotateY(0deg)',
            opacity: folding ? 0 : 1,
          }}
        >
          <FaceCard symbol={right} label="Right" colors={getFaceColor(faces, 5)} size={size} />
        </div>

        {/* BOTTOM — row 2, col 1 */}
        <div
          style={{
            position: 'absolute',
            left: cell,
            top: cell * 2,
            transformOrigin: 'top center',
            transition: folding ? 'transform 0.6s ease-in 0.2s, opacity 0.6s ease-in 0.2s' : undefined,
            transform: folding ? 'rotateX(90deg) translateZ(34px)' : 'rotateX(0deg)',
            opacity: folding ? 0 : 1,
          }}
        >
          <div style={{ position: 'relative' }}>
            <FaceCard symbol={bottom} label="Bottom ★" colors={getFaceColor(faces, 1)} size={size} />
            {/* Star badge */}
            <div style={{
              position: 'absolute', top: -6, right: -6,
              background: '#f59e0b', color: '#fff',
              borderRadius: 999, fontSize: 8, fontWeight: 800,
              padding: '2px 5px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              letterSpacing: 0.5,
            }}>KEY</div>
          </div>
        </div>

        {/* BACK — row 3, col 1 */}
        <div
          style={{
            position: 'absolute',
            left: cell,
            top: cell * 3,
            transformOrigin: 'top center',
            transition: folding ? 'transform 0.6s ease-in 0.3s, opacity 0.6s ease-in 0.3s' : undefined,
            transform: folding ? 'rotateX(90deg) translateZ(34px)' : 'rotateX(0deg)',
            opacity: folding ? 0 : 1,
          }}
        >
          <FaceCard symbol={back} label="Back" colors={getFaceColor(faces, 3)} size={size} />
        </div>

        {/* Connector lines */}
        {!folding && (
          <svg
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
          >
            {/* top → front */}
            <line x1={cell + size / 2} y1={size} x2={cell + size / 2} y2={cell} stroke="#d4d4d4" strokeWidth={1.5} strokeDasharray="4 3" />
            {/* left → front */}
            <line x1={size} y1={cell + size / 2} x2={cell} y2={cell + size / 2} stroke="#d4d4d4" strokeWidth={1.5} strokeDasharray="4 3" />
            {/* right → front */}
            <line x1={cell * 2} y1={cell + size / 2} x2={cell * 2 + size} y2={cell + size / 2} stroke="#d4d4d4" strokeWidth={1.5} strokeDasharray="4 3" />
            {/* front → bottom */}
            <line x1={cell + size / 2} y1={cell + size} x2={cell + size / 2} y2={cell * 2} stroke="#d4d4d4" strokeWidth={1.5} strokeDasharray="4 3" />
            {/* bottom → back */}
            <line x1={cell + size / 2} y1={cell * 2 + size} x2={cell + size / 2} y2={cell * 3} stroke="#d4d4d4" strokeWidth={1.5} strokeDasharray="4 3" />
          </svg>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[['rock', '✊', 'Rock', '#e7e5e4'], ['paper', '✋', 'Paper', '#dbeafe'], ['scissors', '✌️', 'Scissors', '#ffe4e6']].map(([key, icon, label, bg]) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: bg, borderRadius: 8, padding: '4px 10px',
            border: '1.5px solid #d4d4d4', fontSize: 12, fontWeight: 600, color: '#374151',
          }}>
            <span>{icon}</span> {label}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        {!folding && (
          <button
            onClick={handleFold}
            style={{
              background: '#111827', color: '#fff',
              border: 'none', borderRadius: 12, padding: '12px 36px',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
              transition: 'background 0.2s, transform 0.1s',
              letterSpacing: 0.5,
            }}
            onMouseOver={e => e.target.style.background = '#1f2937'}
            onMouseOut={e => e.target.style.background = '#111827'}
          >
            Start Game — Fold Dice ➜
          </button>
        )}
        {folding && !done && (
          <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, letterSpacing: 0.5 }}>
            🎲 Folding dice…
          </div>
        )}
      </div>
    </div>
  );
}