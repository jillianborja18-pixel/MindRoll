// @ts-nocheck
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TILES_INFO = [
  { color: 'bg-yellow-200', emoji: '🔀', name: 'SWAP', desc: 'Shuffles the board when you step on it' },
  { color: 'bg-red-200', emoji: '⚠️', name: 'TRAP', desc: 'Prevents the enemy from moving on their next turn' },
  { color: 'bg-gray-300', emoji: '🔒', name: 'LOCK', desc: 'Blocked — cannot be stepped on' },
  { color: 'bg-green-200', emoji: '⭐', name: 'BONUS', desc: 'Gain +1 point instantly (disappears after use)' },
  { color: 'bg-orange-200', emoji: '🎲', name: 'REROLL', desc: 'Roll the dice again for extra moves (max 6 per turn)' },
];

export default function SpecialTilesModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader className={undefined}>
          <DialogTitle className="text-center">Special Tiles</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {TILES_INFO.map((tile) => (
            <div key={tile.name} className="flex items-center gap-3">
              <div className={`w-10 h-10 ${tile.color} rounded-lg flex items-center justify-center text-lg border`}>
                {tile.emoji}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{tile.name}</div>
                <div className="text-xs text-gray-500">{tile.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
