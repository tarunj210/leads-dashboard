import {
    useEffect,
    useState,
} from "react";

import {
    getDashboardData,
} from "../api/dashboard";

import {
    getFilteredLeads,
} from "../api/leads";

import DashboardFilters
    from "../components/DashboardFilters";

import MetricCard
    from "../components/MetricCard";

import LeadTable
    from "../components/LeadTable";

import LeadsOverTimeChart
    from "../components/LeadsOverTimeChart";

import type {
    DashboardData,
    DashboardSummary,
    DashboardFilterOptions,
    DateBounds,
    LeadsOverTimePoint,
} from "../types/dashboard";

import type {
    LeadTableResponse,
} from "../types/leads";


type DashboardPageProps = {
    refreshKey: number;
};


export default function DashboardPage({
    refreshKey,
}: DashboardPageProps) {


    // =========================================
    // Dashboard summary
    // =========================================

    const [
        summary,
        setSummary,
    ] = useState<
        DashboardSummary | null
    >(
        null
    );


    // =========================================
    // Faceted filter options
    // =========================================

    const [
        filterOptions,
        setFilterOptions,
    ] = useState<
        DashboardFilterOptions
    >({
        services: [],
        domains: [],
        page_names: [],
        statuses: [],
    });


    // =========================================
    // Date metadata
    // =========================================

    const [
        dateBounds,
        setDateBounds,
    ] = useState<
        DateBounds
    >({
        min_date: null,
        max_date: null,
    });


    


    // =========================================
    // Selected filters
    // =========================================

    const [
        startDate,
        setStartDate,
    ] = useState("");


    const [
        endDate,
        setEndDate,
    ] = useState("");


    const [
        service,
        setService,
    ] = useState("all");


    const [
        domain,
        setDomain,
    ] = useState("all");


    const [
        pageName,
        setPageName,
    ] = useState("all");


    const [
        status,
        setStatus,
    ] = useState("all");


    // =========================================
    // Dashboard loading/error
    // =========================================

    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState<
        string | null
    >(
        null
    );


    // =========================================
    // Leads Over Time
    // =========================================

    const [
        leadsOverTime,
        setLeadsOverTime,
    ] = useState<
        LeadsOverTimePoint[]
    >([]);


    // =========================================
    // Lead table
    // =========================================

    const [
        leadData,
        setLeadData,
    ] = useState<
        LeadTableResponse | null
    >(
        null
    );


    const [
        tablePage,
        setTablePage,
    ] = useState(1);


    const [
        tableLoading,
        setTableLoading,
    ] = useState(false);


    // =========================================
    // Clear filters
    // =========================================

    function clearFilters() {

        setStartDate(
            dateBounds.min_date ?? ""
        );


        setEndDate(
            dateBounds.max_date ?? ""
        );


        setService(
            "all"
        );


        setDomain(
            "all"
        );


        setPageName(
            "all"
        );


        setStatus(
            "all"
        );


        setTablePage(
            1
        );
    }


    function exportWebLeadsToCsv() {

        if (
            !leadData ||
            leadData.items.length === 0
        ) {
            return;
        }

        const headers = [
            "Date",
            "Customer",
            "Email",
            "Phone",
            "Service",
            "Status",
            "Domain",
        ];


        const rows =
            leadData.items.map(
                (lead) => [

                    lead.lead_received_date ?? "",

                    lead.customer_name ?? "",

                    lead.customer_email ?? "",

                    lead.customer_phone ?? "",

                    lead.customer_service ?? "",

                    lead.status ?? "",

                    lead.page_url ?? "",

                ]
            );


        const escapeCsvValue = (
            value: string | number
        ) => {

            const text =
                String(value);

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
                [csvContent],
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
            "web-leads.csv";


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


    // =========================================
    // Load dashboard KPIs + facets + chart
    // =========================================

    async function loadDashboardData() {

        try {

            setLoading(
                true
            );


            setError(
                null
            );


            const data: DashboardData =
                await getDashboardData({

                    startDate:
                        startDate ||
                        undefined,

                    endDate:
                        endDate ||
                        undefined,

                    service,

                    domain,

                    pageName,

                    status,

                });


            setSummary(
                data.summary
            );


            setFilterOptions(
                data.filter_options
            );


            setDateBounds(
                data.date_bounds
            );


            setAvailableDates(
                data.available_dates
            );


            setLeadsOverTime(
                data.leads_over_time
            );


            // =================================
            // Initial date range
            // =================================

            if (
                !startDate &&
                data.date_bounds.min_date
            ) {

                setStartDate(
                    data.date_bounds.min_date
                );
            }


            if (
                !endDate &&
                data.date_bounds.max_date
            ) {

                setEndDate(
                    data.date_bounds.max_date
                );
            }


            // =================================
            // Faceted-filter safety
            // =================================

            if (
                service !== "all" &&
                !data.filter_options.services.includes(
                    service
                )
            ) {

                setService(
                    "all"
                );
            }


            if (
                domain !== "all" &&
                !data.filter_options.domains.includes(
                    domain
                )
            ) {

                setDomain(
                    "all"
                );
            }


            if (
                pageName !== "all" &&
                !data.filter_options.page_names.includes(
                    pageName
                )
            ) {

                setPageName(
                    "all"
                );
            }


            if (
                status !== "all" &&
                !data.filter_options.statuses.includes(
                    status
                )
            ) {

                setStatus(
                    "all"
                );
            }

        } catch (err) {

            console.error(
                "Failed to load dashboard:",
                err
            );


            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load dashboard"
            );

        } finally {

            setLoading(
                false
            );
        }
    }


    // =========================================
    // Load filtered lead table
    // =========================================

    async function loadLeadTable(
        page: number,
        append = false,
    ) {

        try {

            setTableLoading(
                true
            );


            const data =
                await getFilteredLeads({

                    startDate:
                        startDate ||
                        undefined,

                    endDate:
                        endDate ||
                        undefined,

                    service,

                    domain,

                    pageName,

                    status,

                    page,

                    pageSize:
                        25,

                });


            setLeadData(
                (
                    current
                ) => {

                    /*
                     * First page or filter change:
                     * replace existing rows.
                     */
                    if (
                        !append ||
                        !current
                    ) {

                        return data;
                    }


                    /*
                     * Load more:
                     * append only new rows.
                     */
                    const existingIds =
                        new Set(
                            current.items.map(
                                (lead) =>
                                    lead.id
                            )
                        );


                    const newItems =
                        data.items.filter(
                            (lead) =>
                                !existingIds.has(
                                    lead.id
                                )
                        );


                    return {
                        ...data,

                        items: [
                            ...current.items,
                            ...newItems,
                        ],
                    };
                }
            );


            setTablePage(
                page
            );

        } catch (err) {

            console.error(
                "Failed to load lead table:",
                err
            );

        } finally {

            setTableLoading(
                false
            );

        }
    }


    // =========================================
    // Filter changes
    // =========================================

    useEffect(() => {

        loadDashboardData();


        setTablePage(
            1
        );


        loadLeadTable(
            1,
            false
        );

    }, [
        startDate,
        endDate,
        service,
        domain,
        pageName,
        status,
    ]);

    // =========================================
    // Header refresh
    // =========================================

    useEffect(() => {

        if (
            refreshKey === 0
        ) {
            return;
        }


        loadDashboardData();


        setTablePage(
            1
        );


        loadLeadTable(
            1,
            false
        );

    }, [
        refreshKey,
    ]);


    // =========================================
    // Table pagination
    // =========================================




    // =========================================
    // Initial loading
    // =========================================

    if (
        loading &&
        !summary
    ) {

        return (

            <div className="dashboard-page">

                <p>
                    Loading dashboard...
                </p>

            </div>

        );
    }


    // =========================================
    // Initial error
    // =========================================

    if (
        error &&
        !summary
    ) {

        return (

            <div className="dashboard-page">

                <h2>
                    Failed to load dashboard
                </h2>

                <p>
                    {error}
                </p>

            </div>

        );
    }


    if (!summary) {

        return (

            <div className="dashboard-page">

                <p>
                    No dashboard data available.
                </p>

            </div>

        );
    }


    // =========================================
    // Percentage helper
    // =========================================

    function getPercentage(
        value: number
    ) {

        if (
            summary.total_leads === 0
        ) {

            return 0;
        }


        return Math.round(

            (
                value /
                summary.total_leads
            ) *
            100

        );
    }


    // =========================================
    // Render
    // =========================================

    return (

        <div className="web-dashboard-page">


            {/* =================================
                Filters
            ================================= */}

            <DashboardFilters

                startDate={
                    startDate
                }

                endDate={
                    endDate
                }

                minDate={
                    dateBounds.min_date
                }

                maxDate={
                    dateBounds.max_date
                }

                service={
                    service
                }

                domain={
                    domain
                }

                pageName={
                    pageName
                }

                status={
                    status
                }

                services={
                    filterOptions.services
                }

                domains={
                    filterOptions.domains
                }

                pageNames={
                    filterOptions.page_names
                }

                statuses={
                    filterOptions.statuses
                }

                onStartDateChange={
                    setStartDate
                }

                onEndDateChange={
                    setEndDate
                }

                onServiceChange={
                    setService
                }

                onDomainChange={
                    setDomain
                }

                onPageNameChange={
                    setPageName
                }

                onStatusChange={
                    setStatus
                }

                onClearFilters={
                    clearFilters
                }

            />


            {/* =================================
                Loading / Error
            ================================= */}

            {
                loading &&
                (
                    <p className="dashboard-updating">
                        Updating dashboard...
                    </p>
                )
            }


            {
                error &&
                (
                    <p className="dashboard-error">
                        {error}
                    </p>
                )
            }


            {/* =================================
                KPI Cards
            ================================= */}

            <div className="web-metric-grid">


                <MetricCard
                    title="Total leads"
                    value={
                        summary.total_leads
                    }
                    subtitle="In selected range"
                />


                <MetricCard
                    title="Booked"
                    value={
                        summary.booked
                    }
                    subtitle={
                        `${getPercentage(
                            summary.booked
                        )}% of leads`
                    }
                />


                <MetricCard
                    title="In process"
                    value={
                        summary.in_process
                    }
                    subtitle={
                        `${getPercentage(
                            summary.in_process
                        )}% of leads`
                    }
                />


                <MetricCard
                    title="Not booked"
                    value={
                        summary.not_booked
                    }
                    subtitle={
                        `${getPercentage(
                            summary.not_booked
                        )}% of leads`
                    }
                />


                <MetricCard
                    title="Conversion rate"
                    value={
                        `${summary.conversion_rate}%`
                    }
                    subtitle="Booked ÷ total leads"
                />

            </div>


            {/* =================================
                Analytics
            ================================= */}

            <div className="web-analytics-grid">


                {/* =============================
                    Leads Per Day
                ============================= */}

                <section
                    className="
                        web-section-card
                        web-chart-section
                    "
                >

                    <LeadsOverTimeChart
                        data={
                            leadsOverTime
                        }
                    />

                </section>


                {/* =============================
                    Status Breakdown
                ============================= */}

                <section
                    className="
                        web-section-card
                        web-status-section
                    "
                >

                    <div className="web-section-header">

                        <div>

                            <h2>
                                Status breakdown
                            </h2>

                            <p>
                                Where the{" "}
                                {summary.total_leads}{" "}
                                leads are now
                            </p>

                        </div>

                    </div>


                    <div className="status-breakdown-list">


                        {/* Booked */}

                        <div className="status-breakdown-row">

                            <div className="status-breakdown-row-header">

                                <span className="status-breakdown-name">
                                    Booked
                                </span>

                                <span className="status-breakdown-number">

                                    {summary.booked}

                                    {" · "}

                                    {
                                        getPercentage(
                                            summary.booked
                                        )
                                    }

                                    %

                                </span>

                            </div>


                            <div className="status-progress-track">

                                <div
                                    className="
                                        status-progress-bar
                                        status-progress-booked
                                    "
                                    style={{
                                        width:
                                            `${getPercentage(
                                                summary.booked
                                            )}%`,
                                    }}
                                />

                            </div>

                        </div>


                        {/* In Process */}

                        <div className="status-breakdown-row">

                            <div className="status-breakdown-row-header">

                                <span className="status-breakdown-name">
                                    In process
                                </span>

                                <span className="status-breakdown-number">

                                    {summary.in_process}

                                    {" · "}

                                    {
                                        getPercentage(
                                            summary.in_process
                                        )
                                    }

                                    %

                                </span>

                            </div>


                            <div className="status-progress-track">

                                <div
                                    className="
                                        status-progress-bar
                                        status-progress-process
                                    "
                                    style={{
                                        width:
                                            `${getPercentage(
                                                summary.in_process
                                            )}%`,
                                    }}
                                />

                            </div>

                        </div>


                        {/* Not Booked */}

                        <div className="status-breakdown-row">

                            <div className="status-breakdown-row-header">

                                <span className="status-breakdown-name">
                                    Not booked
                                </span>

                                <span className="status-breakdown-number">

                                    {summary.not_booked}

                                    {" · "}

                                    {
                                        getPercentage(
                                            summary.not_booked
                                        )
                                    }

                                    %

                                </span>

                            </div>


                            <div className="status-progress-track">

                                <div
                                    className="
                                        status-progress-bar
                                        status-progress-not-booked
                                    "
                                    style={{
                                        width:
                                            `${getPercentage(
                                                summary.not_booked
                                            )}%`,
                                    }}
                                />

                            </div>

                        </div>

                    </div>


                    {
                        summary.in_process > 0 &&
                        (
                            <div className="status-insight">

                                <strong>
                                    {summary.in_process}
                                </strong>

                                {" "}

                                leads are still in process.
                                Follow-ups here have the
                                biggest effect on conversion.

                            </div>
                        )
                    }

                </section>

            </div>


            {/* =================================
                Lead Details Table
            ================================= */}

            <section
                className="
                    web-section-card
                    web-leads-table-section
                "
            >

                <div className="web-section-header">

                    <div>

                        <h2>
                            Lead details
                        </h2>

                        <p>
                            Website enquiries matching
                            the selected filters
                        </p>

                    </div>


                    <div className="web-table-actions">

                        <span className="web-table-count">

                            {
                                leadData?.total ??
                                summary.total_leads
                            }

                            {" "}leads

                        </span>


                        <button
                            type="button"
                            className="web-export-button"
                            onClick={
                                exportWebLeadsToCsv
                            }
                            disabled={
                                !leadData ||
                                leadData.items.length === 0
                            }
                        >
                            ↓&nbsp;&nbsp;Export CSV
                        </button>

                    </div>

                </div>


                <LeadTable

                    data={
                        leadData
                    }

                    loading={
                        tableLoading
                    }

                    onLoadMore={() => {

                        if (
                            !leadData ||
                            tableLoading
                        ) {

                            return;
                        }


                        if (
                            tablePage >=
                            leadData.total_pages
                        ) {

                            return;
                        }


                        loadLeadTable(
                            tablePage + 1,
                            true
                        );

                    }}

                />

            </section>


        </div>

    );
}