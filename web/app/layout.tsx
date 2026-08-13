import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./Navbar";
import { getCounts } from "@/lib/db";

export const metadata: Metadata = {
  title: "Neurology Programs",
  description: "Neurology residency program data browser",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const counts = getCounts();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar programCount={counts.programs} />
        {children}
      </body>
    </html>
  );
}
