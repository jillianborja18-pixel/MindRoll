// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bot, Users, Zap, Flame } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState('opponent'); // 'opponent' | 'difficulty'
  const [mode, setMode] = useState(null);

  const handleModeSelect = (m) => {
    setMode(m);
    setStep('difficulty');
  };

  const handleDifficultySelect = (diff) => {
    navigate(createPageUrl('Game') + `?mode=${mode}&difficulty=${diff}`);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => step === 'difficulty' ? setStep('opponent') : navigate(createPageUrl('Home'))}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <AnimatePresence mode="wait">
          {step === 'opponent' && (
            <motion.div
              key="opponent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Choose Opponent</h2>
              <p className="text-sm text-gray-500 mb-6">Select who you want to play against</p>

              <button
                onClick={() => handleModeSelect('ai')}
                className="w-full bg-white rounded-2xl border-2 border-gray-200 hover:border-gray-400 p-6 text-left transition-all hover:shadow-md group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">VS AI</div>
                    <div className="text-xs text-gray-500">Challenge the computer</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleModeSelect('player')}
                className="w-full bg-white rounded-2xl border-2 border-gray-200 hover:border-gray-400 p-6 text-left transition-all hover:shadow-md group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">VS Player</div>
                    <div className="text-xs text-gray-500">Same device, turn-based</div>
                  </div>
                </div>
              </button>
            </motion.div>
          )}

          {step === 'difficulty' && (
            <motion.div
              key="difficulty"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Select Difficulty</h2>
              <p className="text-sm text-gray-500 mb-6">
                {mode === 'ai' ? 'VS AI' : 'VS Player'} — Choose your challenge level
              </p>

              <button
                onClick={() => handleDifficultySelect('normal')}
                className="w-full bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-400 p-6 text-left transition-all hover:shadow-md group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Normal</div>
                    <div className="text-xs text-gray-500">6×6 board · First to 5 points</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleDifficultySelect('hard')}
                className="w-full bg-white rounded-2xl border-2 border-gray-200 hover:border-red-400 p-6 text-left transition-all hover:shadow-md group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Flame className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Hard</div>
                    <div className="text-xs text-gray-500">8×8 board · First to 10 points</div>
                  </div>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}