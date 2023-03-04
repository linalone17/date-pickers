import React, {useState, useEffect, useRef, useCallback} from 'react';

import {
    getMonthDaysAmount,
    copyDate,
    getWeekDayName,
} from '../../../utils';

import {
    createArrayFromInterval,
} from "../../../../shared/utils";

import {months} from "../../../constants";

import cn from 'classnames';
import styles from './DatePickerWheels.module.scss';


interface DatePickerProps {
    isOpened: boolean;

    date: Date;
    onDatePickerChange: (date:Date) => void;

    initialDate?: Date;
    dateFrom?: Date;
    dateTo?: Date;

    sizes: {
        width: number;
        height: number;
    }
}

type Committer = 'DatePicker' | 'DayWheel' | 'MonthWheel' | 'YearWheel'

interface WheelProps {
    date: Date;
    changeDate: (date: Date, committer?: Committer) => void;

    committer: Committer;

    dateFrom?: Date;
    dateTo?: Date;
}

interface MonthWheelProps extends WheelProps {
    isFullName: boolean;
}

// YearWheel logic

function createYearValuesArray(yearFrom: number, yearTo: number, yearFromThreshold?:number, yearToThreshold?:number): Array<number> {
    let intervalStart = yearFrom;
    if (yearFromThreshold && intervalStart < yearFromThreshold) {
        intervalStart = yearFromThreshold;
    }

    let intervalEnd = yearTo;
    if (yearToThreshold && intervalEnd > yearToThreshold) {
        intervalEnd = yearToThreshold;
    }
    console.log(intervalStart, intervalEnd);

    return createArrayFromInterval(intervalStart, intervalEnd);
}

const YearWheel: React.FC<WheelProps> = ({
    date,
    changeDate,

    committer,

    dateFrom,
    dateTo
}
) => {
    const year = date.getFullYear();
    const yearFrom = dateFrom?.getFullYear();
    const yearTo = dateTo?.getFullYear();


    const [yearValuesArray, setYearValuesArray] = useState<Array<number>>(() => (
        createYearValuesArray(
            year - 50,
            year + 50,
            yearFrom,
            yearTo
        )
    ));

    const wheelRef = useRef<HTMLDivElement>(null);
    const wheelItemSize = wheelRef.current ? wheelRef.current.scrollHeight / wheelRef.current.childElementCount : null;

    const isScrollAllowedRef = useRef<boolean>(true);

    useEffect(() => {
        if (committer !== 'YearWheel') {
            scrollTo(yearValuesArray.indexOf(year));
        }
    }, [wheelItemSize, year]);

    function scrollTo(index: number) {
        if (wheelRef.current) {
            isScrollAllowedRef.current = false;

            wheelRef.current.scrollTo({
                top: (index)*wheelItemSize!
            });

            isScrollAllowedRef.current = true;
        }
    }
    // TODO: use or delete
    function smoothScrollTo(index: number) {
        if (wheelRef.current) {
            isScrollAllowedRef.current = false;

            wheelRef.current.scrollTo({
                top: (index)*wheelItemSize!,
                behavior: 'smooth'
            })

            isScrollAllowedRef.current = true;
        }
    }

    function changeDateYear(year: number) {
        const newDate = new Date(copyDate(date).setFullYear(year));

        if (dateFrom && newDate < dateFrom) {
            newDate.setFullYear(dateFrom.getFullYear())
        }

        if (dateFrom && newDate < dateFrom) {
            newDate.setMonth(dateFrom.getMonth())
        }

        if (dateFrom && newDate < dateFrom) {
            newDate.setDate(dateFrom.getDate())
        }

        if (dateTo && newDate > dateTo) {
            newDate.setFullYear(dateTo.getFullYear())
        }

        if (dateTo && newDate > dateTo) {
            newDate.setMonth(dateTo.getMonth())
        }

        if (dateTo && newDate > dateTo) {
            newDate.setDate(dateTo.getDate())
        }

        changeDate(newDate, 'YearWheel');
    }

    function handleClick (event: React.UIEvent<HTMLDivElement>, year: number) {
        smoothScrollTo(yearValuesArray.indexOf(year));
    }

    function handleScroll (event: React.UIEvent<HTMLDivElement>) {
        if (!isScrollAllowedRef.current) return;
        if (!wheelRef.current) return;

        const scrollTop = event.currentTarget.scrollTop;
        const scrollOffset = (scrollTop) % wheelItemSize!;
        let currentIndexByScroll;
        if (scrollOffset < wheelItemSize!/2) {
            currentIndexByScroll = Math.floor(scrollTop/wheelItemSize!);
        } else {
            currentIndexByScroll = Math.floor(scrollTop/wheelItemSize!) + 1;
        }

        const currentYearByScroll = currentIndexByScroll + yearValuesArray[0];

        if (
            currentYearByScroll !== year &&
            currentYearByScroll >= yearValuesArray[0] &&
            currentYearByScroll <= yearValuesArray[yearValuesArray.length - 1]
        ) {
            changeCurrent(currentYearByScroll);
        }
        if (statRef.current) {
            statRef.current!.innerHTML = `ST:${scrollTop} IS: ${wheelItemSize}`;
        }
    }

    function changeCurrent (year: number) {
        changeDateYear(year);
    }

    const statRef = useRef<HTMLDivElement>(null);

    return (
        <div className={styles.wheelContainer}>
            <div className={styles.wheel}
                 ref={wheelRef}
                 onScroll={wheelRef.current ? handleScroll : undefined}
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
        </div>
    )
}

