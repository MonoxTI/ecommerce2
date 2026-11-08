"use client";
// components/FooterGate.tsx — hides the storefront footer inside the admin panel
import { usePathname } from "next/navigation";

export default function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
