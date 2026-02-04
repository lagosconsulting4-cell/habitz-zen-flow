
/**
 * Returns a date string in YYYY-MM-DD format for the local timezone
 * This is useful for consistent querying of daily records regardless of UTC time
 */
export const getLocalDateString = (date = new Date()): string => {
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
};

/**
 * Checks if two dates are the same calendar day
 */
export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

    return (
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear()
    );
};

/**
 * Returns array of dates for the last N days
 */
export const getLastNDays = (n: number): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < n; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d);
    }
    return dates;
};
