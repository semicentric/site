import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const recordDisc = localFont({
  variable: "--font-record-disc",
  src: [
    { path: "./fonts/RecordDisc-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/RecordDisc-Medium.woff2", weight: "500", style: "normal" },
  ],
});

const zodiak = localFont({
  variable: "--font-zodiak",
  src: [
    { path: "./fonts/zodiak-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/zodiak-bold.woff2", weight: "700", style: "normal" },
  ],
});

const basteleur = localFont({
  variable: "--font-basteleur",
  src: [
    { path: "./fonts/basteleur-moonlight.woff2", weight: "400", style: "normal" },
    { path: "./fonts/basteleur-bold.woff2", weight: "700", style: "normal" },
  ],
});

const sligoil = localFont({
  variable: "--font-sligoil",
  src: [
    { path: "./fonts/sligoil-micro.woff2", weight: "400", style: "normal" },
    { path: "./fonts/sligoil-micro-medium.woff2", weight: "500", style: "normal" },
  ],
});

const bluuNext = localFont({
  variable: "--font-bluu-next",
  src: [{ path: "./fonts/bluu-next-bold.woff2", weight: "400", style: "normal" }],
});

const cabinetGrotesk = localFont({
  variable: "--font-cabinet-grotesk",
  src: [
    { path: "./fonts/cabinet-grotesk-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cabinet-grotesk-bold.woff2", weight: "700", style: "normal" },
  ],
});

const departureMono = localFont({
  variable: "--font-departure-mono",
  src: [{ path: "./fonts/departure-mono-regular.woff2", weight: "400", style: "normal" }],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "semicentric",
  description:
    "semicentric is a security company. we work on software that reads the systems people actually run.",
  openGraph: {
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${recordDisc.variable} ${zodiak.variable} ${basteleur.variable} ${sligoil.variable} ${bluuNext.variable} ${cabinetGrotesk.variable} ${departureMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
