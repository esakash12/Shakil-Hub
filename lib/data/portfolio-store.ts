import { PortfolioCategoryMeta, PortfolioItem } from "./portfolio-types";
import { PORTFOLIO_CATEGORIES as DEFAULT_CATEGORIES, PORTFOLIO_ITEMS as DEFAULT_ITEMS } from "./portfolio";
import { readDataFile, writeDataFile } from "./storage-helper";
import { prisma, isPrismaReady } from "../db/prisma";
import fs from "fs/promises";
import path from "path";

export interface PortfolioData {
  categories: PortfolioCategoryMeta[];
  items: PortfolioItem[];
  updatedAt?: string;
}

const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  categories: DEFAULT_CATEGORIES,
  items: DEFAULT_ITEMS,
  updatedAt: new Date().toISOString(),
};

let portfolioCache: { data: PortfolioData; timestamp: number } | null = null;
const PORTFOLIO_CACHE_TTL_MS = 60000; // 60 seconds memory cache

async function sanitizeItemThumbnail(item: PortfolioItem): Promise<PortfolioItem> {
  if (item.thumbnail && item.thumbnail.startsWith("data:image/")) {
    try {
      const match = item.thumbnail.match(/^data:image\/(\w+);base64,(.+)$/);
      if (match) {
        const ext = match[1] === "jpeg" ? "jpg" : match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, "base64");
        const filename = `thumb-${item.id || Date.now()}.${ext}`;

        const targets = [
          path.join(process.cwd(), "public", "uploads", "thumbnails", filename),
          path.join(process.cwd(), ".next", "standalone", "public", "uploads", "thumbnails", filename),
        ];

        for (const target of targets) {
          try {
            await fs.mkdir(path.dirname(target), { recursive: true });
            await fs.writeFile(target, buffer);
          } catch {}
        }

        return {
          ...item,
          thumbnail: `/uploads/thumbnails/${filename}`,
        };
      }
    } catch (err) {
      console.warn("Failed to extract base64 thumbnail:", err);
    }
  }
  return item;
}

/**
 * Retrieves all portfolio categories and items with Prisma and resilient JSON fallback
 */
export async function getPersistentPortfolio(): Promise<PortfolioData> {
  const now = Date.now();
  if (portfolioCache && now - portfolioCache.timestamp < PORTFOLIO_CACHE_TTL_MS) {
    return portfolioCache.data;
  }

  let data: PortfolioData = DEFAULT_PORTFOLIO_DATA;

  // 1. Try Prisma platformSetting
  try {
    if (prisma && (await isPrismaReady())) {
      const record = await prisma.platformSetting.findUnique({
        where: { key: "portfolio" },
      });
      if (record && record.value && typeof record.value === "object") {
        const val = record.value as any;
        if (Array.isArray(val.categories) && Array.isArray(val.items)) {
          data = {
            categories: val.categories,
            items: val.items,
            updatedAt: val.updatedAt,
          };
        }
      }
    }
  } catch (err: any) {
    console.warn("Prisma getPersistentPortfolio error:", err.message || err);
  }

  // 2. Resilient JSON fallback if Prisma did not load
  if (data === DEFAULT_PORTFOLIO_DATA) {
    try {
      const parsed = await readDataFile<PortfolioData>("portfolio.json", DEFAULT_PORTFOLIO_DATA);
      if (parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.items)) {
        data = parsed;
      }
    } catch (err: any) {
      console.error("Error reading persistent portfolio fallback:", err);
    }
  }

  // 3. Auto-sanitize: Detect and purge any massive base64 strings from data to keep load speed instant
  let hasBase64 = false;
  for (const item of data.items) {
    if (item.thumbnail && item.thumbnail.startsWith("data:image/")) {
      hasBase64 = true;
      break;
    }
  }

  if (hasBase64) {
    const sanitizedItems = await Promise.all(data.items.map(sanitizeItemThumbnail));
    data = { ...data, items: sanitizedItems };
    writePersistentPortfolio(data).catch(() => {});
  }

  // 4. Validate thumbnails to ensure no missing local file causes 404 in console
  const validatedItems = await Promise.all(
    data.items.map(async (item) => {
      if (item.thumbnail && item.thumbnail.startsWith("/uploads/")) {
        const rel = item.thumbnail.replace(/^\//, "");
        const targets = [
          path.join(process.cwd(), "public", rel),
          path.join(process.cwd(), ".next", "standalone", "public", rel),
        ];
        let exists = false;
        for (const t of targets) {
          try {
            await fs.access(t);
            exists = true;
            break;
          } catch {}
        }
        if (!exists) {
          return {
            ...item,
            thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=720&q=75",
          };
        }
      }
      return item;
    })
  );
  data = { ...data, items: validatedItems };

  portfolioCache = { data, timestamp: now };
  return data;
}

