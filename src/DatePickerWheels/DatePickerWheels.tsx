import React, {useState, useEffect, useRef, useReducer, useLayoutEffect} from 'react';

import cn from 'classnames';

import {
    createArrayFromInterval,
    getMonthDaysAmount,
    copyDate,
    getWeekDayName
} from '../lib/utils';

import {
    months
} from "../lib/constants";

import styles from './DatePickerWheels.module.scss';
import {initial} from "lodash";
import {flushSync} from "react-dom";


interface DatePickerProps {
    isOpened: boolean;

    date: Date;
    setDate?: (date: Date) => void;
    onDatePickerChange: (date:Date) => void;

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

const YearWheel: React.FC<WheelProps> = ({date, changeDate, dateFrom, dateTo}) => {
    const [yearValuesArray, setYearValuesArray] = useState<Array<number>>(() =>
        {return createYearValuesArray(
            date.getFullYear(),
            dateFrom?.getFullYear(),
            dateTo?.getFullYear()
        )}
    );
    const year = date.getFullYear();
    const wheelRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
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
        event.currentTarget.parentElement.scrollTop = yearValuesArray.indexOf(value)*wheelItemSize;
    }

    function handleScroll (event: React.UIEvent<HTMLDivElement>) {
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
const MonthWheel = ({date, changeDate}:WheelProps) => {
    const wheelRef = useRef<HTMLDivElement>(null);
    const month = date.getMonth();

    useLayoutEffect(() => {
        if (wheelRef.current) {
            wheelRef.current.scrollTop = month*wheelItemSize;
        }
    }, [wheelRef.current, month])

    function changeDateMonth (month: number) {
        changeDate(
            new Date(copyDate(date).setMonth(month))
        )
    }

    function handleClick (event: React.UIEvent<HTMLDivElement>, value: number) {
        if (!event.currentTarget.parentElement) {
            return
        }
        event.currentTarget.parentElement.scrollTop = monthValuesArray.indexOf(value)*wheelItemSize;
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

//
function createDayValuesArray(date: Date): Array<number> {
    return createArrayFromInterval(1, getMonthDaysAmount(date)); // e.g. [1...31]
}

const DayWheel: React.FC<WheelProps> = ({
    date, changeDate, dateFrom, dateTo
}) => {
    const day = date.getDate();
    const dayValuesArray = createDayValuesArray(date);

    const isScrollHandleAllowedRef = useRef<boolean>(true);
    const switchScrollHandleAllowed = () => {
        isScrollHandleAllowedRef.current = !isScrollHandleAllowedRef.current;
    }
    console.log('DayWheel:', date, day)
    const wheelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollTo(day - 1);
        console.log(day);
    }, [wheelRef, day])


    function scrollTo(index: number) {
        isScrollHandleAllowedRef.current = false;
        if (wheelRef.current) {
            wheelRef.current.scrollTop = (index)*wheelItemSize;
        }
        console.log(wheelRef.current!.scrollTop, 'here')
        isScrollHandleAllowedRef.current = true;
    }

    function changeDateDay(day: number) {
        changeDate(
            new Date(copyDate(date).setDate(day))
        )
    }

    function handleScroll (event: React.UIEvent<HTMLDivElement>) {
        if (!isScrollHandleAllowedRef.current) return;
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
                    onClick={() => {
                        changeDateDay(value)
                    }}
                >
                    <div>{value}</div>
                        {value === day && <div className={styles.weekDay}>
                        {getWeekDayName(new Date(date)).short}
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
    initialDate = initialDate ?? new Date();
    const [dateR, setDate] = useState<Date>(initialDate);
    const changeDate = (date: Date) => {
        onDatePickerChange(date);
        setDate(date);
    }

    console.log('DatePickerWheels:', date);

    return (
        <div className={cn(
                styles.DatePicker,
                {[styles.opened]: isOpened}
        )}
        >
            <DayWheel date={new Date(dateR)}
                      changeDate={changeDate}
                      dateFrom={dateFrom}
                      dateTo={dateTo}
            />
            <MonthWheel date={dateR}
                        changeDate={changeDate}
                        dateFrom={dateFrom}
                        dateTo={dateTo}
            />
            <YearWheel date={dateR}
                       changeDate={changeDate}
                       dateFrom={dateFrom}
                       dateTo={dateTo}
            />
        </div>
    )
}