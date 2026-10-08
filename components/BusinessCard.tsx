"use client";
import Link from "next/link";

type Props = {
  business: {
    id: string;
    slug?: string;
    name: string;
    category: string;
    area: string;
    price_from?: string;
    is_verified: boolean;
    is_special?: boolean;
    views?: number;
  };
};

export default function BusinessCard({ business }: Props) {
  const href = `/${business.slug || business.id}`;
  const isSpecial = business.is_special;

  return (
    <Link href={href}>
      <div
        className={`
          relative group rounded-[20px] p-4 bg-[#121212] border cursor-pointer
          transition-all duration-300 hover:scale-[1.02] overflow-hidden
          ${isSpecial
          ? "border-[#FF4D00] shadow-[0_0_25px_rgba(255,77,0,0.55),0_0_50px_rgba(255,77,0,0.2)] ring-2 ring-[#FF4D00]/40"
            : "border-white/10 hover:border-white/20"
          }
        `}
      >
        {isSpecial && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 to-transparent pointer-events-none"/>
            <div className="absolute -top-2 -right-2 bg-[#FF4D00] text-black text-[10px] font-black px-3 py-1 rounded-full z-20 animate-pulse">🔥 SPECIAL</div>
          </>
        )}

        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <h3 className={`font-bold text-[16px] leading-tight ${isSpecial? "text-orange-100" : "text-white"}`}>{business.name}</h3>
            {business.is_verified && <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-[9px] font-bold px-2 py-1 rounded-full">✓</span>}
          </div>
          <p className="text-[12px] text-zinc-500 mt-1">{business.category} • {business.area}</p>
          {business.price_from && <p className="text-[13px] font-semibold text-zinc-300 mt-3">From R{business.price_from}</p>}
          {isSpecial && <p className="text-[11px] text-[#FF8A4D] mt-2 font-bold">⚡ Special Offer — Book Now!</p>}
          <div className="flex justify-between items-center mt-3">
            <p className="text-[10px] text-zinc-600">{business.views || 0} visits</p>
            <p className="text-[10px] text-zinc-400 group-hover:text-white">Book →</p>
          </div>
        </div>
      </div>
    </Link>
  );
}