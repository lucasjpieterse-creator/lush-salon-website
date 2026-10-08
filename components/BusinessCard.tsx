"use client";
import Link from "next/link";

export default function BusinessCard({ business }: { business: any }) {
  const image = business.cover_image_url || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80";

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[20px] overflow-hidden hover:border-zinc-600 transition-all hover:-translate-y-1">
      <div className="relative h-[190px] bg-zinc-900">
        <img src={image} alt={business.name} className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur border border-white/10 text-white px-3 py-1 rounded-full text-[11px] font-bold">
          🔒 Verified
        </div>
        <div className="absolute top-3 right-3 bg-[#1A1A1A] border border-white/10 text-white px-3 py-1 rounded-full text-[11px] font-bold">
          {business.category}
        </div>
        <div className="absolute bottom-3 left-3 text-white text-[12px] font-medium">
          📍 {business.location || "Secunda"}
        </div>
      </div>

      <div className="p-4 bg-[#1A1A1A]">
        <h3 className="font-bold text-[16px] text-white">{business.name}</h3>
        <p className="text-[12px] text-zinc-400 mt-1">✅ Instant confirmation • Deposit protected</p>
        <Link href={`/${business.slug}`}>
          <button className="mt-4 w-full bg-white text-black hover:bg-zinc-200 font-black text-[13px] py-3 rounded-full transition">
            BOOK APPOINTMENT ⚡
          </button>
        </Link>
      </div>
    </div>
  );
}