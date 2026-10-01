import { API_BASE_URL } from "./config";
import type { DashboardData } from "../types/dashboard";

export interface DashboardFilters {
    startDate?: string;
    endDate?: string;
    service?: string;
    domain?: string;
    pageName?: string;
    status?: string;
}

export async function getDashboardData(
    filters: DashboardFilters = {}
): Promise<DashboardData> {
    const params = new URLSearchParams();

    if (filters.startDate) {
        params.set("start_date", filters.startDate);
    }

    if (filters.endDate) {
        params.set("end_date", filters.endDate);
    }

    params.set(
        "service",
        filters.service ?? "all"
    );

    params.set(
        "domain",
        filters.domain ?? "all"
    );

    params.set(
        "page_name",
        filters.pageName ?? "all"
    );

    params.set(
        "status",
        filters.status ?? "all"
    );

    const response = await fetch(
        `${API_BASE_URL}/api/dashboard/data?${params.toString()}`
    );

    if (!response.ok) {
        throw new Error(
            `Failed to load dashboard data: ${response.status}`
        );
    }

    return response.json();
}