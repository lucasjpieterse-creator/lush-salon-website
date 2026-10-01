"use client";
import { useEffect, useState } from "react";

export default function SeasonalDecor() {
  const [month, setMonth] = useState(0);
  useEffect(() => setMonth(new Date().getMonth() + 1), []);

  // Only show Oct (10) and Dec (12) - add more months later
  const isHalloween = month === 10;
  const isChristmas = month === 12;

  if (!isHalloween && !isChristmas) return null;

  return (
    <>
      {/* Top Left */}
      <div className="seasonal pumpkin tl">
        {isHalloween ? "🎃" : "🍭"}
      </div>
      {/* Bottom Right */}
      <div className="seasonal pumpkin br">
        {isHalloween ? "🎃" : "🎄"}
      </div>

      <style jsx>{`
        .seasonal {
          position: fixed;
          font-size: 38px;
          z-index: 50;
          pointer-events: none;
          filter: drop-shadow(0 0 12px rgba(255, 140, 0, 0.8));
          animation: float 3s ease-in-out infinite;
          opacity: 0.9;
        }
        .tl { top: 20px; left: 20px; animation-delay: 0s; }
        .br { bottom: 20px; right: 20px; animation-delay: 1.5s; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }

        @media (max-width: 768px) {
          .seasonal { font-size: 28px; }
          .tl { top: 10px; left: 10px; }
          .br { bottom: 10px; right: 10px; }
        }
      `}</style>
    </>
  );
}