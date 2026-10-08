"use client";
import Link from "next/link";

type Business = {
  id: string;
  name: string;
  slug: string;
  category?: string;
  cover_url?: string;
  image_url?: string;
  rating?: number;
  review_count?: number;
  location?: string;
  is_verified?: boolean;
};

export default function BusinessCard({ business }: { business: Business }) {
  const cover = business.cover_url || business.image_url || "/placeholder-salon.jpg";
  const href = `/book/${business.slug}`;

  return (
    <div className="group rounded-[20px] overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col">
      {/* 1. COVER PHOTO HEADER */}
      <div className="relative h-[160px] w-full overflow-hidden">
        <img
          src={cover}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* 3. TRUST INDICATORS ON IMAGE */}
        {business.is_verified!== false && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm">
            <span className="text-green-600">🔒</span> Verified Business
          </div>
        )}
        {business.category && (
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur text-white px-2.5 py-1 rounded-full text-[11px] font-medium">
            {business.category}
          </div>
        )}
        <div className="absolute bottom-3 left-3 text-white">
          <p className="text-[11px] opacity-90 flex items-center gap-1">
            📍 {business.location || "Secunda"} • {business.rating? `⭐ ${business.rating} (${business.review_count || 12})` : "New"}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-[16px] leading-tight line-clamp-1">{business.name}</h3>
          <p className="text-xs text-gray-500 mt-1">✅ Instant confirmation • Deposit protected</p>
        </div>

        {/* 4. VIBRANT ACTION BUTTON */}
        <Link
          href={href}
          className="mt-auto w-full bg-[#FF4D00] hover:bg-black text-white font-bold text-[14px] py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          BOOK APPOINTMENT <span>⚡</span>
        </Link>

        <p className="text-[10px] text-center text-gray-400">🔒 Secure booking • Free cancellation</p>
      </div>
    </div>
  );
}