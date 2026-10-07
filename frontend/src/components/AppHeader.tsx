import "./AppHeader.css";


export type DashboardTab =
    | "overview"
    | "web"
    | "mobile"
    | "marketing";


type AppHeaderProps = {

    activeTab: DashboardTab;

    onTabChange: (
        tab: DashboardTab
    ) => void;

    onRefresh: () => void;

    refreshing: boolean;

    webLeadCount?: number;

    mobileLeadCount?: number;
};


export default function AppHeader({

    activeTab,
    onTabChange,
    onRefresh,
    refreshing,
    webLeadCount,
    mobileLeadCount,

}: AppHeaderProps) {

    return (

        <header className="app-header">

            <div className="app-header-inner">


                {/* Brand */}

                <div className="app-header-brand">

                    <div className="app-header-brand-text">

                        <div className="app-header-title">
                            FreshA Tracker
                        </div>

                    </div>

                </div>


                {/* Navigation */}

                <nav className="app-header-nav">


                    <button
                        type="button"
                        className={
                            activeTab === "overview"
                                ? "app-nav-item active"
                                : "app-nav-item"
                        }
                        onClick={() =>
                            onTabChange(
                                "overview"
                            )
                        }
                    >
                        Overview
                    </button>


                    <button
                        type="button"
                        className={
                            activeTab === "web"
                                ? "app-nav-item active"
                                : "app-nav-item"
                        }
                        onClick={() =>
                            onTabChange(
                                "web"
                            )
                        }
                    >
                        Email leads

                        {
                            webLeadCount !== undefined &&
                            (
                                <span className="app-nav-count">

                                    {
                                        webLeadCount
                                    }

                                </span>
                            )
                        }

                    </button>


                    <button
                        type="button"
                        className={
                            activeTab === "mobile"
                                ? "app-nav-item active"
                                : "app-nav-item"
                        }
                        onClick={() =>
                            onTabChange(
                                "mobile"
                            )
                        }
                    >
                        Mobile leads

                        {
                            mobileLeadCount !== undefined &&
                            (
                                <span className="app-nav-count">

                                    {
                                        mobileLeadCount
                                    }

                                </span>
                            )
                        }

                    </button>


                    <button
                        type="button"
                        className={
                            activeTab === "marketing"
                                ? "app-nav-item active"
                                : "app-nav-item"
                        }
                        onClick={() =>
                            onTabChange(
                                "marketing"
                            )
                        }
                    >
                        Marketing
                    </button>


                </nav>


                {/* Refresh */}

                <div className="app-header-actions">

                    <button
                        type="button"
                        className="app-header-refresh"
                        onClick={
                            onRefresh
                        }
                        disabled={
                            refreshing
                        }
                    >
                        {
                            refreshing
                                ? "Refreshing..."
                                : "Refresh"
                        }
                    </button>

                </div>


            </div>

        </header>

    );
}