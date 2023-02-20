import React, {useState} from 'react';
import {DateField} from "./ui/components/DateField";
import styles from './App.module.scss';

export default function App () {
    const [width, setWidth] = useState<string>('400');
    const [height, setHeight] = useState<string>('60');

    function handleWidthChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (!event.target.value.match(/^[0-9]{0,4}$/)) return;

        setWidth(event.currentTarget.value)
    }

    function handleHeightChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (!event.target.value.match(/^[0-9]{0,4}$/)) return;

        setHeight(event.currentTarget.value)
    }

    return (
        <div className={styles.App}>
            <h1>Wheels</h1>
            <div className={styles.mark}>
                <div>standard</div>
            </div>
            <DateField initialDate={new Date()}
                       dateFrom={new Date(2022, 4, 14)}
                       dateTo={new Date(2024, 5, 6)}
                       variant={'wheels'}/>
            <div className={styles.mark}>
                <div>short / less width</div>
            </div>
            <DateField initialDate={new Date()}
                       variant={'wheels'}
                       sizes={{
                           height: 60,
                           width: 300
                       }}
            />
            <div className={styles.mark}>
                <div>smaller size</div>
            </div>
            <DateField initialDate={new Date()}
                       variant={'wheels'}
                       sizes={{
                           height: 40,
                           width: 200
                       }}
            />
            <div className={styles.mark}>
                <div>Custom size</div>
            </div>
            <div className={styles.sizes}>
                <div className={styles.size}>
                    <legend>width</legend>
                    <input type="text"
                           value={width}
                           onChange={handleWidthChange}/>
                </div>
                <div>x</div>
                <div className={styles.size}>
                    <legend>height</legend>
                    <input type="text"
                           value={height}
                           onChange={handleHeightChange}
                    />
                </div>
            </div>
            <DateField initialDate={new Date()}
                       variant={'wheels'}
                       sizes={{
                           height: Number(height),
                           width: Number(width)
                       }}
            />
            <h1>calendar(Work In Progress)</h1>
            <DateField initialDate={new Date()} variant={'calendar'}/>
        </div>
    )
}