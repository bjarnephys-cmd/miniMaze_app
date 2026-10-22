/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Compass, HelpCircle, Volume2, VolumeX, Sparkles, Shield, KeyRound } from 'lucide-react';
import backdropImg from '../assets/images/mazequest_dungeon_backdrop_1792673211451.jpg';
import heroImg from '../assets/images/mazequest_hero_portrait_1792673212472.jpg';

interface StartMenuProps {
  onStartQuest: () => void;
  onOpenLevelSelect: () => void;
  onOpenGuide: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  onStartQuest,
  onOpenLevelSelect,
  onOpenGuide,
  soundMuted,
  onToggleSound,
}) => {
  return (
    <div className="relative min-h-[620px] w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between bg-slate-950">
      {/* Background Image with Ambient Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={backdropImg}
          alt="MazeQuest Dungeon Corridor"
          className="w-full h-full object-cover object-center filter brightness-60 contrast-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
      </div>

      {/* Header bar */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Compass className="w-5 h-5 text-amber-400" />
          </div>
          <span className="font-bold text-slate-100 tracking-wide text-sm font-mono">
            MAZEQUEST MINI
          </span>
        </div>

        <button
          onClick={onToggleSound}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition backdrop-blur-sm"
          title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Center Hero Card & Title */}
      <div className="relative z-10 px-6 sm:px-12 py-6 flex flex-col sm:flex-row items-center gap-8 max-w-3xl mx-auto">
        {/* Character Portrait */}
        <div className="relative shrink-0">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.25)] bg-slate-900">
            <img
              src={heroImg}
              alt="Brave Dungeon Explorer"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-amber-500 text-slate-950 text-[11px] font-bold rounded-md shadow-md">
            Explorer
          </div>
        </div>

        {/* Quest Title & Description */}
        <div className="flex flex-col text-center sm:text-left">
          <div className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2D Puzzle Adventure</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            MazeQuest Mini
          </h1>

          <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-md">
            Delve into sunken stone labyrinth vaults. Outsmart rhythmic spike traps, solve heavy block pressure puzzles, unlock ancient gates, and claim hidden relics.
          </p>

          {/* Quick Feature Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>3 Playable Levels</span>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="inline-flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Block & Plate Puzzles</span>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secret Relics</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Navigation Footer */}
      <div className="relative z-10 p-6 bg-slate-950/80 border-t border-slate-800/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onStartQuest}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-[0_0_20px_rgba(245,158,11,0.35)] active:scale-95"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Start Quest</span>
          </button>

          <button
            onClick={onOpenLevelSelect}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium rounded-xl border border-slate-700 transition active:scale-95"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Select Level</span>
          </button>
        </div>

        <button
          onClick={onOpenGuide}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>How to Play & Controls</span>
        </button>
      </div>
    </div>
  );
};
