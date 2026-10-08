"use client";
import { usePathname } from "next/navigation";
import SeasonalBanner from "./SeasonalBanner";
import HalloweenFloaties from "./HalloweenFloaties";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCEO = pathname?.startsWith("/ceo");

  // CEO = cyberpunk only, no seasons, no header/footer
  if (isCEO) {
    return <>{children}</>;
  }

  // MAIN SITE = with seasons
  return (
    <>
      <HalloweenFloaties />
      <SeasonalBanner />

      <header className="border-b border-white/10 bg-black/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-[60px] flex items-center justify-between">
          <a href="/" className="font-black text-[20px] tracking-tighter text-white">
            HUSTLEHUB<span className="text-[#FF4D00]">.</span> 🎃
          </a>
          <div className="flex items-center gap-2">
            <a href="/manager" className="text-[13px] font-bold border border-white/20 bg-[#1A1A1A] text-zinc-300 px-4 py-2 rounded-full hover:text-white hover:border-zinc-500 transition">
              Manager
            </a>
            <a href="/join" className="text-[13px] font-black bg-white text-black px-5 py-2 rounded-full hover:bg-zinc-200 transition">
              + Add Your Hustle
            </a>
          </div>
        </div>
      </header>

      <div className="relative z-10">{children}</div>

      <footer className="mt-16 border-t border-white/10 bg-black relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="text-sm text-white">
              <p className="font-black text-[18px]">HUSTLEHUB<span className="text-[#FF4D00]">.</span> 🎃🦇</p>
              <p className="text-xs text-white/50 mt-1 max-w-[300px]">
                Secunda's most trusted booking platform. All businesses are manually verified.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1.5 rounded-full font-semibold">🔒 Verified Only</span>
              <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-3 py-1.5 rounded-full">🎃 Halloween Live</span>
              <span className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-white">🦇 Spooky Season</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}