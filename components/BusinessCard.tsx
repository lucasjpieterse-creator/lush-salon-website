import Link from "next/link";

type Props = {
  business: any;
};

export default function BusinessCard({ business }: Props) {
  const rawPrice = business.base_price?? business.price?? null;
  let price = rawPrice? Number(rawPrice) : null;
  let pricingType = business.pricing_type || "fixed";

  // If price is 0 or null -> force custom
  if (!price || price === 0) {
    pricingType = "custom";
    price = null;
  }

  let buttonLabel = "Book Now →";
  let badge = null;

  if (pricingType === "variable" && price) {
    buttonLabel = "Get Estimate →";
    badge = (
      <span className="text-[11px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">
        From R{price} (Estimate)
      </span>
    );
  } else if (pricingType === "custom" ||!price) {
    buttonLabel = "Request Free Quote →";
    badge = (
      <span className="text-[11px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
        Custom Quote Required
      </span>
    );
  } else {
    // fixed
    buttonLabel = "Book Now →";
    badge = (
      <span className="text-[11px] font-black bg-white text-black px-2.5 py-1 rounded-full">
        R{price} / session
      </span>
    );
  }

  return (
    <Link href={`/${business.slug}`} className="block group">
      <div className="bg-[#111] border border-[#222] rounded-[22px] p-4 hover:border-zinc-700 transition-all hover:bg-[#151515]">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-[16px] leading-tight truncate text-white">
              {business.name}
            </h3>
            <p className="text-zinc-500 text-[12px] mt-1 capitalize">
              {business.category} • {business.location || "Secunda"}
            </p>
          </div>
          <div className="w-8 h-8 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full flex items-center justify-center text-[12px] text-purple-400">
            ✔
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {badge}
        </div>

        <div className="mt-3 flex gap-2">
          <span className="text-[10px] text-zinc-500">🔒 POPIA</span>
          <span className="text-[10px] text-zinc-500">• ⚡ WhatsApp Receipt</span>
          <span className="text-[10px] text-zinc-500">• 🇿🇦 Local</span>
        </div>

        <div className="mt-4">
          <div className="w-full bg-white text-black text-center font-black text-[13px] py-3 rounded-full group-hover:bg-zinc-200 transition">
            {buttonLabel}
          </div>
        </div>
      </div>
    </Link>
  );
}