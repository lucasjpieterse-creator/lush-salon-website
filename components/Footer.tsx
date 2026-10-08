// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-black py-8 px-4 text-zinc-400 text-xs mt-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-white text-sm">HustleHub Secunda</p>
          <p className="text-zinc-500 mt-0.5">
            Local Service Marketplace • Secunda, Trichardt & Evander
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-zinc-400">
          <span className="text-emerald-500 font-semibold flex items-center gap-1">
            🔒 POPIA Compliant
          </span>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms & Conditions
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-zinc-900 text-center text-[10px] text-zinc-600">
        © {new Date().getFullYear()} HustleHub Secunda. All rights reserved.
      </div>
    </footer>
  );
}