export type DeliveryMethodType =
  | "download_link"
  | "license_key"
  | "account_access"
  | "custom_instructions";

export interface DeliveryMethod {
  type: DeliveryMethodType;
  label: string;
  instructions: string;
  downloadUrl?: string;
  licenseKeySample?: string;
}

export interface ShopProductFaq {
  question: string;
  answer: string;
}

export interface DigitalProduct {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  thumbnail: string;
  images?: string[];
  badge?: string;
  features: string[];
  deliveryMethod: DeliveryMethod;
  faqs?: ShopProductFaq[];
  stock?: number | "unlimited";
  rating?: number;
  reviewsCount?: number;
  salesCount?: number;
  status: "active" | "draft";
  createdAt?: string;
  updatedAt?: string;
}

export interface ShopProductPayload {
  title: string;
  slug?: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  thumbnail: string;
  images?: string[];
  badge?: string;
  features: string[];
  deliveryMethod: DeliveryMethod;
  faqs?: ShopProductFaq[];
  stock?: number | "unlimited";
  status?: "active" | "draft";
}
