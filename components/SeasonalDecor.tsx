"use client";
import { useEffect, useState } from "react";

export default function SeasonalDecor() {
  const [isOct, setIsOct] = useState(false);

  useEffect(() => {
    setIsOct(new Date().getMonth() === 9); // October only
  }, []);

  if (!isOct) return null;

  return (
    <div id="halloween-root" className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      <div className="absolute top-24 left-6 text-4xl animate-[bounce_3s_infinite]">🎃</div>
      <div className="absolute bottom-24 right-6 text-4xl animate-[bounce_3.5s_infinite]">🎃</div>
    </div>
  );
}