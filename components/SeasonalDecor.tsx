"use client";
import { useEffect, useState } from "react";

export default function SeasonalDecor() {
  const [month, setMonth] = useState(0);
  useEffect(() => setMonth(new Date().getMonth() + 1), []);

  const isHalloween = month === 10;
  const isChristmas = month === 12;
  if (!isHalloween && !isChristmas) return null;

  return (
    <>
      {/* Top Left - MOVED BELOW NAVBAR */}
      <div className="seasonal tl">
        {isHalloween ? "🎃" : "🍭"}
      </div>
      {/* Bottom Right - perfect already */}
      <div className="seasonal br">
        {isHalloween ? "🎃" : "🎄"}
      </div>

      <style jsx>{`
        .seasonal {
          position: fixed;
          font-size: 38px;
          z-index: 9999; /* higher than navbar now */
          pointer-events: none;
          filter: drop-shadow(0 0 12px rgba(255, 140, 0, 0.9));
          animation: float 3s ease-in-out infinite;
        }
        .tl { 
          top: 75px; /* pushed down below your HustleHub bar */
          left: 15px; 
        }
        .br { 
          bottom: 15px; 
          right: 15px; 
          animation-delay: 1.5s; 
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>
    </>
  );
}