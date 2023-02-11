import React, {useEffect, useRef} from 'react';


export function useOutsideClick(
    elementRef: React.RefObject<HTMLElement>,
    onOutsideClick: Function
) {
    function handleClick (event: UIEvent) {
        if (!elementRef || !elementRef.current) return;
        if (!elementRef.current.contains(event.target as Node)) {
            onOutsideClick();
        }
    }

    useEffect(() => {
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('click', handleClick)
        }
    }, [elementRef])

}