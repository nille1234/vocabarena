"use client";
import type * as React from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useEffect } from "react";

const fontSans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
});

const fontHeading = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <title>Quizzy - Interactive Vocabulary Learning</title>
        <meta name="description" content="Team-based vocabulary competition platform" />
      </head>
      <body className={`${fontSans.variable} ${fontHeading.variable} font-sans antialiased`}>
          {children}
          <Toaster />
          <Sonner />
      </body>
    </html>
  );
}
