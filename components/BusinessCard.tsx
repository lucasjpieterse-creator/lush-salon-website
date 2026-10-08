"use client";
import Link from "next/link";

export default function BusinessCard({ business }: { business: any }) {
  const image = business.cover_image_url || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80";

  return (
    <div className="bg-white rounded-[16px] border border-white/10 overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
      <div className="relative h-[190px] bg-gray-100">
        <img src={image} alt={business.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-[11px] font-black text-black shadow">
          🔒 Verified
        </div>
        <div className="absolute top-3 right-3 bg-black text-white px-3 py-1 rounded-full text-[11px] font-bold">
          {business.category}
        </div>
      </div>

      <div className="p-4 bg-white">
        <h3 className="font-black text-[17px] text-black leading-tight">{business.name}</h3>
        <p className="text-[12px] text-gray-600 mt-1 font-medium">📍 {business.location || "Secunda"} • ✅ Deposit protected</p>
        <Link href={`/business/${business.id}`}>
          <button className="mt-3 w-full bg-[#FF4D00] hover:bg-black text-white font-black text-[13px] py-3 rounded-[12px] transition">
            BOOK APPOINTMENT ⚡
          </button>
        </Link>
      </div>
    </div>
  );
}