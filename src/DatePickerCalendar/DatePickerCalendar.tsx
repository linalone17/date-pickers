import React, {useState} from 'react';

interface DatePickerCalendarProps {
    isOpened: boolean;

    date: Date;
    onDatePickerChange: (date: Date) => void;

    initialDate: Date;
    dateFrom: Date;
    dateTo: Date;
}
export const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({
    isOpened, date, onDatePickerChange, initialDate, dateFrom, dateTo
}) => {
    const [dateState, setDateState] = useState<Date>();

    function changeDate (date: Date) {
        setDateState(date);
        onDatePickerChange(date);
    }

    return <div></div>
}