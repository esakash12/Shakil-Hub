import "server-only";
import { DigitalProduct, ShopProductPayload } from "./shop-types";
import { readDataFile, writeDataFile } from "./storage-helper";

export * from "./shop-types";

/**
 * Reads all digital products from disk
 */
export async function getPersistentShopProducts(): Promise<DigitalProduct[]> {
  try {
    const list = await readDataFile<DigitalProduct[]>("shop.json", []);
    if (Array.isArray(list)) {
      return list;
    }
  } catch (err: any) {
    console.error("Error reading persistent shop products:", err);
  }
  return [];
}

/**
 * Saves all digital products to disk
 */
export async function savePersistentShopProducts(products: DigitalProduct[]): Promise<void> {
  await writeDataFile("shop.json", products);
}

/**
 * Finds a digital product by its unique slug
 */
export async function getShopProductBySlug(slug: string): Promise<DigitalProduct | null> {
  const products = await getPersistentShopProducts();
  return products.find((p) => p.slug === slug && p.status === "active") || null;
}

/**
 * Finds a digital product by ID (including draft)
 */
export async function getShopProductById(id: string): Promise<DigitalProduct | null> {
  const products = await getPersistentShopProducts();
  return products.find((p) => p.id === id) || null;
}

/**
 * Helper to slugify product titles
 */
export function generateShopSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Adds a new digital product
 */
export async function createShopProduct(payload: ShopProductPayload): Promise<DigitalProduct> {
  const products = await getPersistentShopProducts();

  const generatedSlug = payload.slug?.trim() || generateShopSlug(payload.title);
  let finalSlug = generatedSlug;
  let counter = 1;
  while (products.some((p) => p.slug === finalSlug)) {
    finalSlug = `${generatedSlug}-${counter}`;
    counter++;
  }

  const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Calculate discount badge if original price is supplied
  let discountBadge = payload.discountBadge;
  if (!discountBadge && payload.originalPrice && payload.originalPrice > payload.price) {
    const pct = Math.round(((payload.originalPrice - payload.price) / payload.originalPrice) * 100);
    discountBadge = `${pct}% OFF`;
  }

  const newProduct: DigitalProduct = {
    id: newId,
    title: payload.title.trim(),
    slug: finalSlug,
    category: payload.category.trim() || "Software",
    shortDescription: payload.shortDescription.trim(),
    fullDescription: payload.fullDescription.trim(),
    price: payload.price,
    originalPrice: payload.originalPrice,
    discountBadge,
    thumbnail: payload.thumbnail.trim(),
    images: payload.images?.length ? payload.images : [payload.thumbnail.trim()],
    badge: payload.badge?.trim() || undefined,
    features: payload.features || [],
    deliveryMethod: payload.deliveryMethod || {
      type: "download_link",
      label: "Instant Delivery",
      instructions: "Access instructions will be delivered immediately after purchase.",
    },
    faqs: payload.faqs || [],
    stock: payload.stock || "unlimited",
    rating: 5.0,
    reviewsCount: 1,
    salesCount: 0,
    status: payload.status || "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  products.unshift(newProduct);
  await savePersistentShopProducts(products);

  return newProduct;
}

/**
 * Updates an existing digital product
 */
export async function updateShopProduct(
  id: string,
  payload: Partial<ShopProductPayload>
): Promise<DigitalProduct | null> {
  const products = await getPersistentShopProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return null;
  }

  const current = products[index];

  // Recalculate discount badge if price changed
  let discountBadge = payload.discountBadge !== undefined ? payload.discountBadge : current.discountBadge;
  const newPrice = payload.price !== undefined ? payload.price : current.price;
  const newOrigPrice = payload.originalPrice !== undefined ? payload.originalPrice : current.originalPrice;

  if (newOrigPrice && newOrigPrice > newPrice && !payload.discountBadge) {
    const pct = Math.round(((newOrigPrice - newPrice) / newOrigPrice) * 100);
    discountBadge = `${pct}% OFF`;
  }

  const updated: DigitalProduct = {
    ...current,
    ...payload,
    price: newPrice,
    originalPrice: newOrigPrice,
    discountBadge,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updated;
  await savePersistentShopProducts(products);

  return updated;
}

/**
 * Deletes a digital product
 */
export async function deleteShopProduct(id: string): Promise<boolean> {
  const products = await getPersistentShopProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) {
    return false;
  }
  await savePersistentShopProducts(filtered);
  return true;
}
