import type {
    LeadRow,
    LeadTableResponse,
} from "../types/leads";


interface LeadTableProps {
    data: LeadTableResponse | null;

    loading: boolean;

    onPageChange: (page: number) => void;
}


function formatStatus(
    status: string
): string {
    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase()
        );
}

function formatAustralianPhone(
    value: string | null | undefined
): string | null {

    if (!value) {
        return null;
    }

    const digits =
        String(value).replace(
            /\D/g,
            ""
        );


    // +61 mobile
    // 61426543786
    // -> +61 426 543 786
    if (
        digits.startsWith("614") &&
        digits.length === 11
    ) {
        return `+61 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    }


    // +61 landline
    // 61292659121
    // -> +61 2 9265 9121
    if (
        digits.startsWith("61") &&
        digits.length === 11
    ) {
        return `+61 ${digits.slice(2, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
    }


    // Australian mobile with leading 0
    // 0426543786
    // -> +61 426 543 786
    if (
        digits.startsWith("04") &&
        digits.length === 10
    ) {
        return `+61 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }


    // Australian landline with leading 0
    // 0292659121
    // -> +61 2 9265 9121
    if (
        digits.startsWith("0") &&
        digits.length === 10
    ) {
        return `+61 ${digits.slice(1, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
    }


    // Mobile where Google Sheets removed
    // the leading zero
    //
    // 426543786
    // -> +61 426 543 786
    if (
        digits.startsWith("4") &&
        digits.length === 9
    ) {
        return `+61 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }


    // Landline where Google Sheets removed
    // the leading zero
    //
    // 292659121
    // -> +61 2 9265 9121
    if (
        /^[2378]/.test(digits) &&
        digits.length === 9
    ) {
        return `+61 ${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5)}`;
    }


    return value;
}


function formatDate(
    value: string
): string {
    if (!value) {
        return "—";
    }

    const dateOnly =
        value.split("T")[0];

    const [year, month, day] =
        dateOnly.split("-");

    return `${day}/${month}/${year}`;
}


function displayValue(
    value: string | null
): string {
    return value || "—";
}


function LeadTableRow({
    lead,
}: {
    lead: LeadRow;
}) {
    return (
        <tr>

            <td>
                {formatDate(
                    lead.lead_received_date
                )}
            </td>

            <td>
                {displayValue(
                    lead.customer_name
                )}
            </td>

            <td>
                {displayValue(
                    lead.customer_email
                )}
            </td>

            <td>
                {displayValue(
                    formatAustralianPhone(
                        lead.customer_phone
                    )
                )}
            </td>

            <td>
                {displayValue(
                    lead.customer_service
                )}
            </td>

            <td>
                <span
                    className={`status-badge status-${lead.status.toLowerCase()}`}
                >
                    {formatStatus(
                        lead.status
                    )}
                </span>
            </td>

            <td>
                {lead.page_url ? (
                    <a
                        href={lead.page_url}
                        target="_blank"
                        rel="noreferrer"
                        className="table-link"
                    >
                        {lead.page_url}
                    </a>
                ) : (
                    "—"
                )}
            </td>

        </tr>
    );
}


export default function LeadTable({
    data,
    loading,
    onPageChange,
}: LeadTableProps) {

    if (!data) {
        return null;
    }


    return (
        <section className="lead-table-card">

            <div className="lead-table-header">

                <div>
                    <h2>
                        Filtered Leads
                    </h2>

                    <p>
                        {data.total} matching{" "}
                        {data.total === 1
                            ? "lead"
                            : "leads"}
                    </p>
                </div>

            </div>


            {loading && (
                <div className="table-loading">
                    Updating leads...
                </div>
            )}


            {data.items.length === 0 ? (

                <div className="table-empty">
                    No leads match the selected filters.
                </div>

            ) : (

                <>
                    <div className="table-scroll">

                        <table className="lead-table">

                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Service</th>
                                    <th>Status</th>
                                    <th>Domain</th>
                                
                                </tr>
                            </thead>


                            <tbody>
                                {data.items.map(
                                    (lead) => (
                                        <LeadTableRow
                                            key={lead.id}
                                            lead={lead}
                                        />
                                    )
                                )}
                            </tbody>

                        </table>

                    </div>


                    <div className="table-pagination">

                        <button
                            type="button"
                            disabled={
                                data.page <= 1 ||
                                loading
                            }
                            onClick={() =>
                                onPageChange(
                                    data.page - 1
                                )
                            }
                        >
                            Previous
                        </button>


                        <span>
                            Page {data.page}
                            {" "}of{" "}
                            {data.total_pages}
                        </span>


                        <button
                            type="button"
                            disabled={
                                data.page >=
                                data.total_pages ||
                                loading
                            }
                            onClick={() =>
                                onPageChange(
                                    data.page + 1
                                )
                            }
                        >
                            Next
                        </button>

                    </div>
                </>
            )}

        </section>
    );
}