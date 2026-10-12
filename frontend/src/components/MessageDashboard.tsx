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


function pad(
    value: number,
) {
    return String(
        value
    ).padStart(
        2,
        "0"
    );
}


function getTodayDate(): string {
    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        pad(
            now.getMonth() + 1
        );

    const day =
        pad(
            now.getDate()
        );

    return `${year}-${month}-${day}`;
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


    /*
     * Initialise missing values only.
     *
     * This also migrates older localStorage values
     * that only contained startDate/endDate.
     */
    useEffect(
        () => {

            const today =
                getTodayDate();


            if (
                !filters.startDate ||
                !filters.endDate ||
                !filters.startTime ||
                !filters.endTime
            ) {

                onFiltersChange({
                    ...filters,

                    startDate:
                        filters.startDate ||
                        today,

                    startTime:
                        filters.startTime ||
                        "00:00",

                    endDate:
                        filters.endDate ||
                        today,

                    endTime:
                        filters.endTime ||
                        "23:59",
                });
            }

        },
        []
    );


    async function loadMessage() {

        if (
            !startDate ||
            !endDate
        ) {
            setError(
                "Select both a start and end date."
            );

            return;
        }


        const startDateTime =
            `${startDate}T${startTime}:00`;

        const endDateTime =
            `${endDate}T${endTime}:59`;


        if (
            endDateTime <
            startDateTime
        ) {
            setError(
                "End date and time must be after the start date and time."
            );

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
                    startDate,
                    startTime,
                    endDate,
                    endTime,
                );


            setData(
                result
            );

        } catch (err) {

            console.error(
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


    function clearFilters() {

        const today =
            getTodayDate();


        onFiltersChange({
            startDate:
                today,

            startTime:
                "00:00",

            endDate:
                today,

            endTime:
                "23:59",
        });


        setData(
            null
        );

        setError(
            null
        );
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


        anchor.href =
            url;

        anchor.download =
            `leads-${startDate}.txt`;


        document.body.appendChild(
            anchor
        );


        anchor.click();


        anchor.remove();


        URL.revokeObjectURL(
            url
        );
    }


    useEffect(
        () => {

            if (
                refreshKey > 0 &&
                startDate &&
                endDate
            ) {
                loadMessage();
            }

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
                        Start date
                    </label>

                    <input
                        type="date"

                        value={
                            startDate
                        }

                        onChange={(
                            event
                        ) => {

                            onFiltersChange({
                                ...filters,

                                startDate:
                                    event.target.value,
                            });

                        }}
                    />

                </div>


                <div className="message-filter">

                    <label>
                        Start time
                    </label>

                    <input
                        type="time"

                        value={
                            startTime
                        }

                        onChange={(
                            event
                        ) => {

                            onFiltersChange({
                                ...filters,

                                startTime:
                                    event.target.value,
                            });

                        }}
                    />

                </div>


                <div className="message-filter">

                    <label>
                        End date
                    </label>

                    <input
                        type="date"

                        value={
                            endDate
                        }

                        onChange={(
                            event
                        ) => {

                            onFiltersChange({
                                ...filters,

                                endDate:
                                    event.target.value,
                            });

                        }}
                    />

                </div>


                <div className="message-filter">

                    <label>
                        End time
                    </label>

                    <input
                        type="time"

                        value={
                            endTime
                        }

                        onChange={(
                            event
                        ) => {

                            onFiltersChange({
                                ...filters,

                                endTime:
                                    event.target.value,
                            });

                        }}
                    />

                </div>


                <button
                    type="button"
                    className="message-generate-button"

                    onClick={
                        loadMessage
                    }

                    disabled={
                        loading
                    }
                >

                    {
                        loading
                            ? "Generating..."
                            : "Generate"
                    }

                </button>


                <button
                    type="button"
                    className="message-clear-button"

                    onClick={
                        clearFilters
                    }

                    disabled={
                        loading
                    }
                >
                    Clear
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
                                        data.call_lead_count
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Email Leads
                                </span>

                                <strong>
                                    {
                                        data.email_lead_count
                                    }
                                </strong>

                            </div>

                        </div>


                        <div className="message-preview-header">

                            <h2>
                                Message Preview
                            </h2>


                            <button
                                type="button"
                                className="message-download-button"

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
