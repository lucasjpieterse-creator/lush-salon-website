"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ManagerDetail() {
  const { slug } = useParams();
  const [business, setBusiness] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
      setBusiness(biz);
      if (biz) {
        const { data: books } = await supabase.from("bookings").select("*").eq("business_id", biz.id).order("created_at", { ascending: false });
        setBookings(books || []);
      }
    })();
  }, [slug]);

  if (!business) return <div className="min-h-screen bg-black text-white p-6">Loading...</div>;

  const bookingLink = `https://hustlehubsecunda.co.za/business/${business.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingLink)}`;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-6xl mx-auto">
      <Link href="/manager" className="text-sm text-zinc-500 hover:text-white">← Back to Manager Hub</Link>

      <div className="mt-6 grid md:grid-cols-3 gap-6">
        {/* BUSINESS INFO + QR */}
        <div className="md:col-span-1">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[20px] p-6">
            <h1 className="text-2xl font-black text-white">{business.name}</h1>
            <p className="text-zinc-500 text-sm mt-1">{business.category} • {business.slug}</p>

            {/* QR CODE - Auto Generated */}
            <div className="mt-6 bg-white rounded-[16px] p-4 flex flex-col items-center">
              <img
                src={qrUrl}
                alt="Business Booking QR Code"
                className="w-48 h-48 rounded-xl border border-zinc-200"
              />
              <p className="text-black font-bold text-xs mt-3 text-center">Scan to Book Instantly</p>
              <p className="text-zinc-500 text-[10px] mt-1 text-center break-all">{bookingLink}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={qrUrl} download={`${business.slug}-qr.png`} target="_blank" className="bg-white text-black text-center py-2.5 rounded-full text-xs font-bold">
                Download QR
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(bookingLink)}
                className="bg-[#2A2A2A] text-white text-center py-2.5 rounded-full text-xs font-bold border border-white/10"
              >
                Copy Link
              </button>
            </div>

            <p className="text-[11px] text-zinc-500 mt-4 text-center">Share this QR on WhatsApp Status, Facebook, or print for your shop!</p>
          </div>
        </div>

        {/* BOOKINGS LIST - stays same dark grey */}
        <div className="md:col-span-2">
          <h2 className="font-bold text-white">Bookings ({bookings.length})</h2>
          <div className="mt-4 grid gap-3">
            {bookings.map((bk) => (
              <div key={bk.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[16px] p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white text-sm">{bk.customer_name}</p>
                  <p className="text-zinc-500 text-xs">{bk.service} • {bk.date} {bk.time}</p>
                </div>
                <span className={`text-[11px] px-3 py-1 rounded-full font-bold ${bk.status === "pending"? "bg-orange-500/20 text-orange-400" : "bg-green-500/20 text-green-400"}`}>{bk.status}</span>
              </div>
            ))}
            {bookings.length === 0 && <p className="text-zinc-600 text-sm">No bookings yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}