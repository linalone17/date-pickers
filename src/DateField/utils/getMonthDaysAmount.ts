import {isLeapYear} from "./isLeapYear";
import {months} from "../constants";

type GetMonthDaysAmountArguments = [Date] | [month: number, year: number]

export function getMonthDaysAmount(...args: GetMonthDaysAmountArguments) {
    let month, year;
    if (args.length === 1) {
        month = args[0].getMonth();
        year = args[0].getFullYear();
    } else {
        month = args[0];
        year = args[1];
    }

    let days = months[month].days;
    if (month === 1 && isLeapYear(year)) {
        days += 1;
    }

    return days
}