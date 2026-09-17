import { PortfolioCategoryMeta, PortfolioItem } from "./portfolio-types";
import { PORTFOLIO_CATEGORIES as DEFAULT_CATEGORIES, PORTFOLIO_ITEMS as DEFAULT_ITEMS } from "./portfolio";
import { readDataFile, writeDataFile } from "./storage-helper";
import { prisma, isPrismaReady } from "../db/prisma";

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

/**
 * Retrieves all portfolio categories and items with Prisma and resilient JSON fallback
 */
export async function getPersistentPortfolio(): Promise<PortfolioData> {
  // 1. Try Prisma platformSetting
  try {
    if (prisma && (await isPrismaReady())) {
      const record = await prisma.platformSetting.findUnique({
        where: { key: "portfolio" },
      });
      if (record && record.value && typeof record.value === "object") {
        const val = record.value as any;
        if (Array.isArray(val.categories) && Array.isArray(val.items)) {
          return {
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

  // 2. Resilient JSON fallback
  try {
    const parsed = await readDataFile<PortfolioData>("portfolio.json", DEFAULT_PORTFOLIO_DATA);
    if (parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.items)) {
      return parsed;
    }
  } catch (err: any) {
    console.error("Error reading persistent portfolio fallback:", err);
  }

  return DEFAULT_PORTFOLIO_DATA;
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

  return updatedData;
}

export async function savePersistentPortfolioItem(item: PortfolioItem): Promise<PortfolioItem> {
  const data = await getPersistentPortfolio();
  const existingIdx = data.items.findIndex((i) => i.id === item.id);

  let updatedItems: PortfolioItem[];
  if (existingIdx >= 0) {
    updatedItems = [...data.items];
    updatedItems[existingIdx] = item;
  } else {
    updatedItems = [item, ...data.items];
  }

  await writePersistentPortfolio({
    ...data,
    items: updatedItems,
  });

  return item;
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
