import {
    useMemo,
    useState,
} from "react";

import {
    DayPicker,
    type DateRange,
} from "react-day-picker";

import "react-day-picker/style.css";

import "./MobileDashboardFilters.css";


type MobileDashboardFiltersProps = {
    startDate: string;
    endDate: string;

    minDate: string | null;
    maxDate: string | null;

    minDuration: number;
    maxDuration: number | null;

    viewMode: "forwarded" | "website";
    selectedCld: string | null;

    trackingNumbers: {
        cld: string;
        website: string;
    }[];

    onStartDateChange: (
        value: string
    ) => void;

    onEndDateChange: (
        value: string
    ) => void;

    onMinDurationChange: (
        value: number
    ) => void;

    onMaxDurationChange: (
        value: number | null
    ) => void;

    onViewModeChange: (
        value: "forwarded" | "website"
    ) => void;

    onSelectedCldChange: (
        value: string | null
    ) => void;

    onClearFilters: () => void;
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

    return value.split("T")[0];
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

    return (
        `${year}-${month}-${day}`
    );
}


function extractTime(
    value: string,
    fallback: string
): string {

    if (
        !value.includes("T")
    ) {
        return fallback;
    }

    return value
        .split("T")[1]
        .slice(
            0,
            5
        );
}


function combineDateAndTime(
    date: Date,
    time: string,
    seconds: string
): string {

    return (
        `${formatDate(date)}T` +
        `${time}:${seconds}`
    );
}


function displayDate(
    value: string
): string {

    if (!value) {
        return "";
    }

    const date =
        parseDate(
            value
        );

    return date.toLocaleDateString(
        "en-AU",
        {
            day:
                "2-digit",

            month:
                "short",
        }
    );
}


function displayTime(
    value: string
): string {

    if (
        !value.includes("T")
    ) {
        return "";
    }

    return value
        .split("T")[1]
        .slice(
            0,
            5
        );
}


/* =========================================
   Phone formatting
========================================= */

function formatTrackingNumber(
    value: string
): string {

    const digits =
        value.replace(
            /\D/g,
            ""
        );

    if (
        digits.startsWith("61") &&
        digits.length === 11
    ) {

        return (
            `+61 ${digits.slice(
                2,
                5
            )} ` +
            `${digits.slice(
                5,
                8
            )} ` +
            `${digits.slice(
                8
            )}`
        );
    }

    return value;
}


/* =========================================
   Component
========================================= */

