import type { Metadata } from "next";
import "./globals.css";
import SeasonalWrapper from "@/components/SeasonalWrapper";

export const metadata: Metadata = {
  title: "HustleHub",
  description: "Find & Book Local Hustlers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <SeasonalWrapper>{children}</SeasonalWrapper>
      </body>
    </html>
  );
}