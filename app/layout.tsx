import type { Metadata } from "next";
import "./globals.css";
import SeasonalDecor from "@/components/SeasonalDecor";

export const metadata: Metadata = {
  title: "HustleHub",
  description: "Book local services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black text-white antialiased">
        {/* Pumpkins only here - once for whole site */}
        <SeasonalDecor />
        {children}
      </body>
    </html>
  );
}