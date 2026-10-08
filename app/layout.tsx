import "./globals.css";
import type { Metadata } from "next";
import SeasonalBanner from "../components/SeasonalBanner";
import HalloweenFloaties from "../components/HalloweenFloaties";

export const metadata: Metadata = {
  title: "HustleHub Secunda - Book Trusted Pros",
  description: "Verified salons, nail techs, car wash & more in Secunda. Instant booking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white antialiased relative">
        <HalloweenFloaties />
        <SeasonalBanner />
        <header className="border-b border-white/10 bg-black/50 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-[60px] flex items-center justify-between">
            <a href="/" className="font-black text-[20px] tracking-tighter text-white">
              HUSTLEHUB<span className="text-[#FF4D00]">.</span> 🎃
            </a>
            <a href="/manager" className="text-sm font-semibold border border-white/20 text-white px-4 py-2 rounded-full hover:bg-white hover:text-black transition">
              For Business
            </a>
          </div>
        </header>

        <div className="relative z-10">
          {children}
        </div>

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
                <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1.5 rounded-full font-semibold">
                  🔒 Verified Only
                </span>
                <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-3 py-1.5 rounded-full">🎃 Halloween Live</span>
                <span className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-white">🦇 Spooky Season</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}