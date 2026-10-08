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
          {/* Top-Left Glowing Pumpkin */}
          <div className="absolute top-4 left-4 text-4xl select-none animate-bounce drop-shadow-[0_0_15px_rgba(249,115,22,0.9)]">
            🎃
          </div>

          {/* Top-Right Glowing Pumpkin */}
          <div className="absolute top-4 right-4 text-4xl select-none animate-bounce drop-shadow-[0_0_15px_rgba(249,115,22,0.9)]">
            🎃
          </div>

          {/* Bats Flying Across the Screen (Left to Right Loop) */}
          <div className="absolute top-12 left-0 w-full pointer-events-none overflow-hidden">
            <div className="flex space-x-12 animate-[fly_12s_linear_infinite] whitespace-nowrap">
              <span className="text-3xl inline-block -rotate-12">🦇</span>
              <span className="text-2xl inline-block rotate-6 translate-y-3">🦇</span>
              <span className="text-4xl inline-block -rotate-45 -translate-y-2">🦇</span>
            </div>
          </div>

          {/* Tailwind Keyframes for Flying Animation */}
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