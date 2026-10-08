"use client";
import { useEffect, useState } from "react";
import BusinessCard from "../components/BusinessCard";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  { label: "All", icon: "✨" },
  { label: "Salon", icon: "💇" },
  { label: "Nails", icon: "💅" },
  { label: "Pet Grooming", icon: "🐶" },
  { label: "Car Wash", icon: "🚗" },
  { label: "Massage", icon: "💆" },
];

export default function HomePage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBiz() {
      setLoading(true);
      const { data, error } = await supabase
       .from("businesses")
       .select("*")
       .order("created_at", { ascending: false });

      if (error) {
        console.error("SUPABASE ERROR:", error);
      } else {
        setBusinesses(data || []);
      }
      setLoading(false);
    }
    fetchBiz();
  }, []);

  const filtered = businesses.filter((b) => {
    const cat = (b.category || "").toLowerCase();
    const matchCat = active === "All" || cat.includes(active.toLowerCase());
    const matchSearch = (b.name || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-[28px] font-extrabold tracking-tight">
            Find trusted pros in Secunda <span>⚡</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Verified businesses • Instant booking • Deposit protected
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative mb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search salon, nails, car wash..."
            className="w-full bg-white border border-gray-200 rounded-full px-5 py-3.5 text-sm focus:outline-none focus:border-black"
          />
          <span className="absolute right-4 top-3.5 text-gray-400">🔍</span>
        </div>

        {/* CATEGORY PILLS */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-3 -mx-4 px-4 sticky top-0 bg-[#fafafa]/80 backdrop-blur z-10">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActive(cat.label)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                active === cat.label
                 ? "bg-black text-white border-black shadow-md scale-105"
                  : "bg-white text-gray-700 border-gray-200 hover:border-black hover:bg-white"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-center text-sm text-gray-500 mt-20">Loading businesses...</p>
        )}

        {/* GRID */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {filtered.map((biz) => (
              <BusinessCard key={biz.id} business={biz} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && businesses.length > 0 && (
          <p className="text-center text-sm text-gray-500 mt-20">
            No businesses found for "{active}"
          </p>
        )}

        {!loading && businesses.length === 0 && (
          <p className="text-center text-sm text-gray-500 mt-20">
            No businesses in database. Check Supabase table `businesses`.
          </p>
        )}
      </div>
    </main>
  );
}