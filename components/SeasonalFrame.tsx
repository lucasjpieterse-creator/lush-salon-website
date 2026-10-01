"use client";
import { useEffect, useState } from "react";

export default function SeasonalFrame({
  hasSpecial,
  children,
  badgeText
}: {
  hasSpecial: boolean,
  children: React.ReactNode,
  badgeText?: string
}) {
  const [month, setMonth] = useState(0);
  useEffect(() => setMonth(new Date().getMonth()+1), []);

  const isHalloween = month === 10;

  if (!hasSpecial ||!isHalloween) return <>{children}</>;

  return (
    <div className="relative halloween-card">
      <div className="absolute -top-3 -left-3 text-2xl animate-bounce">🦇</div>
      <div className="absolute -top-3 -right-3 text-2xl animate-bounce delay-200">🦇</div>
      <div className="absolute -bottom-2 -left-2 text-xl">🕸️</div>

      <div className="absolute top-2 right-2 bg-orange-600 text-white text-[11px] font-bold px-2 py-1 rounded-full z-10 shadow-lg">
        🎃 {badgeText || "HALLOWEEN SPECIAL"}
      </div>

      <div className="rounded-xl border-2 border-orange-500 shadow-[0_0_20px_rgba(255,100,0,0.5)] overflow-hidden">
        {children}
      </div>
    </div>
  );
}