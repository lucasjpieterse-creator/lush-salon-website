"use client";

import { usePathname } from "next/navigation";
import SeasonalEffects from "@/components/SeasonalEffects";

export default function SeasonalWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if current route is the CEO page or any CEO sub-route
  const isCeoPage = pathname?.startsWith("/ceo");

  return (
    <>
      {children}
      {/* Show seasonal effects everywhere EXCEPT on /ceo */}
      {!isCeoPage && <SeasonalEffects />}
    </>
  );
}