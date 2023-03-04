import React, {useEffect, useRef, useState} from 'react';

import styles from './DateField.module.scss';
import calendar from '../../assets/img/calendar.svg';

import {DatePickerWheels} from "./DatePickerWheels";
import {DatePickerCalendar} from "./DatePickerCalendar";
import {useOutsideClick} from "../../../shared/hooks";
import {copyDate, getDateFromString, getStringFromDate} from "../../utils";


interface Sizes {
    height: number,
    width: number
}

interface DateFieldProps {
    variant: 'wheels' | 'calendar';
    initialDate?: Date;
    dateFrom?: Date;
    dateTo?: Date;

    sizes?: Sizes;
    alwaysOpened?: boolean;
}

const defaultSizes = {
    height: 60,
    width: 400
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

    } else if (                                                //  '123' => '12.3' fires on typing
        newValue.match(/^[0-9]{3}$/g) &&
        newValue.length > oldValue.length
    ) {
        newValue = `${newValue.slice(0, 2)}.${newValue.slice(-1)}`;

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

    } else if (                                               //  '03.102' => '03.10.2' fires on typing
        newValue.match(/^[0-9]{2}\.[0-9]{3}$/g) &&
        newValue.length > oldValue.length
    ) {
        newValue = `${newValue.slice(0, 5)}.${newValue.slice(-1)}`;

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
    variant,
    sizes,
    alwaysOpened
}) => {
    const [rawInputValue, setRawInputValue] = useState<string>(
        initialDate ? getStringFromDate(initialDate) : ''
    );

    sizes = sizes ?? defaultSizes;

    // used only to change DatePicker props, may differ from datepicker dateState
    const [datePickerProps, setDatePickerProps] = useState<Date>(initialDate ? initialDate : new Date());

    const [isDatePickerOpened, setIsDatePickerOpened] = useState<boolean>(false);
    const dateFieldRef = useRef<HTMLInputElement>(null);

    useOutsideClick(dateFieldRef, () => {
        setIsDatePickerOpened(false);
    })

    // closes datepicker dropdown on tab
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;
            setIsDatePickerOpened(false);
        }

        document.addEventListener('keydown', handler);
        return () => {
            document.removeEventListener('keydown', handler)
        };
    },[])

    // normalize input -> change input field -> if valid change datepicker props
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = normalizeRawInputValue(event.target.value, rawInputValue);
        if (typeof value !== 'undefined') {
            const date = getDateFromString(value);

            //date value string is invalid
            if (!date) {
                setRawInputValue(value);
                return;
            }

            if (dateFrom && date < dateFrom) {
                setDatePickerProps(copyDate(dateFrom));
                setRawInputValue(getStringFromDate(dateFrom));
                return;
            }
            if (dateTo && date > dateTo) {
                setDatePickerProps(copyDate(dateTo));
                setRawInputValue(getStringFromDate(dateTo))
                return;
            }
            console.log('date in interval: ', value, date)
            setDatePickerProps(date);
            setRawInputValue(value);
        }
    }

    function handleDateChangeFromDatePicker (date: Date) {
        setRawInputValue(getStringFromDate(date));
    }

    function switchIsDatePickerOpened () {
        setIsDatePickerOpened((prev) => (!prev));
    }

    return (
        <div
            className={styles.DateField}
            ref={dateFieldRef}
            style={{
                height: `${sizes.height}px`,
                width: `${sizes.width}px`,
                fontSize: `${sizes.height/2}px`
            }}
        >
            <input className={styles.Input}
                   type="text"
                   onChange={(e) => {handleChange(e)}}
                   placeholder={getStringFromDate(new Date())}
                   value={rawInputValue}
                   onFocus={() => {
                       setIsDatePickerOpened(true)
                   }}
            />
            <img className={styles.icon} src={calendar} onClick={switchIsDatePickerOpened}/>
            <div className={styles.DatePicker}>
                {variant === 'wheels' ?
                    <DatePickerWheels
                        isOpened={alwaysOpened ? alwaysOpened : isDatePickerOpened}

                        date={datePickerProps}
                        onDatePickerChange={handleDateChangeFromDatePicker}
                        initialDate={initialDate}
                        dateFrom={dateFrom}
                        dateTo={dateTo}

                        sizes={sizes}
                    />
                    :
                    <DatePickerCalendar
                        isOpened={alwaysOpened ? alwaysOpened : isDatePickerOpened}

                        date={datePickerProps}
                        onDatePickerChange={handleDateChangeFromDatePicker}
                        initialDate={initialDate}
                        dateFrom={dateFrom}
                        dateTo={dateTo}

                        sizes={sizes}
                    />

                }
            </div>
        </div>
    )
}