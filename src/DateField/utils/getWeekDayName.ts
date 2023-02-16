import {weekDayNamesFromSunday as weekDayNames} from "../constants";

interface WeekDayName {
    full: string;
    short: string;
}
export function getWeekDayName (date: Date):WeekDayName {
    return weekDayNames[date.getDay()]
}