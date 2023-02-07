import React, {useState, useEffect} from 'react';
import cn from 'classnames';
import styles from './DatePicker.module.scss';

interface DatePickerProps {
    onChange: (date: Date) => void;
    isOpened: boolean;
}

interface WheelProps {
    date: Date;
    changeDate: (date: Date) => void;
}

function arrayIncrementFill (start: number, end: number): Array<number> {
    const array = Array(end - start + 1);
    for (let i = 0; array.length; i++) {
        array[i] = i + start;
    }
    return array
}

const YearWheel: React.FC<WheelProps> = ({date, changeDate}) => {

    function createYearValuesArray(year: number): Array<number> {
        return arrayIncrementFill(year - 10, year + 10);
    }

    function changeDateYear(year: number) {
        changeDate(
            new Date(date.setFullYear(year))
        )
    }

    return (
        <div className={styles.wheel}>
            {createYearValuesArray(date.getFullYear()).map((value) => {
                return <div
                    className={cn(
                        styles.item, {[styles.active]: value === date.getFullYear()}
                    )}
                    key={value}
                    onClick={() => {changeDateYear(value)}}
                >value</div>
            })}
        </div>
    )
}

const MonthWheel: React.FC<WheelProps> = ({date}) => {
    return (
        <div className={styles.wheel}></div>
    )
}

const DayWheel: React.FC<WheelProps> = ({date}) => {
    return (
        <div className={styles.wheel}></div>
    )
}

export const DatePicker: React.FC<DatePickerProps> = ({onChange, isOpened}) => {
    const [date, setDate] = useState<Date>(new Date());
    const changeDate = (date: Date) => {
        setDate(date);
        onChange(date);
    }

    return (
        <div className={styles.DatePicker}>
            <YearWheel date={date} changeDate={changeDate}/>
            <MonthWheel date={date} changeDate={changeDate}/>
            <DayWheel date={date} changeDate={changeDate}/>
            <div>Hell yeah</div>
        </div>
    )
}