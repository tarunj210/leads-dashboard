import {
    useEffect,
    useState,
} from "react";

import type {
    MobileFilters,
} from "../types/filters";

import {
    fetchMobileCalls,
    fetchMobileFilterOptions,
    fetchMobileSummary,
    type MobileCall,
    type MobileFilterOptions,
    type MobileSummary,
} from "../api/mobileDashboard";

import MobileDashboardFilters
    from "../components/MobileDashboardFilters";

import MetricCard
    from "../components/MetricCard";

import "./MobileDashboard.css";


type MobileDashboardProps = {
    refreshKey: number;

    filters: MobileFilters;

    onFiltersChange: (
        filters: MobileFilters
    ) => void;
};


export default function MobileDashboard({
    refreshKey,
    filters,
    onFiltersChange,
}: MobileDashboardProps) {

    /* =========================================
       Filter metadata
    ========================================= */

    const [
        filterOptions,
        setFilterOptions,
    ] = useState<
        MobileFilterOptions | null
    >(null);


    /* =========================================
       Selected filters
    ========================================= */

    const {
        startDate,
        endDate,
        minDuration,
        maxDuration,
        viewMode,
        selectedCld,
    } = filters;


    /* =========================================
       Summary
    ========================================= */

    const [
        summary,
        setSummary,
    ] = useState<
        MobileSummary | null
    >(null);


    /* =========================================
       Calls
    ========================================= */

    const [
        calls,
        setCalls,
    ] = useState<
        MobileCall[]
    >([]);


    const [
        page,
        setPage,
    ] = useState(1);


    const [
        totalPages,
        setTotalPages,
    ] = useState(1);


    const [
        totalCalls,
        setTotalCalls,
    ] = useState(0);


    /* =========================================
       Loading / Error
    ========================================= */

    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        tableLoading,
        setTableLoading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);


    /* =========================================
       Derived website selection
    ========================================= */

    const selectedWebsite =
        filterOptions
            ?.tracking_numbers
            .find(
                (item) =>
                    item.cld ===
                    selectedCld
            )
        ?? null;


    /* =========================================
       Load filter metadata
    ========================================= */

    async function loadFilterOptions() {
        try {
            const options =
                await fetchMobileFilterOptions();

            setFilterOptions(
                options
            );

            if (
                !filters.startDate ||
                !filters.endDate
            ) {
                onFiltersChange({
                    ...filters,

                    startDate:
                        filters.startDate ||
                        options.date_range.min_date ||
                        "",

                    endDate:
                        filters.endDate ||
                        options.date_range.max_date ||
                        "",
                });
            }
        } catch (err) {
            console.error(
                "Failed to load mobile filter options:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load mobile filter options"
            );
        }
    }


    /* =========================================
       Load summary
    ========================================= */

    async function loadSummary() {
        try {
            setLoading(
                true
            );

            setError(
                null
            );

            const data =
                await fetchMobileSummary({
                    startDate:
                        startDate ||
                        undefined,

                    endDate:
                        endDate ||
                        undefined,

                    minDuration,
                    maxDuration,
                    viewMode,
                    selectedCld,
                });

            setSummary(
                data
            );
        } catch (err) {
            console.error(
                "Failed to load mobile summary:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load mobile dashboard"
            );
        } finally {
            setLoading(
                false
            );
        }
    }


    /* =========================================
       Load calls
    ========================================= */

    async function loadCalls(
        currentPage: number,
        append = false,
    ) {
        try {
            setTableLoading(
                true
            );

            setError(
                null
            );

            const data =
                await fetchMobileCalls({
                    startDate:
                        startDate ||
                        undefined,

                    endDate:
                        endDate ||
                        undefined,

                    minDuration,
                    maxDuration,
                    viewMode,
                    selectedCld,

                    page:
                        currentPage,

                    pageSize:
                        25,
                });

            setCalls(
                (current) => {
                    if (!append) {
                        return data.items;
                    }

                    const existingIds =
                        new Set(
                            current.map(
                                (call) =>
                                    call.id
                            )
                        );

                    const newItems =
                        data.items.filter(
                            (call) =>
                                !existingIds.has(
                                    call.id
                                )
                        );

                    return [
                        ...current,
                        ...newItems,
                    ];
                }
            );

            setPage(
                currentPage
            );

            setTotalPages(
                data.total_pages
            );

            setTotalCalls(
                data.total
            );
        } catch (err) {
            console.error(
                "Failed to load mobile calls:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load mobile calls"
            );
        } finally {
            setTableLoading(
                false
            );
        }
    }


    /* =========================================
       Export currently loaded rows
    ========================================= */

    function exportMobileCallsToCsv() {
        if (
            calls.length === 0
        ) {
            return;
        }

        const headers = [
            "Connected",
            "Caller",
            "Duration Seconds",
            "Cost",
        ];

        const rows =
            calls.map(
                (call) => [
                    call.connect_time ?? "",
                    call.cli ?? "",
                    call.billed_duration ?? "",
                    call.cost ?? "",
                ]
            );

        const escapeCsvValue = (
            value: string | number
        ) => {
            const text =
                String(
                    value
                );

            return `"${text.replace(
                /"/g,
                '""'
            )}"`;
        };

        const csvContent = [
            headers,
            ...rows,
        ]
            .map(
                (row) =>
                    row
                        .map(
                            escapeCsvValue
                        )
                        .join(",")
            )
            .join("\n");

        const blob =
            new Blob(
                [
                    csvContent
                ],
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

        link.href =
            url;

        link.download =
            viewMode === "website"
                ? "website-mobile-leads.csv"
                : "forwarded-mobile-calls.csv";

        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );

        URL.revokeObjectURL(
            url
        );
    }


    /* =========================================
       Header refresh
    ========================================= */

    async function reloadAfterHeaderRefresh() {
        try {
            setLoading(
                true
            );

            setError(
                null
            );

            const options =
                await fetchMobileFilterOptions();

            setFilterOptions(
                options
            );

            /*
             * Website mode needs a selected
             * tracking number before calls can load.
             */
            if (
                viewMode === "website" &&
                !selectedCld
            ) {
                setSummary(
                    null
                );

                setCalls(
                    []
                );

                setTotalCalls(
                    0
                );

                setTotalPages(
                    1
                );

                setPage(
                    1
                );

                return;
            }

            const summaryData =
                await fetchMobileSummary({
                    startDate:
                        startDate ||
                        undefined,

                    endDate:
                        endDate ||
                        undefined,

                    minDuration,
                    maxDuration,
                    viewMode,
                    selectedCld,
                });

            setSummary(
                summaryData
            );

            setPage(
                1
            );

            await loadCalls(
                1,
                false
            );
        } catch (err) {
            console.error(
                "Failed to reload mobile dashboard:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to reload mobile dashboard"
            );
        } finally {
            setLoading(
                false
            );
        }
    }


    /* =========================================
       Clear filters
    ========================================= */

    function clearFilters() {
        onFiltersChange({
            startDate:
                filterOptions
                    ?.date_range
                    .min_date
                ?? "",

            endDate:
                filterOptions
                    ?.date_range
                    .max_date
                ?? "",

            minDuration:
                filterOptions
                    ?.duration
                    .default_min
                ?? 60,

            maxDuration:
                filterOptions
                    ?.duration
                    .default_max
                ?? null,

            /*
             * Stay in the current sub-tab.
             * Clearing filters should not unexpectedly
             * move the user to another view.
             */
            viewMode,

            /*
             * In website mode, clear the website selection.
             * Forwarded mode never needs selectedCld.
             */
            selectedCld:
                null,
        });

        setPage(
            1
        );
    }


    /* =========================================
       Formatting helpers
    ========================================= */

    function formatDuration(
        seconds: number | null
    ) {
        if (
            seconds === null ||
            seconds === undefined
        ) {
            return "-";
        }

        const totalSeconds =
            Math.max(
                0,
                Math.round(
                    seconds
                )
            );

        const hours =
            Math.floor(
                totalSeconds /
                3600
            );

        const minutes =
            Math.floor(
                (
                    totalSeconds %
                    3600
                ) /
                60
            );

        const remainingSeconds =
            totalSeconds %
            60;

        if (
            hours > 0
        ) {
            return (
                `${hours}h ${minutes}m`
            );
        }

        if (
            minutes > 0
        ) {
            return (
                `${minutes}m ${remainingSeconds
                    .toString()
                    .padStart(
                        2,
                        "0"
                    )}s`
            );
        }

        return (
            `${remainingSeconds}s`
        );
    }


    function formatAustralianPhone(
        value: string | null
    ) {
        if (!value) {
            return "-";
        }

        const digits =
            String(
                value
            ).replace(
                /\D/g,
                ""
            );

        // International mobile
        if (
            digits.startsWith(
                "614"
            ) &&
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

        // International landline
        if (
            digits.startsWith(
                "61"
            ) &&
            digits.length === 11
        ) {
            return (
                `+61 ${digits.slice(
                    2,
                    3
                )} ` +
                `${digits.slice(
                    3,
                    7
                )} ` +
                `${digits.slice(
                    7
                )}`
            );
        }

        // Local mobile
        if (
            digits.startsWith(
                "04"
            ) &&
            digits.length === 10
        ) {
            return (
                `+61 ${digits.slice(
                    1,
                    4
                )} ` +
                `${digits.slice(
                    4,
                    7
                )} ` +
                `${digits.slice(
                    7
                )}`
            );
        }

        // Local landline
        if (
            digits.startsWith(
                "0"
            ) &&
            digits.length === 10
        ) {
            return (
                `+61 ${digits.slice(
                    1,
                    2
                )} ` +
                `${digits.slice(
                    2,
                    6
                )} ` +
                `${digits.slice(
                    6
                )}`
            );
        }

        // Mobile missing leading zero
        if (
            digits.startsWith(
                "4"
            ) &&
            digits.length === 9
        ) {
            return (
                `+61 ${digits.slice(
                    0,
                    3
                )} ` +
                `${digits.slice(
                    3,
                    6
                )} ` +
                `${digits.slice(
                    6
                )}`
            );
        }

        // Landline missing leading zero
        if (
            /^[2378]/.test(
                digits
            ) &&
            digits.length === 9
        ) {
            return (
                `+61 ${digits.slice(
                    0,
                    1
                )} ` +
                `${digits.slice(
                    1,
                    5
                )} ` +
                `${digits.slice(
                    5
                )}`
            );
        }

        return value;
    }


    function formatConnectedTime(
        value: string
    ) {
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
                    "numeric",

                month:
                    "short",

                hour:
                    "numeric",

                minute:
                    "2-digit",
            }
        );
    }


    /* =========================================
       Initial filter load
    ========================================= */

    useEffect(
        () => {
            loadFilterOptions();
        },
        []
    );


    /* =========================================
       Filter changes
    ========================================= */

    useEffect(
        () => {
            if (
                !filterOptions
            ) {
                return;
            }

            /*
             * Don't leave forwarded data visible
             * after switching to website mode.
             */
            if (
                viewMode === "website" &&
                !selectedCld
            ) {
                setSummary(
                    null
                );

                setCalls(
                    []
                );

                setTotalCalls(
                    0
                );

                setTotalPages(
                    1
                );

                setPage(
                    1
                );

                setError(
                    null
                );

                setLoading(
                    false
                );

                return;
            }

            loadSummary();

            setPage(
                1
            );

            loadCalls(
                1,
                false
            );
        },
        [
            filterOptions,
            startDate,
            endDate,
            minDuration,
            maxDuration,
            viewMode,
            selectedCld,
        ]
    );


    /* =========================================
       Header refresh
    ========================================= */

    useEffect(
        () => {
            if (
                refreshKey === 0 ||
                !filterOptions
            ) {
                return;
            }

            reloadAfterHeaderRefresh();
        },
        [
            refreshKey,
        ]
    );


    /* =========================================
       Initial loading
    ========================================= */

    if (
        loading &&
        !summary &&
        viewMode === "forwarded"
    ) {
        return (
            <div className="mobile-dashboard-page">
                <p className="mobile-dashboard-message">
                    Loading mobile dashboard...
                </p>
            </div>
        );
    }


    /* =========================================
       Initial error
    ========================================= */

    if (
        error &&
        !summary
    ) {
        return (
            <div className="mobile-dashboard-page">

                <div className="mobile-dashboard-error">

                    <h2>
                        Failed to load mobile dashboard
                    </h2>

                    <p>
                        {error}
                    </p>

                </div>

            </div>
        );
    }


    /* =========================================
       Duration scale
    ========================================= */

    const maxVisibleDuration =
        Math.max(
            ...calls.map(
                (call) =>
                    call.billed_duration
                    ?? 0
            ),
            1
        );


    /* =========================================
       Render
    ========================================= */

    return (
        <div className="mobile-dashboard-page">

            {/* =================================
                Mobile sub-tabs
            ================================= */}

            <div className="mobile-subtabs">

                <button
                    type="button"

                    className={
                        viewMode === "forwarded"
                            ? "mobile-subtab active"
                            : "mobile-subtab"
                    }

                    aria-selected={
                        viewMode === "forwarded"
                    }

                    onClick={() => {
                        if (
                            viewMode === "forwarded"
                        ) {
                            return;
                        }

                        onFiltersChange({
                            ...filters,

                            viewMode:
                                "forwarded",

                            selectedCld:
                                null,
                        });
                    }}
                >
                    Forwarded Number
                </button>


                <button
                    type="button"

                    className={
                        viewMode === "website"
                            ? "mobile-subtab active"
                            : "mobile-subtab"
                    }

                    aria-selected={
                        viewMode === "website"
                    }

                    onClick={() => {
                        if (
                            viewMode === "website"
                        ) {
                            return;
                        }

                        onFiltersChange({
                            ...filters,

                            viewMode:
                                "website",

                            /*
                             * Start the website view with
                             * an explicit selection.
                             */
                            selectedCld:
                                null,
                        });
                    }}
                >
                    Website / Tracking Number
                </button>

            </div>


            {/* =================================
                Website-specific selector
            ================================= */}

            {
                viewMode === "website" &&
                (
                    <div className="mobile-website-selector-card">

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

                                onChange={(
                                    event
                                ) => {
                                    const value =
                                        event
                                            .target
                                            .value;

                                    onFiltersChange({
                                        ...filters,

                                        selectedCld:
                                            value ||
                                            null,
                                    });
                                }}
                            >
                                <option value="">
                                    Select website
                                </option>

                                {
                                    (
                                        filterOptions
                                            ?.tracking_numbers
                                        ?? []
                                    ).map(
                                        (item) => (
                                            <option
                                                key={
                                                    item.cld
                                                }

                                                value={
                                                    item.cld
                                                }
                                            >
                                                {
                                                    `${item.website} — ${formatAustralianPhone(
                                                        item.cld
                                                    )}`
                                                }
                                            </option>
                                        )
                                    )
                                }

                            </select>

                        </div>

                    </div>
                )
            }


            {/* =================================
                Filters for active sub-tab
            ================================= */}

            <MobileDashboardFilters
                startDate={
                    startDate
                }

                endDate={
                    endDate
                }

                minDate={
                    filterOptions
                        ?.date_range
                        .min_date
                    ?? null
                }

                maxDate={
                    filterOptions
                        ?.date_range
                        .max_date
                    ?? null
                }

                minDuration={
                    minDuration
                }

                maxDuration={
                    maxDuration
                }

                onStartDateChange={(
                    value
                ) => {
                    onFiltersChange({
                        ...filters,

                        startDate:
                            value,
                    });
                }}

                onEndDateChange={(
                    value
                ) => {
                    onFiltersChange({
                        ...filters,

                        endDate:
                            value,
                    });
                }}

                onMinDurationChange={(
                    value
                ) => {
                    onFiltersChange({
                        ...filters,

                        minDuration:
                            value,
                    });
                }}

                onMaxDurationChange={(
                    value
                ) => {
                    onFiltersChange({
                        ...filters,

                        maxDuration:
                            value,
                    });
                }}

                onClearFilters={
                    clearFilters
                }
            />


            {/* =================================
                Website empty state
            ================================= */}

            {
                viewMode === "website" &&
                !selectedCld &&
                (
                    <div className="mobile-view-empty-state">

                        <h3>
                            Select a website
                        </h3>

                        <p>
                            Choose a website / tracking number above to view its mobile leads.
                        </p>

                    </div>
                )
            }


            {/* =================================
                Dashboard state
            ================================= */}

            {
                loading &&
                summary &&
                (
                    <p className="mobile-dashboard-updating">
                        Updating dashboard...
                    </p>
                )
            }


            {
                error &&
                summary &&
                (
                    <p className="mobile-dashboard-inline-error">
                        {error}
                    </p>
                )
            }


            {/* =================================
                KPI cards
            ================================= */}

            {
                summary &&
                (
                    <div className="mobile-metric-grid">

                        <MetricCard
                            title="Calls"

                            value={
                                summary.total_calls
                            }

                            subtitle={
                                summary.max_duration !== null
                                    ? `${summary.min_duration}s – ${summary.max_duration}s`
                                    : `${summary.min_duration}s and above`
                            }
                        />


                        <MetricCard
                            title="Unique callers"

                            value={
                                summary.unique_cli
                            }

                            subtitle={
                                summary.total_calls >
                                    summary.unique_cli

                                    ? `${summary.total_calls -
                                        summary.unique_cli
                                    } called more than once`

                                    : "No repeat callers"
                            }
                        />


                        <MetricCard
                            title="Talk time"

                            value={
                                formatDuration(
                                    summary
                                        .total_duration_seconds
                                )
                            }

                            subtitle={
                                summary.total_calls > 0
                                    ? `Avg ${formatDuration(
                                        Math.round(
                                            summary
                                                .total_duration_seconds /
                                            summary
                                                .total_calls
                                        )
                                    )} per call`
                                    : "No call duration"
                            }
                        />


                        <MetricCard
                            title="Call cost"

                            value={
                                `$${summary
                                    .total_cost
                                    .toFixed(
                                        2
                                    )}`
                            }

                            subtitle={
                                summary.total_calls > 0
                                    ? `Avg $${(
                                        summary
                                            .total_cost /
                                        summary
                                            .total_calls
                                    ).toFixed(
                                        2
                                    )} per call`
                                    : "No call cost"
                            }
                        />


                        <MetricCard
                            title={
                                viewMode === "forwarded"
                                    ? "Forwarded Number"
                                    : "Tracking Number"
                            }

                            value={
                                summary.active_cld
                                    ? formatAustralianPhone(
                                        summary.active_cld
                                    )
                                    : "N/A"
                            }

                            subtitle={
                                viewMode === "forwarded"
                                    ? "Primary forwarded destination"
                                    : selectedWebsite
                                        ?.website
                                    ?? "Selected website"
                            }
                        />

                    </div>
                )
            }


            {/* =================================
                Calls table
            ================================= */}

            {
                (
                    viewMode === "forwarded" ||
                    selectedCld
                ) &&
                (
                    <div className="mobile-table-card">

                        <div className="mobile-table-header">

                            <div>

                                <h2>
                                    {
                                        viewMode === "forwarded"
                                            ? "Forwarded Calls"
                                            : "Website Leads"
                                    }
                                </h2>

                                <p className="mobile-table-subtitle">
                                    {
                                        viewMode === "forwarded"
                                            ? "Calls received through the forwarded destination."
                                            : selectedWebsite
                                                ? `Calls received through ${selectedWebsite.website}.`
                                                : "Calls received through the selected website tracking number."
                                    }
                                </p>

                            </div>


                            <button
                                type="button"
                                className="mobile-export-button"
                                onClick={
                                    exportMobileCallsToCsv
                                }
                                disabled={
                                    calls.length === 0
                                }
                            >
                                ↓&nbsp;&nbsp;Export CSV
                            </button>

                        </div>


                        {
                            tableLoading &&
                            (
                                <div className="mobile-table-loading">
                                    {
                                        calls.length > 0
                                            ? "Loading more calls..."
                                            : "Loading calls..."
                                    }
                                </div>
                            )
                        }


                        <div className="mobile-table-scroll">

                            <table className="mobile-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Connected ↑
                                        </th>

                                        <th>
                                            Caller
                                        </th>

                                        <th>
                                            Duration
                                        </th>

                                        <th>
                                            Cost
                                        </th>

                                        <th
                                            aria-label="Details"
                                            className="mobile-details-column"
                                        />

                                    </tr>

                                </thead>


                                <tbody>

                                    {
                                        calls.length === 0
                                            ? (
                                                <tr>

                                                    <td
                                                        colSpan={
                                                            5
                                                        }
                                                        className="mobile-table-empty"
                                                    >
                                                        {
                                                            tableLoading
                                                                ? "Loading calls..."
                                                                : "No calls found for the selected filters."
                                                        }
                                                    </td>

                                                </tr>
                                            )
                                            : (
                                                calls.map(
                                                    (
                                                        call
                                                    ) => {
                                                        const duration =
                                                            call
                                                                .billed_duration
                                                            ?? 0;

                                                        const durationWidth =
                                                            Math.max(
                                                                (
                                                                    duration /
                                                                    maxVisibleDuration
                                                                ) *
                                                                100,
                                                                3
                                                            );

                                                        return (
                                                            <tr
                                                                key={
                                                                    call.id
                                                                }
                                                            >

                                                                <td className="mobile-connected-cell">
                                                                    {
                                                                        formatConnectedTime(
                                                                            call.connect_time
                                                                        )
                                                                    }
                                                                </td>


                                                                <td className="mobile-caller-cell">
                                                                    {
                                                                        formatAustralianPhone(
                                                                            call.cli
                                                                        )
                                                                    }
                                                                </td>


                                                                <td>

                                                                    <div className="mobile-duration-cell">

                                                                        <div className="mobile-duration-track">

                                                                            <div
                                                                                className="mobile-duration-bar"
                                                                                style={{
                                                                                    width:
                                                                                        `${durationWidth}%`,
                                                                                }}
                                                                            />

                                                                        </div>


                                                                        <span className="mobile-duration-value">
                                                                            {
                                                                                formatDuration(
                                                                                    call.billed_duration
                                                                                )
                                                                            }
                                                                        </span>

                                                                    </div>

                                                                </td>


                                                                <td className="mobile-cost-cell">
                                                                    {
                                                                        call.cost !== null
                                                                            ? `$${call.cost.toFixed(
                                                                                2
                                                                            )}`
                                                                            : "-"
                                                                    }
                                                                </td>


                                                                <td className="mobile-row-chevron">
                                                                    ›
                                                                </td>

                                                            </tr>
                                                        );
                                                    }
                                                )
                                            )
                                    }

                                </tbody>

                            </table>

                        </div>


                        {/* =================================
                            Cumulative pagination
                        ================================= */}

                        <div className="mobile-pagination">

                            <span className="mobile-pagination-summary">
                                Showing{" "}
                                {
                                    calls.length
                                }
                                {" "}of{" "}
                                {
                                    totalCalls
                                }
                                {" "}calls
                            </span>


                            {
                                page < totalPages
                                    ? (
                                        <div className="mobile-pagination-actions">

                                            <button
                                                type="button"
                                                disabled={
                                                    tableLoading
                                                }
                                                onClick={() => {
                                                    if (
                                                        tableLoading
                                                    ) {
                                                        return;
                                                    }

                                                    loadCalls(
                                                        page + 1,
                                                        true
                                                    );
                                                }}
                                            >
                                                {
                                                    tableLoading
                                                        ? "Loading..."
                                                        : "Load more"
                                                }
                                            </button>

                                        </div>
                                    )
                                    : (
                                        totalCalls > 0 &&
                                        (
                                            <span className="mobile-pagination-summary">
                                                All calls loaded
                                            </span>
                                        )
                                    )
                            }

                        </div>

                    </div>
                )
            }

        </div>
    );
}
