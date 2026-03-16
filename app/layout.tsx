// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
//import Navbar from "@/components/layout/Navbar";
//import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "AuraWig — Premium Human Hair Wigs",
  description: "Luxury human hair wigs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        
        <main>{children}</main>
        
      </body>
    </html>
  );
}