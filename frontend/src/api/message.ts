const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL;


export type LeadMessageResponse = {

    start_date: string;

    end_date: string;

    call_leads: string[];

    email_leads: string[];

    call_lead_count: number;

    email_lead_count: number;

    message: string;
};


export async function fetchLeadMessage(
    startDate: string,
    endDate: string,
): Promise<LeadMessageResponse> {

    const params =
        new URLSearchParams({
            start_date: startDate,
            end_date: endDate,
        });


    const response = await fetch(
        `${API_BASE_URL}/api/message/leads?${params.toString()}`
    );


    if (!response.ok) {

        const body =
            await response.json()
                .catch(() => null);


        throw new Error(
            body?.detail
            ?? "Failed to generate lead message"
        );
    }


    return response.json();
}