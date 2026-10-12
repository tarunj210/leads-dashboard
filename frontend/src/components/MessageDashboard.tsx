import {
    useEffect,
    useState,
} from "react";

import type {
    MessageFilters,
} from "../types/filters";

import {
    fetchLeadMessage,
    type LeadMessageResponse,
} from "../api/message";

import "./MessageDashboard.css";


type MessageDashboardProps = {
    refreshKey: number;

    filters: MessageFilters;

    onFiltersChange: (
        filters: MessageFilters
    ) => void;
};


function normalizeDate(
    value: string
): string {

    if (!value) {
        return "";
    }

    return value
        .split("T")[0]
        .split(" ")[0];
}


function toDateTimeLocalValue(
    date: string,
    time: string,
): string {

    const normalizedDate =
        normalizeDate(
            date
        );

    if (!normalizedDate) {
        return "";
    }

    return `${normalizedDate}T${time || "00:00"}`;
}


function splitDateTimeLocalValue(
    value: string,
): {
    date: string;
    time: string;
} {

    if (!value) {
        return {
            date: "",
            time: "",
        };
    }

    const [
        date,
        time = "",
    ] = value.split("T");

    return {
        date,
        time:
            time.slice(
                0,
                5
            ),
    };
}


export default function MessageDashboard({
    refreshKey,
    filters,
    onFiltersChange,
}: MessageDashboardProps) {

    const {
        startDate,
        startTime,
        endDate,
        endTime,
    } = filters;


    const [
        data,
        setData,
    ] = useState<
        LeadMessageResponse | null
    >(
        null
    );


    const [
        loading,
        setLoading,
    ] = useState(
        false
    );


    const [
        error,
        setError,
    ] = useState<
        string | null
    >(
        null
    );


    async function loadMessage() {

        const normalizedStartDate =
            normalizeDate(
                startDate
            );

        const normalizedEndDate =
            normalizeDate(
                endDate
            );


        if (
            !normalizedStartDate ||
            !normalizedEndDate
        ) {
            return;
        }


        try {

            setLoading(
                true
            );

            setError(
                null
            );


            const result =
                await fetchLeadMessage(
                    normalizedStartDate,
                    startTime || "00:00",
                    normalizedEndDate,
                    endTime || "23:59",
                );


            setData(
                result
            );

        } catch (err) {

            console.error(
                "Failed to load lead message:",
                err
            );


            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to generate message"
            );

        } finally {

            setLoading(
                false
            );
        }
    }


    function downloadMessage() {

        if (!data) {
            return;
        }


        const blob =
            new Blob(
                [
                    data.message
                ],
                {
                    type:
                        "text/plain;charset=utf-8",
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const anchor =
            document.createElement(
                "a"
            );


        const date =
            normalizeDate(
                startDate
            );


        anchor.href =
            url;

        anchor.download =
            `leads-${date}.txt`;


        document.body.appendChild(
            anchor
        );


        anchor.click();

        anchor.remove();


        URL.revokeObjectURL(
            url
        );
    }


    /*
     * Reload automatically whenever the
     * selected date/time range changes.
     */
    useEffect(
        () => {

            if (
                !startDate ||
                !endDate
            ) {
                return;
            }

            loadMessage();

        },
        [
            startDate,
            startTime,
            endDate,
            endTime,
        ]
    );


    /*
     * Header refresh should regenerate
     * the currently selected range.
     */
    useEffect(
        () => {

            if (
                refreshKey === 0 ||
                !startDate ||
                !endDate
            ) {
                return;
            }

            loadMessage();

        },
        [
            refreshKey,
        ]
    );


    return (

        <div className="message-dashboard">


            <div className="message-header">

                <div>

                    <h1>
                        Lead Message
                    </h1>

                    <p>
                        Generate call and email leads
                        for a selected time range.
                    </p>

                </div>

            </div>


            <div className="message-filters">


                <div className="message-filter">

                    <label>
                        Start date & time
                    </label>

                    <input
                        type="datetime-local"

                        value={
                            toDateTimeLocalValue(
                                startDate,
                                startTime || "00:00",
                            )
                        }

                        onChange={(
                            event
                        ) => {

                            const {
                                date,
                                time,
                            } =
                                splitDateTimeLocalValue(
                                    event.target.value
                                );


                            onFiltersChange({

                                ...filters,

                                startDate:
                                    date,

                                startTime:
                                    time || "00:00",

                            });

                        }}
                    />

                </div>


                <div className="message-filter">

                    <label>
                        End date & time
                    </label>

                    <input
                        type="datetime-local"

                        value={
                            toDateTimeLocalValue(
                                endDate,
                                endTime || "23:59",
                            )
                        }

                        onChange={(
                            event
                        ) => {

                            const {
                                date,
                                time,
                            } =
                                splitDateTimeLocalValue(
                                    event.target.value
                                );


                            onFiltersChange({

                                ...filters,

                                endDate:
                                    date,

                                endTime:
                                    time || "23:59",

                            });

                        }}
                    />

                </div>


                <button
                    type="button"

                    className=
                        "message-generate-button"

                    onClick={
                        loadMessage
                    }

                    disabled={
                        loading ||
                        !startDate ||
                        !endDate
                    }
                >

                    {
                        loading
                            ? "Generating..."
                            : "Generate"
                    }

                </button>

            </div>


            {
                error &&
                (
                    <div className="message-error">
                        {error}
                    </div>
                )
            }


            {
                data &&
                (
                    <>

                        <div className="message-summary">


                            <div>

                                <span>
                                    Call Leads
                                </span>

                                <strong>
                                    {
                                        data
                                            .call_lead_count
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Email Leads
                                </span>

                                <strong>
                                    {
                                        data
                                            .email_lead_count
                                    }
                                </strong>

                            </div>


                        </div>


                        <div className=
                            "message-preview-header"
                        >

                            <h2>
                                Message Preview
                            </h2>


                            <button
                                type="button"

                                className=
                                    "message-download-button"

                                onClick={
                                    downloadMessage
                                }
                            >
                                Download .txt
                            </button>

                        </div>


                        <pre className="message-preview">
                            {
                                data.message
                            }
                        </pre>

                    </>
                )
            }

        </div>
    );
}