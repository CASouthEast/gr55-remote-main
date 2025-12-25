/**
 * GR55Controller - Main Component
 *
 * Implements the layout logic and state management for the guitar synthesizer.
 * Organizes sub-components into the specific grid layout from the schematic.
 */
import { Triangle } from "lucide-react";
import React, { useState } from "react";

import { Button, SoundStyleButton } from "./components/Buttons";
import { DataWheel } from "./components/DataWheel";
import { Display } from "./components/Display";
import { Pedal, ExpressionPedal } from "./components/Pedal";
import { cn } from "./utils";

export function GR55Controller() {
  const [activePedal, setActivePedal] = useState<number>(1);
  const [patchName, setPatchName] = useState("LEAD GUITAR");
  const [activeStyle, setActiveStyle] = useState("LEAD");

  const styles = [
    { id: "LEAD", label: "LEAD", patch: "LEAD GUITAR" },
    { id: "RHYTHM", label: "RHYTHM", patch: "FUNK RYTHM" },
    { id: "OTHER", label: "OTHER", patch: "STRINGS ENS" },
    { id: "USER", label: "USER", patch: "CUSTOM 01" },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-200 p-4 md:p-8 overflow-x-auto">
      {/* Main Chassis */}
      <div className="relative bg-[#1e2024] p-1 rounded-[2rem] shadow-2xl border-4 border-[#353940] min-w-[1000px] max-w-[1200px] flex">
        {/* Top Edge Labels (Ports) */}
        <div className="absolute -top-6 left-20 right-20 flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-wider w-[80%]">
          <span>USB MEMORY</span>
          <div className="flex gap-8">
            <span>DC IN</span>
            <span>POWER</span>
            <span>USB COMPUTER</span>
            <span>MIDI IN/OUT</span>
            <span>PHONES</span>
            <span>L/MONO OUTPUT R</span>
            <span>GUITAR OUT</span>
            <span>GK IN</span>
          </div>
        </div>

        {/* Left Main Section */}
        <div className="flex-1 flex flex-col border-r-2 border-black/50 bg-[#25282e]">
          {/* Top Control Panel Area */}
          <div className="flex-1 p-6 flex flex-col gap-6 relative">
            {/* Header / Logo */}
            <div className="flex justify-between items-baseline border-b border-zinc-600 pb-2 mb-2">
              <h1 className="text-3xl font-black italic tracking-tighter text-zinc-100 font-sans">
                Roland <span className="font-normal text-2xl ml-2">GR-55</span>{" "}
                <span className="text-sm font-normal not-italic ml-2 text-zinc-400 tracking-widest">
                  GUITAR SYNTHESIZER
                </span>
              </h1>
            </div>

            <div className="flex gap-8 h-full">
              {/* Left Column: Screen & Style Buttons */}
              <div className="flex-[3] flex flex-col gap-4">
                {/* Display */}
                <Display
                  patchName={patchName}
                  bank={`0${activePedal}-1`}
                  mode={activeStyle}
                  className="h-64 w-full"
                />

                {/* Sound Style Buttons */}
                <div className="relative pt-4 border-t border-zinc-600">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#25282e] px-2 text-xs font-bold text-zinc-400">
                    SOUND STYLE
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    {/* V-LINK Logo/Button */}
                    <div className="flex flex-col items-center mr-4">
                      <span className="italic font-black text-white bg-black px-1 text-xs skew-x-[-10deg] mb-1">
                        V-LINK
                      </span>
                      <Button label="" variant="rect" className="h-6 w-10" />
                    </div>

                    {styles.map((style) => (
                      <SoundStyleButton
                        key={style.id}
                        label={style.label}
                        active={activeStyle === style.id}
                        onClick={() => {
                          setActiveStyle(style.id);
                          setPatchName(style.patch);
                        }}
                      />
                    ))}

                    {/* EZ Edit Section */}
                    <div className="ml-4">
                      <Button label="EZ EDIT" variant="rect" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Wheel & Nav */}
              <div className="flex-1 flex flex-col items-center gap-6 pt-2">
                {/* Output Level */}
                <div className="flex flex-col items-center gap-2 w-full">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    Output Level
                  </span>
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-600 shadow-lg relative cursor-pointer rotate-45">
                    <div className="w-1 h-4 bg-white absolute top-1 left-1/2 -translate-x-1/2 rounded-full" />
                  </div>
                </div>

                {/* Data Wheel */}
                <DataWheel />

                {/* Nav Buttons Grid */}
                <div className="grid grid-cols-3 gap-x-4 gap-y-6 w-full px-2">
                  <Button label="PAGE" subLabel="◄" variant="rect" />
                  <Button label="PAGE" subLabel="►" variant="rect" />
                  <Button label="EDIT" variant="rect" />

                  <Button label="EXIT" variant="rect" />
                  <Button label="ENTER" variant="rect" />
                  <Button label="WRITE" variant="rect" />
                </div>

                {/* Audio Player */}
                <div className="mt-auto flex flex-col items-center">
                  <span className="text-[10px] font-bold text-zinc-400 mb-1">
                    AUDIO PLAYER
                  </span>
                  <Button label="" variant="rect" className="w-14" />
                  <span className="text-[10px] bg-black text-white px-1 mt-1">
                    USB MEMORY
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Pedal Area */}
          <div className="bg-[#1a1c21] p-6 border-t-2 border-black/50 flex justify-around items-end pb-8 relative">
            {/* Bank Select Up/Down */}
            <div className="absolute left-16 top-10 flex flex-col gap-8">
              <div className="flex flex-col items-center cursor-pointer active:scale-95">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-zinc-400" />
                <span className="text-[10px] font-bold text-white mt-1 bg-black px-1">
                  BANK
                </span>
              </div>
            </div>
            <div className="absolute left-16 bottom-16 flex flex-col gap-8">
              <div className="flex flex-col items-center cursor-pointer active:scale-95">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-zinc-400" />
                <span className="text-[10px] font-bold text-white mt-1 bg-black px-1 text-center leading-tight">
                  BANK
                  <br />
                  SELECT
                </span>
              </div>
            </div>

            <Pedal
              label="1"
              isActive={activePedal === 1}
              onClick={() => setActivePedal(1)}
            />
            <Pedal
              label="2"
              isActive={activePedal === 2}
              onClick={() => setActivePedal(2)}
              subLabel="BANK ▲"
            />
            <Pedal
              label="3"
              isActive={activePedal === 3}
              onClick={() => setActivePedal(3)}
              subLabel="BANK ▼"
            />
            <Pedal
              label="CTL"
              isActive={activePedal === 4}
              onClick={() => setActivePedal(4)}
              subLabel="PHRASE LOOP"
            />

            {/* Branding Logos */}
            <div className="absolute right-6 bottom-20 flex flex-col items-end opacity-80">
              <span className="font-serif italic text-6xl font-black text-zinc-500 tracking-tighter">
                GR
              </span>
              <span className="font-bold text-white bg-black px-1 italic skew-x-[-10deg] border border-zinc-600">
                COSM
              </span>
            </div>
          </div>
        </div>

        {/* Right Expression Pedal Section */}
        <div className="w-32 bg-[#25282e] border-l-2 border-black/50 p-2 pl-0">
          <ExpressionPedal />
        </div>

        {/* USB Side Port */}
        <div className="absolute -left-1 top-32 bottom-32 w-1 bg-zinc-800 border-l border-zinc-600 flex items-center justify-center">
          <span className="text-[10px] text-zinc-500 -rotate-90 whitespace-nowrap tracking-widest">
            USB MEMORY
          </span>
        </div>
      </div>
    </div>
  );
}

export default GR55Controller;
