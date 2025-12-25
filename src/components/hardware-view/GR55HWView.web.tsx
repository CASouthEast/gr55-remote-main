/**
 * Web-specific implementation of GR55 Hardware View
 * This component provides the full interactive GR55 interface with web-specific libraries
 */

import React, { useState, useEffect } from "react";
import { Platform } from "react-native";

import { GR55HWViewProps } from "./GR55HWView.types";
import { GR55Controller } from "./components/GR55Controller";

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

  if (!depsLoaded) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4">
        <div className="text-white">Loading hardware interface...</div>
      </div>
    );
  }

  const { Settings, Power } = webDeps;

  return (
    <div className="min-h-screen bg-zinc-200 flex flex-col items-center justify-center">
      {loadError && (
        <div className="bg-yellow-800 text-yellow-200 p-2 rounded mb-4 text-sm absolute top-4 left-1/2 -translate-x-1/2 z-50">
          {loadError}
        </div>
      )}

      {/* Use the full GR55Controller for web platform */}
      <GR55Controller
        initialState={initialState}
        onStateChange={onStateChange}
      />

      {/* Footer with platform info and optional icons */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-zinc-500 text-sm font-mono">
        <span>Roland GR-55 Interactive Demo - Web Platform</span>
        {Settings && <Settings className="w-4 h-4" />}
        {Power && <Power className="w-4 h-4" />}
      </div>
    </div>
  );
}
