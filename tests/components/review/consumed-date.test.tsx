import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConsumedDate } from '@/components/review/consumed-date';

vi.mock('next-intl', () => ({
    useTranslations:
        (namespace: string) =>
        (key: string, values?: Record<string, string>) => {
            if (namespace === 'ConsumedDate') {
                return `${key} on ${values?.date}`;
            }
            return key;
        },
    useLocale: () => 'en',
}));

describe('ConsumedDate', () => {
    const date = new Date(2024, 2, 9, 12);

    it('renders nothing without a date', () => {
        const { container } = render(<ConsumedDate mediaType="film" />);

        expect(container).toBeEmptyDOMElement();
    });

    it('words the date after the media type', () => {
        render(
            <ConsumedDate
                date={date}
                mediaType="film"
            />
        );

        expect(screen.getByText('film on Mar 9, 2024')).toBeInTheDocument();
    });

    it('matches the media type regardless of case', () => {
        render(
            <ConsumedDate
                date={date}
                mediaType="BOOK"
            />
        );

        expect(screen.getByText('book on Mar 9, 2024')).toBeInTheDocument();
    });

    it('falls back to the generic wording for an unknown media type', () => {
        render(
            <ConsumedDate
                date={date}
                mediaType="alien-tech"
            />
        );

        expect(screen.getByText('default on Mar 9, 2024')).toBeInTheDocument();
    });

    it('falls back to the generic wording without a media type', () => {
        render(<ConsumedDate date={date} />);

        expect(screen.getByText('default on Mar 9, 2024')).toBeInTheDocument();
    });

    it('accepts an ISO string', () => {
        render(
            <ConsumedDate
                date={date.toISOString()}
                mediaType="game"
            />
        );

        expect(screen.getByText('game on Mar 9, 2024')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        render(
            <ConsumedDate
                date={date}
                mediaType="film"
                className="text-red-500"
            />
        );

        expect(
            screen.getByText('film on Mar 9, 2024').closest('div')
        ).toHaveClass('text-red-500');
    });
});
