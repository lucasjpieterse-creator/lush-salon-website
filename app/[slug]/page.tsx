"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function BookingPage() {
  const { slug } = useParams() as { slug: string };
  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
      if (!biz) {
        const alt = slug === "glamour-locks"? "glamourlocks" : slug.replace(/-/g, "");
        const r = await supabase.from("businesses").select("*").eq("slug", alt).single();
        biz = r.data;
      }
      if (!biz) { setLoading(false); return; }
      setBusiness(biz);
      const { data: serv } = await supabase.from("services").select("*").eq("business_id", biz.id);
      setServices(serv || []);
      setLoading(false);
    }
    load();
  }, [slug]);

  const bookNow = async () => {
    if (!selected ||!business) return;
    const { error } = await supabase.from("bookings").insert({
      business_id: business.id,
      service_id: selected.id,
    });
    if (!error) {
      alert(`Booked ${selected.name} at ${business.name}! Check manager page.`);
      window.location.href = `/${slug}/manager`;
    } else {
      alert("Error: " + error.message);
    }
  };

  if (loading) return <div className="p-10 bg-black min-h-screen text-white">Loading {slug}...</div>;
  if (!business) return <div className="p-10 bg-black min-h-screen text-white">Business not found: {slug}</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-md mx-auto">
      <Link href="/" className="text-zinc-400 text-sm">← Home</Link>
      <h1 className="text-3xl font-black mt-4">{business.name}</h1>
      <p className="text-zinc-400">{business.owner_name}</p>
      <div className="mt-6 space-y-3">
        {services.map((s) => (
          <button key={s.id} onClick={() => setSelected(s)} className={`w-full text-left p-4 rounded-xl border ${selected?.id === s.id? "border-white bg-zinc-900" : "border-zinc-800 bg-zinc-900/50"}`}>
            <div className="flex justify-between font-bold"><span>{s.name}</span><span>R{s.price}</span></div>
          </button>
        ))}
      </div>
      <button onClick={bookNow} disabled={!selected} className="w-full mt-6 bg-white text-black py-4 rounded-xl font-black disabled:opacity-30">Book Now</button>
      <Link href={`/${slug}/manager`} className="block text-center mt-4 text-zinc-500 text-sm">Go to Manager →</Link>
    </div>
  );
}