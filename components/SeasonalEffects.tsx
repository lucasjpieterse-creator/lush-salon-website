"use client";

import React, { useEffect, useState } from "react";

export default function SeasonalEffects() {
  const [season, setSeason] = useState<"halloween" | "christmas" | "none">("halloween");

  useEffect(() => {
    const today = new Date();
    const month = today.getMonth(); // 0 = Jan, 9 = Oct, 11 = Dec

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
      {/* 🎃 HALLOWEEN THEME */}
      {season === "halloween" && (
        <>
          {/* Top-Left Pumpkin */}
          <div className="absolute top-4 left-4 text-4xl animate-bounce duration-1000 select-none">
            🎃
          </div>

          {/* Top-Right Pumpkin */}
          <div className="absolute top-4 right-4 text-4xl animate-bounce duration-1000 select-none">
            🎃
          </div>

          {/* Bats Flying Across Header */}
          <div className="absolute top-10 left-0 right-0 flex justify-between px-12 opacity-80 animate-pulse pointer-events-none select-none">
            <span className="text-2xl transform -rotate-12">🦇</span>
            <span className="text-3xl transform rotate-6">🦇</span>
            <span className="text-2xl transform -rotate-45">🦇</span>
          </div>
        </>
      )}

      {/* 🎄 CHRISTMAS THEME */}
      {season === "christmas" && (
        <>
          <div className="absolute top-4 left-4 text-4xl select-none">🎄</div>
          <div className="absolute top-4 right-4 text-4xl select-none">🎁</div>
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