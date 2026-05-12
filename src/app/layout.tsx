import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Laci Cabang v3 - Portal Autentikasi Premium",
  description: "Akses masuk dan pendaftaran resmi untuk sistem Laci Cabang versi 3 dengan antarmuka yang aman dan modern.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
        {/* Pemasangan Global Sonner Toaster di Kanan Atas */}
        <Toaster />
      </body>
    </html>
  );
}
