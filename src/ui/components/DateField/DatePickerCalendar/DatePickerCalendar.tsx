import React, {useCallback, useEffect, useRef, useState} from 'react';


import {checkDatesEquality, copyDate, getMonthDaysAmount} from "../../../utils";
import {monthNames, weekDayNamesFromMonday as weekDayNames} from "../../../constants";

import cn from 'classnames';
import styles from './DatePickerCalendar.module.scss'


interface DatePickerCalendarProps {
    isOpened: boolean;

    date: Date;
    onDatePickerChange: (date: Date) => void;

    initialDate?: Date;
    dateFrom?: Date;
    dateTo?: Date;

    sizes: {
        height: number,
        width: number
    }
}

interface CalendarProps {
    date: Date;
    changeDate: (date: Date) => void;
}

interface MenuBarProps {
    date: Date;
    changeDate: (date: Date) => void;
}

type Weeks = Array<Array<Date>>;
type MonthStarts = Array<number>;

const weekElementSize = 50;
const scrollMarginTop = 30;
// const padding = weekElementSize/10;

function getNextDay (date: Date): Date {
    date = copyDate(date);
    date.setDate(date.getDate() + 1);
    return date
}

function getWeeksAndMonthStarts(year: number): [Weeks, MonthStarts] {
    const firstDate = new Date(year, 0, 1);

    let day;
    // initially day === first day of the first week of the year(not the first date of the year);
    switch (firstDate.getDay()) {
        case 0:
            day = new Date(
                firstDate.getFullYear() - 1,
                11,
                26
            );
            break;
        case 1:
            day = firstDate;
            break;
        default:
            day = new Date(
                firstDate.getFullYear() - 1,
                11,
                31 - (firstDate.getDay() - 2)
            )
    }

    const weeks = new Array(53);
    const monthStarts = [];

    for (let week = 0; week < 53; week++) {
        const arr = new Array(7);
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            arr[dayOfWeek] = day; //anyway immutable, getNextDay returns new Date
            if (day.getDate() === 1 && monthStarts.length < 12) {
                monthStarts.push(week);
            }
            day = getNextDay(day);
        }
        weeks[week] = arr;
    }
    return [weeks, monthStarts]
}

