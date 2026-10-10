import {
    useEffect,
    useState,
} from "react";

import AppHeader, {
    type DashboardTab,
} from "./components/AppHeader";

import OverviewDashboard
    from "./pages/OverviewDashboard";

import DashboardPage
    from "./pages/DashboardPage";

import MobileDashboard
    from "./components/MobileDashboard";

import MarketingDashboard
    from "./components/MarketingDashboard";

import MessageDashboard
    from "./components/MessageDashboard";

import "./App.css";

import type {
    WebFilters,
    MobileFilters,
    MessageFilters,
} from "./types/filters";


const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL;

const STORAGE_KEYS = {
    web:
        "leads-dashboard:web-filters",
    
    mobile:
        "leads-dashboard:mobile-filters",
    
    message:
        "leads-dashboard:message-filters",
} as const;


/* =========================================
   Filter types
========================================= */



/* =========================================
   Local-storage helpers
========================================= */

function loadStoredValue<T>(
    key: string,
    fallback: T,
): T {

    try {

        const stored =
            localStorage.getItem(
                key
            );


        if (!stored) {
            return fallback;
        }


        return JSON.parse(
            stored
        ) as T;

    } catch {

        return fallback;
    }
}


function saveStoredValue<T>(
    key: string,
    value: T,
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(
                value
            )
        );

    } catch {

        /*
         * If localStorage is unavailable,
         * the dashboard should still work
         * with normal React state.
         */
    }
}

function loadMobileFilters():
    MobileFilters {

    const defaults: MobileFilters = {
        startDate: "",
        endDate: "",
        minDuration: 60,
        maxDuration: null,
        viewMode: "forwarded",
        selectedCld: null,
    };


    const stored =
        loadStoredValue<
            Partial<MobileFilters>
        >(
            STORAGE_KEYS.mobile,
            {}
        );


    return {
        ...defaults,
        ...stored,
    };
}


export default function App() {


    /* =========================================
       Active tab
    ========================================= */

    const [
        activeTab,
        setActiveTab,
    ] = useState<DashboardTab>(
        "overview"
    );


    /* =========================================
       Refresh state
    ========================================= */

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    const [
        refreshKey,
        setRefreshKey,
    ] = useState(0);


    /* =========================================
       Persistent Web filters
    ========================================= */

    const [
        webFilters,
        setWebFilters,
    ] = useState<WebFilters>(
        () =>
            loadStoredValue<WebFilters>(
                STORAGE_KEYS.web,
                {
                    startDate: "",
                    endDate: "",
                    service: "all",
                    domain: "all",
                    pageName: "all",
                    status: "all",
                }
            )
    );


    /* =========================================
       Persistent Mobile filters
    ========================================= */

    
    const [
        mobileFilters,
        setMobileFilters,
    ] = useState<MobileFilters>(
        loadMobileFilters
    );


    /* =========================================
       Persistent Message filters
    ========================================= */

    const [
        messageFilters,
        setMessageFilters,
    ] = useState<MessageFilters>(
        () =>
            loadStoredValue<MessageFilters>(
                STORAGE_KEYS.message,
                {
                    startDate: "",
                    endDate: "",
                }
            )
    );


    /* =========================================
       Save Web filters
    ========================================= */

    useEffect(
        () => {

            saveStoredValue(
                "leads-dashboard:web-filters",
                webFilters
            );

        },
        [
            webFilters,
        ]
    );


    /* =========================================
       Save Mobile filters
    ========================================= */

    useEffect(
        () => {

            saveStoredValue(
                "leads-dashboard:mobile-filters",
                mobileFilters
            );

        },
        [
            mobileFilters,
        ]
    );


    /* =========================================
       Save Message filters
    ========================================= */

    useEffect(
        () => {

            saveStoredValue(
                "leads-dashboard:message-filters",
                messageFilters
            );

        },
        [
            messageFilters,
        ]
    );


    /* =========================================
       Refresh
    ========================================= */

    async function handleRefresh() {

        try {

            setRefreshing(
                true
            );


            if (
                activeTab === "web"
            ) {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/ingestion/refresh`,
                        {
                            method:
                                "POST",
                        }
                    );


                if (
                    !response.ok
                ) {

                    throw new Error(
                        "Failed to refresh web leads"
                    );
                }
            }


            if (
                activeTab === "mobile"
            ) {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/mobile-ingestion/refresh`,
                        {
                            method:
                                "POST",
                        }
                    );


                if (
                    !response.ok
                ) {

                    throw new Error(
                        "Failed to refresh mobile leads"
                    );
                }
            }


            if (
                activeTab === "overview"
            ) {

                const [
                    webResponse,
                    mobileResponse,
                ] = await Promise.all([

                    fetch(
                        `${API_BASE_URL}/api/ingestion/refresh`,
                        {
                            method:
                                "POST",
                        }
                    ),

                    fetch(
                        `${API_BASE_URL}/api/mobile-ingestion/refresh`,
                        {
                            method:
                                "POST",
                        }
                    ),

                ]);


                if (
                    !webResponse.ok ||
                    !mobileResponse.ok
                ) {

                    throw new Error(
                        "Failed to refresh overview data"
                    );
                }
            }


            setRefreshKey(
                (
                    current
                ) =>
                    current + 1
            );

        } catch (error) {

            console.error(
                "Refresh failed:",
                error
            );

        } finally {

            setRefreshing(
                false
            );

        }
    }


    /* =========================================
       Render
    ========================================= */

    return (

        <div className="app">


            <AppHeader

                activeTab={
                    activeTab
                }

                onTabChange={
                    setActiveTab
                }

                onRefresh={
                    handleRefresh
                }

                refreshing={
                    refreshing
                }

            />


            <main className="app-content">


                {
                    activeTab ===
                        "overview" &&
                    (

                        <OverviewDashboard
                            refreshKey={
                                refreshKey
                            }
                        />

                    )
                }


                {
                    activeTab ===
                        "web" &&
                    (

                        <DashboardPage

                            refreshKey={
                                refreshKey
                            }

                            filters={
                                webFilters
                            }

                            onFiltersChange={
                                setWebFilters
                            }

                        />

                    )
                }


                {
                    activeTab ===
                        "mobile" &&
                    (

                        <MobileDashboard

                            refreshKey={
                                refreshKey
                            }

                            filters={
                                mobileFilters
                            }

                            onFiltersChange={
                                setMobileFilters
                            }

                        />

                    )
                }


                {
                    activeTab ===
                        "marketing" &&
                    (

                        <MarketingDashboard
                            refreshKey={
                                refreshKey
                            }
                        />

                    )
                }


                {
                    activeTab ===
                        "message" &&
                    (

                        <MessageDashboard

                            refreshKey={
                                refreshKey
                            }

                            filters={
                                messageFilters
                            }

                            onFiltersChange={
                                setMessageFilters
                            }

                        />

                    )
                }


            </main>


        </div>

    );
}