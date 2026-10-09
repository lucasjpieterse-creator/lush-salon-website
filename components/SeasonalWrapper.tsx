"use client";

import { usePathname } from "next/navigation";
import SeasonalEffects from "@/components/SeasonalEffects";
import Footer from "./Footer";
import Link from "next/link";

export default function SeasonalWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if current route is CEO page
  const isCeoPage = pathname?.startsWith("/ceo");

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Top Header Navigation (Shown on main site, hidden on /ceo) */}
      {!isCeoPage && (
        <header className="w-full bg-black/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-40 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Logo / Home Link */}
            <Link href="/" className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
              <span className="text-orange-500">HustleHub</span>
              <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">
                Secunda
              </span>
            </Link>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 z-50">
              {/* + Add Hustle Button */}
              <Link
                href="/add-hustle"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-lg shadow-emerald-900/20"
              >
                <span>+</span> Add Hustle
              </Link>

              {/* Manager / Owner Portal Button */}
              <Link
                href="/ceo"
                className="bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-cyan-500/40 font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-lg shadow-cyan-950/40"
              >
                Manager Portal 💼
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Page Content */}
      <main className="flex-grow">{children}</main>

      {/* Show Seasonal Effects and POPIA Footer ONLY when not on /ceo */}
      {!isCeoPage && (
        <>
          <SeasonalEffects />
          <Footer />
        </>
      )}
    </div>
  );
}