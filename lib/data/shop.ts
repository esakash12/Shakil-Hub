import "server-only";
import { DigitalProduct, ShopProductPayload } from "./shop-types";
import { readDataFile, writeDataFile } from "./storage-helper";
import { prisma, isPrismaReady } from "../db/prisma";

export * from "./shop-types";

/**
 * Reads all digital products from PostgreSQL via Prisma or storage fallback
 */
export async function getPersistentShopProducts(): Promise<DigitalProduct[]> {
  if (prisma && (await isPrismaReady())) {
    try {
      const dbProducts = await prisma.shopProduct.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (dbProducts && dbProducts.length > 0) {
        return dbProducts.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          shortDescription: p.shortDescription || "",
          fullDescription: p.fullDescription || "",
          price: p.price,
          originalPrice: p.originalPrice || undefined,
          discountBadge: p.discountBadge || undefined,
          thumbnail: p.thumbnail || "",
          images: p.images || [],
          badge: p.badge || undefined,
          features: p.features || [],
          deliveryMethod: (p.deliveryMethod as any) || {
            type: "download_link",
            label: "Instant Delivery",
            instructions: "Access instructions will be delivered immediately after purchase.",
          },
          faqs: (p.faqs as any) || [],
          stock: (p.stock as any) || "unlimited",
          rating: p.rating || 5.0,
          reviewsCount: p.reviewsCount || 0,
          salesCount: p.salesCount || 0,
          status: p.status as any,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt ? p.updatedAt.toISOString() : undefined,
        }));
      }
    } catch (err) {
      console.warn("Prisma shop query failed, falling back to storage:", err);
    }
  }

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

  if (prisma && (await isPrismaReady())) {
    try {
      await prisma.shopProduct.upsert({
        where: { slug: newProduct.slug },
        update: {
          title: newProduct.title,
          category: newProduct.category,
          shortDescription: newProduct.shortDescription,
          fullDescription: newProduct.fullDescription,
          price: newProduct.price,
          originalPrice: newProduct.originalPrice || null,
          discountBadge: newProduct.discountBadge || null,
          thumbnail: newProduct.thumbnail,
          images: newProduct.images || [],
          badge: newProduct.badge || null,
          features: newProduct.features || [],
          deliveryMethod: (newProduct.deliveryMethod as any) || {},
          faqs: (newProduct.faqs as any) || [],
          stock: String(newProduct.stock || "unlimited"),
          rating: newProduct.rating || 5.0,
          reviewsCount: newProduct.reviewsCount || 0,
          salesCount: newProduct.salesCount || 0,
          status: newProduct.status,
        },
        create: {
          id: newProduct.id,
          title: newProduct.title,
          slug: newProduct.slug,
          category: newProduct.category,
          shortDescription: newProduct.shortDescription,
          fullDescription: newProduct.fullDescription,
          price: newProduct.price,
          originalPrice: newProduct.originalPrice || null,
          discountBadge: newProduct.discountBadge || null,
          thumbnail: newProduct.thumbnail,
          images: newProduct.images || [],
          badge: newProduct.badge || null,
          features: newProduct.features || [],
          deliveryMethod: (newProduct.deliveryMethod as any) || {},
          faqs: (newProduct.faqs as any) || [],
          stock: String(newProduct.stock || "unlimited"),
          rating: newProduct.rating || 5.0,
          reviewsCount: newProduct.reviewsCount || 0,
          salesCount: newProduct.salesCount || 0,
          status: newProduct.status,
          createdAt: new Date(newProduct.createdAt!),
          updatedAt: new Date(newProduct.updatedAt!),
        },
      });
    } catch (err) {
      console.warn("Prisma shop product upsert warning:", err);
    }
  }

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

  if (prisma && (await isPrismaReady())) {
    try {
      await prisma.shopProduct.updateMany({
        where: { id: updated.id },
        data: {
          title: updated.title,
          category: updated.category,
          shortDescription: updated.shortDescription,
          fullDescription: updated.fullDescription,
          price: updated.price,
          originalPrice: updated.originalPrice || null,
          discountBadge: updated.discountBadge || null,
          thumbnail: updated.thumbnail,
          images: updated.images || [],
          badge: updated.badge || null,
          features: updated.features || [],
          deliveryMethod: (updated.deliveryMethod as any) || undefined,
          faqs: (updated.faqs as any) || undefined,
          stock: String(updated.stock || "unlimited"),
          status: updated.status,
        },
      });
    } catch (err) {
      console.warn("Prisma update shop product warning:", err);
    }
  }

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

  if (prisma && (await isPrismaReady())) {
    try {
      await prisma.shopProduct.deleteMany({
        where: { id },
      });
    } catch (err) {
      console.warn("Prisma delete shop product warning:", err);
    }
  }

  return true;
}
