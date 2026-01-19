import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConsumedBadge } from '@/components/review/consumed-badge';

vi.mock('next-intl', () => ({
    useTranslations: (namespace: string) => (key: string) => {
        if (namespace === 'ConsumedMoreThanOnce') {
            return `Consumed ${key}`;
        }
        return key;
    },
}));

describe('ConsumedBadge', () => {
    it('renders nothing when mediaType is missing', () => {
        const { container } = render(<ConsumedBadge />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders correctly for known media type', () => {
        render(<ConsumedBadge mediaType="film" />);
        expect(screen.getByText('Consumed film')).toBeInTheDocument();
    });

    it('renders correctly for known media type (case insensitive)', () => {
        render(<ConsumedBadge mediaType="BOOK" />);
        expect(screen.getByText('Consumed book')).toBeInTheDocument();
    });

    it('renders default text for unknown media type', () => {
        render(<ConsumedBadge mediaType="alien-tech" />);
        expect(screen.getByText('Consumed default')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        render(<ConsumedBadge mediaType="film" className="text-red-500" />);
        const badge = screen.getByText('Consumed film').closest('div');
        expect(badge).toHaveClass('text-red-500');
    });
});
