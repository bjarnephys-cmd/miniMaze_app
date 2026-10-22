/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Star, Lock, Play, Compass } from 'lucide-react';
import { LevelData, LevelProgress } from '../types/game';

interface LevelSelectModalProps {
  levels: LevelData[];
  currentLevelId: number;
  progress: Record<number, LevelProgress>;
  onSelectLevel: (id: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  levels,
  currentLevelId,
  progress,
  onSelectLevel,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-left max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Compass className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Select Dungeon Expedition</h2>
              <p className="text-xs text-slate-400">Choose a maze level or test your puzzle mastery</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level Cards List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {levels.map((lvl) => {
            const p = progress[lvl.id] || { unlocked: lvl.id === 1, stars: 0, completed: false, bestTime: 0, bestSteps: 0, highScore: 0 };
            const isUnlocked = p.unlocked || lvl.id === 1;
            const isSelected = lvl.id === currentLevelId;

            return (
              <div
                key={lvl.id}
                className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/30'
                    : isUnlocked
                    ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    : 'bg-slate-950/30 border-slate-900 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-amber-400 font-bold">
                      LEVEL 0{lvl.id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                      {lvl.difficulty}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 line-clamp-1">
                    {lvl.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {lvl.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  {/* Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= p.stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-800 fill-slate-900'
                        }`}
                      />
                    ))}
                  </div>

                  {isUnlocked ? (
                    <button
                      onClick={() => onSelectLevel(lvl.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition active:scale-95 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isSelected ? 'Current' : 'Play'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
