import {
    useEffect,
    useState,
} from "react";

import {
    fetchOverviewSummary,
    type OverviewSummary,
} from "../api/overview";

import "./OverviewDashboard.css";


type OverviewDashboardProps = {
    refreshKey: number;
};


export default function OverviewDashboard({
    refreshKey,
}: OverviewDashboardProps) {

    const [
        summary,
        setSummary,
    ] = useState<
        OverviewSummary | null
    >(null);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);


    /* =========================================
       Load overview
    ========================================= */

    async function loadOverview() {

        try {

            setLoading(true);
            setError(null);


            const data =
                await fetchOverviewSummary();


            setSummary(
                data
            );

        } catch (err) {

            console.error(
                "Failed to load overview:",
                err
            );


            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load overview"
            );

        } finally {

            setLoading(false);

        }
    }


    /* =========================================
       Initial load + header refresh
    ========================================= */

    useEffect(() => {

        loadOverview();

    }, [
        refreshKey,
    ]);


    /* =========================================
       Loading
    ========================================= */

    if (
        loading &&
        !summary
    ) {

        return (

            <div className="overview-page">

                <p className="overview-message">
                    Loading overview...
                </p>

            </div>

        );
    }


    /* =========================================
       Error
    ========================================= */

    if (
        error &&
        !summary
    ) {

        return (

            <div className="overview-page">

                <div className="overview-error">

                    <h2>
                        Failed to load overview
                    </h2>

                    <p>
                        {error}
                    </p>

                </div>

            </div>

        );
    }


    if (!summary) {

        return (

            <div className="overview-page">

                <p className="overview-message">
                    No overview data available.
                </p>

            </div>

        );
    }


    /* =========================================
       Render
    ========================================= */

    return (

        <div className="overview-page">


            {/* =================================
                Updating state
            ================================= */}

            {
                loading &&
                (
                    <p className="overview-updating">
                        Updating overview...
                    </p>
                )
            }


            {
                error &&
                (
                    <p className="overview-inline-error">
                        {error}
                    </p>
                )
            }


            {/* =================================
                Primary metrics
            ================================= */}

            <div className="overview-primary-grid">


                {/* Total Leads */}

                <section className="overview-kpi-card">

                    <div className="overview-kpi-title">
                        Total leads
                    </div>


                    <div className="overview-kpi-value">
                        {summary.total_leads}
                    </div>


                    <div className="overview-total-bar">

                        <div
                            className="overview-total-web"
                            style={{
                                width:
                                    `${summary.web_percentage}%`,
                            }}
                        />


                        <div
                            className="overview-total-mobile"
                            style={{
                                width:
                                    `${summary.mobile_percentage}%`,
                            }}
                        />

                    </div>


                    <div className="overview-total-labels">

                        <span>

                            Web{" "}

                            <strong>
                                {summary.web_leads}
                            </strong>

                        </span>


                        <span>

                            Mobile{" "}

                            <strong>
                                {summary.mobile_leads}
                            </strong>

                        </span>

                    </div>

                </section>


                {/* Web Booked */}

                <section className="overview-kpi-card">

                    <div className="overview-kpi-title">
                        Web booked
                    </div>


                    <div className="overview-kpi-value">
                        {summary.web_booked}
                    </div>


                    <div className="overview-kpi-subtitle">
                        Booked web enquiries
                    </div>

                </section>


                {/* Web Conversion */}

                <section className="overview-kpi-card">

                    <div className="overview-kpi-title">
                        Web conversion rate
                    </div>


                    <div className="overview-kpi-value">
                        {summary.web_conversion_rate}%
                    </div>


                    <div className="overview-conversion-track">

                        <div
                            className="overview-conversion-fill"
                            style={{
                                width:
                                    `${summary.web_conversion_rate}%`,
                            }}
                        />

                    </div>


                    <div className="overview-kpi-subtitle">

                        {summary.web_booked} of{" "}
                        {summary.web_leads} web leads

                    </div>

                </section>

            </div>


            {/* =================================
                Performance cards
            ================================= */}

            <div className="overview-performance-grid">


                {/* Web performance */}

                <section className="overview-performance-card">

                    <div className="overview-performance-header">

                        <div>

                            <h2>
                                Web performance
                            </h2>

                            <p>
                                Website lead performance
                            </p>

                        </div>

                    </div>


                    <div className="overview-web-grid">

                        <div className="overview-mini-card">

                            <span>
                                Web leads
                            </span>

                            <strong>
                                {summary.web_leads}
                            </strong>

                        </div>


                        <div className="overview-mini-card">

                            <span>
                                Booked
                            </span>

                            <strong>
                                {summary.web_booked}
                            </strong>

                        </div>


                        <div className="overview-mini-card">

                            <span>
                                Conversion
                            </span>

                            <strong>
                                {summary.web_conversion_rate}%
                            </strong>

                        </div>

                    </div>

                </section>


                {/* Mobile performance */}

                <section className="overview-performance-card">

                    <div className="overview-performance-header">

                        <div>

                            <h2>
                                Mobile performance
                            </h2>

                            <p>
                                Call lead performance
                            </p>

                        </div>

                    </div>


                    <div className="overview-mobile-grid">

                        <div className="overview-mini-card">

                            <span>
                                Calls
                            </span>

                            <strong>
                                {summary.mobile_leads}
                            </strong>

                        </div>


                        <div className="overview-mini-card">

                            <span>
                                Unique callers
                            </span>

                            <strong>
                                {summary.mobile_unique_cli}
                            </strong>

                        </div>


                        <div className="overview-mini-card">

                            <span>
                                Talk time
                            </span>

                            <strong>
                                {summary.mobile_duration_minutes} min
                            </strong>

                        </div>

                    </div>

                </section>

            </div>


            {/* =================================
                Leads by channel
            ================================= */}

            <section className="overview-channel-card">

                <div className="overview-channel-header">

                    <h2>
                        Leads by channel
                    </h2>

                    <p>
                        Share of all {summary.total_leads} leads
                    </p>

                </div>


                <div className="overview-channel-row">

                    <span className="overview-channel-name">
                        Web
                    </span>


                    <div className="overview-channel-track">

                        <div
                            className="overview-channel-fill overview-channel-web"
                            style={{
                                width:
                                    `${summary.web_percentage}%`,
                            }}
                        />

                    </div>


                    <div className="overview-channel-value">

                        <strong>
                            {summary.web_leads}
                        </strong>

                        <span>
                            · {summary.web_percentage}%
                        </span>

                    </div>

                </div>


                <div className="overview-channel-row">

                    <span className="overview-channel-name">
                        Mobile
                    </span>


                    <div className="overview-channel-track">

                        <div
                            className="overview-channel-fill overview-channel-mobile"
                            style={{
                                width:
                                    `${summary.mobile_percentage}%`,
                            }}
                        />

                    </div>


                    <div className="overview-channel-value">

                        <strong>
                            {summary.mobile_leads}
                        </strong>

                        <span>
                            · {summary.mobile_percentage}%
                        </span>

                    </div>

                </div>

            </section>


        </div>
    );
}