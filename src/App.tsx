import React from 'react';
import {DateField} from "./ui/components/DateField";
import styles from './App.module.scss';

export default function App () {

    return (
        <div className={styles.App}>
            <h2>wheels</h2>
            <h3>standard</h3>
            <DateField initialDate={new Date()}
                       dateFrom={new Date(2022, 4, 14)}
                       dateTo={new Date(2024, 5, 6)}
                       variant={'wheels'}/>
            <h3>less width</h3>
            <DateField initialDate={new Date()}
                       variant={'wheels'}
                       sizes={{
                           height: 60,
                           width: 300
                       }}
            />
            <h3>smaller</h3>
            <DateField initialDate={new Date()}
                       variant={'wheels'}
                       sizes={{
                           height: 40,
                           width: 200
                       }}
            />
            <h2>calendar</h2>
            <DateField initialDate={new Date()} variant={'calendar'}/>
        </div>
    )
}