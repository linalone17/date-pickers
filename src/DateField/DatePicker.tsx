import React, {useState, useEffect, useRef, useLayoutEffect, DOMAttributes, UIEventHandler} from 'react';

import cn from 'classnames';

import styles from './DatePicker.module.scss';


interface DatePickerProps {
    isOpened: boolean;

    date: Date;
    setDate: (date: Date) => void;

    initialDate?: Date;
    dateFrom?: Date;
    dateTo?: Date;
}

interface WheelProps {
    date: Date;
    changeDate: (date: Date) => void;
    dateFrom?: Date;
    dateTo?: Date;
}

// type ReturnOf<Fn> = Fn extends (...args: any) => infer Return ? Return : never;
// type ArgumentsOf<Fn> = Fn extends (...args: infer Arguments) => any ? Arguments : never;

const months = [
    {
        name: 'january',
        short: 'jan',
        days:  31,
    },
    {
        name: 'february',
        short: 'feb',
        days:  28,
    },
    {
        name: 'march',
        short: 'mar',
        days:  31,
    },
    {
        name: 'april',
        short: 'apr',
        days:  30,
    },
    {
        name: 'may',
        short: 'may',
        days:  31,
    },
    {
        name: 'june',
        short: 'jun',
        days:  30,
    },
    {
        name: 'july',
        short: 'jul',
        days:  31,
    },
    {
        name: 'august',
        short: 'aug',
        days:  31,
    },
    {
        name: 'september',
        short: 'sep',
        days:  30,
    },
    {
        name: 'october',
        short: 'oct',
        days:  31,
    },
    {
        name: 'november',
        short: 'nov',
        days:  30,
    },
    {
        name: 'december',
        short: 'dec',
        days:  31,
    },
]

const monthNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'
]

const weekDayNames = [
    'sun',
    'mon',
    'tue',
    'wen',
    'thu',
    'fri',
    'sat'
]

const wheelItemSize = 38.75; //px

function createArrayFromInterval (start: number, end: number): Array<number> {
    const array = Array(end - start + 1);
    for (let i = 0; i < array.length; i++) {
        array[i] = i + start;
    }
    return array
}

function isLeapYear(year: number) {
    if (year % 400 === 0) {
        return true
    }

    if (year % 100 === 0) {
        return false
    }

    return year % 4 === 0;
}

function copyDate(date: Date) {
    return new Date(date);
}

// function useThrottle<Fn>(
//     fn: Fn extends Function ? Fn : never,
//     wait?: number
// ) {
//     wait = wait ?? 1000;
//     const [isTime, setIsTime] = useState<boolean>(true);
//     const throttled = (...args: any): any => {
//         if (isTime) {
//             if (isTime) {
//                 fn(...args);
//                 setIsTime(false);
//                 setTimeout(() => {
//                     setIsTime(true)
//                     fn(...args);
//                 }, wait)
//             }
//         }
//     }
//     return throttled as Fn;
// }

// YearWheel logic
function createYearValuesArray(year: number, yearFrom?:number, yearTo?:number): Array<number> {
    let intervalStart = year - 25;
    if (yearFrom && intervalStart < yearFrom) {
        intervalStart = yearFrom;
    }

    let intervalEnd = year + 25;
    if (yearTo && intervalEnd > yearTo) {
        intervalEnd = yearTo;
    }

    return createArrayFromInterval(intervalStart, intervalEnd);
}

const YearWheel: React.FC<WheelProps> = ({date, changeDate, dateFrom, dateTo}) => {
    const [yearValuesArray, setYearValuesArray] = useState<Array<number>>(
        createYearValuesArray(
            date.getFullYear(),
            dateFrom?.getFullYear(),
            dateTo?.getFullYear()
        )
    );
    const [year, setYear] = useState<number>(date.getFullYear());
    const wheelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (wheelRef.current) {
            wheelRef.current.scrollTop = yearValuesArray.indexOf(year)*wheelItemSize;
        }
    }, [wheelRef.current])

    function changeDateYear(year: number) {
        changeDate(
            new Date(date.setFullYear(year))
        )
    }

    function handleClick (event: React.UIEvent<HTMLDivElement>, value: number) {
        if (!event.currentTarget.parentElement) {
            return
        }
        event.currentTarget.parentElement.scrollTop = value*wheelItemSize;
    }

    function handleScroll (event: React.UIEvent<HTMLDivElement>) {
        if (!event.currentTarget) {
            return
        }
        const scrollTop = event.currentTarget.scrollTop;
        const scrollOffset = (scrollTop) % wheelItemSize;
        let currentByScroll;
        if (scrollOffset < wheelItemSize/2) {
            currentByScroll = Math.floor(scrollTop/wheelItemSize);
        } else {
            currentByScroll = Math.floor(scrollTop/wheelItemSize) + 1;
        }


        changeCurrent(currentByScroll + yearValuesArray[0]);
    }

    function changeCurrent (year: number) {
        setYear(year);
        changeDateYear(year);
    }



    return (
        <div className={styles.wheel}
             ref={wheelRef}
             onScroll={wheelRef.current ? handleScroll: undefined}
        >
            <div className={styles.void}></div>
            <div className={styles.void}></div>

            {yearValuesArray.map((value) => {
                return <div
                    className={cn(
                        {[styles.active]: value === year},
                        styles.item
                    )}
                    key={value}
                    onClick={(e) => {
                        handleClick(e, value);
                    }}
                >{value}</div>
            })}

            <div className={styles.void}></div>
            <div className={styles.void}></div>
        </div>
    )
}

