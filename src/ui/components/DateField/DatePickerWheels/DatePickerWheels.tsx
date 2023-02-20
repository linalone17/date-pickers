import React, {useState, useEffect, useRef, useCallback} from 'react';

import {
    createArrayFromInterval,
    getMonthDaysAmount,
    copyDate,
    getWeekDayName
} from '../../../utils';

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
    flow: 'up' | 'down';

    changeDate: (date: Date) => void;
    dateFrom?: Date;
    dateTo?: Date;
}

interface MonthWheelProps extends WheelProps {
    isFullName: boolean;
}

//all the sizes are in strong dependency with fontSize
// const defaultFontSize = 25; //px
// const wheelItemSize = 1.55*defaultFontSize; //px

// YearWheel logic

function createYearValuesArray(year: number, yearFrom?:number, yearTo?:number): Array<number> {
    console.log(year, yearFrom, yearTo)
    let intervalStart = year - 40;
    if (yearFrom && intervalStart < yearFrom) {
        intervalStart = yearFrom;
    }

    let intervalEnd = year + 40;
    if (yearTo && intervalEnd > yearTo) {
        intervalEnd = yearTo;
    }
    return createArrayFromInterval(intervalStart, intervalEnd);
}

const YearWheel: React.FC<WheelProps> = ({
    date,
    changeDate,

    flow,

    dateFrom,
    dateTo
}
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
    const wheelItemSize = wheelRef.current ? wheelRef.current.scrollHeight / wheelRef.current.childElementCount : null;

    const isScrollAllowedRef = useRef<boolean>(true);

    useEffect(() => {
        if (flow === 'down') {
            scrollTo(yearValuesArray.indexOf(year));
        }
    }, [wheelItemSize, year])


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

    flow,

    dateFrom,
    dateTo,
    isFullName
}) => {
    const wheelRef = useRef<HTMLDivElement>(null);
    const wheelItemSize = wheelRef.current ? wheelRef.current.scrollHeight / wheelRef.current.childElementCount : null;

    const year = date.getFullYear();
    const month = date.getMonth();

    const createMonthValuesArrayMemo = useCallback(createMonthValuesArray, [year]);
    const monthValuesArray = createMonthValuesArrayMemo(date, dateFrom, dateTo);

    const isScrollAllowedRef = useRef<boolean>(true);

    useEffect(() => {
        if (flow === 'down') {
            scrollTo(month);
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
        changeDate(
            new Date(copyDate(date).setMonth(month))
        )
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

    flow,

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
        if (flow === 'down') {
            scrollTo(date.getDate() - 1);
            console.log('scrolled to ', date.getDate() - 1)
        }
    }, [wheelItemSize, date])

    useEffect(() => {
    })

    function scrollTo(index: number) {
        if (wheelRef.current) {
            isScrollAllowedRef.current = false;
            console.log('should scroll ', (index))
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
        changeDate(
            new Date(copyDate(date).setDate(day))
        )
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
        {value: Date, flow: 'up' | 'down'}
    >({
        value: initialDate ? initialDate : new Date(),
        flow: 'down'
    });

    const fontSize = sizes.height*5/12; // all the sizes depend on fontSize

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
             style={{fontSize: `${fontSize}px`}} // you are not to change it!.. please(?)
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

                        isFullName={(sizes.width / sizes.height) > 5}
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