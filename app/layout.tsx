import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://waymark.app";
const previewTitle = "Waymark | Decentralized Travel Journals";
const previewDescription = "Map your journey, collect passport proofs, and archive every mile.";
const previewImage = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Waymark link preview with a passport card, travel pins, and a mapped route.",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: previewTitle,
  description: previewDescription,
  applicationName: "Waymark",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: previewTitle,
    description: previewDescription,
    siteName: "Waymark",
    type: "website",
    url: "/",
    images: [previewImage],
  },
  twitter: {
    card: "summary_large_image",
    title: previewTitle,
    description: previewDescription,
    images: [previewImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
