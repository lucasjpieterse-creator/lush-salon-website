import type { Metadata } from "next";
import "./globals.css";
import HalloweenBats from "@/components/HalloweenBats";

export const metadata: Metadata = {
  title: "HustleHub",
  description: "Find & Book Local Hustlers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black">
        {children}
        <HalloweenBats />
      </body>
    </html>
  );
}