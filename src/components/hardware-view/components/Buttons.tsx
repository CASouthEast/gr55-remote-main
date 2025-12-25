import React from "react";

import { cn } from "../utils";

// Conditional import for framer-motion (web only)
let motion: any;
try {
  motion = require("framer-motion").motion;
} catch {
  // Fallback for native platforms - use regular div/button
  motion = {
    button: "button" as any,
    div: "div" as any,
  };
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  ledActive?: boolean;
  variant?: "rect" | "round" | "wide";
  subLabel?: string;
}

/**
 * Standard tactile button used across the interface.
 * Supports LED indicators and different shapes.
 * Adapted for React Native with conditional framer-motion support.
 */
export function Button({
  label,
  ledActive,
  variant = "rect",
  subLabel,
  className,
  ...props
}: ButtonProps) {
  const MotionButton = motion?.button || "button";

  // Animation props only for web
  const animationProps = motion?.button
    ? {
        whileTap: { scale: 0.95 },
      }
    : {};

  return (
    <div className="flex flex-col items-center gap-1">
      {subLabel && (
        <span className="text-[0.6rem] font-bold text-zinc-400 uppercase tracking-wider">
          {subLabel}
        </span>
      )}
      <MotionButton
        type="button"
        title={`${label} button`}
        {...animationProps}
        className={cn(
          "relative flex items-center justify-center bg-zinc-800 border-2 border-zinc-700 shadow-md transition-colors active:bg-zinc-900 active:shadow-inner outline-none focus:ring-1 focus:ring-blue-500",
          variant === "rect" && "w-12 h-8 rounded-sm",
          variant === "wide" && "w-16 h-8 rounded-sm",
          variant === "round" && "w-10 h-10 rounded-full",
          className
        )}
        {...props}
      >
        {/* LED Indicator Window */}
        {variant !== "round" && (
          <div
            className={cn(
              "w-3 h-1.5 rounded-sm absolute top-1.5 transition-colors duration-200",
              ledActive
                ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                : "bg-zinc-900 border border-zinc-800"
            )}
          />
        )}

        {/* Tactile Center */}
        <div
          className={cn(
            "bg-zinc-700/50 absolute",
            variant === "round"
              ? "w-6 h-6 rounded-full"
              : "w-8 h-3 rounded-sm top-4"
          )}
        />
      </MotionButton>
      <span className="text-[0.65rem] font-bold text-zinc-300 uppercase tracking-tight">
        {label}
      </span>
    </div>
  );
}

/**
 * Special specialized button for the Sound Style section
 * Adapted for React Native with conditional framer-motion support.
 */
export function SoundStyleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const MotionButton = motion?.button || "button";

  // Animation props only for web
  const animationProps = motion?.button
    ? {
        whileTap: { scale: 0.95 },
      }
    : {};

  return (
    <div className="flex flex-col items-center gap-1 group">
      <div className="border border-zinc-500 rounded px-3 py-0.5 mb-1 bg-zinc-900/50">
        <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <MotionButton
        type="button"
        title={`${label} style button`}
        {...animationProps}
        onClick={onClick}
        className="w-16 h-8 bg-zinc-800 border-2 border-zinc-600 rounded-sm relative shadow-md active:shadow-inner flex justify-center"
      >
        <div
          className={cn(
            "w-4 h-2 mt-1.5 rounded-sm transition-all duration-200",
            active
              ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]"
              : "bg-zinc-950"
          )}
        />
      </MotionButton>
    </div>
  );
}
