import React, {useState, useEffect, useRef} from 'react';

import {
    createArrayFromInterval,
    getMonthDaysAmount,
    copyDate,
    getWeekDayName
} from '../../utils';

import {months} from "../../constants";

import cn from 'classnames';
import styles from './DatePickerWheels.module.scss';


interface DatePickerProps {
    isOpened: boolean;

    date: Date;
    onDatePickerChange: (date:Date) => void;

    initialDate?: Date;
    dateFrom?: Date;
    dateTo?: Date;
}

interface WheelProps {
    date: Date;
    flow: 'up' | 'down';

    changeDate: (date: Date) => void;
    dateFrom?: Date;
    dateTo?: Date;
}

const wheelItemSize = 38.75; //px

// YearWheel logic

// TODO: react.memo, but it doesn't seem to be slow YET;
//       don't work with date as prop well, gotta change to year.
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

const YearWheel: React.FC<WheelProps> = ({
    date, flow, changeDate, dateFrom, dateTo}
) => {
    const [yearValuesArray, setYearValuesArray] = useState<Array<number>>(() =>
        {return createYearValuesArray(
            date.getFullYear(),
            dateFrom?.getFullYear(),
            dateTo?.getFullYear()
        )}
    );

    const year = date.getFullYear();
    const wheelRef = useRef<HTMLDivElement>(null);
    const isScrollAllowedRef = useRef<boolean>(true);

    useEffect(() => {
        if (flow === 'down') {
            scrollTo(yearValuesArray.indexOf(year));
        }
    }, [wheelRef, year])


    function scrollTo(index: number) {
        console.log('scroll fired')
        if (wheelRef.current) {
            isScrollAllowedRef.current = false;

            wheelRef.current.scrollTop = (index)*wheelItemSize;

            isScrollAllowedRef.current = true;
        }
    }

    function changeDateYear(year: number) {
        changeDate(
            new Date(copyDate(date).setFullYear(year))
        )
    }

    function handleClick (event: React.UIEvent<HTMLDivElement>, year: number) {
        scrollTo(yearValuesArray.indexOf(year));
    }

    function handleScroll (event: React.UIEvent<HTMLDivElement>) {
        if (!isScrollAllowedRef.current) return;
        if (!event.currentTarget) {
            return
        }
        const scrollTop = event.currentTarget.scrollTop;
        const scrollOffset = (scrollTop) % wheelItemSize;
        let currentIndexByScroll;
        if (scrollOffset < wheelItemSize/2) {
            currentIndexByScroll = Math.floor(scrollTop/wheelItemSize);
        } else {
            currentIndexByScroll = Math.floor(scrollTop/wheelItemSize) + 1;
        }

        const currentYearByScroll = currentIndexByScroll + yearValuesArray[0];
        // console.log(currentIndexByScroll);

        if (
            year !== currentYearByScroll
            && year <= yearValuesArray[yearValuesArray.length - 1]
        ) {
            changeCurrent(currentYearByScroll);
        }
    }

    function changeCurrent (year: number) {
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

//  TODO: React.memo, same as year;
//        but it doesn't seem to be slow YET.
const monthValuesArray: Array<number> = createArrayFromInterval(0, 11);
const MonthWheel: React.FC<WheelProps> = ({date, flow, changeDate}:WheelProps) => {
    const wheelRef = useRef<HTMLDivElement>(null);
    const month = date.getMonth();
    const isScrollAllowedRef = useRef<boolean>(true);

    useEffect(() => {
        if (flow === 'down') {
            scrollTo(month);
        }
    }, [wheelRef.current, month])

    function scrollTo(index: number) {
        if (wheelRef.current) {
            isScrollAllowedRef.current = false;

            wheelRef.current.scrollTop = (index)*wheelItemSize;

            isScrollAllowedRef.current = true;
        }
    }

    function changeDateMonth (month: number) {
        changeDate(
            new Date(copyDate(date).setMonth(month))
        )
    }

    function handleClick (event: React.UIEvent<HTMLDivElement>, month: number) {
        scrollTo(monthValuesArray.indexOf(month));
    }

    function handleScroll (event: React.UIEvent<HTMLDivElement>) {
        if (!isScrollAllowedRef.current) return;

        const scrollTop = event.currentTarget.scrollTop;
        const scrollOffset = (scrollTop) % wheelItemSize;
        let currentByScroll;
        if (scrollOffset < wheelItemSize/2) {
            currentByScroll = Math.floor(scrollTop/wheelItemSize);
        } else {
            currentByScroll = Math.floor(scrollTop/wheelItemSize) + 1;
        }

        //currentByScroll takes the same value as corresponding month
        //length check prevents scroll bug
        if (currentByScroll !== month && currentByScroll < monthValuesArray.length) {
            changeCurrent(currentByScroll);
        }
    }

    function changeCurrent (month: number) {
        changeDateMonth(month);
    }

    // const changeCurrentThrottled = useThrottle<typeof changeCurrent>(changeCurrent, 40)
    return (
        <div
            className={styles.wheel}
            ref={wheelRef}
            onScroll={handleScroll}
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

//
function createDayValuesArray(date: Date): Array<number> {
    return createArrayFromInterval(1, getMonthDaysAmount(date)); // e.g. [1...31]
}

const DayWheel: React.FC<WheelProps> =({
    date, flow, changeDate, dateFrom, dateTo
}) => {
    const day = date.getDate();

    const dayValuesArray = createDayValuesArray(date);

    const wheelRef = useRef<HTMLDivElement>(null);

    const isScrollAllowedRef = useRef<boolean>(true);

    // initialize date
    useEffect(() => {
        if (flow === 'down') {
            scrollTo(day - 1);
        }
    }, [wheelRef, day])


    function scrollTo(index: number) {
        if (wheelRef.current) {
            isScrollAllowedRef.current = false;

            wheelRef.current.scrollTop = (index)*wheelItemSize;

            isScrollAllowedRef.current = true;
        }
    }

    // function smoothScrollTo(index: number) {
    //     if (!wheelRef.current) return;
    //     const startScrollTop = wheelRef.current.scrollTop;
    //     const finishScrollTop = index*wheelItemSize;
    //     const scrollTopDifference = finishScrollTop - startScrollTop;
    //
    //     let startTimestamp: undefined | number;
    //     function animate (timestamp: number) {
    //         if (startTimestamp === undefined) {
    //             startTimestamp = timestamp;
    //         }
    //         if (timestamp - startTimestamp >= 300) {
    //             console.log(isScrollAllowedRef.current);
    //             wheelRef.current!.scrollTop = finishScrollTop;
    //             console.log('finish');
    //             return
    //         }
    //         wheelRef.current!.scrollTop = startScrollTop + scrollTopDifference*((timestamp - startTimestamp)/300)
    //         requestAnimationFrame(animate);
    //     }
    //     requestAnimationFrame(animate);
    //
    // }

    function changeDateDay(day: number) {
        changeDate(
            new Date(copyDate(date).setDate(day))
        )
    }

    function handleScroll (event: React.UIEvent<HTMLDivElement>) {
        console.log(isScrollAllowedRef.current)
        if (!isScrollAllowedRef.current) return;
        const scrollTop = event.currentTarget.scrollTop;
        const scrollOffset = (scrollTop) % wheelItemSize;

        let currentIndexByScroll;
        if (scrollOffset < wheelItemSize/2) {
            currentIndexByScroll = Math.floor(scrollTop/wheelItemSize);
        } else {
            currentIndexByScroll = Math.floor(scrollTop/wheelItemSize) + 1;
        }

        const currentDayByScroll = currentIndexByScroll + 1;

        if (
            currentDayByScroll !== day &&
            currentDayByScroll <= dayValuesArray[dayValuesArray.length - 1]
        ) {
            changeDateDay(currentDayByScroll);
        }
    }

    function handleClick(event: React.MouseEvent<HTMLDivElement>, day: number) {
        scrollTo(dayValuesArray.indexOf(day));
    }

    return (
        <div
            className={styles.wheel}
            ref={wheelRef}
            onScroll={handleScroll}
        >
            <div className={styles.void}></div>
            <div className={styles.void}></div>

            {dayValuesArray.map((value) => {
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
                    {value === day && <div className={styles.weekDay}>
                        {getWeekDayName(date).short}
                    </div>}
                </div>
            })}

            <div className={styles.void}></div>
            <div className={styles.void}></div>
        </div>
    )
}

export const DatePickerWheels: React.FC<DatePickerProps> = ({
        isOpened,

        date,
        onDatePickerChange,

        initialDate,
        dateFrom,
        dateTo,
}) => {
    const [dateState, setDateState] = useState<
        {value: Date, flow: 'up' | 'down'}
    >({
        value: initialDate ? initialDate : new Date(),
        flow: 'down'}
    );

    useEffect(() => {
        setDateState({
            value: date,
            flow: 'down'
        })
    }, [date]);

    const changeDate = (date: Date) => {
        setDateState({
            value: date,
            flow: 'up'
        })
        onDatePickerChange(date);
    }
    return (
        <div className={cn(
                styles.DatePicker,
                {[styles.opened]: isOpened}
        )}
        >
            <DayWheel date={dateState.value}
                      flow={dateState.flow}

                      changeDate={changeDate}
                      dateFrom={dateFrom}
                      dateTo={dateTo}
            />
            <MonthWheel date={dateState.value}
                        flow={dateState.flow}

                        changeDate={changeDate}
                        dateFrom={dateFrom}
                        dateTo={dateTo}
            />
            <YearWheel date={dateState.value}
                       flow={dateState.flow}

                       changeDate={changeDate}
                       dateFrom={dateFrom}
                       dateTo={dateTo}
            />
        </div>
    )
}