// MonthWheel logic

function createMonthValuesArray(date: Date, dateFrom?: Date, dateTo?: Date): Array<number> {
    const monthFrom = date.getFullYear() === dateFrom?.getFullYear() ? dateFrom?.getMonth() : 0;
    const monthTo = date.getFullYear() === dateTo?.getFullYear() ? dateTo?.getMonth() : 11;

    return createArrayFromInterval(monthFrom, monthTo);
}

const MonthWheel: React.FC<MonthWheelProps> = ({
    date,
    changeDate,

    committer,

    dateFrom,
    dateTo,
    isFullName
}) => {
    const wheelRef = useRef<HTMLDivElement>(null);
    const wheelItemSize = wheelRef.current ? wheelRef.current.scrollHeight / wheelRef.current.childElementCount : null;

    const year = date.getFullYear();
    const month = date.getMonth();

    const isEdgeYear = (
        dateFrom?.getFullYear() === date.getFullYear() ||
        dateTo?.getFullYear() === date.getFullYear()
    )
    const createMonthValuesArrayMemo = useCallback(createMonthValuesArray, [isEdgeYear]);
    const monthValuesArray = createMonthValuesArrayMemo(date, dateFrom, dateTo);

    const isScrollAllowedRef = useRef<boolean>(true);

    useEffect(() => {
        if (committer !== 'MonthWheel') {
            scrollTo(monthValuesArray.indexOf(month));
        }
    }, [wheelItemSize, date])

    function scrollTo(index: number) {
        if (wheelRef.current) {
            isScrollAllowedRef.current = false;

            wheelRef.current.scrollTop = (index)*wheelItemSize!;

            isScrollAllowedRef.current = true;
        }
    }

    function smoothScrollTo(index: number) {
        if (wheelRef.current) {
            isScrollAllowedRef.current = false;

            wheelRef.current.scrollTo({
                top: (index)*wheelItemSize!,
                behavior: 'smooth'
            })

            isScrollAllowedRef.current = true;
        }
    }

    function changeDateMonth (month: number) {
        const newDate = new Date(date.getFullYear(), month, 1);
        const daysAmount = getMonthDaysAmount(month, date.getFullYear());

        if (date.getDate() > daysAmount) {
            newDate.setDate(daysAmount);
        } else {
            newDate.setDate(date.getDate());
        }

        if (dateFrom && newDate < dateFrom) {
            newDate.setMonth(dateFrom.getMonth());
        }
        if (dateFrom && newDate < dateFrom) {
            newDate.setDate(dateFrom.getDate());
        }

        if (dateTo && newDate > dateTo) {
            newDate.setMonth(dateTo.getMonth());
        }
        if (dateTo && newDate > dateTo) {
            newDate.setDate(dateTo.getDate());
        }

        changeDate(newDate, 'MonthWheel');
    }

    function handleClick (event: React.UIEvent<HTMLDivElement>, month: number) {
        smoothScrollTo(monthValuesArray.indexOf(month));
    }

    function handleScroll (event: React.UIEvent<HTMLDivElement>) {
        if (!isScrollAllowedRef.current) return;
        if (!wheelRef.current) return;

        const scrollTop = event.currentTarget.scrollTop;
        const scrollOffset = (scrollTop) % wheelItemSize!;
        let currentIndexByScroll;
        if (scrollOffset < wheelItemSize!/2) {
            currentIndexByScroll = Math.floor(scrollTop/wheelItemSize!);
        } else {
            currentIndexByScroll = Math.floor(scrollTop/wheelItemSize!) + 1;
        }

        const currentMonthByScroll = currentIndexByScroll + monthValuesArray[0];
        //length check prevents scroll bug
        if (
            currentMonthByScroll !== month &&
            currentMonthByScroll >= monthValuesArray[0] &&
            currentMonthByScroll <= monthValuesArray[monthValuesArray.length - 1]
        ) {
            changeCurrent(currentMonthByScroll);
        }
    }

    function changeCurrent (month: number) {
        changeDateMonth(month);
    }

    return (
        <div className={cn(
            styles.wheelContainer,
            {[styles.fullMonthName]: isFullName}
        )}>
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
                        onClick={(event) => {
                            handleClick(event, value);
                        }}
                    >{isFullName ? months[value].name : months[value].short}</div>
                })}

                <div className={styles.void}></div>
                <div className={styles.void}></div>
            </div>
        </div>
    )
}

// DayWheel logic

