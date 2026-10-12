import {



    useEffect,



    useState,



} from "react";







import type {



    WebFilters,



} from "../types/filters";







import {



    getDashboardData,



    getUniqueEmails,



    type UniqueEmailItem,



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







    filters: WebFilters;







    onFiltersChange: (



        filters: WebFilters



    ) => void;



};











export default function DashboardPage({







    refreshKey,



    filters,



    onFiltersChange,







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







    const {



        startDate,



        startTime,



        endDate,



        endTime,



        service,



        domain,



        pageName,



        status,



    } = filters;



    function normalizeDate(

        value: string | null | undefined

    ): string {

        if (!value) {

            return "";

        }

        return value

            .split("T")[0]

            .split(" ")[0];

    }











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



    // Lead table view



    // =========================================







    const [



        tableView,



        setTableView,



    ] = useState<



        "leads" | "unique"



    >("leads");











    const [



        uniqueEmails,



        setUniqueEmails,



    ] = useState<



        UniqueEmailItem[]



    >([]);











    const [



        uniqueEmailsLoading,



        setUniqueEmailsLoading,



    ] = useState(false);











    // =========================================



    // Clear filters



    // =========================================







    function clearFilters() {







        onFiltersChange({



            startDate:

                normalizeDate(
                    dateBounds.min_date
                ),



            startTime:



                "00:00",



            endDate:

                normalizeDate(
                    dateBounds.max_date
                ),



            endTime:



                "23:59",



            service:



                "all",



            domain:



                "all",



            pageName:



                "all",



            status:



                "all",



        });



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











    function exportUniqueEmailsToCsv() {







        if (



            uniqueEmails.length === 0



        ) {



            return;



        }











        const rows = [







            [



                "Email",



                "Lead Count",



            ],







            ...uniqueEmails.map(



                (item) => [



                    item.email,



                    item.lead_count,



                ]



            ),







        ];











        const csvContent =



            rows



                .map(



                    (row) =>



                        row



                            .map(



                                (value) =>



                                    `"${String(



                                        value



                                    ).replace(



                                        /"/g,



                                        '""'



                                    )}"`



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



            "unique-emails.csv";











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



    // Load unique emails



    // =========================================







    async function loadUniqueEmails() {







        try {







            setUniqueEmailsLoading(



                true



            );











            setError(



                null



            );











            const data =



                await getUniqueEmails({







                    startDate:

                        normalizeDate(
                            startDate
                        ) ||

                        undefined,







                    startTime:



                        startTime ||



                        undefined,







                    endDate:

                        normalizeDate(
                            endDate
                        ) ||

                        undefined,







                    endTime:



                        endTime ||



                        undefined,







                    service,







                    domain,







                    pageName,







                    status,







                });











            setUniqueEmails(



                data.items



            );







        } catch (err) {







            console.error(



                "Failed to load unique emails:",



                err



            );











            setError(



                err instanceof Error



                    ? err.message



                    : "Failed to load unique emails"



            );







        } finally {







            setUniqueEmailsLoading(



                false



            );



        }



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

                        normalizeDate(
                            startDate
                        ) ||

                        undefined,







                    startTime:



                        startTime ||



                        undefined,







                    endDate:

                        normalizeDate(
                            endDate
                        ) ||

                        undefined,







                    endTime:



                        endTime ||



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











            const normalizedDateBounds = {

                min_date:
                    normalizeDate(
                        data.date_bounds.min_date
                    ) || null,

                max_date:
                    normalizeDate(
                        data.date_bounds.max_date
                    ) || null,

            };


            setDateBounds(

                normalizedDateBounds

            );











            setLeadsOverTime(



                data.leads_over_time



            );











            // =================================



            // Initial date range



            // =================================







            const normalizedStartDate =

                normalizeDate(
                    filters.startDate
                );


            const normalizedEndDate =

                normalizeDate(
                    filters.endDate
                );


            const resolvedStartDate =

                normalizedStartDate ||

                normalizeDate(
                    data.date_bounds.min_date
                );


            const resolvedEndDate =

                normalizedEndDate ||

                normalizeDate(
                    data.date_bounds.max_date
                );


            if (

                filters.startDate !==
                    resolvedStartDate ||

                filters.endDate !==
                    resolvedEndDate ||

                !filters.startTime ||

                !filters.endTime

            ) {

                onFiltersChange({

                    ...filters,

                    startDate:
                        resolvedStartDate,

                    startTime:
                        filters.startTime ||
                        "00:00",

                    endDate:
                        resolvedEndDate,

                    endTime:
                        filters.endTime ||
                        "23:59",

                });

            }











            // =================================



            // Faceted-filter safety



            // =================================







            const nextFilters = {



                ...filters,



            };



            let filtersChanged =



                false;



            if (



                service !== "all" &&



                !data.filter_options.services.includes(



                    service



                )



            ) {



                nextFilters.service =



                    "all";



                filtersChanged =



                    true;



            }



            if (



                domain !== "all" &&



                !data.filter_options.domains.includes(



                    domain



                )



            ) {



                nextFilters.domain =



                    "all";



                filtersChanged =



                    true;



            }



            if (



                pageName !== "all" &&



                !data.filter_options.page_names.includes(



                    pageName



                )



            ) {



                nextFilters.pageName =



                    "all";



                filtersChanged =



                    true;



            }



            if (



                status !== "all" &&



                !data.filter_options.statuses.includes(



                    status



                )



            ) {



                nextFilters.status =



                    "all";



                filtersChanged =



                    true;



            }



            if (



                filtersChanged



            ) {



                onFiltersChange(



                    nextFilters



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

                        normalizeDate(
                            startDate
                        ) ||

                        undefined,







                    startTime:



                        startTime ||



                        undefined,







                    endDate:

                        normalizeDate(
                            endDate
                        ) ||

                        undefined,







                    endTime:



                        endTime ||



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



        startTime,



        endDate,



        endTime,



        service,



        domain,



        pageName,



        status,



    ]);







    // =========================================



    // Unique email view



    // =========================================







    useEffect(() => {







        if (



            tableView !== "unique"



        ) {



            return;



        }











        loadUniqueEmails();







    }, [



        tableView,



        startDate,



        startTime,



        endDate,



        endTime,



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











        if (



            tableView === "unique"



        ) {



            loadUniqueEmails();



        }







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







                startTime={



                    startTime



                }







                endDate={



                    endDate



                }







                endTime={



                    endTime



                }







                minDate={

                    normalizeDate(
                        dateBounds.min_date
                    ) || null

                }







                maxDate={

                    normalizeDate(
                        dateBounds.max_date
                    ) || null

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
                onDateTimeRangeChange={(
                    newStartDate,
                    newStartTime,
                    newEndDate,
                    newEndTime,
                ) => {

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







                onServiceChange={(



                    value



                ) => {



                    onFiltersChange({



                        ...filters,



                        service:



                            value,



                    });



                }}







                onDomainChange={(



                    value



                ) => {



                    onFiltersChange({



                        ...filters,



                        domain:



                            value,



                    });



                }}







                onPageNameChange={(



                    value



                ) => {



                    onFiltersChange({



                        ...filters,



                        pageName:



                            value,



                    });



                }}







                onStatusChange={(



                    value



                ) => {



                    onFiltersChange({



                        ...filters,



                        status:



                            value,



                    });



                }}







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



                Lead table views



            ================================= */}







            <div className="web-data-view-tabs">







                <button



                    type="button"







                    className={



                        tableView === "leads"



                            ? "web-data-view-tab active"



                            : "web-data-view-tab"



                    }







                    onClick={() =>



                        setTableView(



                            "leads"



                        )



                    }



                >



                    Leads



                </button>











                <button



                    type="button"







                    className={



                        tableView === "unique"



                            ? "web-data-view-tab active"



                            : "web-data-view-tab"



                    }







                    onClick={() =>



                        setTableView(



                            "unique"



                        )



                    }



                >



                    Unique Emails



                </button>







            </div>











            {



                tableView === "leads"



                    ? (



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



                                        ↓  Export CSV



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



                    )



                    : (



                        <section



                            className="



                                web-section-card



                                web-leads-table-section



                            "



                        >







                            <div className="web-section-header">







                                <div>







                                    <h2>



                                        Unique emails



                                    </h2>







                                    <p>



                                        Unique customer email addresses



                                        matching the selected filters



                                    </p>







                                </div>











                                <div className="web-table-actions">







                                    <span className="web-table-count">







                                        {



                                            uniqueEmails.length



                                        }







                                        {" "}unique emails







                                    </span>











                                    <button



                                        type="button"



                                        className="web-export-button"



                                        onClick={



                                            exportUniqueEmailsToCsv



                                        }



                                        disabled={



                                            uniqueEmails.length === 0



                                        }



                                    >



                                        ↓  Export CSV



                                    </button>







                                </div>







                            </div>











                            {



                                uniqueEmailsLoading &&



                                (



                                    <div className="web-unique-email-loading">



                                        Loading unique emails...



                                    </div>



                                )



                            }











                            <div className="web-unique-email-table-scroll">







                                <table className="web-unique-email-table">







                                    <thead>







                                        <tr>







                                            <th>



                                                Email



                                            </th>







                                            <th>



                                                Lead Count



                                            </th>







                                        </tr>







                                    </thead>











                                    <tbody>







                                        {



                                            uniqueEmails.length === 0



                                                ? (



                                                    <tr>







                                                        <td



                                                            colSpan={



                                                                2



                                                            }



                                                            className="web-unique-email-empty"



                                                        >



                                                            {



                                                                uniqueEmailsLoading



                                                                    ? "Loading unique emails..."



                                                                    : "No unique emails found for the selected filters."



                                                            }



                                                        </td>







                                                    </tr>



                                                )



                                                : (



                                                    uniqueEmails.map(



                                                        (item) => (



                                                            <tr



                                                                key={



                                                                    item.email



                                                                }



                                                            >







                                                                <td>



                                                                    {



                                                                        item.email



                                                                    }



                                                                </td>







                                                                <td>



                                                                    {



                                                                        item.lead_count



                                                                    }



                                                                </td>







                                                            </tr>



                                                        )



                                                    )



                                                )



                                        }







                                    </tbody>







                                </table>







                            </div>







                        </section>



                    )



            }











        </div>







    );



}