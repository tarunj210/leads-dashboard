export interface LeadRow {
    id: number;

    lead_received_date: string;

    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;

    customer_service: string | null;

    status: string;

    page_url: string | null;
    page_name: string | null;
}


export interface LeadTableResponse {
    items: LeadRow[];

    page: number;
    page_size: number;

    total: number;
    total_pages: number;
}