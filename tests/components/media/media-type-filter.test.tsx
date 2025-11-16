import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MediaTypeFilter from '@/components/media/media-type-filter';
import { useAppStore } from '@/lib/store';
import { useTranslations } from 'next-intl';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: vi.fn(),
}));

// Mock the store
vi.mock('@/lib/store', () => ({
    useAppStore: vi.fn(),
}));

describe('MediaTypeFilter', () => {
    const mockSetSelectedMediaType = vi.fn();
    const mockedUseAppStore = vi.mocked(useAppStore);
    const mockT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            all: 'All',
            films: 'Films',
            series: 'Series',
            games: 'Games',
            books: 'Books',
            music: 'Music',
        };
        return translations[key] || key;
    });

    const mockedUseTranslations = vi.mocked(useTranslations);

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseTranslations.mockReturnValue(
            mockT as unknown as ReturnType<typeof useTranslations>
        );
        mockedUseAppStore.mockReturnValue({
            selectedMediaType: 'all',
            setSelectedMediaType: mockSetSelectedMediaType,
            // Add other store properties that might be needed
            theme: 'system',
            setTheme: vi.fn(),
            user: null,
            setUser: vi.fn(),
            mediaItems: [],
            setMediaItems: vi.fn(),
            addMediaItem: vi.fn(),
            reviews: [],
            setReviews: vi.fn(),
            addReview: vi.fn(),
            updateReview: vi.fn(),
            deleteReview: vi.fn(),
            searchQuery: '',
            setSearchQuery: vi.fn(),
        });
    });

    const mediaTypes = [
        { value: 'all', label: 'All' },
        { value: 'film', label: 'Films' },
        { value: 'series', label: 'Series' },
        { value: 'game', label: 'Games' },
        { value: 'book', label: 'Books' },
        { value: 'music', label: 'Music' },
    ];

    it('renders all media type buttons', () => {
        render(<MediaTypeFilter />);

        mediaTypes.forEach((type) => {
            expect(
                screen.getByRole('button', {
                    name: new RegExp(type.label, 'i'),
                })
            ).toBeInTheDocument();
        });
    });

    it('displays icons for each media type', () => {
        render(<MediaTypeFilter />);

        mediaTypes.forEach((type) => {
            const button = screen.getByRole('button', {
                name: new RegExp(type.label, 'i'),
            });
            const svgElement = button.querySelector('svg');
            expect(svgElement).toBeInTheDocument();
        });
    });

    it('highlights the selected media type', () => {
        mockedUseAppStore.mockReturnValue({
            selectedMediaType: 'film',
            setSelectedMediaType: mockSetSelectedMediaType,
            theme: 'system',
            setTheme: vi.fn(),
            user: null,
            setUser: vi.fn(),
            mediaItems: [],
            setMediaItems: vi.fn(),
            addMediaItem: vi.fn(),
            reviews: [],
            setReviews: vi.fn(),
            addReview: vi.fn(),
            updateReview: vi.fn(),
            deleteReview: vi.fn(),
            searchQuery: '',
            setSearchQuery: vi.fn(),
        });

        render(<MediaTypeFilter />);

        const filmButton = screen.getByRole('button', { name: /films/i });
        expect(filmButton).toHaveClass(
            'bg-background',
            'text-foreground',
            'shadow-sm'
        );

        const allButton = screen.getByRole('button', { name: /all/i });
        expect(allButton).toHaveClass('text-primary');
    });

    it('calls setSelectedMediaType when a button is clicked', async () => {
        const user = userEvent.setup();
        render(<MediaTypeFilter />);

        const filmsButton = screen.getByRole('button', { name: /films/i });
        await user.click(filmsButton);

        expect(mockSetSelectedMediaType).toHaveBeenCalledWith('film');
    });

    it('handles clicking different media type buttons', async () => {
        const user = userEvent.setup();
        render(<MediaTypeFilter />);

        // Test clicking games button
        const gamesButton = screen.getByRole('button', { name: /games/i });
        await user.click(gamesButton);
        expect(mockSetSelectedMediaType).toHaveBeenCalledWith('game');

        // Test clicking books button
        const booksButton = screen.getByRole('button', { name: /books/i });
        await user.click(booksButton);
        expect(mockSetSelectedMediaType).toHaveBeenCalledWith('book');

        // Test clicking all button
        const allButton = screen.getByRole('button', { name: /all/i });
        await user.click(allButton);
        expect(mockSetSelectedMediaType).toHaveBeenCalledWith('all');

        expect(mockSetSelectedMediaType).toHaveBeenCalledTimes(3);
    });

    it('has proper responsive classes', () => {
        render(<MediaTypeFilter />);

        const button = screen.getByRole('button', { name: /films/i });
        expect(button).toHaveClass('flex-col', 'sm:flex-row');

        const icon = button.querySelector('svg');
        expect(icon).toHaveClass('sm:mr-1.5');
    });

    it('has proper styling classes', () => {
        render(<MediaTypeFilter />);

        const container = screen.getByRole('button', {
            name: /all/i,
        }).parentElement;
        expect(container).toHaveClass(
            'bg-muted',
            'rounded-lg',
            'overflow-x-auto'
        );

        const button = screen.getByRole('button', { name: /films/i });
        expect(button).toHaveClass(
            'flex',
            'items-center',
            'rounded-md',
            'px-3',
            'py-1.5',
            'text-sm',
            'font-medium',
            'transition-colors'
        );
    });
});
