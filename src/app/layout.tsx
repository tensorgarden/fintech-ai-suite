import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fintech AI Suite -- Portfolio Analytics & Fraud Detection",
  description:
    "Financial services dashboard with portfolio analytics, fraud detection, KYC automation, and financial reporting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