export default function MobileDashboardFilters({

    startDate,
    endDate,

    minDate,
    maxDate,

    minDuration,
    maxDuration,

    viewMode,
    selectedCld,

    trackingNumbers,

    onStartDateChange,
    onEndDateChange,

    onMinDurationChange,
    onMaxDurationChange,

    onViewModeChange,
    onSelectedCldChange,

    onClearFilters,

}: MobileDashboardFiltersProps) {


    const [
        calendarOpen,
        setCalendarOpen,
    ] = useState(
        false
    );


    const initialRange =
        useMemo<
            DateRange | undefined
        >(
            () => {

                if (
                    !startDate ||
                    !endDate
                ) {
                    return undefined;
                }

                return {
                    from:
                        parseDate(
                            startDate
                        ),

                    to:
                        parseDate(
                            endDate
                        ),
                };
            },
            [
                startDate,
                endDate,
            ]
        );


    const [
        draftRange,
        setDraftRange,
    ] = useState<
        DateRange | undefined
    >(
        initialRange
    );


    const [
        startTime,
        setStartTime,
    ] = useState(
        extractTime(
            startDate,
            "00:00"
        )
    );


    const [
        endTime,
        setEndTime,
    ] = useState(
        extractTime(
            endDate,
            "23:59"
        )
    );


    const [
        dateTimeError,
        setDateTimeError,
    ] = useState<
        string | null
    >(
        null
    );


    /* =====================================
       Open calendar
    ===================================== */

    function handleCalendarOpen() {

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


            setStartTime(
                extractTime(
                    startDate,
                    "00:00"
                )
            );


            setEndTime(
                extractTime(
                    endDate,
                    "23:59"
                )
            );
        }


        setDateTimeError(
            null
        );


        setCalendarOpen(
            (
                current
            ) =>
                !current
        );
    }


    /* =====================================
       Date selection
    ===================================== */

    function handleDateSelect(
        range:
            DateRange | undefined
    ) {

        setDraftRange(
            range
        );

        setDateTimeError(
            null
        );
    }


    /* =====================================
       Disable dates outside DB bounds
    ===================================== */

    function isDateDisabled(
        date: Date
    ): boolean {

        if (
            minDate &&
            date <
                parseDate(
                    minDate
                )
        ) {

            return true;
        }


        if (
            maxDate &&
            date >
                parseDate(
                    maxDate
                )
        ) {

            return true;
        }


        return false;
    }


    /* =====================================
       Apply date + time
    ===================================== */

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


        const startDateTime =
            combineDateAndTime(
                draftRange.from,
                startTime,
                "00"
            );


        const endDateTime =
            combineDateAndTime(
                draftRange.to,
                endTime,
                "59"
            );


        if (
            endDateTime <
            startDateTime
        ) {

            setDateTimeError(
                "End date and time must be after the start date and time."
            );

            return;
        }


        onStartDateChange(
            startDateTime
        );


        onEndDateChange(
            endDateTime
        );


        setCalendarOpen(
            false
        );
    }


    /* =====================================
       View mode
    ===================================== */

    function handleViewModeChange(
        value:
            "forwarded" |
            "website"
    ) {

        onViewModeChange(
            value
        );


        if (
            value ===
            "forwarded"
        ) {

            onSelectedCldChange(
                null
            );
        }
    }


    /* =====================================
       Clear
    ===================================== */

    function handleClearFilters() {

        setDraftRange(
            undefined
        );


        setStartTime(
            "00:00"
        );


        setEndTime(
            "23:59"
        );


        setDateTimeError(
            null
        );


        setCalendarOpen(
            false
        );


        onClearFilters();
    }


    return (

        <div className="mobile-dashboard-filters">


            {/* =================================
                View mode
            ================================= */}

            <div className="mobile-filter-group mobile-view-mode-group">

                <label>
                    View
                </label>


                <div className="mobile-view-mode">

                    <button
                        type="button"

                        className={
                            viewMode ===
                            "forwarded"

                                ? "mobile-view-mode-button active"

                                : "mobile-view-mode-button"
                        }

                        onClick={() =>
                            handleViewModeChange(
                                "forwarded"
                            )
                        }
                    >
                        Forwarded Number
                    </button>


                    <button
                        type="button"

                        className={
                            viewMode ===
                            "website"

                                ? "mobile-view-mode-button active"

                                : "mobile-view-mode-button"
                        }

                        onClick={() =>
                            handleViewModeChange(
                                "website"
                            )
                        }
                    >
                        Website / Tracking Number
                    </button>

                </div>

            </div>


            {/* =================================
                Date/time range
            ================================= */}

            <div className="mobile-filter-group mobile-date-filter">

                <label>
                    Date Range
                </label>


                <div className="mobile-date-picker-wrapper">

                    <button
                        type="button"

                        className="mobile-date-range-button"

                        onClick={
                            handleCalendarOpen
                        }
                    >

                        <span>

                            {
                                startDate &&
                                endDate

                                    ? (
                                        <>

                                            {
                                                displayDate(
                                                    startDate
                                                )
                                            }

                                            {" "}

                                            {
                                                displayTime(
                                                    startDate
                                                )
                                            }

                                            {" → "}

                                            {
                                                displayDate(
                                                    endDate
                                                )
                                            }

                                            {" "}

                                            {
                                                displayTime(
                                                    endDate
                                                )
                                            }

                                        </>
                                    )

                                    : (
                                        "Select date and time"
                                    )
                            }

                        </span>


                        <span>
                            ▾
                        </span>

                    </button>


                    {
                        calendarOpen &&
                        (

                            <div className="mobile-calendar-popup">

                                <DayPicker

                                    mode="range"

                                    selected={
                                        draftRange
                                    }

                                    onSelect={
                                        handleDateSelect
                                    }

                                    disabled={
                                        isDateDisabled
                                    }

                                    defaultMonth={
                                        draftRange
                                            ?.from

                                            ? draftRange.from

                                            : minDate

                                                ? parseDate(
                                                    minDate
                                                )

                                                : undefined
                                    }

                                    startMonth={
                                        minDate

                                            ? parseDate(
                                                minDate
                                            )

                                            : undefined
                                    }

                                    endMonth={
                                        maxDate

                                            ? parseDate(
                                                maxDate
                                            )

                                            : undefined
                                    }

                                    showOutsideDays={
                                        false
                                    }
                                />


                                <div className="mobile-calendar-help">

                                    {
                                        !draftRange?.from

                                            ? "Select a start date"

                                            : !draftRange.to

                                                ? "Now select an end date"

                                                : "Choose the start and end time"
                                    }

                                </div>


                                {
                                    draftRange?.from &&
                                    draftRange?.to &&
                                    (

                                        <div className="mobile-time-range-controls">

                                            <div className="mobile-time-field">

                                                <label>
                                                    Start Time
                                                </label>

                                                <input
                                                    type="time"

                                                    value={
                                                        startTime
                                                    }

                                                    onChange={(event) =>
                                                        setStartTime(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />

                                            </div>


                                            <div className="mobile-time-field">

                                                <label>
                                                    End Time
                                                </label>

                                                <input
                                                    type="time"

                                                    value={
                                                        endTime
                                                    }

                                                    onChange={(event) =>
                                                        setEndTime(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />

                                            </div>

                                        </div>

                                    )
                                }


                                {
                                    dateTimeError &&
                                    (

                                        <div className="mobile-date-time-error">

                                            {
                                                dateTimeError
                                            }

                                        </div>

                                    )
                                }


                                <div className="mobile-calendar-actions">

                                    <button
                                        type="button"

                                        className="mobile-calendar-cancel-button"

                                        onClick={() =>
                                            setCalendarOpen(
                                                false
                                            )
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="button"

                                        className="mobile-calendar-apply-button"

                                        onClick={
                                            handleApplyDateTime
                                        }
                                    >
                                        Apply
                                    </button>

                                </div>

                            </div>

                        )
                    }

                </div>

            </div>


            {/* =================================
                Duration range
            ================================= */}

            <div className="mobile-filter-group">

                <label>
                    Minimum Duration
                </label>

                <input
                    className="mobile-filter-input"

                    type="number"

                    min="0"

                    value={
                        minDuration
                    }

                    onChange={(event) => {

                        const value =
                            Number(
                                event
                                    .target
                                    .value
                            );


                        onMinDurationChange(
                            Math.max(
                                0,
                                value
                            )
                        );
                    }}
                />

            </div>


            <div className="mobile-filter-group">

                <label>
                    Maximum Duration
                </label>

                <input
                    className="mobile-filter-input"

                    type="number"

                    min="0"

                    placeholder="Any"

                    value={
                        maxDuration
                        ?? ""
                    }

                    onChange={(event) => {

                        const value =
                            event
                                .target
                                .value;


                        if (
                            value === ""
                        ) {

                            onMaxDurationChange(
                                null
                            );

                            return;
                        }


                        onMaxDurationChange(
                            Math.max(
                                0,
                                Number(
                                    value
                                )
                            )
                        );
                    }}
                />

            </div>


            {/* =================================
                Website / CLD
            ================================= */}

            {
                viewMode ===
                "website" &&
                (

                    <div className="mobile-filter-group mobile-tracking-number-filter">

                        <label>
                            Website / Tracking Number
                        </label>


                        <select
                            className="mobile-filter-input"

                            value={
                                selectedCld
                                ?? ""
                            }

                            onChange={(event) => {

                                const value =
                                    event
                                        .target
                                        .value;


                                onSelectedCldChange(
                                    value ||
                                    null
                                );
                            }}
                        >

                            <option value="">
                                Select website
                            </option>


                            {
                                trackingNumbers.map(
                                    (
                                        item
                                    ) => (

                                        <option
                                            key={
                                                item.cld
                                            }

                                            value={
                                                item.cld
                                            }
                                        >

                                            {
                                                `${item.website} — ${formatTrackingNumber(
                                                    item.cld
                                                )}`
                                            }

                                        </option>

                                    )
                                )
                            }

                        </select>

                    </div>

                )
            }


            {/* =================================
                Clear
            ================================= */}

            <div className="mobile-filter-group">

                <label>
                    &nbsp;
                </label>


                <button
                    type="button"

                    className="mobile-clear-filters-button"

                    onClick={
                        handleClearFilters
                    }
                >
                    Clear Filters
                </button>

            </div>

        </div>
    );
}