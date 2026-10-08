"use client";

export default function HalloweenFloaties() {
  return (
    <>
      {/* TOP LEFT PUMPKIN - Glowing */}
      <div className="pointer-events-none fixed top-[70px] left-[20px] z-20">
        <span className="text-[52px] animate-glow drop-shadow-[0_0_20px_rgba(255,77,0,0.8)]">🎃</span>
      </div>

      {/* BOTTOM RIGHT PUMPKIN - Glowing */}
      <div className="pointer-events-none fixed bottom-[20px] right-[20px] z-20">
        <span className="text-[52px] animate-glow2 drop-shadow-[0_0_20px_rgba(255,77,0,0.8)]">🎃</span>
      </div>

      <style>{`
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(255,77,0,0.6)) drop-shadow(0 0 20px rgba(255,77,0,0.4)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 20px rgba(255,77,0,1)) drop-shadow(0 0 35px rgba(255,77,0,0.7)); transform: scale(1.1); }
        }
        @keyframes glow2 {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(255,77,0,0.6)) drop-shadow(0 0 20px rgba(255,77,0,0.4)); transform: scale(1) rotate(-5deg); }
          50% { filter: drop-shadow(0 0 20px rgba(255,77,0,1)) drop-shadow(0 0 35px rgba(255,77,0,0.7)); transform: scale(1.1) rotate(5deg); }
        }
       .animate-glow { animation: glow 2.5s ease-in-out infinite; }
       .animate-glow2 { animation: glow2 3s ease-in-out infinite; }
      `}</style>
    </>
  );
}