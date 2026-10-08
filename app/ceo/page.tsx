export default function CeoPage() {
  return (
    <div className="min-h-screen bg-black text-cyan-400 font-mono p-6 md:p-12 relative overflow-hidden">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />

      <main className="max-w-4xl mx-auto relative z-10 space-y-6">
        <div className="border-b border-cyan-500/40 pb-4 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <span className="text-xs text-pink-500 font-bold tracking-widest">[ EXECUTIVE LEVEL ACCESS ]</span>
          <h1 className="text-3xl md:text-5xl font-black text-white mt-1 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
            HUSTLEHUB // CEO DASHBOARD
          </h1>
        </div>

        <div className="bg-zinc-950/90 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <h2 className="text-pink-400 font-bold mb-2">// SYSTEM OVERVIEW</h2>
          <p className="text-xs text-zinc-400">
            Cyberpunk mode active. Seasonal effects disabled on executive dashboard.
          </p>
        </div>
      </main>
    </div>
  );
}