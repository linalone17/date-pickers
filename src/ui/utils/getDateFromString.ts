import {getMonthDaysAmount} from "./getMonthDaysAmount";

// matches only "12.02.2012" format, otherwise returns null
// if the date is invalid(e.g. 12.00.2004 or 31.02.2004) returns null
export function getDateFromString(dateString: string): Date | null {
    if (!dateString.match(/^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$/)) {
        return null
    }

    let [day, month, year] = dateString.split('.').map(str => parseInt(str));
    month = month - 1;

    if (
        year === 0 ||

        month < 0 ||
        month > 11 ||

        day <= 0 ||
        day > getMonthDaysAmount(month, year)
    ) {
        return null
    }

    return new Date(year, month, day);
}