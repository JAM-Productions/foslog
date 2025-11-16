import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchBar from '@/components/header/search-bar';
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

describe('SearchBar', () => {
    const mockSetSearchQuery = vi.fn();
    const mockedUseAppStore = vi.mocked(useAppStore);
    const mockT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            searchPlaceholder: 'Search films, books, games...',
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
            searchQuery: '',
            setSearchQuery: mockSetSearchQuery,
            // Add other store properties
            theme: 'system',
            setTheme: vi.fn(),
            user: null,
            setUser: vi.fn(),
            selectedMediaType: 'all',
            setSelectedMediaType: vi.fn(),
            mediaItems: [],
            setMediaItems: vi.fn(),
            addMediaItem: vi.fn(),
            reviews: [],
            setReviews: vi.fn(),
            addReview: vi.fn(),
            updateReview: vi.fn(),
            deleteReview: vi.fn(),
        });
    });

    it('renders search input with placeholder', () => {
        render(<SearchBar />);

        const input = screen.getByPlaceholderText(
            'Search films, books, games...'
        );
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'text');
    });

    it('displays search icon', () => {
        render(<SearchBar />);

        const container = screen.getByPlaceholderText(
            'Search films, books, games...'
        ).parentElement;
        // The search icon should be present in the container
        expect(container).toHaveClass('relative');
    });

    it('displays current search query value', () => {
        mockedUseAppStore.mockReturnValue({
            searchQuery: 'test query',
            setSearchQuery: mockSetSearchQuery,
            theme: 'system',
            setTheme: vi.fn(),
            user: null,
            setUser: vi.fn(),
            selectedMediaType: 'all',
            setSelectedMediaType: vi.fn(),
            mediaItems: [],
            setMediaItems: vi.fn(),
            addMediaItem: vi.fn(),
            reviews: [],
            setReviews: vi.fn(),
            addReview: vi.fn(),
            updateReview: vi.fn(),
            deleteReview: vi.fn(),
        });

        render(<SearchBar />);

        const input = screen.getByDisplayValue('test query');
        expect(input).toBeInTheDocument();
    });

    it('calls setSearchQuery when input value changes', async () => {
        const user = userEvent.setup();
        render(<SearchBar />);

        const input = screen.getByPlaceholderText(
            'Search films, books, games...'
        );
        await user.type(input, 'new search');

        // setSearchQuery should be called for each character typed
        expect(mockSetSearchQuery).toHaveBeenCalledWith('n');
        expect(mockSetSearchQuery).toHaveBeenCalledWith('e');
        expect(mockSetSearchQuery).toHaveBeenCalledWith('w');
        expect(mockSetSearchQuery).toHaveBeenCalledWith(' ');
        expect(mockSetSearchQuery).toHaveBeenCalledWith('s');
        expect(mockSetSearchQuery).toHaveBeenCalledWith('e');
        expect(mockSetSearchQuery).toHaveBeenCalledWith('a');
        expect(mockSetSearchQuery).toHaveBeenCalledWith('r');
        expect(mockSetSearchQuery).toHaveBeenCalledWith('c');
        expect(mockSetSearchQuery).toHaveBeenCalledWith('h');

        expect(mockSetSearchQuery).toHaveBeenCalledTimes(10);
    });

    it('handles clearing the input', async () => {
        const user = userEvent.setup();

        // Start with some search query
        mockedUseAppStore.mockReturnValue({
            searchQuery: 'existing query',
            setSearchQuery: mockSetSearchQuery,
            theme: 'system',
            setTheme: vi.fn(),
            user: null,
            setUser: vi.fn(),
            selectedMediaType: 'all',
            setSelectedMediaType: vi.fn(),
            mediaItems: [],
            setMediaItems: vi.fn(),
            addMediaItem: vi.fn(),
            reviews: [],
            setReviews: vi.fn(),
            addReview: vi.fn(),
            updateReview: vi.fn(),
            deleteReview: vi.fn(),
        });

        render(<SearchBar />);

        const input = screen.getByDisplayValue('existing query');
        await user.clear(input);

        expect(mockSetSearchQuery).toHaveBeenCalledWith('');
    });

    it('has proper styling classes', () => {
        render(<SearchBar />);

        const container = screen.getByPlaceholderText(
            'Search films, books, games...'
        ).parentElement;
        expect(container).toHaveClass('relative', 'flex-1');

        const input = screen.getByPlaceholderText(
            'Search films, books, games...'
        );
        expect(input).toHaveClass(
            'bg-background',
            'border-input',
            'focus:ring-ring',
            'w-full',
            'rounded-lg',
            'border',
            'py-2',
            'pr-4',
            'pl-10',
            'focus:border-transparent',
            'focus:ring-2',
            'focus:outline-none'
        );
    });

    it('search icon has correct positioning classes', () => {
        render(<SearchBar />);

        const container = screen.getByPlaceholderText(
            'Search films, books, games...'
        ).parentElement;
        const searchIcon = container?.querySelector('svg');

        if (searchIcon) {
            expect(searchIcon).toHaveClass(
                'text-muted-foreground',
                'absolute',
                'top-1/2',
                'left-3',
                'h-4',
                'w-4',
                '-translate-y-1/2',
                'transform'
            );
        }
    });

    it('handles special characters in search query', async () => {
        const user = userEvent.setup();
        render(<SearchBar />);

        const input = screen.getByPlaceholderText(
            'Search films, books, games...'
        );
        await user.type(input, '!@#$%');

        expect(mockSetSearchQuery).toHaveBeenCalledWith('!');
        expect(mockSetSearchQuery).toHaveBeenCalledWith('@');
        expect(mockSetSearchQuery).toHaveBeenCalledWith('#');
        expect(mockSetSearchQuery).toHaveBeenCalledWith('$');
        expect(mockSetSearchQuery).toHaveBeenCalledWith('%');
    });

    it('handles unicode characters in search query', async () => {
        const user = userEvent.setup();
        render(<SearchBar />);

        const input = screen.getByPlaceholderText(
            'Search films, books, games...'
        );
        await user.type(input, 'café');

        expect(mockSetSearchQuery).toHaveBeenCalledWith('c');
        expect(mockSetSearchQuery).toHaveBeenCalledWith('a');
        expect(mockSetSearchQuery).toHaveBeenCalledWith('f');
        expect(mockSetSearchQuery).toHaveBeenCalledWith('é');
    });
});
