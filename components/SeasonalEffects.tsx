"use client";

import React, { useEffect, useState } from "react";

export default function SeasonalEffects() {
  const [season, setSeason] = useState<"halloween" | "christmas" | "none">("halloween");

  useEffect(() => {
    const today = new Date();
    const month = today.getMonth(); // 9 = October
    if (month === 9) {
      setSeason("halloween");
    } else if (month === 11) {
      setSeason("christmas");
    } else {
      setSeason("none");
    }
  }, []);

  if (season === "none") return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {season === "halloween" && (
        <>
          {/* Top-Left Pumpkin with Tight Outer Glow */}
          <div className="absolute top-4 left-4 z-50">
            <div className="relative inline-block animate-bounce">
              {/* Radial backlight glow locked behind the pumpkin */}
              <div className="absolute inset-0 m-auto h-10 w-10 rounded-full bg-orange-500/80 blur-xl scale-150 animate-pulse" />
              <span className="relative text-5xl select-none drop-shadow-[0_0_20px_rgba(255,115,0,1)]">
                🎃
              </span>
            </div>
          </div>

          {/* Top-Right Pumpkin with Tight Outer Glow */}
          <div className="absolute top-4 right-4 z-50">
            <div className="relative inline-block animate-bounce">
              {/* Radial backlight glow locked behind the pumpkin */}
              <div className="absolute inset-0 m-auto h-10 w-10 rounded-full bg-orange-500/80 blur-xl scale-150 animate-pulse" />
              <span className="relative text-5xl select-none drop-shadow-[0_0_20px_rgba(255,115,0,1)]">
                🎃
              </span>
            </div>
          </div>

          {/* Bats Flying Across the Entire Screen */}
          <div className="absolute top-12 left-0 w-full pointer-events-none overflow-hidden">
            <div className="flex space-x-16 animate-[fly_12s_linear_infinite] whitespace-nowrap">
              <span className="text-3xl inline-block -rotate-12">🦇</span>
              <span className="text-2xl inline-block rotate-6 translate-y-3">🦇</span>
              <span className="text-4xl inline-block -rotate-45 -translate-y-2">🦇</span>
            </div>
          </div>

          <style jsx global>{`
            @keyframes fly {
              0% {
                transform: translateX(-10%);
              }
              100% {
                transform: translateX(110vw);
              }
            }
          `}</style>
        </>
      )}

      {season === "christmas" && (
        <>
          <div className="absolute top-4 left-4 text-4xl select-none drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]">🎄</div>
          <div className="absolute top-4 right-4 text-4xl select-none drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]">🎁</div>
          <div className="absolute inset-0 text-white/40 text-sm flex justify-around pt-6 select-none">
            <span className="animate-pulse">❄️</span>
            <span className="animate-bounce">❄️</span>
            <span className="animate-pulse">❄️</span>
          </div>
        </>
      )}
    </div>
  );
}