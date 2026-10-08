"use client";
import Link from "next/link";

export default function BusinessCard({ business }: { business: any }) {
  const isSpecial =!!business.is_special;
  const href = `/${business.slug || business.id}`;

  return (
    <Link href={href}>
      <div
        className={`
          relative rounded-[20px] p-4 bg-[#121212] border cursor-pointer transition-all duration-300 overflow-hidden
          ${isSpecial
           ? "!border-[#FF4D00]!bg-[#1A1008] shadow-[0_0_25px_rgba(255,77,0,0.7),0_0_60px_rgba(255,77,0,0.3)] ring-2 ring-orange-500"
            : "border-white/10"
          }
        `}
        style={isSpecial? { borderColor: "#FF4D00", background: "#1A1008" } : {}}
      >
        {isSpecial && (
          <div className="absolute -top-2 -right-2 bg-[#FF4D00] text-black text-[11px] font-black px-3 py-1 rounded-full z-20 animate-pulse">
            🔥 SPECIAL LIVE
          </div>
        )}

        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <h3 className={`font-bold text-[16px] ${isSpecial? "text-orange-100" : "text-white"}`}>{business.name}</h3>
            {(business.is_verified || business.verified) && (
              <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-[9px] font-bold px-2 py-1 rounded-full">✓ VERIFIED</span>
            )}
          </div>
          <p className="text-[12px] text-zinc-500 mt-1">{business.category} • {business.area} {isSpecial? "• SPECIAL" : ""}</p>
          {isSpecial && <p className="text-[12px] text-[#FF8A4D] mt-2 font-black">⚡ SPECIAL OFFER LIVE!</p>}
          <div className="flex justify-between items-center mt-3">
            <p className="text-[10px] text-zinc-600">{business.views || 0} visits {isSpecial? "• SPECIAL=1" : ""}</p>
            <p className="text-[10px] text-zinc-400">Book →</p>
          </div>
        </div>
      </div>
    </Link>
  );
}