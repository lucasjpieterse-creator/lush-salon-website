"use client";
import { useEffect, useState } from "react";

export default function HalloweenBats() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* bat 1 */}
      <div className="absolute top-[5%] left-[-10%] animate-[fly_12s_linear_infinite] text-[28px]">🦇</div>
      {/* bat 2 */}
      <div className="absolute top-[15%] left-[-15%] animate-[fly_18s_linear_infinite_2s] text-[22px]">🦇</div>
      {/* bat 3 */}
      <div className="absolute top-[25%] left-[-10%] animate-[fly_15s_linear_infinite_4s] text-[18px]">🦇</div>
      {/* bat 4 small */}
      <div className="absolute top-[8%] left-[-5%] animate-[fly_10s_linear_infinite_1s] text-[14px]">🦇</div>

      <style jsx>{`
        @keyframes fly {
          0% { transform: translateX(0) translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(120vw) translateY(-20vh) rotate(20deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}