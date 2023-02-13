export function createArrayFromInterval (start: number, end: number): Array<number> {
    const array = Array(end - start + 1);
    for (let i = 0; i < array.length; i++) {
        array[i] = i + start;
    }
    return array
}