// MonthWheel logic
const monthValuesArray: Array<number> = createArrayFromInterval(0, 11);

const MonthWheel: React.FC<WheelProps> = ({date, changeDate}) => {
    const wheelRef = useRef<HTMLDivElement>(null);
    const [month, setMonth] = useState(date.getMonth());

    useEffect(() => {
        if (wheelRef.current) {
            wheelRef.current.scrollTop = month*wheelItemSize;
        }
    }, [wheelRef.current])

    function changeDateMonth (month: number) {
        changeDate(
            new Date(date.setMonth(month))
        )
    }

    function handleClick (event: React.UIEvent<HTMLDivElement>, value: number) {
        if (!event.currentTarget.parentElement) {
            return
        }
        event.currentTarget.parentElement.scrollTop = value*wheelItemSize;
    }

    function handleScroll (event: React.UIEvent<HTMLDivElement>) {
        if (!event.currentTarget) {
            return
        }
        const scrollTop = event.currentTarget.scrollTop;
        const scrollOffset = (scrollTop) % wheelItemSize;
        let currentByScroll;
        if (scrollOffset < wheelItemSize/2) {
            currentByScroll = Math.floor(scrollTop/wheelItemSize);
        } else {
            currentByScroll = Math.floor(scrollTop/wheelItemSize) + 1;
        }

        //currentByScroll takes the same value as corresponding month
        changeCurrent(currentByScroll);
    }

    function changeCurrent (month: number) {
        setMonth(month);
        changeDateMonth(month);
    }

    // const changeCurrentThrottled = useThrottle<typeof changeCurrent>(changeCurrent, 40)
    return (
        <div
            className={styles.wheel}
            ref={wheelRef}
            onScroll={wheelRef.current ? handleScroll: undefined}
        >
            <div className={styles.void}></div>
            <div className={styles.void}></div>

            {monthValuesArray.map((value) => {
                return <div
                    className={cn(
                        {[styles.active]: value === month},
                        styles.item
                    )}
                    key={value}
                    onClick={(e) => {
                        handleClick(e, value);
                    }}
                >{months[value].name}</div>
            })}

            <div className={styles.void}></div>
            <div className={styles.void}></div>
        </div>
    )
}

// DayWheel logic
function createDayValuesArray(month: number, isLeapYear: boolean): Array<number> {
    let days = months[month].days;
    if (month === 1 && isLeapYear) {
        days += 1;
    }
    return createArrayFromInterval(1, days);
}

const DayWheel: React.FC<WheelProps> = ({date, changeDate}) => {
    const [day, setDay] = useState<number>(date.getDate());
    const [isScrollEventAllowed, setIsScrollEventAllowed] = useState<boolean>(false);

    const wheelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (wheelRef.current) {
            wheelRef.current.scrollTop = (day - 1)*wheelItemSize;
        }
    }, [wheelRef])

    function changeDateDay(day: number) {
        changeDate(
            new Date(date.setDate(day))
        )
    }

    function handleClick (event: React.UIEvent<HTMLDivElement>, value: number) {
        if (event.currentTarget.parentElement) {
            event.currentTarget.parentElement.scrollTop = value*wheelItemSize;
        }
    }

    function handleScroll (event: React.UIEvent<HTMLDivElement>) {
        const scrollTop = event.currentTarget.scrollTop;
        const scrollOffset = (scrollTop) % wheelItemSize;
        let currentByScroll;
        if (scrollOffset < wheelItemSize/2) {
            currentByScroll = Math.floor(scrollTop/wheelItemSize);
        } else {
            currentByScroll = Math.floor(scrollTop/wheelItemSize) + 1;
        }

        //currentByScroll takes the same value as corresponding month
        changeCurrent(currentByScroll);
    }

    function changeCurrent (day: number) {
        setDay(day + 1);
        changeDateDay(day + 1);
    }

    return (
        <div
            className={styles.wheel}
            ref={wheelRef}
            onScroll={
                wheelRef.current
                    ? handleScroll
                    : undefined
            }
        >
            <div className={styles.void}></div>
            <div className={styles.void}></div>

            {createDayValuesArray(
                date.getMonth(),
                isLeapYear(date.getFullYear())
            ).map((value) => {
                const dateWithChosenDay = new Date(copyDate(date).setDate(value));
                const weekDay = dateWithChosenDay.getDay();
                return <div
                    className={cn(
                        {[styles.active]: value === day},
                        styles.item
                    )}
                    key={value}
                    onClick={(event) => {
                        handleClick(event, value);
                    }}
                >
                    <div>{value}</div>
                    {value === day && <div className={styles.weekDay}>{weekDayNames[weekDay]}</div>}
                </div>
            })}

            <div className={styles.void}></div>
            <div className={styles.void}></div>
        </div>
    )
}

export const DatePicker: React.FC<DatePickerProps> = ({
        isOpened,
        date,
        setDate,
        dateFrom,
        dateTo
}) => {
    const changeDate = (date: Date) => {
        setDate(date);
    }

    return (
        <div className={cn(
                styles.DatePicker,
                {[styles.opened]: isOpened}
        )}
        >
            <DayWheel date={date}
                      changeDate={changeDate}
                      dateFrom={dateFrom}
                      dateTo={dateTo}
            />
            <MonthWheel date={date}
                        changeDate={changeDate}
                        dateFrom={dateFrom}
                        dateTo={dateTo}
            />
            <YearWheel date={date}
                       changeDate={changeDate}
                       dateFrom={dateFrom}
                       dateTo={dateTo}
            />
        </div>
    )
}