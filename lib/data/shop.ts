import "server-only";
import { DigitalProduct, ShopProductPayload } from "./shop-types";
import { readDataFile, writeDataFile } from "./storage-helper";
import { prisma, isPrismaReady } from "../db/prisma";

export * from "./shop-types";

/**
 * Reads all digital products directly from PostgreSQL with JSON fallback
 */
export async function getPersistentShopProducts(): Promise<DigitalProduct[]> {
  try {
    if (prisma && (await isPrismaReady())) {
      const dbProducts = await prisma.shopProduct.findMany({
        orderBy: { createdAt: "desc" },
      });
      return (dbProducts || []).map((p) => ({
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
        stock: p.stock || "unlimited",
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        salesCount: p.salesCount,
        status: p.status as any,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));
    }
  } catch (err: any) {
    console.warn("Prisma getPersistentShopProducts error:", err.message || err);
  }

  try {
    const list = await readDataFile<DigitalProduct[]>("shop.json", []);
    if (Array.isArray(list)) {
      return list;
    }
  } catch (err: any) {
    console.error("Error reading persistent shop products fallback:", err);
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
 * Finds a digital product by its unique slug in PostgreSQL
 */
export async function getShopProductBySlug(slug: string): Promise<DigitalProduct | null> {
  if (!slug) return null;
  const cleanSlug = slug.trim();

  try {
    if (prisma && (await isPrismaReady())) {
      const p = await prisma.shopProduct.findFirst({
        where: {
          slug: cleanSlug,
          status: "active",
        },
      });
      if (p) {
        return {
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
          },
          faqs: (p.faqs as any) || [],
          stock: p.stock || "unlimited",
          rating: p.rating,
          reviewsCount: p.reviewsCount,
          salesCount: p.salesCount,
          status: p.status as any,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }
      return null;
    }
  } catch (err: any) {
    console.warn("Prisma getShopProductBySlug error:", err.message || err);
  }

  const products = await getPersistentShopProducts();
  return products.find((p) => p.slug === cleanSlug && p.status === "active") || null;
}

/**
 * Finds a digital product by ID in PostgreSQL
 */
export async function getShopProductById(id: string): Promise<DigitalProduct | null> {
  if (!id) return null;
  const cleanId = id.trim();

  try {
    if (prisma && (await isPrismaReady())) {
      const p = await prisma.shopProduct.findFirst({
        where: {
          OR: [{ id: cleanId }, { slug: cleanId }],
        },
      });
      if (p) {
        return {
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
          },
          faqs: (p.faqs as any) || [],
          stock: p.stock || "unlimited",
          rating: p.rating,
          reviewsCount: p.reviewsCount,
          salesCount: p.salesCount,
          status: p.status as any,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }
    }
  } catch (err: any) {
    console.warn("Prisma getShopProductById error:", err.message || err);
  }

  const products = await getPersistentShopProducts();
  return products.find((p) => p.id === cleanId || p.slug === cleanId) || null;
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
 * Adds a new digital product in PostgreSQL
 */
export async function createShopProduct(payload: ShopProductPayload): Promise<DigitalProduct> {
  const generatedSlug = payload.slug?.trim() || generateShopSlug(payload.title);
  const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  let discountBadge = payload.discountBadge;
  if (!discountBadge && payload.originalPrice && payload.originalPrice > payload.price) {
    const pct = Math.round(((payload.originalPrice - payload.price) / payload.originalPrice) * 100);
    discountBadge = `${pct}% OFF`;
  }

  const newProduct: DigitalProduct = {
    id: newId,
    title: payload.title.trim(),
    slug: generatedSlug,
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
    reviewsCount: 0,
    salesCount: 0,
    status: payload.status || "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    if (prisma && (await isPrismaReady())) {
      await prisma.shopProduct.upsert({
        where: { slug: generatedSlug },
        update: {
          title: newProduct.title,
          category: newProduct.category,
          shortDescription: newProduct.shortDescription,
          fullDescription: newProduct.fullDescription,
          price: newProduct.price,
          originalPrice: newProduct.originalPrice || null,
          discountBadge: newProduct.discountBadge || null,
          thumbnail: newProduct.thumbnail,
          images: newProduct.images,
          badge: newProduct.badge || null,
          features: newProduct.features,
          deliveryMethod: newProduct.deliveryMethod as any,
          faqs: newProduct.faqs as any,
          stock: newProduct.stock !== undefined ? String(newProduct.stock) : "unlimited",
          status: newProduct.status,
        },
        create: {
          id: newId,
          slug: generatedSlug,
          title: newProduct.title,
          category: newProduct.category,
          shortDescription: newProduct.shortDescription,
          fullDescription: newProduct.fullDescription,
          price: newProduct.price,
          originalPrice: newProduct.originalPrice || null,
          discountBadge: newProduct.discountBadge || null,
          thumbnail: newProduct.thumbnail,
          images: newProduct.images,
          badge: newProduct.badge || null,
          features: newProduct.features,
          deliveryMethod: newProduct.deliveryMethod as any,
          faqs: newProduct.faqs as any,
          stock: newProduct.stock !== undefined ? String(newProduct.stock) : "unlimited",
          status: newProduct.status,
        },
      });
    }
  } catch (err: any) {
    console.warn("Prisma createShopProduct error:", err.message || err);
  }

  // Backup to shop.json
  try {
    const products = await readDataFile<DigitalProduct[]>("shop.json", []);
    products.unshift(newProduct);
    await writeDataFile("shop.json", products);
  } catch {}

  return newProduct;
}

/**
 * Updates an existing digital product in PostgreSQL
 */
export async function updateShopProduct(
  id: string,
  updates: Partial<ShopProductPayload>
): Promise<DigitalProduct | null> {
  try {
    if (prisma && (await isPrismaReady())) {
      const existing = await prisma.shopProduct.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });
      if (existing) {
        let discountBadge = updates.discountBadge ?? existing.discountBadge;
        const finalPrice = updates.price !== undefined ? updates.price : existing.price;
        const finalOrigPrice = updates.originalPrice !== undefined ? updates.originalPrice : existing.originalPrice;
        if (updates.originalPrice !== undefined && finalOrigPrice && finalOrigPrice > finalPrice) {
          const pct = Math.round(((finalOrigPrice - finalPrice) / finalOrigPrice) * 100);
          discountBadge = `${pct}% OFF`;
        }

        const updated = await prisma.shopProduct.update({
          where: { id: existing.id },
          data: {
            title: updates.title ?? existing.title,
            category: updates.category ?? existing.category,
            shortDescription: updates.shortDescription ?? existing.shortDescription,
            fullDescription: updates.fullDescription ?? existing.fullDescription,
            price: finalPrice,
            originalPrice: finalOrigPrice,
            discountBadge,
            thumbnail: updates.thumbnail ?? existing.thumbnail,
            images: updates.images ?? existing.images,
            badge: updates.badge ?? existing.badge,
            features: updates.features ?? existing.features,
            deliveryMethod: updates.deliveryMethod ? (updates.deliveryMethod as any) : existing.deliveryMethod,
            faqs: updates.faqs ? (updates.faqs as any) : existing.faqs,
            stock: updates.stock !== undefined ? String(updates.stock) : existing.stock,
            status: updates.status ?? existing.status,
          },
        });

        const mappedProduct: DigitalProduct = {
          id: updated.id,
          title: updated.title,
          slug: updated.slug,
          category: updated.category,
          shortDescription: updated.shortDescription || "",
          fullDescription: updated.fullDescription || "",
          price: updated.price,
          originalPrice: updated.originalPrice || undefined,
          discountBadge: updated.discountBadge || undefined,
          thumbnail: updated.thumbnail || "",
          images: updated.images || [],
          badge: updated.badge || undefined,
          features: updated.features || [],
          deliveryMethod: (updated.deliveryMethod as any) || {},
          faqs: (updated.faqs as any) || [],
          stock: updated.stock || "unlimited",
          rating: updated.rating,
          reviewsCount: updated.reviewsCount,
          salesCount: updated.salesCount,
          status: updated.status as any,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };

        // Always sync shop.json backup store
        try {
          const products = await readDataFile<DigitalProduct[]>("shop.json", []);
          const idx = products.findIndex((p) => p.id === id || p.slug === id);
          if (idx >= 0) {
            products[idx] = { ...products[idx], ...mappedProduct };
          } else {
            products.unshift(mappedProduct);
          }
          await writeDataFile("shop.json", products);
        } catch {}

        return mappedProduct;
      }
    }
  } catch (err: any) {
    console.warn("Prisma updateShopProduct error:", err.message || err);
  }

  // Fallback to shop.json
  const products = await readDataFile<DigitalProduct[]>("shop.json", []);
  const index = products.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) return null;

  const current = products[index];
  const updatedItem: DigitalProduct = {
    ...current,
    ...updates,
    id: current.id,
    slug: current.slug,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updatedItem;
  await writeDataFile("shop.json", products);
  return updatedItem;
}

/**
 * Permanently deletes a digital product from PostgreSQL
 */
export async function deleteShopProduct(id: string): Promise<boolean> {
  if (!id) return false;

  try {
    if (prisma && (await isPrismaReady())) {
      await prisma.shopProduct.deleteMany({
        where: { OR: [{ id }, { slug: id }] },
      });
    }
  } catch (err: any) {
    console.warn("Prisma deleteShopProduct error:", err.message || err);
  }

  try {
    const products = await readDataFile<DigitalProduct[]>("shop.json", []);
    const filtered = products.filter((p) => p.id !== id && p.slug !== id);
    await writeDataFile("shop.json", filtered);
  } catch {}

  return true;
}
