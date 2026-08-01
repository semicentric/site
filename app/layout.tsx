import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});



const instrumentSans = localFont({
  variable: "--font-instrument-sans",
  src: [
    { path: "./fonts/instrument-sans-semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/instrument-sans-bold.woff2", weight: "700", style: "normal" },
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
    "semicentric is a security company. the machine in front of you should answer to you.",
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
      className={`${inter.variable} ${instrumentSans.variable} h-full antialiased`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
