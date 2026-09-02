import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListMediaFilters } from '@/components/list/list-media-filters';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const translations: Record<string, string> = {
            expandFilter: 'Amplia filtre',
            collapseFilter: 'Redueix filtre',
        };
        return translations[key] || key;
    },
}));

// The search bar and the media type filter are the very same components the
// home page uses, so they are stubbed here and covered by their own suites.
vi.mock('@/components/header/search-bar', () => ({
    default: () => <div data-testid="search-bar" />,
}));

vi.mock('@/components/header/search-bar-skeleton', () => ({
    default: () => <div data-testid="search-bar-skeleton" />,
}));

vi.mock('@/components/media/media-type-filter', () => ({
    default: () => <div data-testid="media-type-filter" />,
}));

vi.mock('@/components/media/media-type-filter-skeleton', () => ({
    default: () => <div data-testid="media-type-filter-skeleton" />,
}));

describe('ListMediaFilters', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the shared search bar', () => {
        render(<ListMediaFilters />);

        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });

    it('renders the shared media type filter', () => {
        render(<ListMediaFilters />);

        expect(screen.getByTestId('media-type-filter')).toBeInTheDocument();
    });

    it('keeps the media type filter collapsed by default', () => {
        render(<ListMediaFilters />);

        expect(
            screen.getByTestId('list-media-type-filter').className
        ).toContain('max-h-0');
    });

    it('uses localized accessibility labels for the filter toggle', async () => {
        const user = userEvent.setup();
        render(<ListMediaFilters />);

        const toggle = screen.getByTestId('list-filter-toggle');
        expect(toggle).toHaveAttribute('aria-label', 'Amplia filtre');
        expect(toggle).toHaveAttribute('title', 'Amplia filtre');

        await user.click(toggle);

        expect(toggle).toHaveAttribute('aria-label', 'Redueix filtre');
        expect(toggle).toHaveAttribute('title', 'Redueix filtre');
    });

    it('expands the media type filter from the toggle', async () => {
        const user = userEvent.setup();
        render(<ListMediaFilters />);

        await user.click(screen.getByTestId('list-filter-toggle'));

        expect(
            screen.getByTestId('list-media-type-filter').className
        ).toContain('max-h-40');
    });

    it('collapses the media type filter again', async () => {
        const user = userEvent.setup();
        render(<ListMediaFilters />);

        const toggle = screen.getByTestId('list-filter-toggle');
        await user.click(toggle);
        await user.click(toggle);

        expect(
            screen.getByTestId('list-media-type-filter').className
        ).toContain('max-h-0');
    });
});
