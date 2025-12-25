import React from "react";

import { cn } from "../utils";

interface DisplayProps {
  patchName: string;
  bank: string;
  mode: string;
  className?: string;
}

/**
 * LCD Display component that replicates the Roland GR-55 screen
 * Maintains the visual design and layout from GR55HWDesign.png
 * Adapted for React Native compatibility
 */
export function Display({ patchName, bank, mode, className }: DisplayProps) {
  return (
    <div
      className={cn(
        "bg-[#e0e7ff] border-[12px] border-zinc-800 rounded-lg shadow-inner relative overflow-hidden",
        className
      )}
    >
      {/* Inner Bezel Shadow */}
      <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none z-10" />

      {/* LCD Screen Content */}
      <div className="h-full w-full p-6 flex flex-col justify-between font-mono text-blue-900 bg-[#dbeafe]">
        {/* Top Status Bar */}
        <div className="flex justify-between border-b-2 border-blue-900/20 pb-2">
          <div className="flex gap-4">
            <span className="bg-blue-900 text-white px-2 text-xs font-bold rounded-sm">
              GUITAR
            </span>
            <span className="font-bold text-sm">PCM1</span>
            <span className="font-bold text-sm text-blue-900/50">PCM2</span>
            <span className="font-bold text-sm text-blue-900/50">MODEL</span>
          </div>
          <div className="text-sm font-bold">BPM: 120</div>
        </div>

        {/* Main Patch Info */}
        <div className="flex items-end gap-4 my-auto">
          <div className="text-6xl font-black tracking-tighter leading-none">
            {bank}
          </div>
          <div className="flex flex-col pb-2">
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">
              {mode}
            </span>
            <h1 className="text-4xl font-bold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
              {patchName}
            </h1>
          </div>
        </div>

        {/* Bottom Parameters */}
        <div className="grid grid-cols-4 gap-2 text-xs font-bold pt-2 border-t-2 border-blue-900/20">
          <div className="bg-blue-200 p-1 text-center rounded">MFX</div>
          <div className="bg-blue-100 p-1 text-center rounded text-blue-900/30">
            AMP
          </div>
          <div className="bg-blue-100 p-1 text-center rounded text-blue-900/30">
            MOD
          </div>
          <div className="bg-blue-200 p-1 text-center rounded">DLY</div>
        </div>
      </div>
    </div>
  );
}
