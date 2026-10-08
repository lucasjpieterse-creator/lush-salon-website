"use client";
import { useState } from "react";

export default function SeasonalBanner() {
  const [show, setShow] = useState(true);
  if (!show) return null;

  return (
    <div className="w-full bg-gradient-to-r from-orange-500 to-[#FF4D00] text-white text-center py-2.5 px-4 text-[13px] font-bold flex items-center justify-center gap-3 sticky top-0 z-[100]">
      <span>🎃 Spooky Season in Secunda — Book your glow-up & get 10% off! 👻</span>
      <button
        onClick={() => setShow(false)}
        className="ml-2 bg-white/20 hover:bg-white/30 rounded-full w-5 h-5 flex items-center justify-center text-[12px]"
      >
        ✕
      </button>
    </div>
  );
}