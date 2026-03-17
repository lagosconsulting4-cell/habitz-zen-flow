
/** Brazil is permanently UTC-3 (no DST since 2019) */
const BRT_OFFSET_MS = 3 * 60 * 60 * 1000;

/**
 * Returns a date string in YYYY-MM-DD format for Brasília time (UTC-3).
 * Use this everywhere a "today" date is needed — avoids the day flipping
 * at 21:00 BRT (= 00:00 UTC) that happens with toISOString().
 */
export const getBRTDateString = (date = new Date()): string => {
    const brt = new Date(date.getTime() - BRT_OFFSET_MS);
    return brt.toISOString().split('T')[0];
};

/**
 * Returns milliseconds until the next midnight in Brasília time.
 * Use this to schedule the daily reset timer.
 */
export const msUntilBRTMidnight = (): number => {
    const brtNow = new Date(Date.now() - BRT_OFFSET_MS);
    const nextMidnightUTC =
        Date.UTC(brtNow.getUTCFullYear(), brtNow.getUTCMonth(), brtNow.getUTCDate() + 1)
        + BRT_OFFSET_MS;
    return nextMidnightUTC - Date.now();
};

/**
 * Returns a date string in YYYY-MM-DD format for the local timezone
 * @deprecated Use getBRTDateString() instead for consistent BRT dates
 */
export const getLocalDateString = (date = new Date()): string => {
    return getBRTDateString(date);
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
