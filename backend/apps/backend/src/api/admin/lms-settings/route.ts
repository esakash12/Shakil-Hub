import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import fs from "fs";
import path from "path";

const SETTINGS_FILE_PATH = path.resolve(process.cwd(), "lms-settings.json");

interface LMSSettings {
  bkashNumber: string;
  nagadNumber: string;
  welcomeMessage: string;
  supportEmail: string;
  supportPhone: string;
  updatedAt: string;
}

const defaultSettings: LMSSettings = {
  bkashNumber: "01712345678",
  nagadNumber: "01812345678",
  welcomeMessage: "Welcome to Sakil Hub! Master video editing and filmmaking with industry-leading masterclasses.",
  supportEmail: "support@sakilhub.com",
  supportPhone: "+880 1712-345678",
  updatedAt: new Date().toISOString(),
};

function getSettings(): LMSSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch {
    // Fallback to default
  }
  return defaultSettings;
}

function saveSettings(settings: Partial<LMSSettings>): LMSSettings {
  const current = getSettings();
  const updated: LMSSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const settings = getSettings();
  res.json({
    settings,
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as Partial<LMSSettings>;
  const updated = saveSettings(body);

  res.json({
    message: "LMS settings updated successfully",
    settings: updated,
  });
}
