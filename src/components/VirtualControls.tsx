/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Hand,
} from 'lucide-react';
import { Direction } from '../types/game';

interface VirtualControlsProps {
  onMove: (dir: Direction) => void;
  onInteract: () => void;
  canInteract: boolean;
  interactLabel?: string;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onMove,
  onInteract,
  canInteract,
  interactLabel = 'Interact',
}) => {
  return (
    <div className="flex items-center justify-between gap-4 max-w-md mx-auto w-full pt-2 px-4 select-none">
      {/* Directional Pad */}
      <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm">
        <div />
        <button
          onClick={() => onMove('up')}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-600/40 text-slate-200 active:scale-95 transition border border-slate-700/80 shadow"
          aria-label="Move Up"
        >
          <ArrowUp className="w-5 h-5 text-amber-400" />
        </button>
        <div />

        <button
          onClick={() => onMove('left')}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-600/40 text-slate-200 active:scale-95 transition border border-slate-700/80 shadow"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-5 h-5 text-amber-400" />
        </button>
        <button
          onClick={onInteract}
          className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold transition active:scale-95 border shadow ${
            canInteract
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 ring-2 ring-amber-500/30'
              : 'bg-slate-800/40 text-slate-500 border-slate-800'
          }`}
          aria-label="Action"
        >
          <Hand className="w-5 h-5" />
        </button>
        <button
          onClick={() => onMove('right')}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-600/40 text-slate-200 active:scale-95 transition border border-slate-700/80 shadow"
          aria-label="Move Right"
        >
          <ArrowRight className="w-5 h-5 text-amber-400" />
        </button>

        <div />
        <button
          onClick={() => onMove('down')}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-600/40 text-slate-200 active:scale-95 transition border border-slate-700/80 shadow"
          aria-label="Move Down"
        >
          <ArrowDown className="w-5 h-5 text-amber-400" />
        </button>
        <div />
      </div>

      {/* Action / Keyboard hints column */}
      <div className="flex flex-col gap-2 items-start text-xs text-slate-400">
        <button
          onClick={onInteract}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition active:scale-95 border ${
            canInteract
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Hand className="w-4 h-4" />
          <span>{interactLabel}</span>
          <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono">[SPACE]</span>
        </button>

        <div className="flex flex-col text-[11px] text-slate-500">
          <span>Controls: <strong className="text-slate-400">WASD</strong> or <strong className="text-slate-400">Arrows</strong></span>
          <span>Or click any tile to pathfind</span>
        </div>
      </div>
    </div>
  );
};
