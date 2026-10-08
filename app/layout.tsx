import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HustleHub Secunda - Book Trusted Pros",
  description: "Verified salons, nail techs, car wash & more in Secunda. Instant booking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased">
        {/* NAV */}
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-[60px] flex items-center justify-between">
            <a href="/" className="font-black text-[20px] tracking-tighter">
              HUSTLEHUB<span className="text-[#FF4D00]">.</span>
            </a>
            <a
              href="/dashboard"
              className="text-sm font-semibold border px-4 py-2 rounded-full hover:bg-black hover:text-white transition"
            >
              For Business
            </a>
          </div>
        </header>

        {children}

        {/* 3. TRUST FOOTER */}
        <footer className="mt-16 border-t bg-white">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
              <div className="text-sm">
                <p className="font-black text-[18px]">HUSTLEHUB<span className="text-[#FF4D00]">.</span></p>
                <p className="text-xs text-gray-500 mt-1 max-w-[300px]">
                  Secunda's most trusted booking platform. All businesses are manually verified.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-semibold">
                  🔒 Verified Businesses Only
                </span>
                <span className="bg-gray-50 border px-3 py-1.5 rounded-full">✓ Secure by Paystack</span>
                <span className="bg-gray-50 border px-3 py-1.5 rounded-full">⚡ Instant Confirmation</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t flex flex-col md:flex-row gap-3 justify-between text-[11px] text-gray-500">
              <div className="flex gap-4">
                <a href="/terms" className="hover:underline hover:text-black">Terms & Conditions</a>
                <a href="/privacy" className="hover:underline hover:text-black">Privacy Policy</a>
                <a href="/refund" className="hover:underline hover:text-black">Refund Policy</a>
              </div>
              <div>© 2026 HustleHub Secunda • Built for trust</div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}