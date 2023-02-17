// for crossbrowser support.
// e.g. toLocaleDateString in edge returns string in 2/2/2002 format
export function getStringFromDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth()).padStart(2, '0');
    const year = String(date.getFullYear());

    return `${day}.${month}.${year}` //
}