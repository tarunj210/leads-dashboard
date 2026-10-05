import {
    useEffect,
    useState,
} from "react";

import {
    fetchMarketingCalls,
} from "../api/marketing";

import type {
    MobileCall,
} from "../api/mobileDashboard";

import "./MobileDashboard.css";


type MarketingDashboardProps = {
    refreshKey: number;
};


export default function MarketingDashboard({
    refreshKey,
}: MarketingDashboardProps) {

    const [
        calls,
        setCalls,
    ] = useState<MobileCall[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );


    async function loadCalls() {

        try {
            setLoading(true);
            setError(null);

            const data =
                await fetchMarketingCalls();

            setCalls(
                data.items
            );

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load marketing calls"
            );

        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        loadCalls();
    }, [refreshKey]);


    function exportCsv() {

        if (calls.length === 0) {
            return;
        }

        const rows = calls.map(
            (call) => [
                call.connect_time ?? "",
                call.cli ?? "",
                call.cld ?? "",
                call.billed_duration ?? "",
                call.result ?? "",
                call.cost ?? "",
            ]
        );

        const csv = [
            [
                "Connected",
                "CLI",
                "CLD",
                "Duration",
                "Result",
                "Cost",
            ],
            ...rows,
        ]
            .map(
                (row) =>
                    row
                        .map(
                            (value) =>
                                `"${String(value).replace(
                                    /"/g,
                                    '""'
                                )}"`
                        )
                        .join(",")
            )
            .join("\n");

        const blob = new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;",
            }
        );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href = url;
        link.download =
            "marketing-calls.csv";

        link.click();

        URL.revokeObjectURL(
            url
        );
    }


    return (

        <div className="mobile-dashboard-page">

            <div className="mobile-dashboard-header">

                <div>
                    <h1>
                        Marketing calls
                    </h1>

                    <p>
                        Repeated callers with at least
                        3 calls, all under 60 seconds,
                        across at least 3 different days.
                    </p>
                </div>

            </div>


            {
                loading &&
                (
                    <p>
                        Loading marketing calls...
                    </p>
                )
            }


            {
                error &&
                (
                    <p className="mobile-dashboard-inline-error">
                        {error}
                    </p>
                )
            }


            {
                !loading &&
                !error &&
                (

                    <div className="mobile-table-card">

                        <div className="mobile-table-header">

                            <div>
                                <h2>
                                    Marketing calls
                                </h2>
                            </div>


                            <button
                                type="button"
                                className="mobile-export-button"
                                onClick={
                                    exportCsv
                                }
                                disabled={
                                    calls.length === 0
                                }
                            >
                                Export CSV
                            </button>

                        </div>


                        <div className="mobile-table-scroll">

                            <table className="mobile-table">

                                <thead>
                                    <tr>
                                        <th>Connected</th>
                                        <th>Caller</th>
                                        <th>Called Number</th>
                                        <th>Duration</th>
                                        <th>Cost</th>
                                    </tr>
                                </thead>


                                <tbody>

                                    {
                                        calls.map(
                                            (call) => (

                                                <tr
                                                    key={
                                                        call.id
                                                    }
                                                >
                                                    <td>
                                                        {
                                                            call.connect_time
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            call.cli
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            call.cld
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            call.billed_duration
                                                        }s
                                                    </td>

                                                    <td>
                                                        {
                                                            call.cost !== null
                                                                ? `$${call.cost.toFixed(2)}`
                                                                : "-"
                                                        }
                                                    </td>
                                                </tr>

                                            )
                                        )
                                    }

                                </tbody>

                            </table>

                        </div>

                    </div>

                )
            }

        </div>
    );
}