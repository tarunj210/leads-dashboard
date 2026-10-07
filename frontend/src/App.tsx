import {
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

import "./App.css";

import MessageDashboard
    from "./components/MessageDashboard";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL;

export default function App() {

    const [
        activeTab,
        setActiveTab,
    ] = useState<DashboardTab>(
        "overview"
    );


    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    const [
        refreshKey,
        setRefreshKey,
    ] = useState(0);


    async function handleRefresh() {

        try {

            setRefreshing(true);


            if (activeTab === "web") {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/ingestion/refresh`,
                        {
                            method: "POST",
                        }
                    );


                if (!response.ok) {
                    throw new Error(
                        "Failed to refresh web leads"
                    );
                }

            }


            if (activeTab === "mobile") {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/mobile-ingestion/refresh`,
                        {
                            method: "POST",
                        }
                    );


                if (!response.ok) {
                    throw new Error(
                        "Failed to refresh mobile leads"
                    );
                }

            }

            if (activeTab === "marketing") {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/mobile-ingestion/refresh`,
                        {
                            method: "POST",
                        }
                    );

                if (!response.ok) {
                    throw new Error(
                        "Failed to refresh marketing calls"
                    );
                }
            }

            if (activeTab === "message") {

                const [
                    webResponse,
                    mobileResponse,
                ] = await Promise.all([

                    fetch(
                        `${API_BASE_URL}/api/ingestion/refresh`,
                        {
                            method: "POST",
                        }
                    ),

                    fetch(
                        `${API_BASE_URL}/api/mobile-ingestion/refresh`,
                        {
                            method: "POST",
                        }
                    ),

                ]);


                if (
                    !webResponse.ok ||
                    !mobileResponse.ok
                ) {

                    throw new Error(
                        "Failed to refresh message leads"
                    );
                }
            }




            if (activeTab === "overview") {

                const [
                    webResponse,
                    mobileResponse,
                ] = await Promise.all([

                    fetch(
                        `${API_BASE_URL}/api/ingestion/refresh`,
                        {
                            method: "POST",
                        }
                    ),

                    fetch(
                        `${API_BASE_URL}/api/mobile-ingestion/refresh`,
                        {
                            method: "POST",
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
                (current) =>
                    current + 1
            );

        } catch (error) {

            console.error(
                "Refresh failed:",
                error
            );

        } finally {

            setRefreshing(false);

        }
    }


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
                    activeTab === "overview" &&
                    (
                        <OverviewDashboard
                            refreshKey={
                                refreshKey
                            }
                        />
                    )
                }


                {
                    activeTab === "web" &&
                    (
                        <DashboardPage
                            refreshKey={
                                refreshKey
                            }
                        />
                    )
                }


                {
                    activeTab === "mobile" &&
                    (
                        <MobileDashboard
                            refreshKey={
                                refreshKey
                            }
                        />
                    )
                }
                {
                    activeTab === "marketing" &&
                    (
                        <MarketingDashboard
                            refreshKey={
                                refreshKey
                            }
                        />
                    )
                }
                {
                    activeTab === "message" &&
                    (
                        <MessageDashboard
                            refreshKey={
                                refreshKey
                            }
                        />
                    )
                }

            </main>

        </div>

    );
}