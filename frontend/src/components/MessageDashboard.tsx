import {
    useEffect,
    useState,
} from "react";

import {
    fetchLeadMessage,
    type LeadMessageResponse,
} from "../api/message";

import "./MessageDashboard.css";


type MessageDashboardProps = {

    refreshKey: number;
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


function toLocalInputValue(
    date: Date,
) {

    const year =
        date.getFullYear();

    const month =
        pad(
            date.getMonth() + 1
        );

    const day =
        pad(
            date.getDate()
        );

    const hours =
        pad(
            date.getHours()
        );

    const minutes =
        pad(
            date.getMinutes()
        );


    return (
        `${year}-${month}-${day}`
        + `T${hours}:${minutes}`
    );
}


function getDefaultRange() {

    const now =
        new Date();


    const start =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0,
            0,
            0,
        );


    const end =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            55,
            0,
        );


    return {
        start:
            toLocalInputValue(
                start
            ),

        end:
            toLocalInputValue(
                end
            ),
    };
}


export default function MessageDashboard({

    refreshKey,

}: MessageDashboardProps) {

    const defaultRange =
        getDefaultRange();


    const [
        startDate,
        setStartDate,
    ] = useState(
        defaultRange.start
    );


    const [
        endDate,
        setEndDate,
    ] = useState(
        defaultRange.end
    );


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
                    endDate,
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
            startDate
                .slice(
                    0,
                    10
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


    useEffect(
        () => {

            if (
                refreshKey > 0
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
                        Start date & time
                    </label>

                    <input
                        type="datetime-local"
                        value={
                            startDate
                        }
                        onChange={
                            (event) =>
                                setStartDate(
                                    event.target.value
                                )
                        }
                    />

                </div>


                <div className="message-filter">

                    <label>
                        End date & time
                    </label>

                    <input
                        type="datetime-local"
                        value={
                            endDate
                        }
                        onChange={
                            (event) =>
                                setEndDate(
                                    event.target.value
                                )
                        }
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