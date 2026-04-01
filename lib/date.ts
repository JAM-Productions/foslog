/**
 * Returns a local-timezone YYYY-MM-DD string suitable for <input type="date"> values.
 * Avoids the UTC off-by-one-day issue that occurs when using toISOString().split('T')[0].
 */
export function toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Parses a "YYYY-MM-DD" date-only string to a Date at local noon to avoid UTC midnight
 * causing the date to shift when converted back to local time.
 */
export function parseDateOnly(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Parses a "YYYY-MM-DD" date-only string from an external source (e.g. CSV imports)
 * anchored to noon UTC to avoid the date shifting when later rendered in local timezones.
 * Returns null if the string is not a valid date.
 */
export function parseDateOnlyUTC(dateStr: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (!match) return null;
    const [, year, month, day] = match.map(Number);
    const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return isNaN(d.getTime()) ? null : d;
}
