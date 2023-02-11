import React, {useReducer, useRef, useState} from 'react';

import styles from './DateField.module.scss';
import calendar from '../img/calendar.svg';

import {DatePicker} from "./DatePicker";
import {useOutsideClick} from "../hooks";

interface DateFieldProps {
    initialDate?: Date;
    dateFrom?: Date;
    dateTo?: Date;
}

interface DateReducerState {
    asString: string;
    asDate: Date;
}

type DateReducerAction = {
    type: 'setString',
    payload: string
} | {
    type: 'setDate',
    payload: Date
}

// TODO: change to regex
const dateStringRegExp = new RegExp('[^0-9.]|[1234567890]{9,}]', 'g');
function getDateFromString2(string:string): Date | void {
    if (string === '') {
        return
    }
    if (string.match(dateStringRegExp)) {
        return
    }

    const values = string.split('.');

    if (values.length > 3) {
        return
    }


}

function getDateFromString(string: string) {
    // @ts-ignore
    return new Date(...string.split('.').reverse())
}

function normalizeRawInputValue(value: string, date: Date): string | void {
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    if (value.match(/[^0-9.]/g)) {            // skip if not 0-9 or dot
        console.log('asd')
        return;
    } else if (value === '.') {                             // '.' => '04.', where 04 - current day
        value = `${date.getDate()}.`;

    } else if (value.match(/^[0-9]\.$/g)) {         //  '5.' => '05.'
        value = `0${value}`;

    } else if (value.match(/^[0-9]{2}\.\.$/g)) {    //  '12..' => '12.03', where 03 - current month
        const month = String(date.getMonth() + 1).padStart(2, '0')
        value = `${value.slice(0, -1)}${month}.`;

    } else if (value.match(/^[0-9]{2}\.[0-9]\.$/g)) { // '15.3.' => '15.03.'
        value = `${value.slice(0, 3)}0${value.slice(3, 4)}.`;

    } else if (value.match(/^[0-9]{2}\.[0-9]{2}\.\.$/g)) {
        value = `${value.slice(0, -1)}${date.getFullYear()}`;
    }

    return value
}

function dateReducerInit (date: Date): DateReducerState {
    return {
        asString: date.toLocaleDateString(),
        asDate: new Date(date)
    }
}

const dateReducer = (
    state: DateReducerState,
    action: DateReducerAction
): DateReducerState => {
    switch (action.type) {
        case "setString":
            return {
                asString: action.payload,
                asDate: getDateFromString(action.payload) ?? state.asDate
            }
        case "setDate":
            return {
                asString: action.payload.toLocaleDateString(),
                asDate: new Date(action.payload)
            }
    }
}

export const DateField: React.FC<DateFieldProps> = ({
    initialDate,
    dateFrom,
    dateTo
}) => {
    initialDate = initialDate ?? new Date();
    const [date, dispatchDate] = useReducer(dateReducer, initialDate, dateReducerInit);
    const [rawInputValue, setRawInputValue] = useState<string>(initialDate.toLocaleDateString());

    const [isDatePickerOpened, setIsDatePickerOpened] = useState<boolean>(false);

    const ref = useRef<HTMLInputElement>(null);
    useOutsideClick(ref, () => {
        setIsDatePickerOpened(false);
    })

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = normalizeRawInputValue(event.target.value, date.asDate);

        if (typeof value !== 'undefined') {
            setRawInputValue(value);
        }
    }

    function handleDateChangeFromDatePicker (date: Date) {
        setRawInputValue(date.toLocaleDateString());
        dispatchDate({
            type: 'setDate',
            payload: date
        })
    }

    function switchIsDatePickerOpened () {
        setIsDatePickerOpened((prev) => (!prev));
    }
    return (
        <div className={styles.DateField} ref={ref}>
            <input className={styles.Input}
                   type="text"
                   onChange={(e) => {handleChange(e)}}
                   value={rawInputValue}
                   onClick={() => {
                       setIsDatePickerOpened(true)
                   }}
            />
            <img className={styles.icon} src={calendar} onClick={switchIsDatePickerOpened}/>
            <div className={styles.DatePicker}>
                <DatePicker
                    isOpened={isDatePickerOpened}

                    date={date.asDate}
                    setDate={handleDateChangeFromDatePicker}

                    initialDate={initialDate}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                />
            </div>
        </div>
    )
}