import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://www.sigmadapp.xyz";
const title = "SIGMA | AI-Powered Token Risk Analysis";
const description =
  "AI-powered token risk analysis for traders who want better market insight.";
const socialImage = "/social-hero-preview-v2.jpeg";

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
    url: siteUrl,
    siteName: "SIGMA",
    type: "website",
    images: [
      {
        url: socialImage,
        width: 1536,
        height: 1024,
        alt: "SIGMA homepage hero preview"
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
