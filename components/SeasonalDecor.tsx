"use client";

export default function SeasonalDecor() {
  return (
    <>
      {/* Flying Bats - UNTOUCHED */}
      <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
        <span className="absolute top-[10%] left-0 text-2xl animate-[fly_8s_linear_infinite]">🦇</span>
        <span className="absolute top-[15%] left-0 text-xl animate-[fly_10s_linear_infinite_1s]">🦇</span>
        <span className="absolute top-[8%] left-0 text-lg animate-[fly_12s_linear_infinite_2s]">🦇</span>
      </div>

      {/* Left Pumpkin - SINGLE + FAST FLOAT */}
      <div className="fixed top-2 left-2 md:top-4 md:left-4 z-50 pointer-events-none select-none animate-[pumpkinFloat_2.2s_ease-in-out_infinite]">
        <div className="text-3xl md:text-5xl drop-shadow-[0_0_12px_rgba(255,140,0,0.8)]">
          🎃
        </div>
      </div>

      {/* Right Pumpkin - SINGLE + FAST FLOAT */}
      <div className="fixed top-2 right-2 md:top-4 md:right-4 z-50 pointer-events-none select-none animate-[pumpkinFloat_2.2s_ease-in-out_infinite_0.3s]">
        <div className="text-3xl md:text-5xl drop-shadow-[0_0_12px_rgba(255,140,0,0.8)]">
          🎃
        </div>
      </div>

      <style jsx>{`
        @keyframes fly {
          0% { transform: translateX(-50px) translateY(0px); }
          25% { transform: translateX(25vw) translateY(-20px); }
          50% { transform: translateX(50vw) translateY(10px); }
          75% { transform: translateX(75vw) translateY(-15px); }
          100% { transform: translateX(110vw) translateY(0px); }
        }
        @keyframes pumpkinFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </>
  );
}