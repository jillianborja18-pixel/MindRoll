// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Dices, Heart } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-4">
      <div className="max-w-lg w-full animate-slide-up">
        <button
          onClick={() => navigate(createPageUrl('Home'))}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Dices className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Mind Roll</h1>
          <p className="text-gray-500 text-sm mb-6">Rock Paper Scissors Strategy Board Game</p>

          <div className="space-y-4 text-sm text-gray-600 leading-relaxed text-left">
            <p>
              <strong>Mind Roll</strong> is a strategic board game that combines the classic Rock-Paper-Scissors 
              with dice mechanics and board movement. Players must memorize their dice faces and 
              strategically navigate the board to outscore their opponent.
            </p>
            <p>
              The game features two modes — VS AI and VS Player (same device) — and two difficulty 
              levels with different board sizes and win conditions.
            </p>
            <p>
              Special tiles add an extra layer of strategy: swap the board, gain bonus points, 
              reroll your dice, or get locked for a turn.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for strategy game lovers
            </p>
            <p className="text-xs text-gray-400 mt-1">Version 1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
