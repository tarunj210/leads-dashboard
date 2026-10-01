import {
    useState,
} from "react";


interface RefreshButtonProps {

    endpoint?: string;

    onRefreshComplete?: () =>
        void | Promise<void>;
}


export default function RefreshButton({
    endpoint = "/api/ingestion/refresh",
    onRefreshComplete,
}: RefreshButtonProps) {

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);


    async function handleRefresh() {

        try {

            setRefreshing(true);

            setError(null);


            const API_BASE_URL =
                import.meta.env
                    .VITE_API_BASE_URL;


            if (!API_BASE_URL) {

                throw new Error(
                    "VITE_API_BASE_URL is not defined"
                );
            }


            const response =
                await fetch(
                    `${API_BASE_URL}${endpoint}`,
                    {
                        method: "POST",
                    }
                );


            if (!response.ok) {

                let message =
                    "Refresh failed";


                try {

                    const data =
                        await response.json();


                    if (data?.detail) {
                        message =
                            data.detail;
                    }

                } catch {

                    // Keep default message
                }


                throw new Error(
                    message
                );
            }


            if (
                onRefreshComplete
            ) {
                await onRefreshComplete();
            }

        } catch (err) {

            console.error(
                "Refresh failed:",
                err
            );


            setError(
                err instanceof Error
                    ? err.message
                    : "Refresh failed"
            );

        } finally {

            setRefreshing(false);
        }
    }


    return (

        <div className="refresh-container">

            <button
                type="button"

                className="refresh-button"

                onClick={
                    handleRefresh
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


            {
                error &&
                (
                    <span className="refresh-error">
                        {error}
                    </span>
                )
            }

        </div>
    );
}