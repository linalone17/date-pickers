import React from 'react';
import {DateField} from "./DateField";
import styles from './App.module.scss';

export default function App () {

    return (
        <div className={styles.App}>
            <h2>calendar</h2>
            <DateField initialDate={new Date()} variant={'calendar'}/>
            <h2>wheels</h2>
            <DateField initialDate={new Date()} variant={'wheels'}/>
        </div>
    )
}