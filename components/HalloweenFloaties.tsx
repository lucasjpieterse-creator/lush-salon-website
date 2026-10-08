"use client";

export default function HalloweenFloaties() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Floating Pumpkins */}
      <span className="absolute animate-float1 text-[24px] left-[5%] top-[20%]">🎃</span>
      <span className="absolute animate-float2 text-[20px] left-[85%] top-[15%]">🎃</span>
      <span className="absolute animate-float3 text-[28px] left-[15%] top-[70%]">🎃</span>
      <span className="absolute animate-float1 text-[18px] left-[90%] top-[60%]">🎃</span>

      {/* Floating Bats */}
      <span className="absolute animate-bat1 text-[22px] left-[10%] top-[10%]">🦇</span>
      <span className="absolute animate-bat2 text-[20px] left-[75%] top-[25%]">🦇</span>
      <span className="absolute animate-bat1 text-[24px] left-[50%] top-[80%]">🦇</span>
      <span className="absolute animate-bat2 text-[18px] left-[30%] top-[40%]">🦇</span>

      {/* Ghosts */}
      <span className="absolute animate-float2 text-[20px] left-[60%] top-[10%]">👻</span>
      <span className="absolute animate-float3 text-[16px] left-[40%] top-[85%]">👻</span>

      <style>{`
        @keyframes float1 { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-20px) rotate(5deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0) rotate(5deg)} 50%{transform:translateY(-30px) rotate(-5deg)} }
        @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
        @keyframes bat1 { 0%,100%{transform:translateX(0) translateY(0)} 25%{transform:translateX(20px) translateY(-10px)} 50%{transform:translateX(-10px) translateY(-20px)} 75%{transform:translateX(15px) translateY(-5px)} }
        @keyframes bat2 { 0%,100%{transform:translateX(0) translateY(0)} 33%{transform:translateX(-25px) translateY(-15px)} 66%{transform:translateX(15px) translateY(-25px)} }
       .animate-float1{animation:float1 6s ease-in-out infinite}
       .animate-float2{animation:float2 8s ease-in-out infinite}
       .animate-float3{animation:float3 5s ease-in-out infinite}
       .animate-bat1{animation:bat1 10s ease-in-out infinite}
       .animate-bat2{animation:bat2 12s ease-in-out infinite}
      `}</style>
    </div>
  );
}