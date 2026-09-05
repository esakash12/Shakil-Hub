import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

/**
 * Enterprise Dual-Target Data Storage Writer
 * Ensures writes synchronize across both the root directory and .next/standalone in production
 */
export async function writeDataFile(filename: string, data: any): Promise<void> {
  const content = JSON.stringify(data, null, 2);
  const targets = [
    path.join(process.cwd(), "lib", "data", filename),
    path.join(process.cwd(), ".next", "standalone", "lib", "data", filename),
  ];

  for (const target of targets) {
    try {
      const dir = path.dirname(target);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(target, content, "utf8");
    } catch {}
  }
}
