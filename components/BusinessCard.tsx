"use client";
import Link from "next/link";

type Props = {
  business: any;
};

export default function BusinessCard({ business }: Props) {
  const isSpecial = business.is_special === true;
  const isVerified = business.is_verified || business.verified;
  const href = `/${business.slug || business.id}`;

  return (
    <Link href={href}>
      <div
        className={`
          relative group rounded-[20px] p-4 bg-[#121212] border cursor-pointer
          transition-all duration-300 hover:scale-[1.02] overflow-hidden
          ${isSpecial
         ? "border-[#FF4D00] bg-[#1A0F0A] shadow-[0_0_25px_rgba(255,77,0,0.6),0_0_50px_rgba(255,77,0,0.25)] ring-2 ring-[#FF4D00]/50"
            : "border-white/10 hover:border-white/20"
          }
        `}
      >
        {isSpecial && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-2 -right-2 bg-[#FF4D00] text-black text-[10px] font-black px-3 py-1 rounded-full z-20 animate-pulse shadow-[0_0_15px_rgba(255,77,0,0.8)]">
              🔥 SPECIAL
            </div>
          </>
        )}

        <div className="relative z-10">
          <div className="flex justify-between items-start gap-2">
            <h3 className={`font-bold text-[16px] leading-tight ${isSpecial? "text-orange-100" : "text-white"}`}>
              {business.name}
            </h3>
            {isVerified && (
              <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-[9px] font-bold px-2 py-1 rounded-full shrink-0">✓ VERIFIED</span>
            )}
          </div>

          <p className="text-[12px] text-zinc-500 mt-1">{business.category} • {business.area}</p>

          {business.price_from && (
            <p className="text-[13px] font-semibold text-zinc-300 mt-3">From R{business.price_from}</p>
          )}

          {isSpecial && (
            <p className="text-[11px] text-[#FF8A4D] mt-2 font-bold tracking-wide animate-pulse">⚡ Limited Time Special — Book Now!</p>
          )}

          <div className="flex justify-between items-center mt-3">
            <p className="text-[10px] text-zinc-600">{business.views || 0} visits</p>
            <p className="text-[10px] text-zinc-400 group-hover:text-white transition-colors">Book →</p>
          </div>
        </div>
      </div>
    </Link>
  );
}