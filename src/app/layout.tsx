import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CutCAD.ai | Precision Laser Cutting Intelligence",
  description: "The ultimate AI-driven parametric engine for laser cutting and CNC.",
};

import { GlobalNav } from "@/components/GlobalNav";
import { NeuralField } from "@/components/NeuralField";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`} suppressHydrationWarning>
      <body className="h-full bg-background text-foreground overflow-hidden flex relative industrial-grid">
        <GlobalNav />
        <main className="flex-1 h-full overflow-y-auto relative scroll-smooth z-10 bg-black/20 backdrop-blur-[1px]">
          {children}
        </main>
      </body>
    </html>
  );
}
