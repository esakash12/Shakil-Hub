import { AgencyCmsData, DEFAULT_AGENCY_CMS } from "./agency-cms-types";
import { readDataFile, writeDataFile } from "./storage-helper";
import { prisma, isPrismaReady } from "../db/prisma";

export * from "./agency-cms-types";

/**
 * Reads persistent Agency CMS data from PostgreSQL with fallback to local JSON
 */
export async function getPersistentAgencyCms(): Promise<AgencyCmsData> {
  try {
    if (prisma && (await isPrismaReady())) {
      const record = await prisma.platformSetting.findUnique({
        where: { key: "agency_cms" },
      });
      if (record && record.value && typeof record.value === "object") {
        return {
          ...DEFAULT_AGENCY_CMS,
          ...(record.value as any),
        };
      }
    }
  } catch (err: any) {
    console.warn("Prisma getPersistentAgencyCms error:", err.message || err);
  }

  try {
    const parsed = await readDataFile<AgencyCmsData>("agency-cms.json", DEFAULT_AGENCY_CMS);
    if (parsed && typeof parsed === "object") {
      return {
        ...DEFAULT_AGENCY_CMS,
        ...parsed,
      };
    }
  } catch (err: any) {
    console.error("Error reading persistent agency cms fallback:", err);
  }

  return DEFAULT_AGENCY_CMS;
}

/**
 * Updates persistent Agency CMS data in PostgreSQL and local JSON
 */
export async function updatePersistentAgencyCms(
  updates: Partial<AgencyCmsData>
): Promise<AgencyCmsData> {
  const current = await getPersistentAgencyCms();
  const merged: AgencyCmsData = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    if (prisma && (await isPrismaReady())) {
      await prisma.platformSetting.upsert({
        where: { key: "agency_cms" },
        update: { value: merged as any },
        create: { key: "agency_cms", value: merged as any },
      });
    }
  } catch (err: any) {
    console.warn("Prisma updatePersistentAgencyCms error:", err.message || err);
  }

  try {
    await writeDataFile("agency-cms.json", merged);
  } catch (err) {
    console.error("Failed to write agency-cms.json fallback:", err);
  }

  return merged;
}
