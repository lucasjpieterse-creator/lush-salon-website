import { createClient } from "@supabase/supabase-js";

// Force dynamic server rendering so you always see live real-time metrics
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function CeoDashboard() {
  // 1. Fetch all businesses from Supabase
  const { data: businesses, error: busError } = await supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. Fetch all bookings & status logs
  const { data: bookings, error: bookError } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  // Compute key summary totals
  const totalBusinesses = businesses?.length || 0;
  const totalBookings = bookings?.length || 0;
  
  // Track system status / errors
  const failedBookings = bookings?.filter((b) => b.whatsapp_status === "failed") || [];
  const pendingBookings = bookings?.filter((b) => b.status === "pending") || [];

  return (
    <div className="min-h-screen bg-black text-cyan-400 font-mono p-4 md:p-10 relative overflow-hidden">
      {/* Cyberpunk Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-25 pointer-events-none" />

      <main className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="border-b border-cyan-500/40 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-pink-500 font-bold tracking-widest">[ EXECUTIVE COMMAND CENTER ]</span>
            <h1 className="text-3xl md:text-5xl font-black text-white mt-1 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              HUSTLEHUB // CEO OVERVIEW
            </h1>
          </div>
          <div className="flex items-center space-x-3 bg-zinc-950 border border-cyan-500/30 px-4 py-2 rounded-xl text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-300">SYSTEM: LIVE ENGINE ACTIVE</span>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-950/90 border border-cyan-500/30 rounded-xl p-5 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <p className="text-xs text-zinc-400 font-bold uppercase">Total Onboarded Shops</p>
            <p className="text-3xl font-black text-white mt-2">{totalBusinesses}</p>
            <p className="text-[10px] text-cyan-400 mt-1">Secunda / Trichardt / Evander</p>
          </div>

          <div className="bg-zinc-950/90 border border-cyan-500/30 rounded-xl p-5 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <p className="text-xs text-zinc-400 font-bold uppercase">Total Bookings</p>
            <p className="text-3xl font-black text-pink-500 mt-2">{totalBookings}</p>
            <p className="text-[10px] text-pink-400/80 mt-1">All time processed</p>
          </div>

          <div className="bg-zinc-950/90 border border-amber-500/30 rounded-xl p-5 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <p className="text-xs text-zinc-400 font-bold uppercase">Pending Actions</p>
            <p className="text-3xl font-black text-amber-400 mt-2">{pendingBookings.length}</p>
            <p className="text-[10px] text-amber-400/80 mt-1">Awaiting shop responses</p>
          </div>

          <div className="bg-zinc-950/90 border border-rose-500/30 rounded-xl p-5 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <p className="text-xs text-zinc-400 font-bold uppercase">System Alerts / Errors</p>
            <p className="text-3xl font-black text-rose-500 mt-2">{failedBookings.length}</p>
            <p className="text-[10px] text-rose-400/80 mt-1">Failed WhatsApp dispatches</p>
          </div>
        </div>

        {/* Database Connection Warnings / Flags */}
        {(busError || bookError || failedBookings.length > 0) && (
          <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-4 text-xs text-rose-300 space-y-1 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
            <p className="font-bold text-rose-400">⚠️ CRITICAL SYSTEM NOTICES:</p>
            {busError && <p>• Businesses Table Error: {busError.message}</p>}
            {bookError && <p>• Bookings Table Error: {bookError.message}</p>}
            {failedBookings.length > 0 && (
              <p>• {failedBookings.length} booking WhatsApp notification(s) failed to dispatch. Verify Meta API tokens.</p>
            )}
          </div>
        )}

        {/* Onboarded Businesses Directory */}
        <div className="bg-zinc-950/90 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-cyan-500/20 pb-3">
            <h2 className="text-lg font-bold text-white">// REGISTERED BUSINESS DIRECTORY</h2>
            <span className="text-xs text-cyan-400">{totalBusinesses} Active Listings</span>
          </div>

          {totalBusinesses === 0 ? (
            <p className="text-xs text-zinc-500 italic py-4">No businesses found in Supabase database.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase">
                    <th className="py-2.5 px-3">Business Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Pricing Model</th>
                    <th className="py-2.5 px-3">WhatsApp Contact</th>
                    <th className="py-2.5 px-3">Live Route</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {businesses?.map((b) => (
                    <tr key={b.id} className="hover:bg-cyan-950/20 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">{b.name}</td>
                      <td className="py-3 px-3 text-cyan-400">{b.category || "General"}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-zinc-800 uppercase text-pink-400">
                          {b.price_type || "Fixed"}
                        </span>
                      </td>
                      <td className="py-3 px-3">{b.phone || b.whatsapp || "N/A"}</td>
                      <td className="py-3 px-3">
                        <a
                          href={`https://hustlehubsecunda.co.za/${b.slug || ""}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 underline hover:text-cyan-300"
                        >
                          /{b.slug || "view"}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Bookings & WhatsApp Log */}
        <div className="bg-zinc-950/90 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-cyan-500/20 pb-3">// RECENT BOOKING REQUESTS</h2>
          {totalBookings === 0 ? (
            <p className="text-xs text-zinc-500 italic py-4">No recent booking logs recorded.</p>
          ) : (
            <div className="space-y-2">
              {bookings?.slice(0, 10).map((book) => (
                <div key={book.id} className="flex justify-between items-center p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs">
                  <div>
                    <p className="font-bold text-white">{book.service_name || "Custom Service"}</p>
                    <p className="text-[10px] text-zinc-400">Client: {book.client_name || "Guest"} ({book.client_phone || "No Phone"})</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      book.whatsapp_status === "failed" ? "bg-rose-900/50 text-rose-400 border border-rose-800" : "bg-emerald-900/50 text-emerald-400 border border-emerald-800"
                    }`}>
                      WhatsApp: {book.whatsapp_status || "sent"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}