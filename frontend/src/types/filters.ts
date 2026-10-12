export interface FilterOptions {
    services: string[];
    domains: string[];
    page_names: string[];
    statuses: string[];
}


export type DateTimeRangeFilters = {
    startDate: string;
    startTime: string;

    endDate: string;
    endTime: string;
};


export type WebFilters =
    DateTimeRangeFilters & {
        service: string;
        domain: string;
        pageName: string;
        status: string;
    };


export type MobileFilters =
    DateTimeRangeFilters & {
        minDuration: number;
        maxDuration: number | null;

        viewMode:
            | "forwarded"
            | "website";

        selectedCld:
            string | null;
    };


export type MessageFilters =
    DateTimeRangeFilters;