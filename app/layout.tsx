import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeScript } from "@/components/ThemeScript";

const fontSans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: 'swap',
});

const fontHeading = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Quizzy - Interactive Vocabulary Learning",
  description: "Team-based vocabulary competition platform",
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${fontSans.variable} ${fontHeading.variable} font-sans antialiased`} style={{ minHeight: '100vh' }}>
        {children}
        <Toaster />
        <Sonner />
      </body>
    </html>
  );
}
