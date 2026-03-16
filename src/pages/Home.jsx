// @ts-nocheck
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Gamepad2, BookOpen, Info } from 'lucide-react';
import { createPageUrl } from '@/utils';
import Dice3D from '../components/game/Dice3D';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const accepted = localStorage.getItem('mindroll_terms');
    if (!accepted) {
      navigate(createPageUrl('Terms'));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col items-center justify-center p-4">
      <div className="text-center animate-slide-up">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-1">
          Mind Roll
        </h1>
        <p className="text-lg text-gray-500 font-medium tracking-widest uppercase mb-8">
          Rock Paper Scissors
        </p>

        <div className="animate-float mb-10">
          <Dice3D
            faces={['rock', 'scissors', 'paper', 'rock', 'scissors', 'paper']}
            spinning={true}
            size={220}
          />
        </div>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Button
            onClick={() => navigate(createPageUrl('GameSetup'))}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl text-base font-semibold shadow-lg transition-all active:scale-[0.98]"
          >
            <Gamepad2 className="w-5 h-5 mr-2" />
            Start Game
          </Button>

          <Button
            onClick={() => navigate(createPageUrl('Tutorial'))}
            variant="outline"
            className="w-full border-2 border-gray-300 hover:bg-gray-100 py-4 rounded-xl text-base font-semibold transition-all"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Game Rules
          </Button>

          <Button
            onClick={() => navigate(createPageUrl('About'))}
            variant="ghost"
            className="w-full hover:bg-gray-200 py-4 rounded-xl text-base font-semibold text-gray-600 transition-all"
          >
            <Info className="w-5 h-5 mr-2" />
            About
          </Button>
        </div>
      </div>
    </div>
  );
}