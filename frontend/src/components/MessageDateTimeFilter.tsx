import {
    useState,
} from "react";

import {
    DayPicker,
    type DateRange,
} from "react-day-picker";

import "react-day-picker/style.css";


type MessageDateTimeFilterProps = {

    startDate: string;
    startTime: string;

    endDate: string;
    endTime: string;

    onDateTimeRangeChange: (
        startDate: string,
        startTime: string,
        endDate: string,
        endTime: string,
    ) => void;
};


/* =========================================
   Date helpers
========================================= */

function normalizeDateString(
    value: string
): string {

    if (!value) {
        return "";
    }

    return value
        .split("T")[0]
        .split(" ")[0];
}


function parseDate(
    value: string
): Date {

    const normalized =
        normalizeDateString(
            value
        );

    const [
        year,
        month,
        day,
    ] = normalized
        .split("-")
        .map(Number);

    return new Date(
        year,
        month - 1,
        day
    );
}


function formatDate(
    date: Date
): string {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;
}


function displayShortDate(
    value: string
): string {

    if (!value) {
        return "";
    }

    const date =
        parseDate(
            value
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleDateString(
        "en-AU",
        {
            day: "2-digit",
            month: "short",
        }
    );
}


function displayTime(
    value: string
): string {

    return (
        value || ""
    );
}


/* =========================================
   Component
========================================= */

export default function MessageDateTimeFilter({

    startDate,
    startTime,

    endDate,
    endTime,

    onDateTimeRangeChange,

}: MessageDateTimeFilterProps) {


    const [
        calendarOpen,
        setCalendarOpen,
    ] = useState(
        false
    );


    const [
        draftRange,
        setDraftRange,
    ] = useState<
        DateRange | undefined
    >(
        undefined
    );


    const [
        draftStartTime,
        setDraftStartTime,
    ] = useState(
        startTime ||
        "00:00"
    );


    const [
        draftEndTime,
        setDraftEndTime,
    ] = useState(
        endTime ||
        "23:59"
    );


    const [
        dateTimeError,
        setDateTimeError,
    ] = useState<
        string | null
    >(
        null
    );


    /* =========================================
       Open / close popup
    ========================================= */

    function handleCalendarOpen() {

        if (
            calendarOpen
        ) {

            setCalendarOpen(
                false
            );

            return;
        }


        setDateTimeError(
            null
        );


        setDraftStartTime(
            startTime ||
            "00:00"
        );


        setDraftEndTime(
            endTime ||
            "23:59"
        );


        if (
            startDate &&
            endDate
        ) {

            setDraftRange({
                from:
                    parseDate(
                        startDate
                    ),

                to:
                    parseDate(
                        endDate
                    ),
            });

        } else {

            setDraftRange(
                undefined
            );
        }


        setCalendarOpen(
            true
        );
    }


    /* =========================================
       Date selection
    ========================================= */

    function handleDateSelect(
        range: DateRange | undefined
    ) {

        setDateTimeError(
            null
        );


        if (
            !range?.from
        ) {
            return;
        }


        /*
         * First click or starting
         * a new range.
         */
        if (
            !draftRange?.from ||
            draftRange.to
        ) {

            setDraftRange({
                from:
                    range.from,

                to:
                    undefined,
            });

            return;
        }


        /*
         * Second click.
         */
        let start =
            draftRange.from;

        let end =
            range.to ??
            range.from;


        /*
         * If second date is earlier,
         * swap the range.
         */
        if (
            end < start
        ) {

            const temporary =
                start;

            start =
                end;

            end =
                temporary;
        }


        setDraftRange({
            from:
                start,

            to:
                end,
        });
    }


    /* =========================================
       Apply
    ========================================= */

    function handleApplyDateTime() {

        setDateTimeError(
            null
        );


        if (
            !draftRange?.from ||
            !draftRange?.to
        ) {

            setDateTimeError(
                "Select both a start and end date."
            );

            return;
        }


        const nextStartDate =
            formatDate(
                draftRange.from
            );


        const nextEndDate =
            formatDate(
                draftRange.to
            );


        const nextStartTime =
            draftStartTime ||
            "00:00";


        const nextEndTime =
            draftEndTime ||
            "23:59";


        const startDateTime =
            `${nextStartDate}T${nextStartTime}:00`;


        const endDateTime =
            `${nextEndDate}T${nextEndTime}:59`;


        if (
            endDateTime <
            startDateTime
        ) {

            setDateTimeError(
                "End date and time must be after the start."
            );

            return;
        }


        /*
         * IMPORTANT:
         * one atomic parent-state update.
         */
        onDateTimeRangeChange(
            nextStartDate,
            nextStartTime,
            nextEndDate,
            nextEndTime,
        );


        setCalendarOpen(
            false
        );
    }


    return (

        <div className="filter-group date-filter">

            <label>
                Date & Time
            </label>


            <div className="date-picker-wrapper">

                <button
                    type="button"
                    className="date-range-button"

                    onClick={
                        handleCalendarOpen
                    }
                >

                    <span className="date-range-value">

                        {
                            startDate &&
                            endDate
                                ? (
                                    <>

                                        <span>
                                            {
                                                displayShortDate(
                                                    startDate
                                                )
                                            }
                                        </span>


                                        <span className="date-range-time">

                                            {
                                                displayTime(
                                                    startTime
                                                )
                                            }

                                        </span>


                                        <span className="date-range-separator">
                                            →
                                        </span>


                                        <span>

                                            {
                                                displayShortDate(
                                                    endDate
                                                )
                                            }

                                        </span>


                                        <span className="date-range-time">

                                            {
                                                displayTime(
                                                    endTime
                                                )
                                            }

                                        </span>

                                    </>
                                )
                                : (
                                    <span className="date-placeholder">
                                        Select date & time
                                    </span>
                                )
                        }

                    </span>


                    <span className="date-range-arrow">
                        ▾
                    </span>

                </button>


                {
                    calendarOpen &&
                    (

                        <div className="calendar-popup">


                            {/* Calendar */}

                            <div className="calendar-section">

                                <DayPicker
                                    mode="range"

                                    selected={
                                        draftRange
                                    }

                                    onSelect={
                                        handleDateSelect
                                    }

                                    defaultMonth={
                                        draftRange
                                            ?.from
                                            ? draftRange.from
                                            : startDate
                                                ? parseDate(
                                                    startDate
                                                )
                                                : undefined
                                    }

                                    showOutsideDays={
                                        false
                                    }
                                />

                            </div>


                            {/* Time footer */}

                            <div className="calendar-footer">


                                <div className="time-row">


                                    <div className="compact-time-field">

                                        <label htmlFor="message-start-time">
                                            Start time
                                        </label>


                                        <input
                                            id="message-start-time"
                                            type="time"

                                            value={
                                                draftStartTime
                                            }

                                            onChange={(
                                                event
                                            ) => {

                                                setDateTimeError(
                                                    null
                                                );

                                                setDraftStartTime(
                                                    event
                                                        .target
                                                        .value
                                                );
                                            }}
                                        />

                                    </div>


                                    <span className="time-arrow">
                                        →
                                    </span>


                                    <div className="compact-time-field">

                                        <label htmlFor="message-end-time">
                                            End time
                                        </label>


                                        <input
                                            id="message-end-time"
                                            type="time"

                                            value={
                                                draftEndTime
                                            }

                                            onChange={(
                                                event
                                            ) => {

                                                setDateTimeError(
                                                    null
                                                );

                                                setDraftEndTime(
                                                    event
                                                        .target
                                                        .value
                                                );
                                            }}
                                        />

                                    </div>

                                </div>


                                {
                                    dateTimeError &&
                                    (

                                        <div className="date-time-error">

                                            {
                                                dateTimeError
                                            }

                                        </div>
                                    )
                                }


                                <div className="calendar-actions">


                                    <button
                                        type="button"
                                        className="calendar-cancel-button"

                                        onClick={
                                            () =>
                                                setCalendarOpen(
                                                    false
                                                )
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="button"
                                        className="date-apply-button"

                                        disabled={
                                            !draftRange?.from ||
                                            !draftRange?.to
                                        }

                                        onClick={
                                            handleApplyDateTime
                                        }
                                    >
                                        Apply
                                    </button>


                                </div>

                            </div>

                        </div>

                    )
                }

            </div>

        </div>
    );
}