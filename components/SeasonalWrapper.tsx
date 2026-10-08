"use client";

import { usePathname } from "next/navigation";
import SeasonalEffects from "@/components/SeasonalEffects";
import Footer from "@/components/Footer"; // Ensure path matches your existing Footer location

export default function SeasonalWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if current route is CEO page
  const isCeoPage = pathname?.startsWith("/ceo");

  return (
    <div className="flex flex-col min-h-screen">
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