import React, {useEffect, useRef, useState} from 'react';

import cn from 'classnames';
import styles from './Slider.module.scss';

import {Nullable} from "../../../shared/typings/utils";

interface Coords {
    x: number;
    y: number;
}

export const Slider: React.FC = () => {
    const isScale = true;

    const bodyRef = useRef<HTMLDivElement>(null);
    const coordsRef = useRef<Nullable<Coords>>(null);

    const [isDragged, setIsDragged] = useState<boolean>(false);

    const [sliderPosition, setSliderPosition] = useState<number>(0);
    const width = 500; //px

    function handleDrag (event: React.DragEvent) {
        coordsRef.current = {
            x: event.pageX,
            y: event.pageY
        }

        const rect = bodyRef.current!.getBoundingClientRect();

        const left = rect.left;
        const right = rect.right;
        console.log(`left: ${left} right:${right} curr:${coordsRef.current.x}`)
        if (
            coordsRef.current &&
            coordsRef.current!.x >= left &&
            coordsRef.current!.x <= right
        ) {
            setSliderPosition(coordsRef.current!.x - left);
        }
    }

    function handleClick (event: React.MouseEvent) {
        const rect = bodyRef.current!.getBoundingClientRect();
        const left = rect.left;
        const right = rect.right;

        if (
            event.clientX >= left &&
            event.clientX <= right
        ) {
            setSliderPosition(event.clientX - left);
        }

    }

    function handleButtonClick (event: React.MouseEvent) {

    }
    return (
        <div className={styles.Slider}>
            <div className={styles.SliderBody}>
                <div className={styles.body} ref={bodyRef} onClickCapture={handleClick}>
                    <div
                        className={styles.progress}
                        style={{marginLeft: `${sliderPosition - width}px`}}
                    ></div>
                </div>

                <div
                    className={styles.indicator}
                    onDrag={handleDrag}
                    style={{marginLeft: `${sliderPosition}px`}}
                ></div>
                {/*<button>Click me</button>*/}
            </div>
            {isScale &&
                <div className={styles.SliderScale}>
                    <button onClick={handleButtonClick}>CLick me</button>
                </div>
            }
        </div>
    )
}