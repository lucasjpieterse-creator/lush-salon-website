"use client";
import { usePathname } from "next/navigation";
import HalloweenBats from "./HalloweenBats";
import HalloweenFloaties from "./HalloweenFloaties";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCeo = pathname?.startsWith("/ceo");
  if (isCeo) return <>{children}</>;

  const Bats = HalloweenBats as any;
  const Floaties = HalloweenFloaties as any;

  return (
    <>
      {children}
      <Floaties />
      <Bats />
    </>
  );
}