const Calendar: React.FC<CalendarProps> = ({date, changeDate}) => {

    const [month, setMonth] = useState<number>(date.getMonth());
    const [year, setYear] = useState<number>(date.getFullYear());

    const getWeeksAndMonthStartsMemo = useCallback(getWeeksAndMonthStarts, [year]);


    const [prevYearWeeksPreload, setPrevYearWeeksPreload] = useState<Weeks>(
        getWeeksAndMonthStartsMemo(year - 1)[0].slice(-7)
    );

    const [nextYearWeeksPreload, setNextYearWeeksPreload] = useState<Weeks>(
        getWeeksAndMonthStartsMemo(year + 1)[0].slice(0, 7)
    );
    const calendarRef = useRef<HTMLDivElement>(null);
    const prevYearPreloadRef = useRef<HTMLDivElement>(null);

    const [weeks, monthStarts] = getWeeksAndMonthStartsMemo(year);

    //
    useEffect(() => {
        setMonth(date.getMonth());
        setYear(date.getFullYear());

        changePreloadsByYear(year - 1);
    },[date])

    function changePreloadsByYear(year: number) {
        setPrevYearWeeksPreload(
            getWeeksAndMonthStartsMemo(year)[0].slice(-7)
        );
        setNextYearWeeksPreload(
            getWeeksAndMonthStartsMemo(year)[0].slice(0, 7)
        );
    }

    // initial scroll on mount
    useEffect(() => {
        if (!calendarRef || !calendarRef.current) return;
        calendarRef.current.scrollTo({top: 600});
    },[calendarRef]);

    // intersection observer init
    useEffect(() => {
        if (!calendarRef.current || !prevYearPreloadRef.current) return;

        const options = {
            root: calendarRef.current,
            rootMargin: '0px',
            threshold: 0.9,
        }

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    observer.unobserve(entry.target);
                    // calendarRef.current!.scrollTo({top: 0, behavior: 'smooth'});
                    setTimeout(() => {
                        setYear(prev => prev - 1)
                        calendarRef.current!.scrollTo({top: 3030, behavior: 'auto'});
                    }, 800)
                }
            })
        }, options)

        return () => {
            observer.disconnect();
        }
    },[calendarRef]);

    useEffect(() => {

    }, [year])



    function changeCurrent (target: HTMLDivElement, day: Date) {
        changeDate(copyDate(day));
    }

    return (
        <div className={styles.Calendar}>
            <div className={styles.head}>
                {weekDayNames.map((day) => {
                    return <div key={day.veryShort} className={styles.day}>{day.veryShort}</div>
                })}
            </div>
            <div className={styles.body}
                 ref={calendarRef}
            >
                {prevYearWeeksPreload.map((week) => {
                    return <div className={cn(
                        styles.prevYearWeeksPreload,
                        styles.week
                    )}>
                        {week.map((day) => {
                            return <div className={styles.day}>
                                <div className={styles.value}>{day.getDate()}</div>
                            </div>
                        })}
                    </div>
                })}

                <div
                    className={styles.prevYearContainer}
                    ref={prevYearPreloadRef}
                >
                    <div className={styles.year}>
                        <div className={styles.value}>{year}</div>
                    </div>
                </div>

                {weeks.map((week, index) => {
                    return <div className={cn(
                        styles.week,
                        {
                            [styles.scrollSnapTarget]: monthStarts.includes(index)
                        }
                    )}>
                        {week.map((day) => {

                            return <div
                                className={cn(
                                    styles.day,
                                    {
                                        [styles.current]: checkDatesEquality(day, date),
                                        [styles.ofCurrentMonth]: day.getMonth() === month
                                    }
                                )}
                                onClick={(event) => {
                                    changeCurrent(event.currentTarget, day)
                                }}
                            >
                                <div className={styles.value}>{day.getDate()}</div>
                            </div>
                        })}
                    </div>
                })}

                <div className={styles.nextYearContainer}>
                    <div className={styles.year}>
                        <div className={styles.value}>{year + 1}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const MenuBar: React.FC<MenuBarProps> = ({date, changeDate}) => {
    const month = date.getMonth();

    const [year, setYear] = useState<string>(date.getFullYear().toString());

    function changeMonth(month: number) {
        changeDate(
            new Date(copyDate(date).setMonth(month))
        )
    }

    // changes date to year arg, same month, same day if exists
    function changeYear(year: number) {
        if (year === date.getFullYear()) return;

        const monthDaysAmount = getMonthDaysAmount(date.getMonth(), year);

        changeDate(
            new Date(
                year,
                date.getMonth(),
                date.getDate() <= monthDaysAmount ? date.getDate() : monthDaysAmount)
        )

    }
    function handleChange(value: string) {
        setYear(value);

        if (value.match(/^[0-9]{4}$/)) {
            changeYear(parseInt(value));
        }
    }
    return (
        <div className={styles.MenuBar}>
            <div className={styles.monthPicker}>
                <div
                    className={cn(
                        styles.arrow,
                        {[styles.disabled]: month === 0}
                    )}
                    onClick={() => {
                        if (month > 0) {
                            changeMonth(month - 1)
                        }
                    }}
                >{'<'}</div>

                <div className={styles.month}>
                    <div className={styles.monthName}>
                        {monthNames[month]}
                    </div>
                </div>

                <div
                    className={cn(
                        styles.arrow,
                        {[styles.disabled]: month === 11}
                    )}
                     onClick={() => {
                         if (month < 11) {
                             changeMonth(month + 1)
                         }
                     }}
                >{'>'}</div>
            </div>

            <div className={styles.yearPicker}>
                <input type="text"
                       maxLength={4}
                       value={year}
                       onChange={(event) => {
                           handleChange(event.target.value)
                       }}
                />
            </div>
        </div>
    )
}

export const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({
    isOpened,

    date,
    onDatePickerChange,

    initialDate,
    dateFrom,
    dateTo,

    sizes
}) => {
    const [dateState, setDateState] = useState<Date>(initialDate ? initialDate : new Date());

    useEffect(() => {
        setDateState(date)
    }, [date])

    function changeDate (date: Date) {
        setDateState(date);
        onDatePickerChange(date);
    }

    return (
        <div className={cn(
            styles.DatePicker,
            {[styles.opened]: isOpened}
        )}>
            <MenuBar date={dateState} changeDate={changeDate}/>
            <Calendar date={dateState} changeDate={changeDate}/>
        </div>
    )
}