import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kigali BIZHUB — Grow your business online",
  description:
    "An AI-powered storefront and business management platform built for Rwanda and East Africa.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}