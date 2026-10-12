import {

    useMemo,

    useState,

} from "react";



import {

    DayPicker,

    type DateRange,

} from "react-day-picker";



import "react-day-picker/style.css";

import "./MobileDashboardFilters.css";





type MobileDashboardFiltersProps = {

    startDate: string;

    startTime: string;



    endDate: string;

    endTime: string;



    minDate: string | null;

    maxDate: string | null;



    minDuration: number;

    maxDuration: number | null;
    onDateTimeRangeChange: (
        startDate: string,
        startTime: string,
        endDate: string,
        endTime: string,
    ) => void;



    onMinDurationChange:

        (value: number) => void;



    onMaxDurationChange:

        (

            value: number | null

        ) => void;



    onClearFilters:

        () => void;

};





/* =========================================

   Date helpers

========================================= */



function normalizeDateString(

    value: string

): string {

    if (!value) {

        return "";

    }



    return value.split("T")[0];

}





function parseDate(

    value: string

): Date {

    const normalized =

        normalizeDateString(value);



    const [

        year,

        month,

        day,

    ] = normalized

        .split("-")

        .map(Number);



    return new Date(

        year,

        month - 1,

        day

    );

}





function formatDate(

    date: Date

): string {

    const year =

        date.getFullYear();



    const month =

        String(

            date.getMonth() + 1

        ).padStart(

            2,

            "0"

        );



    const day =

        String(

            date.getDate()

        ).padStart(

            2,

            "0"

        );



    return `${year}-${month}-${day}`;

}





function displayDate(

    value: string

): string {

    if (!value) {

        return "";

    }



    const date =

        parseDate(value);



    return date.toLocaleDateString(

        "en-AU",

        {

            day: "2-digit",

            month: "short",

        }

    );

}





function displayTime(
    value: string
): string {
    return value || "";
}





/* =========================================

   Component

========================================= */



