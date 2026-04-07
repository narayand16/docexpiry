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
  title: {
    default: "DocExpiry — Never Miss a License Renewal",
    template: "%s | DocExpiry",
  },
  description:
    "Free tool for small business owners to track FSSAI, Fire NOC, GST, and other license expiry dates. Get WhatsApp reminders before you get fined.",
  keywords: [
    "FSSAI renewal reminder",
    "business license expiry tracker",
    "document expiry tracker India",
    "GST renewal reminder",
    "Fire NOC expiry",
    "shop licence renewal",
  ],
  openGraph: {
    title: "DocExpiry — Never Miss a License Renewal",
    description:
      "Track your business document expiry dates. Free WhatsApp reminders.",
    url: "https://docexpiry.in",
    siteName: "DocExpiry",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DocExpiry — Never Miss a License Renewal",
    description:
      "Track FSSAI, Fire NOC, GST and other license expiry dates. Free.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://docexpiry.in"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
