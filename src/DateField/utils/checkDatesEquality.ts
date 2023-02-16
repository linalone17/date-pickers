export function checkDatesEquality(dateA: Date, dateB: Date): boolean {
    return (
        dateA.getDate() === dateB.getDate() &&
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getFullYear() === dateB.getFullYear()
    )

}