//
function createDayValuesArray(date: Date, dateFrom?: Date, dateTo?: Date): Array<number> {
    let dayFrom = 1;
    if (dateFrom &&
        dateFrom.getMonth() === date.getMonth() &&
        dateFrom.getFullYear() === date.getFullYear()
    ) {
        dayFrom = dateFrom.getDate();
    }

    let dayTo = getMonthDaysAmount(date);
    if (dateTo &&
        dateTo.getMonth() === date.getMonth() &&
        dateTo.getFullYear() === date.getFullYear()
    ) {
        dayTo = dateTo.getDate();
    }

    return createArrayFromInterval(dayFrom, dayTo); // e.g. [1...31]
}

const DayWheel: React.FC<WheelProps> =({
    date,
    changeDate,

    committer,

    dateFrom,
    dateTo
}) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const isEdgeYearAndMonth = (
        (
            dateFrom &&
            month === dateFrom.getMonth() &&
            year === dateFrom.getFullYear()
        ) || (
            dateTo &&
            month === dateTo.getMonth() &&
            year === dateTo.getFullYear()
        )
    )
    const createDayValuesArrayMemo = useCallback(createDayValuesArray, [isEdgeYearAndMonth]);
    const dayValuesArray = createDayValuesArrayMemo(date, dateFrom, dateTo);

    const wheelRef = useRef<HTMLDivElement>(null);
    const wheelItemSize = wheelRef.current ? wheelRef.current.scrollHeight / wheelRef.current.childElementCount : null;

    const isScrollAllowedRef = useRef<boolean>(true);

    // initialize date
    useEffect(() => {
        if (committer !== 'DayWheel') {
            scrollTo(dayValuesArray.indexOf(day));
        }
    }, [wheelItemSize, date])


    function scrollTo(index: number) {
        if (wheelRef.current) {
            isScrollAllowedRef.current = false;
            wheelRef.current.scrollTop = (index)*wheelItemSize!;

            isScrollAllowedRef.current = true;
        }
    }

    function smoothScrollTo(index: number) {
        if (wheelRef.current) {
            isScrollAllowedRef.current = false;

            wheelRef.current.scrollTo({
                top: (index)*wheelItemSize!,
                behavior: 'smooth'
            })

            isScrollAllowedRef.current = true;
        }
    }


    function changeDateDay(day: number) {
        const newDate = new Date(copyDate(date).setDate(day));

        if (dateFrom && newDate < dateFrom) {
            newDate.setDate(dateFrom.getDate())
        }

        if (dateTo && newDate > dateTo) {
            newDate.setDate(dateTo.getDate())
        }
        changeDate(newDate, 'DayWheel')
    }

    function handleScroll (event: React.UIEvent<HTMLDivElement>) {
        if (!isScrollAllowedRef.current) return;
        if (!wheelRef.current) return;

        const scrollTop = event.currentTarget.scrollTop;
        const scrollOffset = (scrollTop) % wheelItemSize!;

        let currentIndexByScroll;
        if (scrollOffset < wheelItemSize!/2) {
            currentIndexByScroll = Math.floor(scrollTop/wheelItemSize!);
        } else {
            currentIndexByScroll = Math.floor(scrollTop/wheelItemSize!) + 1;
        }

        const currentDayByScroll = currentIndexByScroll + dayValuesArray[0];

        if (
            currentDayByScroll !== day &&
            currentDayByScroll >= dayValuesArray[0] &&
            currentDayByScroll <= dayValuesArray[dayValuesArray.length - 1]
        ) {
            changeDateDay(currentDayByScroll);
        }
    }

    function handleClick(event: React.MouseEvent<HTMLDivElement>, day: number) {
        smoothScrollTo(dayValuesArray.indexOf(day));
    }


    return (
        <div className={styles.wheelContainer}>
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

        sizes
}) => {
    const [dateState, setDateState] = useState<
        {value: Date, committer: Committer}
    >({
        value: initialDate ? initialDate : new Date(),
        committer: 'DatePicker'
    });

    const fontSize = sizes.height*5/12; // all the sizes depend on fontSize

    useEffect(() => {
        setDateState({
            value: date,
            committer: 'DatePicker'
        })
    }, [date]);

    const changeDate = (date: Date, committer: Committer = 'DatePicker') => {
        setDateState({
            value: date,
            committer
        })

        onDatePickerChange(date);
    }

    return (
        <div className={cn(
                styles.DatePicker,
                {[styles.opened]: isOpened}
        )}
             style={{fontSize: `${fontSize}px`}} // you are not to change it!.. please(?)
        >
            <DayWheel date={dateState.value}
                      changeDate={changeDate}

                      committer={dateState.committer}

                      dateFrom={dateFrom}
                      dateTo={dateTo}
            />
            <MonthWheel date={dateState.value}
                        changeDate={changeDate}

                        committer={dateState.committer}

                        dateFrom={dateFrom}
                        dateTo={dateTo}

                        isFullName={(sizes.width / sizes.height) > 5}
            />
            <YearWheel date={dateState.value}
                       changeDate={changeDate}

                       committer={dateState.committer}

                       dateFrom={dateFrom}
                       dateTo={dateTo}

            />
        </div>
    )
}