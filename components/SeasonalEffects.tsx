"use client";

import React, { useEffect, useState } from "react";

export default function SeasonalEffects() {
  const [season, setSeason] = useState<"halloween" | "christmas" | "none">("halloween");

  useEffect(() => {
    const today = new Date();
    const month = today.getMonth();
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
          {/* Left Pumpkin with Brighter Glow */}
          <div className="absolute top-4 left-4 text-5xl select-none animate-bounce relative">
            <div className="absolute inset-0 rounded-full bg-orange-500/40 blur-xl scale-150 animate-pulse pointer-events-none" />
            <span className="relative drop-shadow-[0_0_25px_rgba(255,102,0,1)]">🎃</span>
          </div>

          {/* Right Pumpkin with Brighter Glow */}
          <div className="absolute top-4 right-4 text-5xl select-none animate-bounce relative">
            <div className="absolute inset-0 rounded-full bg-orange-500/40 blur-xl scale-150 animate-pulse pointer-events-none" />
            <span className="relative drop-shadow-[0_0_25px_rgba(255,102,0,1)]">🎃</span>
          </div>

          {/* Flying Bats */}
          <div className="absolute top-12 left-0 w-full pointer-events-none overflow-hidden">
            <div className="flex space-x-12 animate-[fly_12s_linear_infinite] whitespace-nowrap">
              <span className="text-3xl inline-block -rotate-12">🦇</span>
              <span className="text-2xl inline-block rotate-6 translate-y-3">🦇</span>
              <span className="text-4xl inline-block -rotate-45 -translate-y-2">🦇</span>
            </div>
          </div>

          <style jsx global>{`
            @keyframes fly {
              0% { transform: translateX(-10%); }
              100% { transform: translateX(110vw); }
            }
          `}</style>
        </>
      )}
    </div>
  );
}