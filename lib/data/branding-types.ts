export interface PlatformBrandingSettings {
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  footerBio: string;
  footerCopyright: string;
  announcement: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  updatedAt?: string;
}

export const DEFAULT_BRANDING: PlatformBrandingSettings = {
  siteName: "Sakil Hub",
  siteTagline: "We Build Powerful Digital Experiences, Videos & Brands",
  logoUrl: "",
  faviconUrl: "",
  contactEmail: "support@sakilhub.com",
  contactPhone: "+880 1326-896947",
  whatsappNumber: "+8801326896947",
  address: "Dhaka, Bangladesh",
  facebookUrl: "https://facebook.com/sakilhub",
  youtubeUrl: "https://youtube.com/@sakilhub",
  instagramUrl: "https://instagram.com/sakilhub",
  linkedinUrl: "https://linkedin.com/company/sakilhub",
  twitterUrl: "https://twitter.com/sakilhub",
  footerBio:
    "We Build Powerful Digital Experiences, Videos & Brands. Professional cinematic video production, commercial editing, and visual storytelling.",
  footerCopyright: "© 2026 Sakil Hub. All rights reserved.",
  announcement:
    "Welcome to Sakil Hub! Turn your ideas into powerful visual stories.",
  bkashNumber: "01326896947",
  nagadNumber: "01326896947",
  rocketNumber: "01326896947",
  updatedAt: "2026-09-19T23:00:00.000Z",
};