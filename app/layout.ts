// app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title:       "AuraWig — Premium Human Hair Wigs",
  description: "Luxury human hair wigs. Lace front, full lace, and HD lace collections. Crafted for the woman who demands the finest.",
  keywords:    "human hair wigs, lace front, HD lace, luxury wigs, South Africa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}