import type {
    MobileCall,
} from "./mobileDashboard";


const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL;


export type MarketingCallsResponse = {
    total_calls: number;
    unique_cli: number;
    items: MobileCall[];
};


export async function fetchMarketingCalls():
    Promise<MarketingCallsResponse> {

    const response = await fetch(
        `${API_BASE_URL}/api/marketing/calls`
    );

    if (!response.ok) {
        throw new Error(
            "Failed to load marketing calls"
        );
    }

    return response.json();
}