import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HustleHub Secunda | On-Demand Local Service Directory",
  description: "Discover and book trusted local service providers in Secunda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-black">
      <body className={`${inter.className} bg-black text-white min-h-screen antialiased`}>
        {/* Render only page content to avoid duplicate navigation header */}
        {children}
      </body>
    </html>
  );
}