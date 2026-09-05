import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

/**
 * Enterprise Resilient Persistent Storage Engine
 * 
 * Hierarchy:
 * 1. Primary Store: process.cwd()/storage/data/${filename} (Git-ignored, persists across git pulls and next builds)
 * 2. Standalone Store: process.cwd()/.next/standalone/storage/data/${filename}
 * 3. Seed Fallback: process.cwd()/lib/data/${filename}
 * 4. Standalone Fallback: process.cwd()/.next/standalone/lib/data/${filename}
 */
function getStoragePaths(filename: string) {
  const root = process.cwd();
  return {
    primary: path.join(root, "storage", "data", filename),
    standaloneStorage: path.join(root, ".next", "standalone", "storage", "data", filename),
    libData: path.join(root, "lib", "data", filename),
    standaloneLib: path.join(root, ".next", "standalone", "lib", "data", filename),
  };
}

/**
 * Safely reads a JSON data file from persistent storage with automatic fallbacks
 */
export async function readDataFile<T>(filename: string, defaultValue: T): Promise<T> {
  const paths = getStoragePaths(filename);
  const searchOrder = [
    paths.primary,
    paths.standaloneStorage,
    paths.libData,
    paths.standaloneLib,
  ];

  for (const filePath of searchOrder) {
    try {
      if (fsSync.existsSync(/*turbopackIgnore: true*/ filePath)) {
        const raw = await fs.readFile(/*turbopackIgnore: true*/ filePath, "utf8");
        if (raw && raw.trim()) {
          const parsed = JSON.parse(raw);
          // If read from fallback libData, mirror it to persistent primary storage immediately
          if (filePath !== paths.primary && !fsSync.existsSync(/*turbopackIgnore: true*/ paths.primary)) {
            await writeDataFile(filename, parsed).catch(() => {});
          }
          return parsed as T;
        }
      }
    } catch {}
  }

  // If not found anywhere, initialize persistent storage with default
  await writeDataFile(filename, defaultValue).catch(() => {});
  return defaultValue;
}

/**
 * Writes JSON data to all targets including git-ignored persistent storage
 */
export async function writeDataFile(filename: string, data: any): Promise<void> {
  const content = JSON.stringify(data, null, 2);
  const paths = getStoragePaths(filename);
  const targets = [
    paths.primary,
    paths.standaloneStorage,
    paths.libData,
    paths.standaloneLib,
  ];

  for (const target of targets) {
    try {
      const dir = path.dirname(target);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(target, content, "utf8");
    } catch {}
  }
}

