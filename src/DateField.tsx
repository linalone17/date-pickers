import React, {useState} from 'react';

import styles from './DateField.module.scss';
import calendar from './calendar.svg';

import {DatePicker} from "./DatePicker";


export function DateField () {
    const [value, setValue] = useState<string>();
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setValue(event.currentTarget.value)
    }

    function handleDateChangeFromDatePicker () {

    }
    return (
        <div className={styles.DateField}>
            <input className={styles.Input} type="text" onChange={handleChange}/>
            <img className={styles.icon} src={calendar} alt=""/>
            <DatePicker onChange={handleDateChangeFromDatePicker} isOpened={true}/>
        </div>
    )
}