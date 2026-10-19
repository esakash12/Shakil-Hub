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
  siteName: "SakilHub",
  siteTagline: "All Your Creative & Digital Solutions Under One Roof",
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
    "From Vision to Creation, We Make It Happen. Video Production | Video Editing | Web Development | Digital Marketing | Model Hunting | Studio & More.",
  footerCopyright: "© 2026 SakilHub. All rights reserved.",
  announcement:
    "From Vision to Creation, We Make It Happen — Explore our creative & digital agency services.",
  bkashNumber: "01326896947",
  nagadNumber: "01326896947",
  rocketNumber: "01326896947",
  updatedAt: "2026-10-19T12:40:00.000Z",
};