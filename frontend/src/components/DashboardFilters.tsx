import {
    useMemo,
    useState,
} from "react";

import {
    DayPicker,
    type DateRange,
} from "react-day-picker";

import "react-day-picker/style.css";


interface DashboardFiltersProps {
    startDate: string;
    endDate: string;

    minDate: string | null;
    maxDate: string | null;

    availableDates: string[];

    service: string;
    domain: string;
    pageName: string;
    status: string;

    services: string[];
    domains: string[];
    pageNames: string[];
    statuses: string[];

    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;

    onServiceChange: (value: string) => void;
    onDomainChange: (value: string) => void;
    onPageNameChange: (value: string) => void;
    onStatusChange: (value: string) => void;

    onClearFilters: () => void;
}


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
        normalizeDateString(value);

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
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function extractTime(
    value: string,
    fallback: string
): string {
    if (
        !value ||
        !value.includes("T")
    ) {
        return fallback;
    }

    const time =
        value.split("T")[1];

    if (!time) {
        return fallback;
    }

    return time.slice(0, 5);
}


function combineDateAndTime(
    date: Date,
    time: string,
    seconds = "00"
): string {
    return `${formatDate(date)}T${time}:${seconds}`;
}


/* =========================================
   Display helpers
========================================= */

function displayShortDate(
    value: string
): string {
    if (!value) {
        return "";
    }

    const date =
        parseDate(value);

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
    if (
        !value ||
        !value.includes("T")
    ) {
        return "";
    }

    return (
        value
            .split("T")[1]
            ?.slice(0, 5) ?? ""
    );
}


function formatStatus(
    value: string
): string {
    return value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase()
        );
}


/* =========================================
   Component
========================================= */

