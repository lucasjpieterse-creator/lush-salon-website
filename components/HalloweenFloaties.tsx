"use client";

export default function HalloweenFloaties() {
  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {/* 3 BIG PUMPKINS */}
      <span className="absolute animate-float1 text-[48px] left-[8%] top-[15%] opacity-80">🎃</span>
      <span className="absolute animate-float2 text-[56px] left-[50%] top-[40%] opacity-80">🎃</span>
      <span className="absolute animate-float3 text-[44px] left-[85%] top-[20%] opacity-80">🎃</span>

      {/* 3 BIG BATS */}
      <span className="absolute animate-bat1 text-[42px] left-[20%] top-[60%] opacity-70">🦇</span>
      <span className="absolute animate-bat2 text-[48px] left-[70%] top-[70%] opacity-70">🦇</span>
      <span className="absolute animate-bat1 text-[36px] left-[45%] top-[10%] opacity-70">🦇</span>

      <style>{`
        @keyframes float1 { 0%,100%{transform:translateY(0) rotate(-10deg)} 50%{transform:translateY(-40px) rotate(10deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0) rotate(10deg)} 50%{transform:translateY(-50px) rotate(-10deg)} }
        @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-30px)} }
        @keyframes bat1 { 0%,100%{transform:translateX(0) translateY(0)} 25%{transform:translateX(100px) translateY(-30px)} 50%{transform:translateX(50px) translateY(-60px)} 75%{transform:translateX(-50px) translateY(-20px)} }
        @keyframes bat2 { 0%,100%{transform:translateX(0) translateY(0)} 33%{transform:translateX(-80px) translateY(-40px)} 66%{transform:translateX(80px) translateY(-70px)} }
      .animate-float1{animation:float1 4s ease-in-out infinite}
      .animate-float2{animation:float2 5s ease-in-out infinite}
      .animate-float3{animation:float3 4.5s ease-in-out infinite}
      .animate-bat1{animation:bat1 8s ease-in-out infinite}
      .animate-bat2{animation:bat2 9s ease-in-out infinite}
      `}</style>
    </div>
  );
}