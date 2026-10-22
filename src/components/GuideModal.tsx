/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Key, ShieldAlert, Square, Footprints, Hand, Sparkles } from 'lucide-react';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-left max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Adventurer Guide & Mechanics</h2>
            <p className="text-xs text-slate-400">Master the dungeon mechanics to achieve 3-star ratings</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="space-y-4 mt-4 text-xs text-slate-300">
          {/* Movement */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-3">
            <Footprints className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white text-sm mb-1">Movement & Pathfinding</h3>
              <p className="leading-relaxed">
                Use <strong className="text-amber-400">WASD</strong> or <strong className="text-amber-400">Arrow Keys</strong> to step directly. You can also <strong className="text-amber-400">click or tap any floor tile</strong> to automatically navigate the shortest path using smart pathfinding!
              </p>
            </div>
          </div>

          {/* Switches & Levers */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-3">
            <Hand className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white text-sm mb-1">Interactive Levers & Switches</h3>
              <p className="leading-relaxed">
                Walk adjacent to a lever and press <strong className="text-amber-400">[SPACE]</strong>, tap the <strong className="text-amber-400">Interact button</strong>, or click the switch to toggle it. Levers disarm spike traps, lower energy barriers, or reveal hidden alcoves.
              </p>
            </div>
          </div>

          {/* Pushable Blocks & Pressure Plates */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-3">
            <Square className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white text-sm mb-1">Pushable Blocks & Pressure Plates</h3>
              <p className="leading-relaxed">
                Heavy runestone blocks can be pushed forward into empty floor tiles. Align and push blocks onto glowing floor pressure plates to depress them and keep gates open.
              </p>
            </div>
          </div>

          {/* Spike Traps & Hazards */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white text-sm mb-1">Traps & Health</h3>
              <p className="leading-relaxed">
                Stepping on extended steel spikes costs 1 Heart. Timing is everything: some spikes cycle on a rhythm, while others can be disarmed via wall levers. Red potions restore lost health.
              </p>
            </div>
          </div>

          {/* Keys & Gates */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-3">
            <Key className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white text-sm mb-1">Color-Coded Keys & Vault Gates</h3>
              <p className="leading-relaxed">
                Bronze, Silver, and Gold gates require their matching key. Keys are consumed upon unlocking a gate. Find all secrets and reach the glowing exit stairs to complete the expedition!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition active:scale-95 shadow-md"
          >
            Ready to Explore
          </button>
        </div>
      </div>
    </div>
  );
};
