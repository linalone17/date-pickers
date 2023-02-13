import React from 'react';
import {DateField} from "./DateField/DateField";
import styles from './App.module.scss';

export default function App () {

    return (
        <div className={styles.App}>
            <div>Choose a date</div>
            <DateField initialDate={new Date()}/>
        </div>
    )
}