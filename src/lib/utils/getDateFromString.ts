import {getMonthDaysAmount} from "./getMonthDaysAmount";

// matches only "12.02.2012" format, otherwise returns null
// if the date is invalid(e.g. 12.00.2004 or 31.02.2004) returns null
export function getDateFromString(dateString: string): Date | null {
    console.log(dateString)
    if (!dateString.match(/^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$/)) {
        return null
    }

    const [day, month, year] = dateString.split('.').map(str => parseInt(str))
    if (day === 0 || month === 0 || year === 0) {
        return null
    }

    if (day > getMonthDaysAmount(month - 1, year)) {
        return null
    }
    // @ts-ignore
    return new Date(year, month, day);
}