/** Units the relative formatter walks through, largest first. */
const RELATIVE_TIME_UNITS: {
    unit: Intl.RelativeTimeFormatUnit;
    seconds: number;
}[] = [
    { unit: 'year', seconds: 365 * 24 * 60 * 60 },
    { unit: 'month', seconds: 30 * 24 * 60 * 60 },
    { unit: 'week', seconds: 7 * 24 * 60 * 60 },
    { unit: 'day', seconds: 24 * 60 * 60 },
    { unit: 'hour', seconds: 60 * 60 },
    { unit: 'minute', seconds: 60 },
];

/**
 * Formats a date the way someone would say it out loud: "25 minutes ago",
 * "Yesterday", "Last week". Picks the largest unit that still fits the gap and
 * rounds towards it, so 90 minutes reads as an hour rather than two. The result
 * is capitalized, since it always starts a line of its own.
 */
export function formatRelativeTime(
    date: Date | string,
    locale: string,
    now: Date = new Date()
): string {
    const target = typeof date === 'string' ? new Date(date) : date;
    const elapsedSeconds = (target.getTime() - now.getTime()) / 1000;
    const distance = Math.abs(elapsedSeconds);
    // "auto" is what turns -1 day into "yesterday" instead of "1 day ago".
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    const match = RELATIVE_TIME_UNITS.find(
        ({ seconds }) => distance >= seconds
    );

    const formatted = match
        ? formatter.format(
              Math.trunc(elapsedSeconds / match.seconds),
              match.unit
          )
        : formatter.format(Math.trunc(elapsedSeconds), 'second');

    return formatted.charAt(0).toLocaleUpperCase(locale) + formatted.slice(1);
}

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

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * True for a plain "YYYY-MM-DD" naming a real calendar day. Guards the callers
 * of {@link parseDateOnly}, which assumes that exact shape.
 */
export function isDateOnly(value: string): boolean {
    if (!DATE_ONLY_PATTERN.test(value)) return false;

    const [year, month, day] = value.split('-').map(Number);
    const parsed = parseDateOnly(value);

    return (
        parsed.getFullYear() === year &&
        parsed.getMonth() === month - 1 &&
        parsed.getDate() === day
    );
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
 * Normalizes a date that may arrive as a string. A plain "YYYY-MM-DD" is
 * anchored at local noon, like the values the app stores, so it never renders
 * as the previous day west of UTC; anything else is parsed as an instant.
 */
export function toDate(value: Date | string): Date {
    if (typeof value !== 'string') return value;

    return DATE_ONLY_PATTERN.test(value)
        ? parseDateOnly(value)
        : new Date(value);
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
