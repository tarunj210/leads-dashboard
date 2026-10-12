type DateTimeRangeFilterProps = {
    startDate: string;
    startTime: string;

    endDate: string;
    endTime: string;

    minDate?: string | null;
    maxDate?: string | null;

    onStartDateChange: (
        value: string
    ) => void;

    onStartTimeChange: (
        value: string
    ) => void;

    onEndDateChange: (
        value: string
    ) => void;

    onEndTimeChange: (
        value: string
    ) => void;
};


export default function DateTimeRangeFilter({
    startDate,
    startTime,
    endDate,
    endTime,
    minDate,
    maxDate,
    onStartDateChange,
    onStartTimeChange,
    onEndDateChange,
    onEndTimeChange,
}: DateTimeRangeFilterProps) {

    return (
        <div className="date-time-range-filter">

            <div className="date-time-filter-group">

                <label>
                    Start date
                </label>

                <input
                    type="date"
                    value={startDate}
                    min={minDate ?? undefined}
                    max={maxDate ?? undefined}
                    onChange={(
                        event
                    ) =>
                        onStartDateChange(
                            event.target.value
                        )
                    }
                />

            </div>


            <div className="date-time-filter-group">

                <label>
                    Start time
                </label>

                <input
                    type="time"
                    value={startTime}
                    onChange={(
                        event
                    ) =>
                        onStartTimeChange(
                            event.target.value
                        )
                    }
                />

            </div>


            <div className="date-time-filter-group">

                <label>
                    End date
                </label>

                <input
                    type="date"
                    value={endDate}
                    min={minDate ?? undefined}
                    max={maxDate ?? undefined}
                    onChange={(
                        event
                    ) =>
                        onEndDateChange(
                            event.target.value
                        )
                    }
                />

            </div>


            <div className="date-time-filter-group">

                <label>
                    End time
                </label>

                <input
                    type="time"
                    value={endTime}
                    onChange={(
                        event
                    ) =>
                        onEndTimeChange(
                            event.target.value
                        )
                    }
                />

            </div>

        </div>
    );
}