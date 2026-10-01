import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SeasonalDecor from "@/components/SeasonalDecor";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HustleHub TEKS - Find & Book Local Hustles 24/7",
  description: "Book barbers, nail techs, car wash on WhatsApp anytime",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SeasonalDecor />
        {children}
      </body>
    </html>
  );
}