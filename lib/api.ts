import medusa from "./medusa";

export interface ConnectionStatus {
  status: boolean;
  message: string;
}

/**
 * Utility to test whether the Medusa headless commerce backend is reachable.
 */
export async function checkBackendConnection(): Promise<ConnectionStatus> {
  try {
    const response = await medusa.regions.list();
    if (response && response.regions) {
      return {
        status: true,
        message: "Successfully connected to Medusa backend.",
      };
    }
    return {
      status: false,
      message: "Received empty response from Medusa backend.",
    };
  } catch (error: any) {
    return {
      status: false,
      message:
        error?.message || "Could not reach Medusa backend at the configured URL.",
    };
  }
}
