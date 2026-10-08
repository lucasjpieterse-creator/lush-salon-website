import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HustleHub Secunda - Book Trusted Pros",
  description: "Verified salons, nail techs, car wash & more in Secunda.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white antialiased">
        {children}
      </body>
    </html>
  );
}