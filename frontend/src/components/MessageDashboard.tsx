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

import MessageDateTimeFilter
    from "../components/MessageDateTimeFilter";

import "./MessageDashboard.css";


type MessageDashboardProps = {

    refreshKey: number;

    filters:
        MessageFilters;

    onFiltersChange: (
        filters:
            MessageFilters
    ) => void;
};


/* =========================================
   Date helper
========================================= */

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


/* =========================================
   Component
========================================= */

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


    /* =========================================
       Load message
    ========================================= */

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

                    startTime ||
                    "00:00",

                    normalizedEndDate,

                    endTime ||
                    "23:59",

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


    /* =========================================
       Download text file
    ========================================= */

    function downloadMessage() {

        if (
            !data
        ) {
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


    /* =========================================
       Reload when filter changes
    ========================================= */

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


    /* =========================================
       Header refresh
    ========================================= */

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


    /* =========================================
       Render
    ========================================= */

    return (

        <div className="message-dashboard">


            {/* =================================
                Header
            ================================= */}

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


            {/* =================================
                Date & Time Filter
            ================================= */}

            <div className="message-filters">


                <MessageDateTimeFilter

                    startDate={
                        startDate
                    }

                    startTime={
                        startTime ||
                        "00:00"
                    }

                    endDate={
                        endDate
                    }

                    endTime={
                        endTime ||
                        "23:59"
                    }


                    onDateTimeRangeChange={(
                        newStartDate,
                        newStartTime,
                        newEndDate,
                        newEndTime,
                    ) => {

                        /*
                         * Update all four values
                         * together.
                         */
                        onFiltersChange({

                            ...filters,

                            startDate:
                                newStartDate,

                            startTime:
                                newStartTime,

                            endDate:
                                newEndDate,

                            endTime:
                                newEndTime,

                        });

                    }}
                />


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


            {/* =================================
                Error
            ================================= */}

            {
                error &&
                (

                    <div className="message-error">

                        {
                            error
                        }

                    </div>

                )
            }


            {/* =================================
                Result
            ================================= */}

            {
                data &&
                (
                    <>


                        {/* =========================
                            Summary
                        ========================= */}

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


                        {/* =========================
                            Preview header
                        ========================= */}

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


                        {/* =========================
                            Message preview
                        ========================= */}

                        <pre className=
                            "message-preview"
                        >

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