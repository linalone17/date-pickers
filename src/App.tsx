import React from 'react';
import {DateField} from "./ui/components/DateField";
import styles from './App.module.scss';

export default function App () {

    return (
        <div className={styles.App}>
            <h2>calendar</h2>
            <DateField initialDate={new Date()} variant={'calendar'}/>
            <h2>wheels</h2>
            <DateField initialDate={new Date()}
                       // dateFrom={new Date(2022, 4, 14)}
                       // dateTo={new Date(2024, 5, 6)}
                       variant={'wheels'}/>
        </div>
    )
}