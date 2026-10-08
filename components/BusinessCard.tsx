"use client";
import Link from "next/link";

export default function BusinessCard({ business }: { business: any }) {
  const image = business.image_url || business.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80";

  return (
    <div className="bg-white rounded-[16px] border overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
      {/* IMAGE */}
      <div className="relative h-[180px] bg-gray-100">
        <img src={image} alt={business.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* TOP BADGES */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[11px] font-bold shadow">
          🔒 Verified Business
        </div>
        <div className="absolute top-3 right-3 bg-black/80 text-white px-3 py-1 rounded-full text-[11px] font-bold">
          {business.category}
        </div>

        {/* LOCATION */}
        <div className="absolute bottom-3 left-3 text-white text-[12px] font-semibold flex items-center gap-1">
          📍 {business.location || "Secunda"} • New
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <h3 className="font-bold text-[16px]">{business.name}</h3>
        <p className="text-[12px] text-gray-500 mt-1 flex items-center gap-1">
          <span className="text-green-600">✅</span> Instant confirmation • Deposit protected
        </p>

        <Link href={`/business/${business.id}`}>
          <button className="mt-3 w-full bg-[#FF4D00] hover:bg-black text-white font-black text-[13px] py-3 rounded-[12px] transition-all">
            BOOK APPOINTMENT ⚡
          </button>
        </Link>

        <p className="text-[10px] text-gray-400 text-center mt-2">🔒 Secure booking • Free cancellation</p>
      </div>
    </div>
  );
}