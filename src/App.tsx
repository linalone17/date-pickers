import React from 'react';
import {DateField} from "./DateField/DateField";
import styles from './App.module.scss';

export default function App () {

    return (
        <div className={styles.App}>
            <div>Выберите дату</div>
            {/*<DateField/>*/}
            {/*<DateField/>*/}
            <DateField/>
        </div>
    )
}