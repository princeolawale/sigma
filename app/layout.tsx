import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIGMA | AI-Powered Token Risk Analysis",
  description:
    "Analyze token risk, liquidity, volume, and price action with AI-powered summaries.",
  icons: {
    icon: "/icon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
