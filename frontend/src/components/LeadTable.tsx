import type {
    LeadTableResponse,
} from "../types/leads";


type LeadTableProps = {

    data:
        LeadTableResponse | null;

    loading:
        boolean;

};


function formatLeadDate(
    value:
        string |
        null |
        undefined
): string {

    if (!value) {
        return "-";
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }


    return date.toLocaleString(
        "en-AU",
        {
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            hour:
                "numeric",

            minute:
                "2-digit",
        }
    );
}


function formatStatus(
    value:
        string |
        null |
        undefined
): string {

    if (!value) {
        return "-";
    }


    return value
        .replace(
            /_/g,
            " "
        )
        .toLowerCase()
        .replace(
            /\b\w/g,
            (
                character
            ) =>
                character
                    .toUpperCase()
        );
}


function getStatusClass(
    value:
        string |
        null |
        undefined
): string {

    const normalized =
        value
            ?.trim()
            .toUpperCase();


    if (
        normalized ===
        "BOOKED"
    ) {

        return (
            "status-badge status-booked"
        );
    }


    if (
        normalized ===
        "NOT_BOOKED"
    ) {

        return (
            "status-badge status-not-booked"
        );
    }


    if (
        normalized ===
        "IN_PROCESS"
    ) {

        return (
            "status-badge status-in-process"
        );
    }


    return (
        "status-badge"
    );
}


export default function LeadTable({

    data,
    loading,

}: LeadTableProps) {


    return (

        <div className="lead-table-card">


            {
                loading &&
                (

                    <div className="table-loading">
                        Loading leads...
                    </div>

                )
            }


            <div className="table-scroll">


                <table className="lead-table">


                    <thead>

                        <tr>

                            <th>
                                Date
                            </th>

                            <th>
                                Customer
                            </th>

                            <th>
                                Email
                            </th>

                            <th>
                                Phone
                            </th>

                            <th>
                                Service
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Page
                            </th>

                            <th>
                                Domain
                            </th>

                        </tr>

                    </thead>


                    <tbody>


                        {
                            !data ||
                            data.items.length ===
                            0
                                ? (

                                    <tr>

                                        <td
                                            colSpan={
                                                8
                                            }

                                            className=
                                                "table-empty"
                                        >
                                            {
                                                loading
                                                    ? "Loading leads..."
                                                    : "No leads found for the selected filters."
                                            }
                                        </td>

                                    </tr>

                                )
                                : (

                                    data.items.map(
                                        (
                                            lead
                                        ) => (

                                            <tr
                                                key={
                                                    lead.id
                                                }
                                            >


                                                <td>
                                                    {
                                                        formatLeadDate(
                                                            lead.lead_received_date
                                                        )
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        lead.customer_name
                                                        ??
                                                        "-"
                                                    }
                                                </td>


                                                <td>

                                                    {
                                                        lead.customer_email
                                                            ? (

                                                                <a
                                                                    href={
                                                                        `mailto:${lead.customer_email}`
                                                                    }
                                                                >
                                                                    {
                                                                        lead.customer_email
                                                                    }
                                                                </a>

                                                            )
                                                            : "-"
                                                    }

                                                </td>


                                                <td>
                                                    {
                                                        lead.customer_phone
                                                        ??
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        lead.customer_service
                                                        ??
                                                        "-"
                                                    }
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            getStatusClass(
                                                                lead.status
                                                            )
                                                        }
                                                    >
                                                        {
                                                            formatStatus(
                                                                lead.status
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                <td>
                                                    {
                                                        lead.page_name
                                                        ??
                                                        "-"
                                                    }
                                                </td>


                                                <td>

                                                    {
                                                        lead.page_url
                                                            ? (

                                                                <a
                                                                    href={
                                                                        lead.page_url
                                                                    }

                                                                    target="_blank"

                                                                    rel=
                                                                        "noreferrer"
                                                                >
                                                                    {
                                                                        lead.page_url
                                                                    }
                                                                </a>

                                                            )
                                                            : "-"
                                                    }

                                                </td>


                                            </tr>

                                        )
                                    )

                                )
                        }


                    </tbody>


                </table>


            </div>


        </div>
    );
}