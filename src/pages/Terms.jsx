// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Shield } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Terms() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleEnter = () => {
    localStorage.setItem('mindroll_terms', 'true');
    navigate(createPageUrl('Home'));
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-4">
      <div className="max-w-lg w-full animate-slide-up">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">
            Mind Roll: Rock Paper Scissors
          </h1>
          <p className="text-center text-gray-500 text-sm mb-6">Terms & Agreement</p>

          <div className="bg-gray-50 rounded-xl p-5 mb-6 max-h-48 overflow-y-auto scrollbar-thin text-sm text-gray-600 leading-relaxed space-y-3">
            <p>Welcome to <strong>Mind Roll: Rock Paper Scissors</strong> — a strategic dice board game.</p>
            <p>By using this application, you agree to the following:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>This game is for entertainment purposes only.</li>
              <li>Fair play is expected at all times. No exploiting bugs or glitches.</li>
              <li>All game results are determined by random dice mechanics and player strategy.</li>
              <li>Player data is stored locally and used only for game functionality.</li>
              <li>The developers reserve the right to update game rules and mechanics.</li>
              <li>Be respectful when playing with others in VS Player mode.</li>
            </ul>
            <p>Enjoy the game and may the best strategist win!</p>
          </div>

          <label className="flex items-center gap-3 mb-6 cursor-pointer group">
            <Checkbox
              checked={agreed}
              onCheckedChange={setAgreed}
              className="data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
              I agree to the terms and conditions
            </span>
          </label>

          <Button
            onClick={handleEnter}
            disabled={!agreed}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl text-sm font-semibold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Enter Game
          </Button>
        </div>
      </div>
    </div>
  );
}