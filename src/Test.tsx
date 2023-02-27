import React, {useEffect, useReducer, useRef, useState} from 'react';
import styles from './Test.module.scss';
import {Slider} from "./ui/components/Slider";

interface Props {
    prop: any;
}
function Outer ({prop}:Props) {
    const [_, setCount] = useState<number>(0);
    const ref = useRef<number | string>('1');

    const day = prop.day;
    const month = prop.month;

    useEffect(() => {
        console.log('useEffect', month);
    }, [day])


    function handleClick() {
        // setCount(prev => prev + 1);
        prop.month += 1;
    }

    function handleRender() {
        setCount(prev => prev + 1);
    }
    console.log('Outer call', prop)
    return <div className={styles.first}>
        <Inner prop={ref}/>
        <button onClick={handleClick}>Outer</button>
        <button onClick={handleRender}>Render</button>
    </div>
}

function Inner ({prop}:Props) {
    const [_, setCount] = useState<number>(0);

    function handleClick() {
        setCount(prev => prev + 1)
    }
    console.log('Inner call', prop)
    return <div className={styles.second}>
        <div>{prop.current}</div>
        <button onClick={handleClick}>Inner</button>
    </div>
}

const mutableProp = {
    day: 10,
    month: 10
};

// export default function Test () {
//     const [_, setCount] = useState<number>(0);
//
//     function handleClick() {
//         setCount(prev => prev + 1);
//         mutableProp.day += 1;
//     }
//     console.log('Test call')
//     return (
//         <div className={styles.Test}>
//             <Outer prop={mutableProp}/>
//             <button onClick={handleClick}>Test</button>
//         </div>
//     )
// }

function useForceUpdate() {
    const [_, forceUpdate] = useReducer(p => !p, false);
    return forceUpdate;
}

export default function Test () {

    const a = useRef(0);
    const forceUpdate = useForceUpdate();

    function incr() {
        a.current++
    }

    return <div>
        <button onClick={incr}>{a.current}</button>
        <button onClick={forceUpdate}>update</button>
    </div>

}