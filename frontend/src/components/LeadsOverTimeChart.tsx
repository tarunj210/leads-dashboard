import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type {
    LeadsOverTimePoint,
} from "../types/dashboard";


type LeadsOverTimeChartProps = {
    data: LeadsOverTimePoint[];
};


function formatChartDate(
    value: string
) {
    const date =
        new Date(
            `${value}T00:00:00`
        );

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
            day: "numeric",
            month: "short",
        }
    );
}


export default function LeadsOverTimeChart({
    data,
}: LeadsOverTimeChartProps) {

    if (!data.length) {
        return (
            <div className="chart-empty">
                No lead data available
                for the selected period.
            </div>
        );
    }


    const values =
        data.map(
            (item) =>
                item.count
        );


    const peak =
        Math.max(
            ...values
        );


    const average =
        values.reduce(
            (
                total,
                value
            ) =>
                total + value,
            0
        ) /
        values.length;


    const chartData =
        data.map(
            (item) => ({
                ...item,

                displayDate:
                    formatChartDate(
                        item.date
                    ),
            })
        );


    return (
        <div className="leads-chart">

            <div className="leads-chart-heading">

                <div>

                    <h2>
                        Leads per day
                    </h2>

                    <p>
                        Days with at least one lead
                    </p>

                </div>


                <div className="leads-chart-stats">

                    <span>
                        Peak
                        {" "}
                        <strong>
                            {peak}
                        </strong>
                    </span>

                    <span className="chart-stat-divider">
                        ·
                    </span>

                    <span>
                        Avg
                        {" "}
                        <strong>
                            {average.toFixed(1)}
                        </strong>
                    </span>

                </div>

            </div>


            <div className="leads-chart-body">

                <ResponsiveContainer
                    width="100%"
                    height={280}
                >

                    <BarChart
                        data={chartData}
                        margin={{
                            top: 8,
                            right: 8,
                            left: -18,
                            bottom: 8,
                        }}
                        barCategoryGap="32%"
                    >

                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                        />


                        <XAxis
                            dataKey="displayDate"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                            minTickGap={30}
                            interval="preserveStartEnd"
                        />


                        <YAxis
                            allowDecimals={false}
                            axisLine={false}
                            tickLine={false}
                            width={34}
                        />


                        <Tooltip
                            cursor={{
                                fill:
                                    "rgba(15, 23, 42, 0.03)",
                            }}
                        />


                        <Bar
                            dataKey="count"
                            name="Leads"
                            fill="#315ecd"
                            radius={[
                                4,
                                4,
                                0,
                                0,
                            ]}
                            maxBarSize={32}
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </div>
    );
}