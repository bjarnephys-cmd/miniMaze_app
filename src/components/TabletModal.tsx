/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Scroll, X } from 'lucide-react';
import { TabletElement } from '../types/game';

interface TabletModalProps {
  tablet: TabletElement;
  onClose: () => void;
}

export const TabletModal: React.FC<TabletModalProps> = ({ tablet, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Scroll className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono">
            {tablet.title}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 my-2">
          <p className="text-sm text-slate-200 italic leading-relaxed font-serif">
            {tablet.message}
          </p>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition active:scale-95"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
