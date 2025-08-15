import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MediaTypeFilter from '@/components/media-type-filter';
import { useAppStore } from '@/lib/store';

// Mock the store
vi.mock('@/lib/store', () => ({
    useAppStore: vi.fn(),
}));

describe('MediaTypeFilter', () => {
    const mockSetSelectedMediaType = vi.fn();
    const mockedUseAppStore = vi.mocked(useAppStore);

    beforeEach(() => {
        vi.clearAllMocks();
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
        { value: 'all', label: 'All', icon: '🔍' },
        { value: 'film', label: 'Films', icon: '🎬' },
        { value: 'series', label: 'Series', icon: '📺' },
        { value: 'game', label: 'Games', icon: '🎮' },
        { value: 'book', label: 'Books', icon: '📚' },
        { value: 'music', label: 'Music', icon: '🎵' },
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
            expect(button).toHaveTextContent(type.icon);
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
        expect(allButton).toHaveClass('text-muted-foreground');
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

        const iconSpan = button.querySelector('span');
        expect(iconSpan).toHaveClass('sm:mr-1.5');
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
