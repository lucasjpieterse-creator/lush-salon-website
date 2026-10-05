"use client";
import { useEffect, useState } from "react";

export default function SeasonalDecor() {
  const [isOct, setIsOct] = useState(false);
  useEffect(() => setIsOct(new Date().getMonth() === 9), []);
  if (!isOct) return null;

  return (
    <>
      <div className="pointer-events-none fixed top-24 left-2 z-40 animate-[float_1.2s_ease-in-out_infinite] drop-shadow-[0_0_18px_rgba(255,120,0,0.9)]">
        <img src="/pumpkin.png" alt="pumpkin" className="w-12 h-12 md:w-14 md:h-14" />
      </div>
      <div className="pointer-events-none fixed bottom-24 right-2 z-40 animate-[float_1.4s_ease-in-out_infinite_0.3s] drop-shadow-[0_0_18px_rgba(255,120,0,0.9)]">
        <img src="/pumpkin.png" alt="pumpkin" className="w-12 h-12 md:w-14 md:h-14" />
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-14px) rotate(4deg)}}`}</style>
    </>
  );
}