import Link from "next/link";

type BusinessCardProps = {
  business: {
    id: string;
    name: string;
    category: string;
    area: string;
    price_from?: string;
    is_verified: boolean;
    is_special?: boolean;
    image_url?: string;
  };
};

export default function BusinessCard({ business }: BusinessCardProps) {
  const isSpecial = business.is_special;

  return (
    <Link href={`/${business.id}`}>
      <div
        className={`
          group relative rounded-[20px] border p-4 bg-[#121212]
          transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden
          ${isSpecial
           ? "border-[#FF4D00] shadow-[0_0_25px_rgba(255,77,0,0.5),0_0_50px_rgba(255,77,0,0.2)] ring-2 ring-[#FF4D00]/40"
            : "border-white/10 hover:border-white/20"
          }
        `}
      >
        {isSpecial && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent pointer-events-none" />
            <div className="absolute -top-2 -right-2 bg-[#FF4D00] text-black text-[10px] font-black px-3 py-1 rounded-full z-20 animate-pulse shadow-lg">
              🔥 SPECIAL
            </div>
          </>
        )}

        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`font-bold text-[16px] leading-tight ${isSpecial? "text-orange-100" : "text-white"}`}>
                {business.name}
              </h3>
              <p className="text-[12px] text-zinc-500 mt-1">{business.category} • {business.area}</p>
            </div>
            {business.is_verified && (
              <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-[9px] font-bold px-2 py-1 rounded-full">✓ VERIFIED</span>
            )}
          </div>

          {business.price_from && (
            <p className="text-[13px] font-semibold text-zinc-300 mt-3">From R{business.price_from}</p>
          )}

          {isSpecial && (
            <p className="text-[11px] text-[#FF8A4D] mt-2 font-bold tracking-wide">⚡ Limited Time Special — Book Now!</p>
          )}
        </div>
      </div>
    </Link>
  );
}