export default function MobileDashboardFilters({
    startDate,
    startTime,

    endDate,
    endTime,

    minDate,
    maxDate,

    minDuration,
    maxDuration,
    onDateTimeRangeChange,

    onMinDurationChange,
    onMaxDurationChange,

    onClearFilters,
}: MobileDashboardFiltersProps) {



    const [

        calendarOpen,

        setCalendarOpen,

    ] = useState(false);





    const initialRange =

        useMemo<DateRange | undefined>(

            () => {

                if (

                    !startDate ||

                    !endDate

                ) {

                    return undefined;

                }



                return {

                    from:

                        parseDate(

                            startDate

                        ),

                    to:

                        parseDate(

                            endDate

                        ),

                };

            },

            [

                startDate,

                endDate,

            ]

        );





    const [

        draftRange,

        setDraftRange,

    ] = useState<

        DateRange | undefined

    >(

        initialRange

    );





    const [

        draftStartTime,

        setDraftStartTime,

    ] = useState(

        startTime || "00:00"

    );





    const [

        draftEndTime,

        setDraftEndTime,

    ] = useState(

        endTime || "23:59"

    );





    const [

        dateTimeError,

        setDateTimeError,

    ] = useState<

        string | null

    >(null);





    /* =====================================

       Open calendar

    ===================================== */



    function handleCalendarOpen() {

        if (

            startDate &&

            endDate

        ) {

            setDraftRange({

                from:

                    parseDate(

                        startDate

                    ),

                to:

                    parseDate(

                        endDate

                    ),

            });

        }



        setDraftStartTime(

            startTime || "00:00"

        );



        setDraftEndTime(

            endTime || "23:59"

        );



        setDateTimeError(

            null

        );



        setCalendarOpen(

            (current) =>

                !current

        );

    }





    /* =====================================

       Date selection

    ===================================== */



    function handleDateSelect(

        range:

            DateRange | undefined

    ) {

        setDraftRange(

            range

        );



        setDateTimeError(

            null

        );

    }





    /* =====================================

       Disable dates outside DB bounds

    ===================================== */



    function isDateDisabled(

        date: Date

    ): boolean {

        if (

            minDate &&

            date <

                parseDate(

                    minDate

                )

        ) {

            return true;

        }



        if (

            maxDate &&

            date >

                parseDate(

                    maxDate

                )

        ) {

            return true;

        }



        return false;

    }





    /* =====================================

       Apply date + time

    ===================================== */



    function handleApplyDateTime() {

        setDateTimeError(

            null

        );



        if (

            !draftRange?.from ||

            !draftRange?.to

        ) {

            setDateTimeError(

                "Select both a start and end date."

            );



            return;

        }



        const nextStartDate =

            formatDate(

                draftRange.from

            );



        const nextEndDate =

            formatDate(

                draftRange.to

            );



        const startDateTime =

            `${nextStartDate}T${draftStartTime}:00`;



        const endDateTime =

            `${nextEndDate}T${draftEndTime}:59`;



        if (

            endDateTime <

            startDateTime

        ) {

            setDateTimeError(

                "End date and time must be after the start date and time."

            );



            return;

        }
        onDateTimeRangeChange(
            nextStartDate,
            draftStartTime,
            nextEndDate,
            draftEndTime,
        );



        setCalendarOpen(

            false

        );

    }





    /* =====================================

       Clear

    ===================================== */



    function handleClearFilters() {

        setDraftRange(

            undefined

        );



        setDraftStartTime(

            "00:00"

        );



        setDraftEndTime(

            "23:59"

        );



        setDateTimeError(

            null

        );



        setCalendarOpen(

            false

        );



        onClearFilters();

    }





    return (

        <div className="mobile-dashboard-filters">



            {/* =============================

                Date/time range

            ============================= */}



            <div className="mobile-filter-group mobile-date-filter">



                <label>

                    Date Range

                </label>



                <div className="mobile-date-picker-wrapper">



                    <button

                        type="button"

                        className="mobile-date-range-button"

                        onClick={

                            handleCalendarOpen

                        }

                    >

                        <span>

                            {

                                startDate &&

                                endDate

                                    ? (

                                        <>

                                            {

                                                displayDate(

                                                    startDate

                                                )

                                            }



                                            {" "}



                                            {

                                                displayTime(

                                                    startTime

                                                )

                                            }



                                            {" → "}



                                            {

                                                displayDate(

                                                    endDate

                                                )

                                            }



                                            {" "}



                                            {

                                                displayTime(

                                                    endTime

                                                )

                                            }

                                        </>

                                    )

                                    : (

                                        "Select date and time"

                                    )

                            }

                        </span>



                        <span>

                            ▾

                        </span>

                    </button>





                    {

                        calendarOpen &&

                        (

                            <div className="mobile-calendar-popup">



                                <DayPicker

                                    mode="range"



                                    selected={

                                        draftRange

                                    }



                                    onSelect={

                                        handleDateSelect

                                    }



                                    disabled={

                                        isDateDisabled

                                    }



                                    defaultMonth={

                                        draftRange?.from

                                            ? draftRange.from

                                            : minDate

                                                ? parseDate(

                                                    minDate

                                                )

                                                : undefined

                                    }



                                    startMonth={

                                        minDate

                                            ? parseDate(

                                                minDate

                                            )

                                            : undefined

                                    }



                                    endMonth={

                                        maxDate

                                            ? parseDate(

                                                maxDate

                                            )

                                            : undefined

                                    }



                                    showOutsideDays={

                                        false

                                    }

                                />





                                <div className="mobile-calendar-help">

                                    {

                                        !draftRange?.from

                                            ? "Select a start date"

                                            : !draftRange.to

                                                ? "Now select an end date"

                                                : "Choose the start and end time"

                                    }

                                </div>





                                {

                                    draftRange?.from &&

                                    draftRange?.to &&

                                    (

                                        <div className="mobile-time-range-controls">



                                            <div className="mobile-time-field">



                                                <label>

                                                    Start Time

                                                </label>



                                                <input

                                                    type="time"



                                                    value={

                                                       draftStartTime

                                                   }



                                                    onChange={(

                                                        event

                                                    ) =>

                                                        setDraftStartTime(

                                                            event

                                                                .target

                                                                .value

                                                        )

                                                    }

                                                />



                                            </div>





                                            <div className="mobile-time-field">



                                                <label>

                                                    End Time

                                                </label>



                                                <input

                                                    type="time"



                                                    value={

                                                       draftEndTime

                                                   }



                                                    onChange={(

                                                        event

                                                    ) =>

                                                        setDraftEndTime(

                                                            event

                                                                .target

                                                                .value

                                                        )

                                                    }

                                                />



                                            </div>



                                        </div>

                                    )

                                }





                                {

                                    dateTimeError &&

                                    (

                                        <div className="mobile-date-time-error">

                                            {

                                                dateTimeError

                                            }

                                        </div>

                                    )

                                }





                                <div className="mobile-calendar-actions">



                                    <button

                                        type="button"

                                        className="mobile-calendar-cancel-button"

                                        onClick={() =>

                                            setCalendarOpen(

                                                false

                                            )

                                        }

                                    >

                                        Cancel

                                    </button>





                                    <button

                                        type="button"

                                        className="mobile-calendar-apply-button"

                                        onClick={

                                            handleApplyDateTime

                                        }

                                    >

                                        Apply

                                    </button>



                                </div>



                            </div>

                        )

                    }



                </div>



            </div>





            {/* =============================

                Minimum duration

            ============================= */}



            <div className="mobile-filter-group">



                <label>

                    Minimum Duration

                </label>



                <input

                    className="mobile-filter-input"

                    type="number"

                    min="0"



                    value={

                        minDuration

                    }



                    onChange={(

                        event

                    ) => {

                        const value =

                            Number(

                                event

                                    .target

                                    .value

                            );



                        onMinDurationChange(

                            Math.max(

                                0,

                                value

                            )

                        );

                    }}

                />



            </div>





            {/* =============================

                Maximum duration

            ============================= */}



            <div className="mobile-filter-group">



                <label>

                    Maximum Duration

                </label>



                <input

                    className="mobile-filter-input"

                    type="number"

                    min="0"

                    placeholder="Any"



                    value={

                        maxDuration

                        ?? ""

                    }



                    onChange={(

                        event

                    ) => {

                        const value =

                            event

                                .target

                                .value;



                        if (

                            value === ""

                        ) {

                            onMaxDurationChange(

                                null

                            );



                            return;

                        }



                        onMaxDurationChange(

                            Math.max(

                                0,

                                Number(

                                    value

                                )

                            )

                        );

                    }}

                />



            </div>





            {/* =============================

                Clear

            ============================= */}



            <div className="mobile-filter-group">



                <label>

                     

                </label>



                <button

                    type="button"

                    className="mobile-clear-filters-button"

                    onClick={

                        handleClearFilters

                    }

                >

                    Clear Filters

                </button>



            </div>



        </div>

    );

}
