export function compactDate(date: string | number | Date) {
    date = new Date(date);
    return (date.getFullYear() % 100) * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function dateString(date: Date) {
    let year = date.getFullYear();
    let month = `0${date.getMonth() + 1}`.slice(-2);
    let day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
}
