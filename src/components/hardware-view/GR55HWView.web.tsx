/**
 * Web-specific implementation of GR55 Hardware View
 * This component provides the full interactive GR55 interface with web-specific libraries
 */

import React, { useState, useEffect } from "react";
import { Platform } from "react-native";

import { GR55HWViewProps, GR55State } from "./GR55HWView.types";

// Type definitions for web-specific dependencies
type FramerMotionModule = typeof import("framer-motion");
type LucideReactModule = typeof import("lucide-react");

interface WebDependencies {
  motion?: FramerMotionModule["motion"];
  AnimatePresence?: FramerMotionModule["AnimatePresence"];
  Settings?: LucideReactModule["Settings"];
  Power?: LucideReactModule["Power"];
}

export function GR55HWView({ initialState, onStateChange }: GR55HWViewProps) {
  const [state, setState] = useState<GR55State>({
    activePedal: 1,
    patchName: "LEAD GUITAR",
    activeStyle: "LEAD",
    bank: "01-1",
    ...initialState,
  });

  const [webDeps, setWebDeps] = useState<WebDependencies>({});
  const [depsLoaded, setDepsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Only load web dependencies on web platform
    if (Platform.OS === "web") {
      loadWebDependencies();
    } else {
      setDepsLoaded(true);
    }
  }, []);

  const loadWebDependencies = async () => {
    try {
      // Dynamic imports for web-specific libraries
      const [framerMotion, lucideReact] = await Promise.all([
        import("framer-motion").catch(() => null),
        import("lucide-react").catch(() => null),
      ]);

      const deps: WebDependencies = {};

      if (framerMotion) {
        deps.motion = framerMotion.motion;
        deps.AnimatePresence = framerMotion.AnimatePresence;
      }

      if (lucideReact) {
        deps.Settings = lucideReact.Settings;
        deps.Power = lucideReact.Power;
      }

      setWebDeps(deps);
      setDepsLoaded(true);
    } catch (error) {
      console.warn("Failed to load web dependencies:", error);
      setLoadError("Some web features may not be available");
      setDepsLoaded(true);
    }
  };

  const handleStateChange = (newState: Partial<GR55State>) => {
    const updatedState = { ...state, ...newState };
    setState(updatedState);
    onStateChange?.(updatedState);
  };

  if (!depsLoaded) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4">
        <div className="text-white">Loading hardware interface...</div>
      </div>
    );
  }

  const { motion, AnimatePresence, Settings, Power } = webDeps;

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4">
      {loadError && (
        <div className="bg-yellow-800 text-yellow-200 p-2 rounded mb-4 text-sm">
          {loadError}
        </div>
      )}

      <div className="scale-[0.8] md:scale-100 origin-center">
        <div className="bg-gray-800 p-8 rounded-lg border-2 border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-bold">
              Roland GR-55 Interactive Interface
            </h2>
            {Settings && <Settings className="text-gray-400 w-5 h-5" />}
          </div>

          <div className="text-white mb-6">
            <div className="bg-black p-3 rounded border border-gray-500 mb-4">
              <p className="font-mono text-green-400">
                {state.bank} - {state.patchName}
              </p>
              <p className="font-mono text-blue-400 text-sm">
                Style: {state.activeStyle} | Pedal: {state.activePedal}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-white text-sm mb-2">Style Selection</h3>
            <div className="flex gap-2">
              {(["LEAD", "RHYTHM", "OTHER", "USER"] as const).map((style) => {
                const isActive = state.activeStyle === style;
                const ButtonComponent = motion ? motion.button : "button";

                return (
                  <ButtonComponent
                    key={style}
                    className={`px-4 py-2 rounded font-semibold transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-600 text-gray-200 hover:bg-gray-500"
                    }`}
                    onClick={() => handleStateChange({ activeStyle: style })}
                    {...(motion && {
                      whileHover: { scale: 1.05 },
                      whileTap: { scale: 0.95 },
                      transition: { duration: 0.1 },
                    })}
                  >
                    {style}
                  </ButtonComponent>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-white text-sm mb-2">Pedal Selection</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((pedal) => {
                const isActive = state.activePedal === pedal;
                const ButtonComponent = motion ? motion.button : "button";

                return (
                  <ButtonComponent
                    key={pedal}
                    className={`w-12 h-12 rounded-full font-bold transition-colors ${
                      isActive
                        ? "bg-orange-600 text-white shadow-lg"
                        : "bg-gray-600 text-gray-200 hover:bg-gray-500"
                    }`}
                    onClick={() => handleStateChange({ activePedal: pedal })}
                    {...(motion && {
                      whileHover: { scale: 1.1 },
                      whileTap: { scale: 0.9 },
                      transition: { duration: 0.1 },
                    })}
                  >
                    {pedal}
                  </ButtonComponent>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Web Platform - Full Interactive Mode</span>
            {Power && <Power className="w-4 h-4" />}
          </div>
        </div>
      </div>

      <p className="text-zinc-500 mt-4 text-sm font-mono">
        Roland GR-55 Interactive Demo - Web Platform
      </p>
    </div>
  );
}
