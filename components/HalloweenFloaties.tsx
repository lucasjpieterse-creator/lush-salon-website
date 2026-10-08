"use client";

export default function HalloweenFloaties() {
  return (
    <>
      {/* TOP LEFT PUMPKIN - Glowing + Floating */}
      <div className="pointer-events-none fixed top-[75px] left-[25px] z-20 animate-floatSlow">
        <span className="text-[44px] animate-glow drop-shadow-[0_0_20px_rgba(255,77,0,0.9)]">🎃</span>
      </div>

      {/* BOTTOM RIGHT PUMPKIN - Glowing + Floating */}
      <div className="pointer-events-none fixed bottom-[30px] right-[25px] z-20 animate-floatSlow2">
        <span className="text-[44px] animate-glow2 drop-shadow-[0_0_20px_rgba(255,77,0,0.9)]">🎃</span>
      </div>

      {/* SMALL BATS GOING OVER SCREEN */}
      <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
        <span className="absolute text-[16px] animate-batFly1 top-[15%]">🦇</span>
        <span className="absolute text-[14px] animate-batFly2 top-[35%]">🦇</span>
        <span className="absolute text-[12px] animate-batFly3 top-[65%]">🦇</span>
      </div>

      <style>{`
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(255,77,0,0.7)) drop-shadow(0 0 20px rgba(255,77,0,0.4)); }
          50% { filter: drop-shadow(0 0 25px rgba(255,77,0,1)) drop-shadow(0 0 40px rgba(255,77,0,0.6)); }
        }
        @keyframes glow2 {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(255,77,0,0.7)) drop-shadow(0 0 20px rgba(255,77,0,0.4)); }
          50% { filter: drop-shadow(0 0 25px rgba(255,77,0,1)) drop-shadow(0 0 40px rgba(255,77,0,0.6)); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes floatSlow2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes batFly1 {
          0% { left: -5%; transform: translateY(0px) }
          50% { transform: translateY(-20px) }
          100% { left: 105%; transform: translateY(10px) }
        }
        @keyframes batFly2 {
          0% { left: 105%; transform: translateY(0px) }
          50% { transform: translateY(15px) }
          100% { left: -5%; transform: translateY(-10px) }
        }
        @keyframes batFly3 {
          0% { left: -5%; transform: translateY(0px) }
          100% { left: 105%; transform: translateY(-15px) }
        }
       .animate-glow { animation: glow 2.5s ease-in-out infinite; }
       .animate-glow2 { animation: glow2 3s ease-in-out infinite; }
       .animate-floatSlow { animation: floatSlow 3s ease-in-out infinite; }
       .animate-floatSlow2 { animation: floatSlow2 3.5s ease-in-out infinite; }
       .animate-batFly1 { animation: batFly1 18s linear infinite; }
       .animate-batFly2 { animation: batFly2 22s linear infinite; }
       .animate-batFly3 { animation: batFly3 26s linear infinite; opacity: 0.7; }
      `}</style>
    </>
  );
}