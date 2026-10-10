export interface FilterOptions {
    services: string[];
    domains: string[];
    page_names: string[];
    statuses: string[];
}

export type WebFilters = {
    startDate: string;
    endDate: string;

    service: string;
    domain: string;
    pageName: string;
    status: string;
};


export type MobileFilters = {
    startDate: string;
    endDate: string;

    minDuration: number;
};


export type MessageFilters = {
    startDate: string;
    endDate: string;
};