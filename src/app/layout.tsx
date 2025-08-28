import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Risk It!",
  description: "A thrilling betting game",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="text-center pt-4 pb-2">
          <h1 className="text-2xl font-bold text-white">
            You&apos;ve gotta{" "}
            <span className="text-green-400">💰 RISK IT 💰</span> to get the{" "}
            <span className="text-orange-400">🍪 BISCUIT 🍪</span>!
          </h1>
        </div>
        {children}
      </body>
    </html>
  );
}
