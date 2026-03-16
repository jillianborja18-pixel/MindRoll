import React, { useRef, useEffect } from 'react';
import { ScrollText } from 'lucide-react';

export default function MatchHistory({ logs }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ScrollText className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Match Log</span>
        </div>
        <span className="text-[10px] text-gray-300 font-medium">{logs.length} events</span>
      </div>
      <div
        ref={scrollRef}
        className="max-h-[180px] overflow-y-auto scrollbar-thin p-2 space-y-0.5"
      >
        {logs.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No events yet</p>
        )}
        {logs.map((log, i) => {
          const isRecent = i === logs.length - 1;
          return (
            <div
              key={i}
              className={`text-xs px-2 py-1 rounded-lg leading-relaxed transition-colors
                ${isRecent ? 'bg-gray-100 text-gray-800 font-medium' : 'text-gray-500 bg-transparent'}`}
            >
              {log}
            </div>
          );
        })}
      </div>
    </div>
  );
}