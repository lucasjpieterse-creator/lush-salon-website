"use client";
import { useEffect, useState } from "react";

export default function SeasonalDecor() {
  const [isOct, setIsOct] = useState(false);

  useEffect(() => {
    setIsOct(new Date().getMonth() === 9);
  }, []);

  if (!isOct) return null;

  return (
    <>
      <div className="pointer-events-none fixed top-24 left-6 z-40 animate-[float_1.2s_ease-in-out_infinite] drop-shadow-[0_0_15px_rgba(255,140,0,0.8)]">
        <span className="text-5xl filter drop-shadow-[0_0_12px_orange]">🎃</span>
      </div>
      <div className="pointer-events-none fixed bottom-24 right-6 z-40 animate-[float_1.4s_ease-in-out_infinite_0.3s] drop-shadow-[0_0_15px_rgba(255,140,0,0.8)]">
        <span className="text-5xl filter drop-shadow-[0_0_12px_orange]">🎃</span>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
      `}</style>
    </>
  );
}