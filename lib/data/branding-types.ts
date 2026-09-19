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
  siteTagline: "Professional Video Editing & Filmmaking Masterclasses",
  logoUrl: "",
  faviconUrl: "",
  contactEmail: "support@sakilhub.com",
  contactPhone: "+880 1712-345678",
  whatsappNumber: "+8801712345678",
  address: "Dhaka, Bangladesh",
  facebookUrl: "https://facebook.com",
  youtubeUrl: "https://youtube.com",
  instagramUrl: "https://instagram.com",
  linkedinUrl: "https://linkedin.com",
  twitterUrl: "https://twitter.com",
  footerBio:
    "The premier online academy for video editing, motion graphics, visual effects, and color grading. Empowering creators worldwide to turn passion into a career.",
  footerCopyright: "© 2026 Sakil Hub. All rights reserved.",
  announcement:
    "Welcome to Sakil Hub! Level up your video editing and filmmaking skills today.",
  bkashNumber: "01754511619",
  nagadNumber: "01812345678",
  rocketNumber: "01912345678",
  updatedAt: "2026-09-02T03:20:00.000Z",
};