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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "semicentric",
  description:
    "scanners read the code you wrote. attackers read the system you actually shipped. semicentric maps every container, binary, and dependency you run, proves what an attacker could reach, then closes it. nothing leaves your machine.",
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
    <html lang="en" className={`${inter.variable} ${recordDisc.variable} h-full antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
