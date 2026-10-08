"use client";
import { usePathname } from "next/navigation";
import HalloweenBats from "./HalloweenBats";
import HalloweenFloaties from "./HalloweenFloaties";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCeo = pathname?.startsWith("/ceo");

  if (isCeo) {
    // CEO = pure cyberpunk, NO season effects
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <HalloweenFloaties />
      <HalloweenBats />
    </>
  );
}