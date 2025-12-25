import React, { useState } from "react";

import { cn } from "../utils";

// Conditional import for framer-motion (web only)
let motion: any;
try {
  motion = require("framer-motion").motion;
} catch {
  // Fallback for native platforms - use regular button/div
  motion = {
    button: "button" as any,
    div: "div" as any,
  };
}

interface PedalProps {
  label: string;
  subLabel?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Large trapezoidal foot pedal.
 * Features a complex 3D shape using SVG and gradients.
 * Adapted for React Native with conditional framer-motion support.
 */
export function Pedal({
  label,
  subLabel,
  isActive,
  onClick,
  className,
}: PedalProps) {
  const MotionButton = motion?.button || "button";

  // Animation props only for web
  const animationProps = motion?.button
    ? {
        whileTap: { scale: 0.98, translateY: 2 },
      }
    : {};

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative w-24 h-48 group">
        {/* Pedal Base / Bezel */}
        <svg
          viewBox="0 0 100 200"
          className="w-full h-full drop-shadow-xl filter"
        >
          <path
            d="M 10 0 L 90 0 L 80 200 L 20 200 Z"
            className="fill-zinc-800 stroke-zinc-600 stroke-2"
          />
          <path
            d="M 15 10 L 85 10 L 75 190 L 25 190 Z"
            className="fill-zinc-900"
          />
        </svg>

        {/* LED Indicator */}
        <div
          className={cn(
            "absolute top-6 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border border-black transition-all duration-300",
            isActive
              ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]"
              : "bg-red-900/30"
          )}
        />

        {/* Pedal Actuator (The moving part) */}
        <MotionButton
          type="button"
          title={`${label} pedal`}
          onClick={onClick}
          {...animationProps}
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[60%] h-[55%] outline-none"
        >
          {/* Metal Tread Plate */}
          <div className="w-full h-full bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-sm border-x border-t border-zinc-500 shadow-[inset_0_2px_5px_rgba(255,255,255,0.2)] flex flex-col items-center justify-end pb-4">
            {/* Rubber Grip Texture */}
            <div className="w-[80%] h-[70%] bg-black/40 rounded-sm border border-zinc-900/50" />
          </div>
        </MotionButton>

        {/* Label */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center">
          <span className="block text-2xl font-black text-white tracking-tighter drop-shadow-md font-sans">
            {label}
          </span>
        </div>
      </div>

      {/* Sub Label (below pedal) */}
      {subLabel && (
        <div className="mt-2 bg-black/50 px-2 py-1 rounded border border-zinc-700">
          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest block text-center leading-none">
            {subLabel}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * The large Expression Pedal on the right side.
 * Adapted for React Native with conditional framer-motion support.
 */
export function ExpressionPedal({ className }: { className?: string }) {
  const [value, setValue] = useState(0);
  const MotionDiv = motion?.div || "div";

  // Animation props only for web
  const animationProps = motion?.div
    ? {
        whileHover: { scale: 1.01 },
        whileTap: { scale: 0.99 },
      }
    : {};

  return (
    <div
      className={cn(
        "relative h-full w-full bg-zinc-800 rounded-r-lg border-l border-zinc-900 p-2",
        className
      )}
    >
      <div className="h-full w-full bg-zinc-900 rounded border border-zinc-700 relative overflow-hidden shadow-inner group cursor-ns-resize">
        {/* Rubber Tread Pattern */}
        <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]" />

        {/* Pedal Surface (Visual only, simple animation) */}
        <MotionDiv
          className="absolute inset-2 bg-gradient-to-b from-zinc-700 to-zinc-800 rounded shadow-lg border-t border-zinc-600"
          {...animationProps}
        >
          {/* Logo Emboss */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20 rotate-90">
            <span className="text-4xl font-black tracking-tighter">Roland</span>
          </div>

          {/* Curved shape simulation */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />
        </MotionDiv>
      </div>

      {/* Side Label */}
      <div className="absolute -left-16 top-10 text-[10px] text-zinc-500 font-bold uppercase rotate-0 w-12 text-right">
        EXP PEDAL <br /> SW ON/OFF
      </div>
      <div className="absolute -left-4 top-12 text-[10px] text-zinc-500 font-bold uppercase rotate-0">
        ►
      </div>
    </div>
  );
}
