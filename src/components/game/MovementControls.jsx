import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export default function MovementControls({ onMove, disabled }) {
  const btnClass = `w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-150 
    ${disabled 
      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
      : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 active:scale-95 shadow-sm'
    }`;

  return (
    <div className="grid grid-cols-3 gap-1.5 w-fit">
      <div />
      <button className={btnClass} onClick={() => !disabled && onMove('up')} disabled={disabled}>
        <ArrowUp className="w-5 h-5" />
      </button>
      <div />
      <button className={btnClass} onClick={() => !disabled && onMove('left')} disabled={disabled}>
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button className={btnClass} onClick={() => !disabled && onMove('down')} disabled={disabled}>
        <ArrowDown className="w-5 h-5" />
      </button>
      <button className={btnClass} onClick={() => !disabled && onMove('right')} disabled={disabled}>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}