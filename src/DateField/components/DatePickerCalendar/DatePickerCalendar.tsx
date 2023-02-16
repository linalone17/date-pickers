import React, {useCallback, useRef, useState} from 'react';


import {checkDatesEquality, copyDate} from "../../utils";
import {monthNames, weekDayNamesFromMonday as weekDayNames} from "../../constants";

import cn from 'classnames';
import styles from './DatePickerCalendar.module.scss'

interface DatePickerCalendarProps {
    isOpened: boolean;

    date: Date;
    onDatePickerChange: (date: Date) => void;

    initialDate?: Date;
    dateFrom?: Date;
    dateTo?: Date;
}

interface CalendarProps {
    date: Date;
    changeDate: (date: Date) => void;
}

interface MenuBarProps {
    date: Date;
    changeDate: (date: Date) => void;
}

function getNextDay (date: Date): Date{
    date = copyDate(date);
    date.setDate(date.getDate() + 1);
    return date
}

function getWeeksArray(year: number): Array<Array<Date>> {
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
            console.log()
            day = new Date(
                firstDate.getFullYear() - 1,
                11,
                31 - (firstDate.getDay() - 2)
            )
            console.log(day.getDay())
    }

    const weekArray = new Array(53);

    for (let week = 0; week < 53; week++) {
        const arr = new Array(7);
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            arr[dayOfWeek] = day; //anyway immutable, getNextDay returns new Date
            day = getNextDay(day);
        }
        weekArray[week] = arr;
    }
    return weekArray
}

const Calendar: React.FC<CalendarProps> = ({date, changeDate}) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const getWeeksArrayMemoized = useCallback(getWeeksArray, [year]);
    const weeksArray = getWeeksArrayMemoized(year);

    const currentDayRef = useRef<HTMLDivElement | null>(null);

    function changeCurrent (target: HTMLDivElement, day: Date) {
        if (currentDayRef.current) {
            currentDayRef.current.classList.remove(styles.current);
        }

        currentDayRef.current = target;
        currentDayRef.current.classList.add(styles.current);
    }


    return (
        <div className={styles.Calendar}>
            <div className={styles.head}>
                {weekDayNames.map((day) => {
                    return <div key={day.veryShort} className={styles.day}>{day.veryShort}</div>
                })}
            </div>
            <div className={styles.body}>
                <div>prev year</div>
                {weeksArray.map((week, index) => {

                    return <div className={cn(
                        styles.week
                    )}>
                        {week.map((day) => {

                            return <div
                                className={cn(
                                    styles.day,
                                    {
                                        [styles.active]: checkDatesEquality(day, date),
                                        [styles.currentMonth]: day.getMonth() === month
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
                <div>next year</div>
            </div>
        </div>
    )
}

const MenuBar: React.FC<MenuBarProps> = ({date, changeDate}) => {
    const [month, setMonth] = useState<number>(date.getMonth());

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
                            setMonth(month - 1)
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
                             setMonth(month + 1)
                         }
                     }}
                >{'>'}</div>
            </div>

            <div className={styles.yearPicker}>
                <input type="text" maxLength={4} defaultValue={new Date().getFullYear()}/>
            </div>
        </div>
    )
}
export const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({
    isOpened, date, onDatePickerChange, initialDate, dateFrom, dateTo
}) => {
    const [dateState, setDateState] = useState<Date>();

    function changeDate (date: Date) {
        setDateState(date);
        onDatePickerChange(date);
    }

    return (
        <div className={cn(
            styles.DatePicker,
            {[styles.opened]: isOpened}
        )}>
            <MenuBar date={date} changeDate={changeDate}/>
            <Calendar date={date} changeDate={changeDate}/>
        </div>
    )
}