import { RelativeDate } from '@/components/relative-date';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('next-intl', () => ({
    useLocale: () => 'en',
}));

describe('RelativeDate', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('tells how long ago the review was posted', () => {
        const date = new Date(Date.now() - 25 * 60 * 1000);

        render(<RelativeDate date={date} />);

        expect(screen.getByText('25 minutes ago')).toBeInTheDocument();
    });

    test('exposes the exact timestamp for machines', () => {
        const date = new Date(Date.now() - 60 * 60 * 1000);

        render(<RelativeDate date={date} />);

        expect(screen.getByText('1 hour ago')).toHaveAttribute(
            'datetime',
            date.toISOString()
        );
    });

    test('accepts an ISO string', () => {
        const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        render(<RelativeDate date={date.toISOString()} />);

        expect(screen.getByText('Last week')).toBeInTheDocument();
    });

    test('keeps up with the clock while the page stays open', () => {
        render(<RelativeDate date={new Date(Date.now() - 59 * 1000)} />);

        expect(screen.getByText('59 seconds ago')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(60 * 1000);
        });

        expect(screen.getByText('1 minute ago')).toBeInTheDocument();
    });

    test('applies the class it is given', () => {
        render(
            <RelativeDate
                date={new Date()}
                className="text-xs"
            />
        );

        expect(screen.getByText('Now')).toHaveClass('text-xs');
    });
});
