/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Heart,
  Key,
  Gem,
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
  Pause,
  Play,
  Compass,
  Sun,
  Moon,
} from 'lucide-react';
import { PlayerState, LevelData } from '../types/game';

interface GameHUDProps {
  level: LevelData;
  player: PlayerState;
  elapsedSeconds: number;
  soundMuted: boolean;
  onToggleSound: () => void;
  onResetLevel: () => void;
  onOpenHelp: () => void;
  onTogglePause: () => void;
  isPaused: boolean;
  onOpenLevelSelect: () => void;
  brightMode: boolean;
  onToggleBrightMode: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  level,
  player,
  elapsedSeconds,
  soundMuted,
  onToggleSound,
  onResetLevel,
  onOpenHelp,
  onTogglePause,
  isPaused,
  onOpenLevelSelect,
  brightMode,
  onToggleBrightMode,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full flex flex-col gap-3 max-w-4xl mx-auto">
      {/* Top Banner: Level Info & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLevelSelect}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
            title="Choose Dungeon Level"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Level {level.id}: {level.title}</span>
          </button>
          <span className="hidden sm:inline-block text-xs text-slate-300">
            {level.subtitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Lighting Ambiance Toggle (Bright / Torchlight) */}
          <button
            onClick={onToggleBrightMode}
            className={`p-2 rounded-lg transition-colors border ${
              brightMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
            title={brightMode ? 'Switch to Dungeon Torch Ambiance' : 'Switch to Bright Mode'}
          >
            {brightMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
            title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Help / Guide */}
          <button
            onClick={onOpenHelp}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
            title="Dungeon Guide & Controls"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
          </button>

          {/* Pause / Resume */}
          <button
            onClick={onTogglePause}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
            title={isPaused ? 'Resume Game' : 'Pause Game'}
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Reset Level */}
          <button
            onClick={onResetLevel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-medium rounded-lg border border-rose-800/60 transition-colors"
            title="Restart current level"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Main Status Strip: Health, Keys, Score, Steps, Time */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-2">
        {/* 1. Health Hearts */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-1">
            {Array.from({ length: player.maxHealth }).map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 transition-transform ${
                  i < player.health
                    ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                    : 'text-slate-700 fill-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400 tabular-nums font-mono ml-auto">
            {player.health}/{player.maxHealth}
          </span>
        </div>

        {/* 2. Keys Inventory */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg">
          <Key className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`font-mono font-medium ${
                player.keys.bronze > 0 ? 'text-amber-500 font-bold' : 'text-slate-600'
              }`}
              title="Bronze Keys"
            >
              B:{player.keys.bronze}
            </span>
            <span
              className={`font-mono font-medium ${
                player.keys.silver > 0 ? 'text-slate-200 font-bold' : 'text-slate-600'
              }`}
              title="Silver Keys"
            >
              S:{player.keys.silver}
            </span>
            <span
              className={`font-mono font-medium ${
                player.keys.gold > 0 ? 'text-yellow-400 font-bold' : 'text-slate-600'
              }`}
              title="Gold Keys"
            >
              G:{player.keys.gold}
            </span>
          </div>
        </div>

        {/* 3. Gems & Score */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg">
          <Gem className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-100 font-mono tabular-nums">
              {player.score} pts
            </span>
          </div>
          <span className="text-[11px] text-slate-400 ml-auto tabular-nums">
            {player.gems} 💎
          </span>
        </div>

        {/* 4. Steps Taken */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg">
          <span className="text-xs text-slate-400">Moves:</span>
          <span
            className={`text-xs font-mono font-bold tabular-nums ${
              player.steps <= level.parSteps ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {player.steps} <span className="text-[10px] text-slate-500 font-normal">/ {level.parSteps}</span>
          </span>
        </div>

        {/* 5. Elapsed Time */}
        <div className="col-span-2 sm:col-span-1 flex items-center justify-between px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg">
          <span className="text-xs text-slate-400">Time:</span>
          <span
            className={`text-xs font-mono font-bold tabular-nums ${
              elapsedSeconds <= level.parTimeSeconds ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {formatTime(elapsedSeconds)} <span className="text-[10px] text-slate-500 font-normal">/ {formatTime(level.parTimeSeconds)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
