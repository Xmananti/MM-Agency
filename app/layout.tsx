import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MM Agency - Multi-Vendor Marketplace",
  description: "A production-ready multi-vendor SaaS marketplace platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
