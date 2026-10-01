import { API_BASE_URL } from "./config";
import type { RefreshResult } from "../types/ingestion";


export async function refreshLeads(): Promise<RefreshResult> {
    const response = await fetch(
        `${API_BASE_URL}/api/ingestion/refresh`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        throw new Error(
            `Refresh failed with status ${response.status}`
        );
    }

    return response.json();
}