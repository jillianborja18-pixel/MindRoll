// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Home } from 'lucide-react';

export default function GameOverModal({ winner, p1Score, p2Score, mode, onRestart, onHome }) {
  const winnerLabel = winner === 1 ? 'Player 1' : (mode === 'ai' ? 'AI' : 'Player 2');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm w-full mx-4"
      >
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-amber-600" />
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-1">Game Over!</h2>
        <p className="text-lg font-bold text-gray-700 mb-2">
          {winnerLabel} Wins!
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Final Score: {p1Score} — {p2Score}
        </p>

        <div className="flex gap-3">
          <Button
            onClick={onRestart}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-3"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
          <Button
            onClick={onHome}
            variant="outline"
            className="flex-1 border-2 border-gray-300 rounded-xl py-3"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}