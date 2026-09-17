export type StandardPortfolioCategory =
  | "all"
  | "commercials"
  | "social-media"
  | "motion-graphics"
  | "ai-videos"
  | "branding"
  | "ai-work"
  | "promotional-ads"
  | "real-estate"
  | "wedding"
  | "vlogs";

export type PortfolioCategory = StandardPortfolioCategory | (string & {});

export interface PortfolioCategoryMeta {
  id: string;
  label: string;
  badge?: string;
  description?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: PortfolioCategory;
  categoryLabel: string;
  description: string;
  client?: string;
  duration?: string;
  thumbnail: string;
  videoUrl?: string; // YouTube embed / MP4 / Vimeo / Cloudflare
  embedType?: "youtube" | "mp4" | "vimeo";
  tags: string[];
  featured?: boolean;
}
