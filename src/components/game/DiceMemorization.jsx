import React, { useState } from 'react';
import DiceNet from './DiceNet';
import Dice3D from './Dice3D';
import { motion, AnimatePresence } from 'framer-motion';

export default function DiceMemorization({ faces, playerNum, onReady }) {
  const [folded, setFolded] = useState(false);
  const [showDice, setShowDice] = useState(false);

  const handleFold = () => {
  setFolded(true);
  setShowDice(true);
  onReady(); // diretso tawag, no need delay
};

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {playerNum && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-sm shadow
              ${playerNum === 1 ? 'bg-blue-500' : 'bg-red-500'}`}
          >
            {playerNum}
          </div>
          <h3 className="text-base font-bold text-gray-600 uppercase tracking-widest">
            Player {playerNum}
          </h3>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {!folded ? (
          <motion.div
            key="net"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
          >
            <DiceNet faces={faces} onFold={handleFold} />
          </motion.div>
        ) : (
          showDice && (
            <motion.div
              key="dice3d"
              initial={{ opacity: 0, scale: 0.3, rotateY: 180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="flex flex-col items-center gap-3"
            >
              <Dice3D faces={faces} spinning={true} size={140}   onRollComplete={() => console.log('Dice3D memorization done')} />
              <p className="text-sm text-gray-500 font-medium">Starting game…</p>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}