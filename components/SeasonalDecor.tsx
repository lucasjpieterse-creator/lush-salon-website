"use client";
import { useEffect, useState } from "react";

export default function SeasonalDecor() {
  const [isOct, setIsOct] = useState(false);
  useEffect(() => { setIsOct(new Date().getMonth() === 9 || true); }, []); // force true for testing, change to 9 for October only
  if (!isOct) return null;

  return (
    <>
      {/* Left pumpkin - pure emoji glow, no png needed */}
      <div className="pointer-events-none fixed top-28 left-3 z-40 text-5xl animate-[float_1.2s_ease-in-out_infinite] drop-shadow-[0_0_25px_rgba(255,140,0,1)]">
        🎃
      </div>
      {/* Right pumpkin */}
      <div className="pointer-events-none fixed bottom-28 right-3 z-40 text-5xl animate-[float_1.4s_ease-in-out_infinite_0.3s] drop-shadow-[0_0_25px_rgba(255,140,0,1)]">
        🎃
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-18px) rotate(6deg)}}`}</style>
    </>
  );
}