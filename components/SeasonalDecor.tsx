"use client";
import { useEffect, useState } from "react";

export default function SeasonalDecor() {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);
  if (!show) return null;

  return (
    <>
      {/* Glowing Pumpkins - fast bounce */}
      <div className="pointer-events-none fixed top-28 left-3 z-40 text-5xl animate-[float_1.2s_ease-in-out_infinite] drop-shadow-[0_0_25px_rgba(255,140,0,1)]">🎃</div>
      <div className="pointer-events-none fixed bottom-28 right-3 z-40 text-5xl animate-[float_1.4s_ease-in-out_infinite_0.3s] drop-shadow-[0_0_25px_rgba(255,140,0,1)]">🎃</div>

      {/* BATS - flying across */}
      <div className="pointer-events-none fixed top-20 left-0 w-full z-30 overflow-hidden h-32">
        <div className="absolute text-2xl animate-[batFly_8s_linear_infinite]">🦇</div>
        <div className="absolute top-8 text-xl animate-[batFly_12s_linear_infinite_2s]">🦇</div>
        <div className="absolute top-14 text-lg animate-[batFly_9s_linear_infinite_4s]">🦇</div>
      </div>

      <style>{`
        @keyframes float{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-18px) rotate(6deg)}}
        @keyframes batFly{
          0%{transform:translateX(-50px) translateY(0px) rotate(0deg)}
          25%{transform:translateX(25vw) translateY(-10px) rotate(10deg)}
          50%{transform:translateX(50vw) translateY(10px) rotate(-10deg)}
          75%{transform:translateX(75vw) translateY(-5px) rotate(5deg)}
          100%{transform:translateX(110vw) translateY(0px) rotate(0deg)}
        }
      `}</style>
    </>
  );
}