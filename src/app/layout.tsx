import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daphny Dodo Cuisine — Lagos Kitchen | Order Nigerian Food Online",
  description:
    "Authentic Nigerian cuisine cooked over firewood and delivered hot across Lagos. Egusi, smoky party jollof, grilled tilapia, suya and zobo — order in-app and confirm on WhatsApp.",
  keywords: [
    "Nigerian food Lagos",
    "jollof rice delivery",
    "egusi soup",
    "suya",
    "Daphny Dodo Cuisine",
    "food delivery Lekki",
  ],
  openGraph: {
    title: "Daphny Dodo Cuisine — Lagos Kitchen",
    description:
      "Wood-fire Nigerian cooking delivered across Lagos. Build your order, pay on confirmation.",
    type: "website",
    locale: "en_NG",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b4d3e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,500&family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-canvas font-sans text-charcoal antialiased">
        {children}
      </body>
    </html>
  );
}
