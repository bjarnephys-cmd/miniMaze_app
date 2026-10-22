/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Trophy, ArrowRight, RotateCcw, List, Sparkles } from 'lucide-react';
import relicImg from '../assets/images/mazequest_ancient_relic_1792673212232.jpg';

interface VictoryModalProps {
  levelId: number;
  levelTitle: string;
  steps: number;
  parSteps: number;
  elapsedSeconds: number;
  parTimeSeconds: number;
  gemsCollected: number;
  totalGems: number;
  score: number;
  stars: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelId,
  levelTitle,
  steps,
  parSteps,
  elapsedSeconds,
  parTimeSeconds,
  gemsCollected,
  totalGems,
  score,
  stars,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onLevelSelect,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 text-center">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/20 blur-2xl rounded-full" />

        {/* Relic / Trophy icon */}
        <div className="relative mx-auto w-20 h-20 mb-3 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
          <img
            src={relicImg}
            alt="Ancient Talisman Relic"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Level {levelId} Cleared!</span>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
          {levelTitle}
        </h2>

        {/* Star Rating */}
        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-8 h-8 transition-transform duration-300 ${
                starIdx <= stars
                  ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                  : 'text-slate-700 fill-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 my-4 bg-slate-950/60 border border-slate-800 rounded-xl text-left">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400">Moves</span>
            <span className="text-sm font-bold text-slate-100 font-mono">
              {steps} <span className="text-xs font-normal text-slate-500">/{parSteps}</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400">Time</span>
            <span className="text-sm font-bold text-slate-100 font-mono">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400">Gems</span>
            <span className="text-sm font-bold text-slate-100 font-mono">
              {gemsCollected} <span className="text-xs font-normal text-slate-500">/{totalGems}</span>
            </span>
          </div>
        </div>

        {/* Total Score Banner */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-300 font-medium">Quest Score</span>
          </div>
          <span className="text-lg font-extrabold text-amber-400 font-mono tabular-nums">
            {score} pts
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onReplay}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay</span>
          </button>

          <button
            onClick={onLevelSelect}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition active:scale-95"
          >
            <List className="w-4 h-4 text-amber-400" />
            <span>Levels</span>
          </button>

          {hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
