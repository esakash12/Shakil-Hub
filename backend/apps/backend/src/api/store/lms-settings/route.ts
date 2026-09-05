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
}

const defaultSettings: LMSSettings = {
  bkashNumber: "01712345678",
  nagadNumber: "01812345678",
  welcomeMessage: "Welcome to Sakil Hub! Master video editing and filmmaking with industry-leading masterclasses.",
  supportEmail: "support@sakilhub.com",
  supportPhone: "+880 1712-345678",
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

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const settings = getSettings();
  res.json({
    settings,
  });
}
