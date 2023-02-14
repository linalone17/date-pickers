import React, {useReducer, useRef, useState} from 'react';

import styles from './DateField.module.scss';
import calendar from '../img/calendar.svg';

import {DatePickerWheels as DatePicker} from "../DatePickerWheels";
import {useOutsideClick} from "../hooks";
import {getDateFromString} from "../lib/utils";

interface DateFieldProps {
    initialDate?: Date;
    dateFrom?: Date;
    dateTo?: Date;
}

// TODO: make simpler with same logic
function normalizeRawInputValue(newValue: string, oldValue:string): string | void {
    if (newValue.length > 10) {
        newValue = newValue.slice(0, 10);
    }
    if (newValue.match(/[^0-9.]/g)) {                   // skip if not (0-9 or dot)
        return;

    } else if (newValue === '.') {                             // '.' => '04.', where 04 - today
        newValue = `${new Date().getDate()}.`;

    } else if (                                                //  '12' => '12.' fires on typing
        newValue.match(/^[0-9]{2}$/g) &&
        newValue.length > oldValue.length
    ) {
        newValue = `${newValue}.`;

    } else if (                                                //  '12.' => '12' fires on deleting
        newValue.match(/^[0-9]{2}\.$/g) &&
        newValue.length < oldValue.length
    ) {
        newValue = newValue.slice(0, -1)
    } else if (newValue.match(/^[0-9]\.$/g)) {         //  '5.' => '05.'
        newValue = `0${newValue}`;

    } else if (newValue.match(/^[0-9]{2}\.\.$/g)) {    //  '12..' => '12.03', where 03 - current(today) month
        const month = String(new Date().getMonth() + 1).padStart(2, '0')
        newValue = `${newValue.slice(0, -1)}${month}.`;

    } else if (                                               //  '03.10' => '03.10.' fires on typing
        newValue.match(/^[0-9]{2}\.[0-9]{2}$/g) &&
        newValue.length > oldValue.length
    ) {
        newValue = `${newValue}.`;

    } else if (                                               //  '03.10.2' => '03.10' fires on deleting
        newValue.match(/^[0-9]{2}\.[0-9]{2}\.$/g) &&
        newValue.length < oldValue.length
    ) {         //  '03.10' => '03.10.'
        newValue = newValue.slice(0, -1);

    } else if (newValue.match(/^[0-9]{2}\.[0-9]\.$/g)) {          // '15.3.' => '15.03.'
        newValue = `${newValue.slice(0, 3)}0${newValue.slice(3, 4)}.`;

    } else if (newValue.match(/^[0-9]{2}\.[0-9]{2}\.\.$/g)) {     //12.12.. => 12.12.2012 where 2012 is current(today) year
        newValue = `${newValue.slice(0, -1)}${new Date().getFullYear()}`;
    }

    return newValue
}


export const DateField: React.FC<DateFieldProps> = ({
    initialDate,
    dateFrom,
    dateTo,
}) => {
    const [rawInputValue, setRawInputValue] = useState<string>(
        initialDate ? initialDate.toLocaleDateString() : ''
    );
    const [date, setDate] = useState<Date>(initialDate ? initialDate : new Date());
    const [isDatePickerOpened, setIsDatePickerOpened] = useState<boolean>(false);
    const ref = useRef<HTMLInputElement>(null);

    useOutsideClick(ref, () => {
        setIsDatePickerOpened(false);
    })

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = normalizeRawInputValue(event.target.value, rawInputValue);
        if (typeof value !== 'undefined') {
            setRawInputValue(value);
            const date = getDateFromString(value);
            console.log('here', value, date)
            if (date) {
                setDate(date);
            }
        }
    }

    function handleDateChangeFromDatePicker (date: Date) {
        setRawInputValue(date.toLocaleDateString());
    }

    function switchIsDatePickerOpened () {
        setIsDatePickerOpened((prev) => (!prev));
    }
    return (
        <div className={styles.DateField} ref={ref}>
            <input className={styles.Input}
                   type="text"
                   onChange={(e) => {handleChange(e)}}
                   placeholder={new Date().toLocaleDateString()}
                   value={rawInputValue}
                   onFocus={() => {
                       setIsDatePickerOpened(true)
                   }}
            />
            <img className={styles.icon} src={calendar} onClick={switchIsDatePickerOpened}/>
            <div className={styles.DatePicker}>
                <DatePicker
                    isOpened={isDatePickerOpened}

                    date={date}
                    onDatePickerChange={handleDateChangeFromDatePicker}
                    initialDate={initialDate}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                />
            </div>
        </div>
    )
}