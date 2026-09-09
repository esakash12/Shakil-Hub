import { isPrismaReady } from "./db/prisma";

export interface ConnectionStatus {
  status: boolean;
  message: string;
}

/**
 * Utility to test whether the PostgreSQL database is reachable and ready.
 */
export async function checkBackendConnection(): Promise<ConnectionStatus> {
  const ready = await isPrismaReady();
  if (ready) {
    return {
      status: true,
      message: "Successfully connected to PostgreSQL Enterprise Database.",
    };
  }
  return {
    status: false,
    message: "PostgreSQL Database connection unavailable.",
  };
}
