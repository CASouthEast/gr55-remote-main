import React from "react";

import GR55Controller from "./Component";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4">
      <div className="scale-[0.8] md:scale-100 origin-center">
        <GR55Controller />
      </div>
      <p className="text-zinc-500 mt-4 text-sm font-mono">
        Roland GR-55 Interactive Demo
      </p>
    </div>
  );
}
