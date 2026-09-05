import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import StorefrontShell from "@/components/layout/StorefrontShell";
import { getPersistentBranding } from "@/lib/data/branding";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getPersistentBranding();
  const siteTitle = `${branding.siteName} - ${branding.siteTagline}`;

  return {
    metadataBase: new URL("https://sakilhub.com"),
    title: {
      default: siteTitle,
      template: `%s | ${branding.siteName}`,
    },
    description: branding.footerBio,
    icons: branding.faviconUrl ? { icon: branding.faviconUrl } : undefined,
    keywords: [
      "Video Editing Course",
      "Premiere Pro Masterclass",
      "After Effects Tutorial",
      "DaVinci Resolve Color Grading",
      "Filmmaking Bangladesh",
      branding.siteName,
      "Content Creator Editing",
    ],
    authors: [{ name: `${branding.siteName} Team`, url: "https://sakilhub.com" }],
    creator: branding.siteName,
    publisher: `${branding.siteName} Media`,
    openGraph: {
      title: siteTitle,
      description: branding.footerBio,
      url: "https://sakilhub.com",
      siteName: branding.siteName,
      images: [
        {
          url:
            branding.logoUrl ||
            "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&h=630&q=80",
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: branding.footerBio,
      creator: "@sakilhub",
      images: [
        branding.logoUrl ||
          "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&h=630&q=80",
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark scroll-smooth ${outfit.variable} ${inter.variable}`}>
      <body className="font-sans bg-black text-white antialiased selection:bg-blue-600 selection:text-white flex flex-col min-h-screen">
        <StorefrontShell>{children}</StorefrontShell>
      </body>
    </html>
  );
}
