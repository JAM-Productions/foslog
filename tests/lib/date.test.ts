import {
    formatRelativeTime,
    isDateOnly,
    parseDateOnly,
    parseDateOnlyUTC,
    toDate,
    toLocalDateString,
} from '@/lib/date';
import { describe, expect, test } from 'vitest';

describe('toLocalDateString', () => {
    test('keeps the local day instead of shifting to UTC', () => {
        expect(toLocalDateString(new Date(2024, 0, 5, 23, 30))).toBe(
            '2024-01-05'
        );
    });
});

describe('parseDateOnly', () => {
    test('anchors the date at local noon', () => {
        const parsed = parseDateOnly('2024-03-09');

        expect(parsed.getFullYear()).toBe(2024);
        expect(parsed.getMonth()).toBe(2);
        expect(parsed.getDate()).toBe(9);
        expect(parsed.getHours()).toBe(12);
    });
});

describe('isDateOnly', () => {
    test('accepts a plain calendar day', () => {
        expect(isDateOnly('2024-03-09')).toBe(true);
    });

    test('rejects a full timestamp, which parseDateOnly cannot read', () => {
        expect(isDateOnly('2024-03-09T10:00:00Z')).toBe(false);
    });

    test('rejects a day that does not exist', () => {
        expect(isDateOnly('2024-02-31')).toBe(false);
    });

    test('rejects other date formats', () => {
        expect(isDateOnly('09/03/2024')).toBe(false);
    });
});

describe('toDate', () => {
    test('returns a Date untouched', () => {
        const date = new Date('2024-03-09T10:00:00Z');

        expect(toDate(date)).toBe(date);
    });

    test('anchors a plain calendar day at local noon', () => {
        const parsed = toDate('2024-03-09');

        // Not UTC midnight, which would read as the 8th west of Greenwich.
        expect(parsed.getDate()).toBe(9);
        expect(parsed.getHours()).toBe(12);
    });

    test('parses a timestamp as the instant it names', () => {
        expect(toDate('2024-03-09T10:00:00Z').toISOString()).toBe(
            '2024-03-09T10:00:00.000Z'
        );
    });
});

describe('parseDateOnlyUTC', () => {
    test('anchors the date at noon UTC', () => {
        expect(parseDateOnlyUTC('2024-03-09')?.toISOString()).toBe(
            '2024-03-09T12:00:00.000Z'
        );
    });

    test('rejects anything that is not a plain date', () => {
        expect(parseDateOnlyUTC('09/03/2024')).toBeNull();
    });
});

describe('formatRelativeTime', () => {
    const now = new Date('2024-06-15T12:00:00Z');
    const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000);

    test.each([
        [0, 'Now'],
        [30, '30 seconds ago'],
        [25 * 60, '25 minutes ago'],
        [60 * 60, '1 hour ago'],
        [24 * 60 * 60, 'Yesterday'],
        [3 * 24 * 60 * 60, '3 days ago'],
        [7 * 24 * 60 * 60, 'Last week'],
        [30 * 24 * 60 * 60, 'Last month'],
        [365 * 24 * 60 * 60, 'Last year'],
    ])('describes %i seconds ago as "%s"', (seconds, expected) => {
        expect(formatRelativeTime(ago(seconds), 'en', now)).toBe(expected);
    });

    test('rounds down to the unit it picked', () => {
        // 90 minutes is an hour ago, not two.
        expect(formatRelativeTime(ago(90 * 60), 'en', now)).toBe('1 hour ago');
    });

    test('speaks the locale it is given', () => {
        expect(formatRelativeTime(ago(25 * 60), 'es', now)).toBe(
            'Hace 25 minutos'
        );
        expect(formatRelativeTime(ago(7 * 24 * 60 * 60), 'es', now)).toBe(
            'La semana pasada'
        );
    });

    test('accepts an ISO string', () => {
        expect(formatRelativeTime(ago(60 * 60).toISOString(), 'en', now)).toBe(
            '1 hour ago'
        );
    });
});
