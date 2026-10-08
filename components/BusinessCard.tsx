"use client";
import Link from "next/link";

export default function BusinessCard({ business }: { business: any }) {
  const isSpecial =!!business.is_special ||!!business.halloween_special;
  const isVerified = business.is_verified || business.verified;
  const href = `/${business.slug || business.id}`;

  return (
    <Link href={href} className="block">
      <div
        className={`
          relative rounded-[20px] p-4 bg-[#121212] border cursor-pointer
          transition-all duration-300 hover:scale-[1.02] group
          ${isSpecial
         ? "border-[#FF4D00] bg-[#1A1008] shadow-[0_0_20px_rgba(255,77,0,0.5)]"
            : "border-white/10 hover:border-white/20"
          }
        `}
      >
        {/* BADGE - NOW FITS INSIDE */}
        {isSpecial && (
          <div className="absolute top-0 right-0 bg-[#FF4D00] text-black text-[10px] font-black px-3 py-1 rounded-tr-[20px] rounded-bl-[12px] z-20 tracking-wide">
            🔥 SPECIAL LIVE
          </div>
        )}

        <div className="pt-1">
          <div className="flex justify-between items-start gap-3 pr-[110px]">
            <h3 className={`font-bold text-[16px] leading-tight ${isSpecial? "text-white" : "text-white"}`}>
              {business.name}
            </h3>
          </div>

          {isVerified && (
            <div className="mt-2">
              <span className="inline-flex bg-[#1E3A2A] text-[#6EE7A0] border border-[#2A5A3A] text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wide">
                ✓ VERIFIED
              </span>
            </div>
          )}

          <p className="text-[12px] text-zinc-500 mt-2">{business.category} • {business.area}</p>

          {isSpecial && (
            <p className="text-[11px] text-[#FF8A4D] mt-3 font-black tracking-wide flex items-center gap-1">
              ⚡ SPECIAL OFFER LIVE!
            </p>
          )}

          <div className="flex justify-end items-center mt-4">
            <p className="text-[12px] text-zinc-500 group-hover:text-white transition-colors">Book →</p>
          </div>
        </div>
      </div>
    </Link>
  );
}