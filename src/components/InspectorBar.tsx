/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Info, HelpCircle, Sparkles } from 'lucide-react';
import { TileExplanation } from '../utils/tileInspector';

interface InspectorBarProps {
  explanation: TileExplanation | null;
  hoveredPos: { x: number; y: number } | null;
}

export const InspectorBar: React.FC<InspectorBarProps> = ({
  explanation,
  hoveredPos,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-2 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-md text-xs backdrop-blur-md">
        {explanation ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
            {/* Left: Icon & Name & Category Badge */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xl shrink-0 p-1 bg-slate-800 rounded-lg border border-slate-700">
                {explanation.icon}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    {explanation.name}
                  </span>
                  {explanation.badgeText && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        explanation.badgeStyle || 'text-slate-300 bg-slate-800 border-slate-700'
                      }`}
                    >
                      {explanation.badgeText}
                    </span>
                  )}
                </div>
                {hoveredPos && (
                  <span className="text-[10px] font-mono text-slate-400">
                    Coords: ({hoveredPos.x}, {hoveredPos.y})
                  </span>
                )}
              </div>
            </div>

            {/* Middle: What is it? & What can player do? */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 text-slate-300 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
              <div className="flex-1">
                <span className="text-slate-400 font-semibold mr-1">What is it:</span>
                <span className="text-slate-200">{explanation.whatIsIt}</span>
              </div>
              <div className="flex-1">
                <span className="text-amber-400 font-semibold mr-1">Action:</span>
                <span className="text-amber-200/90 font-medium">{explanation.whatCanYouDo}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 py-0.5 w-full justify-center sm:justify-start">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              Hover over any item, wall, switch, or trap to see what it is and how to interact with it.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