/**
 * Writes updated portfolio data to both PostgreSQL and persistent storage files
 */
export async function writePersistentPortfolio(data: PortfolioData): Promise<PortfolioData> {
  const updatedData: PortfolioData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  try {
    if (prisma && (await isPrismaReady())) {
      await prisma.platformSetting.upsert({
        where: { key: "portfolio" },
        update: { value: updatedData as any },
        create: { key: "portfolio", value: updatedData as any },
      });
    }
  } catch (err: any) {
    console.warn("Prisma writePersistentPortfolio error:", err.message || err);
  }

  try {
    await writeDataFile("portfolio.json", updatedData);
  } catch (err) {
    console.error("Failed to write portfolio.json fallback:", err);
  }

  portfolioCache = { data: updatedData, timestamp: Date.now() };
  return updatedData;
}

export async function savePersistentPortfolioItem(item: PortfolioItem): Promise<PortfolioItem> {
  const sanitized = await sanitizeItemThumbnail(item);
  const data = await getPersistentPortfolio();
  const existingIdx = data.items.findIndex((i) => i.id === sanitized.id);

  let updatedItems: PortfolioItem[];
  if (existingIdx >= 0) {
    updatedItems = [...data.items];
    updatedItems[existingIdx] = sanitized;
  } else {
    updatedItems = [sanitized, ...data.items];
  }

  await writePersistentPortfolio({
    ...data,
    items: updatedItems,
  });

  return sanitized;
}

export async function deletePersistentPortfolioItem(itemId: string): Promise<boolean> {
  const data = await getPersistentPortfolio();
  const updatedItems = data.items.filter((i) => i.id !== itemId);

  await writePersistentPortfolio({
    ...data,
    items: updatedItems,
  });

  return true;
}

export async function savePersistentPortfolioCategory(
  category: PortfolioCategoryMeta
): Promise<PortfolioCategoryMeta> {
  const data = await getPersistentPortfolio();
  const existingIdx = data.categories.findIndex((c) => c.id === category.id);

  let updatedCategories: PortfolioCategoryMeta[];
  if (existingIdx >= 0) {
    updatedCategories = [...data.categories];
    updatedCategories[existingIdx] = category;
  } else {
    updatedCategories = [...data.categories, category];
  }

  await writePersistentPortfolio({
    ...data,
    categories: updatedCategories,
  });

  return category;
}

export async function deletePersistentPortfolioCategory(categoryId: string): Promise<boolean> {
  if (categoryId === "all") {
    throw new Error("Cannot delete default 'all' category.");
  }

  const data = await getPersistentPortfolio();
  const updatedCategories = data.categories.filter((c) => c.id !== categoryId);

  const fallbackCat = updatedCategories.find((c) => c.id !== "all")?.id || "commercials";
  const updatedItems = data.items.map((item) => {
    if (item.category === categoryId) {
      return { ...item, category: fallbackCat };
    }
    return item;
  });

  await writePersistentPortfolio({
    ...data,
    categories: updatedCategories,
    items: updatedItems,
  });

  return true;
}
