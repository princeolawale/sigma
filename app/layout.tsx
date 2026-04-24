import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
const title = "SIGMA | AI-Powered Token Risk Analysis";
const description =
  "Analyze token risk, liquidity, volume, and price action with AI-powered summaries.";
const socialImage = "/social-preview.jpeg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: {
    icon: "/icon.png"
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "SIGMA",
    type: "website",
    images: [
      {
        url: socialImage,
        width: 1080,
        height: 360,
        alt: "SIGMA token risk analysis preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage]
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
