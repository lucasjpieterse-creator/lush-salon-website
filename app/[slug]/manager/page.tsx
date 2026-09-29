"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default function ManagerPage() {
  const { slug } = useParams() as { slug: string };
  const [business, setBusiness] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      let { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
      if (!biz) {
        const alt = slug === "glamour-locks"? "glamourlocks" : slug.replace(/-/g, "");
        const r = await supabase.from("businesses").select("*").eq("slug", alt).single();
        biz = r.data;
      }
      setBusiness(biz);
      if (biz) {
        const { data } = await supabase.from("bookings").select("*, services(name,price)").eq("business_id", biz.id).order("created_at", { ascending: false });
        setBookings(data || []);
      }
    }
    load();
  }, [slug]);

  if (!business) return <div className="p-8 bg-black min-h-screen text-white">Loading {slug}...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto">
      <div className="flex justify-between text-sm">
        <Link href="/manager" className="text-zinc-400">← All Managers</Link>
        <Link href={`/${slug}`} className="text-zinc-400">View Booking Page →</Link>
      </div>
      <h1 className="text-3xl font-black mt-6">{business.name}</h1>
      <p className="text-zinc-400 mt-1">{business.owner_name} • {bookings.length} bookings</p>
      <div className="mt-6 space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex justify-between font-bold"><span>{b.services?.name}</span><span>R{b.services?.price}</span></div>
            <div className="text-xs text-zinc-400 mt-1">{new Date(b.created_at).toLocaleString()}</div>
          </div>
        ))}
        {bookings.length === 0 && <div className="bg-zinc-900 p-8 rounded-xl text-center text-zinc-500">No bookings yet. Go test one!</div>}
      </div>
    </div>
  );
}