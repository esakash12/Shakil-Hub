export type PortfolioCategory =
  | "all"
  | "ai-work"
  | "promotional-ads"
  | "real-estate"
  | "wedding"
  | "vlogs";

export interface PortfolioCategoryMeta {
  id: PortfolioCategory;
  label: string;
  badge?: string;
  description: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: "ai-work" | "promotional-ads" | "real-estate" | "wedding" | "vlogs";
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
