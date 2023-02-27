import React, {useState, useEffect, useRef, useCallback} from 'react';

import {
    getMonthDaysAmount,
    copyDate,
    getWeekDayName,
    getStringFromDate
} from '../../../utils';

import {
    createArrayFromInterval,
    getArrayMiddleElement
} from "../../../../shared/utils";

import {Nullable} from "../../../../shared/typings/utils";

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

interface WheelProps {
    date: Date;
    withScroll: boolean;

    changeDate: (date: Date, withScroll?: boolean) => void;
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

    withScroll,

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
        if (withScroll) {
            scrollTo(yearValuesArray.indexOf(year));
        }
    }, [wheelItemSize, year]);

    const intersectionObserverRef = useRef<Nullable<IntersectionObserver>>(null);
    // Intersection Observer init
    useEffect(() => {
        if (!wheelRef.current) return;

        const options = {
            root: wheelRef.current,
            rootMargin: '0px',
            threshold: 1.0
        }

        const callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            let isIntersection = false;
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    isIntersection = true;
                    observer.unobserve(entry.target);

                    setYearValuesArray((prev) => {
                        const isUpscrolling = parseInt(entry.target.textContent!) < getArrayMiddleElement(prev);

                        if (isUpscrolling) {
                            return [
                                ...createYearValuesArray(
                                    prev[0] - 50,
                                    prev[0] - 1,
                                    yearFrom,
                                    yearTo
                                ),
                                ...prev.slice(0, -50)
                            ]
                        } else {
                            return [
                                ...prev.slice(50),
                                ...createYearValuesArray(
                                    prev[prev.length - 1] + 1,
                                    prev[prev.length - 1] + 50,
                                    yearFrom,
                                    yearTo
                                )
                            ]
                        }
                    })

                }
            })

            if (isIntersection) {
                entries.forEach(entry => observer.unobserve(entry.target));
            }
        }

        const observer = new IntersectionObserver(callback, options);
        intersectionObserverRef.current = observer;

        return () => {
            observer.disconnect();
        }
    }, [wheelRef])

    // Intersection Observer target change on list of years change
    useEffect(() => {
        if (!intersectionObserverRef.current || !wheelRef.current) return;
        const childLength = wheelRef.current.children.length;

        if (childLength < 85) return;

        const observer = intersectionObserverRef.current;
        const upperChild = wheelRef.current.children[19];
        const lowerChild = wheelRef.current.children[childLength - 20];
        console.log('intersection change', upperChild, lowerChild);

        observer.observe(upperChild);
        observer.observe(lowerChild);

    }, [intersectionObserverRef, yearValuesArray])

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

        changeDate(newDate)
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
// const monthValuesArray: Array<number> = createArrayFromInterval(0, 11);

const MonthWheel: React.FC<MonthWheelProps> = ({
    date,
    changeDate,

    withScroll,

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
        if (withScroll) {
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
        let withScroll = false;

        if (date.getDate() > daysAmount) {
            newDate.setDate(daysAmount);
            withScroll = true;
        } else {
            newDate.setDate(date.getDate());
        }

        if (dateFrom && newDate < dateFrom) {
            newDate.setMonth(dateFrom.getMonth());
            withScroll = true;
        }
        if (dateFrom && newDate < dateFrom) {
            newDate.setDate(dateFrom.getDate());
        }

        if (dateTo && newDate > dateTo) {
            newDate.setMonth(dateTo.getMonth());
            withScroll = true;
        }
        if (dateTo && newDate > dateTo) {
            newDate.setDate(dateTo.getDate());
        }
        console.log(getStringFromDate(newDate), 'withScroll: ', withScroll);

        changeDate(newDate, withScroll);
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
                        onClick={(e) => {
                            handleClick(e, value);
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

    withScroll,

    dateFrom,
    dateTo
}) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const createDayValuesArrayMemo = useCallback(createDayValuesArray, [month, year]);
    const dayValuesArray = createDayValuesArrayMemo(date, dateFrom, dateTo);

    const wheelRef = useRef<HTMLDivElement>(null);
    const wheelItemSize = wheelRef.current ? wheelRef.current.scrollHeight / wheelRef.current.childElementCount : null;

    const isScrollAllowedRef = useRef<boolean>(true);

    // initialize date
    useEffect(() => {
        if (withScroll) {
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
        changeDate(newDate)
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
        {value: Date, withScroll: boolean}
    >({
        value: initialDate ? initialDate : new Date(),
        withScroll: true
    });

    const fontSize = sizes.height*5/12; // all the sizes depend on fontSize

        useEffect(() => {
        setDateState({
            value: date,
            withScroll: true
        })
    }, [date]);

    const changeDate = (date: Date, withScroll: boolean = false) => {
        setDateState({
            value: date,
            withScroll: withScroll
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
                      withScroll={dateState.withScroll}

                      changeDate={changeDate}
                      dateFrom={dateFrom}
                      dateTo={dateTo}
            />
            <MonthWheel date={dateState.value}
                        withScroll={dateState.withScroll}

                        changeDate={changeDate}
                        dateFrom={dateFrom}
                        dateTo={dateTo}

                        isFullName={(sizes.width / sizes.height) > 5}
            />
            <YearWheel date={dateState.value}
                       withScroll={dateState.withScroll}

                       changeDate={changeDate}
                       dateFrom={dateFrom}
                       dateTo={dateTo}

            />
        </div>
    )
}