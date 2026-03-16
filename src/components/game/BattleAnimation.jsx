import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSymbol } from './GameEngine';

export default function BattleAnimation({ battle, onComplete }) {
  const [phase, setPhase] = useState('symbols');

  useEffect(() => {
    if (!battle) return;
    const t1 = setTimeout(() => setPhase('result'), 800);
    const t2 = setTimeout(() => {
      onComplete?.();
    }, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [battle]);

  if (!battle) return null;

  const resultColors = {
    win: 'text-green-500',
    lose: 'text-red-500',
    draw: 'text-yellow-500',
  };
  const resultText = {
    win: 'WIN!',
    lose: 'LOSE',
    draw: 'DRAW',
  };
  const resultPts = {
    win: '+1',
    lose: '0',
    draw: '0',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 shadow-2xl text-center min-w-[300px]"
        >
          <div className="flex items-center justify-center gap-6 mb-4">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-5xl mb-2">{getSymbol(battle.playerSymbol)}</div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Player {battle.playerNum}</div>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-2xl font-bold text-gray-400"
            >
              VS
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-5xl mb-2">{getSymbol(battle.tileSymbol)}</div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Tile</div>
            </motion.div>
          </div>

          {phase === 'result' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`text-3xl font-black ${resultColors[battle.result]}`}
            >
              {resultText[battle.result]}
              <div className={`text-sm font-semibold mt-1 ${battle.result === 'win' ? 'text-green-600' : battle.result === 'lose' ? 'text-red-600' : 'text-gray-500'}`}>
                {resultPts[battle.result]} Point
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}