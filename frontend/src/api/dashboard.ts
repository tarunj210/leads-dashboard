import { API_BASE_URL } from "./config";
import type {
    DashboardData,
} from "../types/dashboard";


export interface DashboardFilters {
    startDate?: string;
    startTime?: string;

    endDate?: string;
    endTime?: string;

    service?: string;
    domain?: string;
    pageName?: string;
    status?: string;
}


export interface UniqueEmailItem {
    email: string;
    lead_count: number;
}


export interface UniqueEmailsResponse {
    total: number;
    items: UniqueEmailItem[];
}

function normalizeDateParam(
    value?: string
): string | undefined {

    if (!value) {
        return undefined;
    }

    return value
        .split("T")[0]
        .split(" ")[0];
}


function buildDashboardParams(
    filters: DashboardFilters
): URLSearchParams {

    const params =
        new URLSearchParams();


    const startDate =normalizeDateParam(filters.startDate);
    
    if (startDate) {
        params.set(
            "start_date",
            startDate
        );
    }


    if (filters.startTime) {
        params.set(
            "start_time",
            filters.startTime
        );
    }


    const endDate =
    normalizeDateParam(
        filters.endDate
    );

    if (endDate) {
        params.set(
            "end_date",
            endDate
        );
    }


    if (filters.endTime) {
        params.set(
            "end_time",
            filters.endTime
        );
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


    return params;
}


export async function getDashboardData(
    filters: DashboardFilters = {}
): Promise<DashboardData> {

    const params =
        buildDashboardParams(
            filters
        );


    const response =
        await fetch(
            `${API_BASE_URL}/api/dashboard/data?${params.toString()}`
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load dashboard data: ${response.status}`
        );
    }


    return response.json();
}


export async function getUniqueEmails(
    filters: DashboardFilters = {}
): Promise<UniqueEmailsResponse> {

    const params =
        buildDashboardParams(
            filters
        );


    const response =
        await fetch(
            `${API_BASE_URL}/api/dashboard/unique-emails?${params.toString()}`
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load unique emails: ${response.status}`
        );
    }


    return response.json();
}