import { motion } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";

import { cn } from "../utils";

interface DataWheelProps {
  onRotate?: (direction: "left" | "right") => void;
  onPress?: (direction: "up" | "down" | "left" | "right") => void;
  className?: string;
}

/**
 * Large rotary encoder with directional buttons integrated.
 * Replicates the complex navigation wheel of the GR-55.
 */
export function DataWheel({ onRotate, onPress, className }: DataWheelProps) {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Wheel drag logic
  const handleWheelDrag = (event: any, info: any) => {
    const newRotation = rotation + info.delta.x + info.delta.y;
    setRotation(newRotation);
    if (info.delta.x > 0 || info.delta.y > 0) onRotate?.("right");
    else onRotate?.("left");
  };

  return (
    <div
      className={cn(
        "relative w-32 h-32 flex items-center justify-center",
        className
      )}
    >
      {/* Directional Buttons Ring */}
      <div className="absolute inset-0 rounded-full border border-zinc-700 bg-zinc-900 shadow-xl" />

      {/* Up Button */}
      <button
        onClick={() => onPress?.("up")}
        className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-6 bg-zinc-800 hover:bg-zinc-700 rounded-t-lg flex items-center justify-center shadow-sm active:translate-y-0.5 transition-transform"
      >
        <svg
          className="w-3 h-3 text-zinc-400"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 6l-6 12h12z" />
        </svg>
      </button>

      {/* Down Button */}
      <button
        onClick={() => onPress?.("down")}
        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-6 bg-zinc-800 hover:bg-zinc-700 rounded-b-lg flex items-center justify-center shadow-sm active:-translate-y-0.5 transition-transform"
      >
        <svg
          className="w-3 h-3 text-zinc-400"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 18l6-12H6z" />
        </svg>
      </button>

      {/* Left Button */}
      <button
        onClick={() => onPress?.("left")}
        className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-l-lg flex items-center justify-center shadow-sm active:translate-x-0.5 transition-transform"
      >
        <svg
          className="w-3 h-3 text-zinc-400"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M6 12l12 6V6z" />
        </svg>
      </button>

      {/* Right Button */}
      <button
        onClick={() => onPress?.("right")}
        className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-r-lg flex items-center justify-center shadow-sm active:-translate-x-0.5 transition-transform"
      >
        <svg
          className="w-3 h-3 text-zinc-400"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M18 12L6 6v12z" />
        </svg>
      </button>

      {/* Center Wheel */}
      <motion.div
        drag
        dragConstraints={wheelRef}
        dragElastic={0}
        dragMomentum={false}
        onDrag={handleWheelDrag}
        animate={{ rotate: rotation }}
        className="w-20 h-20 rounded-full bg-zinc-800 border-4 border-zinc-900 shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
        style={{
          background:
            "conic-gradient(from 180deg, #27272a 0%, #3f3f46 50%, #27272a 100%)",
        }}
      >
        {/* Wheel Texture */}
        <div className="absolute w-16 h-16 rounded-full border-2 border-dashed border-zinc-600 opacity-30" />
        <div className="w-12 h-12 rounded-full bg-zinc-900/50 shadow-inner" />
        {/* Spinner Divot */}
        <div className="absolute top-2 w-3 h-3 rounded-full bg-zinc-950 shadow-inner border border-zinc-700" />
      </motion.div>
    </div>
  );
}
