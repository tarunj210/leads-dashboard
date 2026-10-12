import { API_BASE_URL } from "./config";

import type {
    LeadTableResponse,
} from "../types/leads";


export interface LeadTableFilters {
    startDate?: string;
    startTime?: string;

    endDate?: string;
    endTime?: string;

    service?: string;
    domain?: string;
    pageName?: string;
    status?: string;

    page?: number;
    pageSize?: number;
}


export async function getFilteredLeads(
    filters: LeadTableFilters = {}
): Promise<LeadTableResponse> {

    const params =
        new URLSearchParams();


    if (filters.startDate) {
        params.set(
            "start_date",
            filters.startDate
        );
    }


    if (filters.startTime) {
        params.set(
            "start_time",
            filters.startTime
        );
    }


    if (filters.endDate) {
        params.set(
            "end_date",
            filters.endDate
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


    params.set(
        "page",
        String(
            filters.page ?? 1
        )
    );


    params.set(
        "page_size",
        String(
            filters.pageSize ?? 25
        )
    );


    const response =
        await fetch(
            `${API_BASE_URL}/api/dashboard/leads?${params.toString()}`
        );


    if (!response.ok) {
        throw new Error(
            `Failed to load leads: ${response.status}`
        );
    }


    return response.json();
}