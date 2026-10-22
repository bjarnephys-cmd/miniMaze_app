/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Skull, RotateCcw, List } from 'lucide-react';

interface GameOverModalProps {
  onRetry: () => void;
  onLevelSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  onRetry,
  onLevelSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-slate-900 border border-rose-900/60 rounded-2xl shadow-2xl p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-rose-950/60 border border-rose-700/60 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.3)]">
          <Skull className="w-8 h-8 text-rose-500 animate-pulse" />
        </div>

        <h2 className="text-xl font-bold text-white mb-1">
          Perils of the Vault
        </h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          The dungeon traps overwhelmed your adventurer. Study the rhythm of the spike plates, or disarm them with wall levers before passing!
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={onLevelSelect}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition"
          >
            <List className="w-4 h-4" />
            <span>Levels</span>
          </button>
        </div>
      </div>
    </div>
  );
};
