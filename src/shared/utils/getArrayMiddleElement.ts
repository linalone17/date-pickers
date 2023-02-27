export function getArrayMiddleElement(arrayLike: ArrayLike<any>) {
    return arrayLike[Math.floor(arrayLike.length/2)]
}