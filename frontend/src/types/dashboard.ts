export interface DashboardSummary {
    total_leads: number;
    booked: number;
    not_booked: number;
    in_process: number;
    conversion_rate: number;
}

export interface DashboardFilterOptions {
    services: string[];
    domains: string[];
    page_names: string[];
    statuses: string[];
}

export interface DateBounds {
    min_date: string | null;
    max_date: string | null;
}

export interface LeadsOverTimePoint {
    date: string;
    count: number;
}

export interface DashboardData {
    summary: DashboardSummary;
    filter_options: DashboardFilterOptions;
    date_bounds: DateBounds;
    available_dates: string[];
    leads_over_time: LeadsOverTimePoint[];
}