export default function DashboardFilters({
    startDate,
    endDate,

    minDate,
    maxDate,

    availableDates,

    service,
    domain,
    pageName,
    status,

    services,
    domains,
    pageNames,
    statuses,

    onStartDateChange,
    onEndDateChange,

    onServiceChange,
    onDomainChange,
    onPageNameChange,
    onStatusChange,

    onClearFilters,
}: DashboardFiltersProps) {

    const [
        calendarOpen,
        setCalendarOpen,
    ] = useState(false);


    const [
        draftRange,
        setDraftRange,
    ] = useState<
        DateRange | undefined
    >(undefined);


    const [
        startTime,
        setStartTime,
    ] = useState("00:00");


    const [
        endTime,
        setEndTime,
    ] = useState("23:59");


    const [
        dateTimeError,
        setDateTimeError,
    ] = useState<string | null>(
        null
    );


    /* =====================================
       Available dates
    ===================================== */

    const availableDateSet =
        useMemo(
            () =>
                new Set(
                    availableDates.map(
                        normalizeDateString
                    )
                ),
            [availableDates]
        );


    function isDateDisabled(
        date: Date
    ): boolean {
        return !availableDateSet.has(
            formatDate(date)
        );
    }


    /* =====================================
       Open / close
    ===================================== */

    function handleCalendarOpen() {

        if (calendarOpen) {
            setCalendarOpen(false);
            return;
        }

        setDateTimeError(null);

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

        if (
            startDate &&
            endDate
        ) {
            setDraftRange({
                from: parseDate(
                    startDate
                ),
                to: parseDate(
                    endDate
                ),
            });
        } else {
            setDraftRange(
                undefined
            );
        }

        setCalendarOpen(true);
    }


    /* =====================================
       Date range selection
    ===================================== */

    function handleDateSelect(
        range: DateRange | undefined
    ) {

        setDateTimeError(null);

        if (!range?.from) {
            return;
        }


        /*
         * First click, or user is starting
         * a new range after a completed one.
         */
        if (
            !draftRange?.from ||
            draftRange.to
        ) {
            setDraftRange({
                from: range.from,
                to: undefined,
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
         * User selected an earlier date
         * as the second date.
         */
        if (end < start) {
            const temporary =
                start;

            start = end;
            end = temporary;
        }


        setDraftRange({
            from: start,
            to: end,
        });
    }


    /* =====================================
       Apply
    ===================================== */

    function handleApplyDateTime() {

        setDateTimeError(null);


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


        /*
         * End of selected minute.
         */
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
                "End date and time must be after the start."
            );

            return;
        }


        onStartDateChange(
            startDateTime
        );

        onEndDateChange(
            endDateTime
        );

        setCalendarOpen(false);
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
        <div className="dashboard-filters">


            {/* =================================
                Date & Time
            ================================= */}

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

                            {startDate &&
                            endDate
                                ? (
                                    <>
                                        <span>
                                            {displayShortDate(
                                                startDate
                                            )}
                                        </span>

                                        <span className="date-range-time">
                                            {displayTime(
                                                startDate
                                            )}
                                        </span>

                                        <span className="date-range-separator">
                                            →
                                        </span>

                                        <span>
                                            {displayShortDate(
                                                endDate
                                            )}
                                        </span>

                                        <span className="date-range-time">
                                            {displayTime(
                                                endDate
                                            )}
                                        </span>
                                    </>
                                )
                                : (
                                    <span className="date-placeholder">
                                        Select date & time
                                    </span>
                                )}

                        </span>


                        <span className="date-range-arrow">
                            ▾
                        </span>

                    </button>


                    {calendarOpen && (

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

                                    disabled={
                                        isDateDisabled
                                    }

                                    defaultMonth={
                                        draftRange?.from
                                            ? draftRange.from
                                            : startDate
                                                ? parseDate(
                                                    startDate
                                                )
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

                            </div>


                            {/* Footer */}

                            <div className="calendar-footer">


                                <div className="time-row">


                                    <div className="compact-time-field">

                                        <label htmlFor="start-time">
                                            Start time
                                        </label>

                                        <input
                                            id="start-time"
                                            type="time"

                                            value={
                                                startTime
                                            }

                                            onChange={(event) => {

                                                setDateTimeError(
                                                    null
                                                );

                                                setStartTime(
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

                                        <label htmlFor="end-time">
                                            End time
                                        </label>

                                        <input
                                            id="end-time"
                                            type="time"

                                            value={
                                                endTime
                                            }

                                            onChange={(event) => {

                                                setDateTimeError(
                                                    null
                                                );

                                                setEndTime(
                                                    event
                                                        .target
                                                        .value
                                                );
                                            }}
                                        />

                                    </div>

                                </div>


                                {dateTimeError && (

                                    <div className="date-time-error">
                                        {dateTimeError}
                                    </div>

                                )}


                                <div className="calendar-actions">

                                    <button
                                        type="button"
                                        className="calendar-cancel-button"
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

                    )}

                </div>

            </div>


            {/* =================================
                Service
            ================================= */}

            <div className="filter-group">

                <label>
                    Service
                </label>

                <select
                    value={service}

                    onChange={(event) =>
                        onServiceChange(
                            event.target.value
                        )
                    }
                >

                    <option value="all">
                        All Services
                    </option>

                    {services.map(
                        (item) => (

                            <option
                                key={item}
                                value={item}
                            >
                                {item}
                            </option>

                        )
                    )}

                </select>

            </div>


            {/* =================================
                Domain
            ================================= */}

            <div className="filter-group">

                <label>
                    Domain
                </label>

                <select
                    value={domain}

                    onChange={(event) =>
                        onDomainChange(
                            event.target.value
                        )
                    }
                >

                    <option value="all">
                        All Domains
                    </option>

                    {domains.map(
                        (item) => (

                            <option
                                key={item}
                                value={item}
                            >
                                {item}
                            </option>

                        )
                    )}

                </select>

            </div>


            {/* =================================
                Page
            ================================= */}

            <div className="filter-group">

                <label>
                    Page Name
                </label>

                <select
                    value={pageName}

                    onChange={(event) =>
                        onPageNameChange(
                            event.target.value
                        )
                    }
                >

                    <option value="all">
                        All Pages
                    </option>

                    {pageNames.map(
                        (item) => (

                            <option
                                key={item}
                                value={item}
                            >
                                {item}
                            </option>

                        )
                    )}

                </select>

            </div>


            {/* =================================
                Status
            ================================= */}

            <div className="filter-group">

                <label>
                    Status
                </label>

                <select
                    value={status}

                    onChange={(event) =>
                        onStatusChange(
                            event.target.value
                        )
                    }
                >

                    <option value="all">
                        All Statuses
                    </option>

                    {statuses.map(
                        (item) => (

                            <option
                                key={item}
                                value={item}
                            >
                                {formatStatus(
                                    item
                                )}
                            </option>

                        )
                    )}

                </select>

            </div>


            {/* =================================
                Clear
            ================================= */}

            <div className="filter-group filter-actions">

                <label>
                    &nbsp;
                </label>

                <button
                    type="button"
                    className="clear-filters-button"

                    onClick={
                        handleClearFilters
                    }
                >
                    Clear
                </button>

            </div>

        </div>
    );
}