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
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {season === "halloween" && (
        <>
          {/* Top-Left Pumpkin: Scaled for mobile, elevated above header */}
          <div className="absolute top-1 left-1 md:top-3 md:left-4 pointer-events-none">
            <div className="relative inline-block animate-bounce">
              <div className="absolute inset-0 m-auto h-8 w-8 md:h-10 md:w-10 rounded-full bg-orange-500/80 blur-xl scale-150 animate-pulse" />
              <span className="relative text-3xl md:text-5xl select-none drop-shadow-[0_0_20px_rgba(255,115,0,1)]">
                🎃
              </span>
            </div>
          </div>

          {/* Top-Right Pumpkin: Scaled for mobile, elevated above header */}
          <div className="absolute top-1 right-1 md:top-3 md:right-4 pointer-events-none">
            <div className="relative inline-block animate-bounce">
              <div className="absolute inset-0 m-auto h-8 w-8 md:h-10 md:w-10 rounded-full bg-orange-500/80 blur-xl scale-150 animate-pulse" />
              <span className="relative text-3xl md:text-5xl select-none drop-shadow-[0_0_20px_rgba(255,115,0,1)]">
                🎃
              </span>
            </div>
          </div>

          {/* Bats Flying Across Screen */}
          <div className="absolute top-10 left-0 w-full pointer-events-none overflow-hidden">
            <div className="flex space-x-16 animate-[fly_12s_linear_infinite] whitespace-nowrap">
              <span className="text-2xl md:text-3xl inline-block animate-[flap_0.4s_ease-in-out_infinite_alternate]">
                🦇
              </span>
              <span className="text-xl md:text-2xl inline-block translate-y-3 animate-[flap_0.35s_ease-in-out_infinite_alternate]">
                🦇
              </span>
              <span className="text-3xl md:text-4xl inline-block -translate-y-2 animate-[flap_0.45s_ease-in-out_infinite_alternate]">
                🦇
              </span>
            </div>
          </div>

          {/* Keyframe Animations */}
          <style jsx global>{`
            @keyframes fly {
              0% {
                transform: translateX(-10%);
              }
              100% {
                transform: translateX(110vw);
              }
            }

            @keyframes flap {
              0% {
                transform: scaleY(1) rotate(-8deg);
              }
              100% {
                transform: scaleY(0.65) rotate(12deg);
              }
            }
          `}</style>
        </>
      )}

      {season === "christmas" && (
        <>
          <div className="absolute top-2 left-2 md:top-4 md:left-4 text-3xl md:text-4xl select-none drop-shadow-[0_0_12px_rgba(34,197,94,0.8)] pointer-events-none">🎄</div>
          <div className="absolute top-2 right-2 md:top-4 md:right-4 text-3xl md:text-4xl select-none drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] pointer-events-none">🎁</div>
          <div className="absolute inset-0 text-white/40 text-sm flex justify-around pt-6 select-none pointer-events-none">
            <span className="animate-pulse">❄️</span>
            <span className="animate-bounce">❄️</span>
            <span className="animate-pulse">❄️</span>
          </div>
        </>
      )}
    </div>
  );
}