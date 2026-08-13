import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar";
import { getCounts } from "@/lib/db";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Residency Explorer — Neurology",
  description: "Local mirror of AAMC Residency Explorer neurology program data",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const counts = getCounts();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar programCount={counts.programs} />
        {children}
      </body>
    </html>
  );
}
