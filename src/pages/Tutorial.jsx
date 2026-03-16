import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Dices, Target, Zap, Clock, Star } from 'lucide-react';
import { createPageUrl } from '@/utils';

const sections = [
  {
    icon: Dices,
    title: 'Dice Mechanics',
    color: 'bg-blue-100 text-blue-600',
    items: [
      'Your dice has 6 faces: 2 Rock ✊, 2 Paper ✋, 2 Scissors ✌️',
      'Faces are randomly assigned each game — memorize them!',
      'Rolling in any direction rotates the dice realistically',
      'The BOTTOM face determines your symbol in battle',
    ],
  },
  {
    icon: Target,
    title: 'Movement & Turns',
    color: 'bg-green-100 text-green-600',
    items: [
      'Press "Roll Dice" or Spacebar to roll (gives 3–5 moves)',
      'Use Arrow keys or on-screen buttons to move',
      'Each turn has a 20-second timer',
      'If time runs out, your turn ends automatically',
    ],
  },
  {
    icon: Zap,
    title: 'RPS Battle',
    color: 'bg-amber-100 text-amber-600',
    items: [
      'Landing on a tile triggers Rock-Paper-Scissors',
      'Your bottom dice face vs. the tile symbol',
      'Win = +1 point · Draw = 0 · Lose = 0',
      'Normal: First to 5 wins · Hard: First to 10 wins',
    ],
  },
  {
    icon: Star,
    title: 'Special Tiles',
    color: 'bg-purple-100 text-purple-600',
    items: [
      '🔀 SWAP (Yellow) — Randomizes the board',
      '⚠️ TRAP (Red) — No penalty',
      '🔒 LOCK (Gray) — Skip next turn',
      '⭐ BONUS (Green) — Gain +1 point',
      '🎲 REROLL (Orange) — Roll dice again',
    ],
  },
];

export default function Tutorial() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(createPageUrl('Home'))}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Game Rules</h1>
        <p className="text-gray-500 mb-8">Learn how to play Mind Roll: Rock Paper Scissors</p>

        <div className="space-y-5">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.color}`}>
                  <section.icon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
              </div>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}