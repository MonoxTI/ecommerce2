// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { 
  Playfair_Display, 
  Cormorant_Garamond 
} from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

// ── GOOGLE FONTS (Server-side setup) ──────────────────────
export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
});

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
});

// ── METADATA (Server-only feature) ────────────────────────
export const metadata: Metadata = {
  title: "AuraWig | Premium Human Hair Wigs",
  description: "Luxury human hair wigs.",
  keywords: ["wigs", "lace front", "HD lace", "human hair", "luxury beauty", "South Africa"],
};

// ── ROOT LAYOUT (MUST be a Server Component) ─────────────
export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body 
        className={`${playfairDisplay.variable} ${cormorantGaramond.variable} antialiased bg-[#F1F1F1]`}
      >
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}