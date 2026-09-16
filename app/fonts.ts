import localFont from "next/font/local";
import { Cormorant_Garamond } from "next/font/google";

// Place your licensed Quiche files in /public/fonts/
export const quicheStencil = localFont({
  src: [
    { path: "../public/fonts/QuicheDisplay-StencilRegular.woff2", weight: "400" },
    { path: "../public/fonts/QuicheDisplay-StencilBold.woff2", weight: "700" },
  ],
  variable: "--font-quiche-stencil",
  display: "swap",
});

export const quiche = localFont({
  src: [
    { path: "../public/fonts/QuicheDisplay-Light.woff2", weight: "300" },
    { path: "../public/fonts/QuicheDisplay-Regular.woff2", weight: "400" },
    { path: "../public/fonts/QuicheDisplay-Medium.woff2", weight: "500" },
  ],
  variable: "--font-quiche",
  display: "swap",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});