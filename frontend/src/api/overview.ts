const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL;


if (!API_BASE_URL) {
    throw new Error(
        "VITE_API_BASE_URL is not defined"
    );
}


export type OverviewSummary = {

    total_leads: number;

    web_leads: number;

    mobile_leads: number;

    web_percentage: number;

    mobile_percentage: number;

    web_booked: number;

    web_conversion_rate: number;

    mobile_unique_cli: number;

    mobile_duration_minutes: number;
};


export async function fetchOverviewSummary():
    Promise<OverviewSummary> {

    const response =
        await fetch(
            `${API_BASE_URL}/api/overview/summary`
        );


    if (!response.ok) {

        throw new Error(
            "Failed to load overview summary"
        );
    }


    return response.json();
}