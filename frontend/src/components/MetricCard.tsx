type MetricCardProps = {
    title: string;
    value: string | number;
    subtitle?: string;
};

export default function MetricCard({
    title,
    value,
    subtitle,
}: MetricCardProps) {
    return (
        <div className="metric-card">

            <div className="metric-card-title">
                {title}
            </div>

            <div className="metric-card-value">
                {value}
            </div>

            {subtitle && (
                <div className="metric-card-subtitle">
                    {subtitle}
                </div>
            )}

        </div>
    );
}