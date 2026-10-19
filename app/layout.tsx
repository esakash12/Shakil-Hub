import type { Metadata, Viewport } from "next";
import { Outfit, Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import StorefrontShell from "@/components/layout/StorefrontShell";
import { getPersistentBranding } from "@/lib/data/branding";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "600"],
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  variable: "--font-bengali",
  weight: ["400", "600"],
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
  
  // Explicit agency branding as confirmed by client
  const siteTitle = "SakilHub — All Your Creative & Digital Solutions Under One Roof";
  const siteDescription =
    "From Vision to Creation, We Make It Happen. Video Production | Video Editing | Web Development | Digital Marketing | Model Hunting | Studio & More.";
  const sakilPhoto = "https://sakilhub.com/images/mehedi-hasan-sakil.jpg";

  return {
    metadataBase: new URL("https://sakilhub.com"),
    title: {
      default: siteTitle,
      template: `%s | SakilHub`,
    },
    description: siteDescription,
    icons: branding.faviconUrl ? { icon: branding.faviconUrl } : { icon: "/images/mehedi-hasan-sakil.jpg" },
    keywords: [
      "SakilHub",
      "Creative Agency Bangladesh",
      "Video Production",
      "Video Editing",
      "Web Development",
      "Digital Marketing",
      "Model Hunting",
      "Media Studio",
      "Filmmaking Bangladesh",
      "Color Grading",
      "Mehedi Hasan Sakil",
    ],
    authors: [{ name: "Mehedi Hasan Sakil", url: "https://sakilhub.com" }],
    creator: "SakilHub",
    publisher: "SakilHub Media",
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      url: "https://sakilhub.com",
      siteName: "SakilHub",
      images: [
        {
          url: sakilPhoto,
          width: 1200,
          height: 630,
          alt: "SakilHub — Directed by Mehedi Hasan Sakil",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      creator: "@sakilhub",
      images: [sakilPhoto],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getPersistentBranding();

  return (
    <html
      lang="bn"
      className={`dark scroll-smooth ${outfit.variable} ${inter.variable} ${hindSiliguri.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="font-sans bg-black text-white antialiased selection:bg-blue-600 selection:text-white flex flex-col min-h-screen">
        <StorefrontShell branding={branding}>{children}</StorefrontShell>
      </body>
    </html>
  );
}
