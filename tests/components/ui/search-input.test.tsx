import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchInput, Suggestion } from '@/components/ui/search-input';
import { MediaType } from '@prisma/client';
import { useTranslations } from 'next-intl';

vi.mock('next-intl', () => ({
    useTranslations: vi.fn(),
}));

vi.mock('@/hooks/useClickOutside', () => ({
    useClickOutside: vi.fn(),
}));

const mockSuggestions: Suggestion[] = [
    {
        title: 'The Matrix',
        type: MediaType.FILM,
        year: 1999,
        poster: '/matrix.jpg',
        description:
            'A computer hacker learns about the true nature of reality.',
    },
    {
        title: 'Inception',
        type: MediaType.FILM,
        year: 2010,
        poster: '/inception.jpg',
        description:
            'A thief who steals corporate secrets through dream-sharing technology.',
    },
    {
        title: 'The Last of Us',
        type: MediaType.GAME,
        year: 2013,
        poster: '/tlou.jpg',
        description: 'A post-apocalyptic action-adventure game.',
    },
];

describe('SearchInput', () => {
    const mockOnSelect = vi.fn();
    const mockOnChange = vi.fn();
    const mockOnSearchResults = vi.fn();
    const mockOnAutoSelect = vi.fn();
    const mockT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            loading: 'Loading...',
            noSuggestions: 'No suggestions found',
        };
        return translations[key] || key;
    });

    const mockedUseTranslations = vi.mocked(useTranslations);

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseTranslations.mockReturnValue(
            mockT as unknown as ReturnType<typeof useTranslations>
        );
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders with default props', () => {
        render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'text');
    });

    it('renders with default variant and size', () => {
        render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');
        expect(input).toHaveClass(
            'border',
            'border-input',
            'bg-background',
            'h-10',
            'px-4',
            'py-2'
        );
    });

    it('renders with outline variant', () => {
        render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                variant="outline"
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');
        expect(input).toHaveClass('border-2', 'border-input', 'bg-transparent');
    });

    it('renders with filled variant', () => {
        render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                variant="filled"
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');
        expect(input).toHaveClass('border-0', 'bg-muted');
    });

    it('renders with small size', () => {
        render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                inputSize="sm"
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');
        expect(input).toHaveClass('h-8', 'px-2', 'py-1', 'text-sm');
    });

    it('renders with large size', () => {
        render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                inputSize="lg"
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');
        expect(input).toHaveClass('h-12', 'px-4', 'py-3', 'text-lg');
    });

    it('applies custom className', () => {
        render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                className="custom-class"
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');
        expect(input).toHaveClass('custom-class');
    });

    it('handles controlled input value', () => {
        render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                value="test query"
                onChange={mockOnChange}
                placeholder="Search..."
            />
        );
        const input = screen.getByDisplayValue('test query');
        expect(input).toBeInTheDocument();
    });

    it('calls onChange when input value changes', async () => {
        const user = userEvent.setup();
        render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');

        await user.type(input, 'test');
        expect(mockOnChange).toHaveBeenCalled();
    });

    it('opens dropdown on focus', async () => {
        const user = userEvent.setup();
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            json: async () => mockSuggestions,
        } as Response);

        render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                value="Matrix"
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');

        await user.click(input);

        await waitFor(() => {
            expect(screen.getByText('The Matrix')).toBeInTheDocument();
        });
    });

    it('fetches and displays suggestions when typing', async () => {
        const user = userEvent.setup();
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            json: async () => mockSuggestions,
        } as Response);

        const { rerender } = render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                value=""
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');

        await user.click(input);

        rerender(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                value="Matrix"
                placeholder="Search..."
            />
        );

        await waitFor(() => {
            expect(screen.getByText('The Matrix')).toBeInTheDocument();
            expect(screen.getByText('Inception')).toBeInTheDocument();
            expect(screen.getByText('The Last of Us')).toBeInTheDocument();
        });
    });

    it('displays loading state while fetching', async () => {
        const user = userEvent.setup();
        (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
            () =>
                new Promise((resolve) =>
                    setTimeout(
                        () =>
                            resolve({
                                json: async () => mockSuggestions,
                            } as Response),
                        100
                    )
                )
        );

        const { rerender } = render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                value=""
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');

        await user.click(input);

        rerender(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                value="test"
                placeholder="Search..."
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });
    });

    it('displays "no suggestions" message when no results', async () => {
        const user = userEvent.setup();
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            json: async () => [],
        } as Response);

        const { rerender } = render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                value=""
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');

        await user.click(input);

        rerender(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                value="nonexistent"
                placeholder="Search..."
            />
        );

        await waitFor(() => {
            expect(
                screen.getByText('No suggestions found')
            ).toBeInTheDocument();
        });
    });

    it('calls onSelect when suggestion is clicked', async () => {
        const user = userEvent.setup();
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            json: async () => mockSuggestions,
        } as Response);

        const { rerender } = render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                value=""
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');

        await user.click(input);

        rerender(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                value="Matrix"
                placeholder="Search..."
            />
        );

        await waitFor(() => {
            expect(screen.getByText('The Matrix')).toBeInTheDocument();
        });

        const suggestion = screen.getByText('The Matrix');
        await user.click(suggestion);

        expect(mockOnSelect).toHaveBeenCalledWith(mockSuggestions[0]);
    });

    it('closes dropdown after selecting a suggestion', async () => {
        const user = userEvent.setup();
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            json: async () => mockSuggestions,
        } as Response);

        const { rerender } = render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                value=""
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');

        await user.click(input);

        rerender(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                value="Matrix"
                placeholder="Search..."
            />
        );

        await waitFor(() => {
            expect(screen.getByText('The Matrix')).toBeInTheDocument();
        });

        const suggestion = screen.getByText('The Matrix');
        await user.click(suggestion);

        await waitFor(() => {
            expect(screen.queryByText('Inception')).not.toBeInTheDocument();
        });
    });

    it('calls onSearchResults with fetched data', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            json: async () => mockSuggestions,
        } as Response);

        const { rerender } = render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                onSearchResults={mockOnSearchResults}
                value=""
                placeholder="Search..."
            />
        );

        rerender(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                onSearchResults={mockOnSearchResults}
                value="test"
                placeholder="Search..."
            />
        );

        await waitFor(() => {
            expect(mockOnSearchResults).toHaveBeenCalledWith(mockSuggestions);
        });
    });

    it('calls onAutoSelect when exact title match is found', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            json: async () => mockSuggestions,
        } as Response);

        const { rerender } = render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                onAutoSelect={mockOnAutoSelect}
                value=""
                placeholder="Search..."
            />
        );

        rerender(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                onAutoSelect={mockOnAutoSelect}
                value="The Matrix"
                placeholder="Search..."
            />
        );

        await waitFor(() => {
            expect(mockOnAutoSelect).toHaveBeenCalledWith(mockSuggestions[0]);
        });
    });

    it('calls onAutoSelect with null when no exact match', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            json: async () => mockSuggestions,
        } as Response);

        const { rerender } = render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                onAutoSelect={mockOnAutoSelect}
                value=""
                placeholder="Search..."
            />
        );

        rerender(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                onAutoSelect={mockOnAutoSelect}
                value="Matrix"
                placeholder="Search..."
            />
        );

        await waitFor(() => {
            expect(mockOnAutoSelect).toHaveBeenCalledWith(null);
        });
    });

    it('builds API URL with query parameters', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            json: async () => mockSuggestions,
        } as Response);

        const { rerender } = render(
            <SearchInput
                apiUrl="/api/search"
                apiParams={{ type: 'film', year: '2020' }}
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                value=""
                placeholder="Search..."
            />
        );

        rerender(
            <SearchInput
                apiUrl="/api/search"
                apiParams={{ type: 'film', year: '2020' }}
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                value="test"
                placeholder="Search..."
            />
        );

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/search?type=film&year=2020')
            );
        });
    });

    it('respects custom debounce time', async () => {
        vi.useFakeTimers();
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            json: async () => mockSuggestions,
        } as Response);

        const { rerender } = render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                debounceMs={500}
                value=""
                placeholder="Search..."
            />
        );

        rerender(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                debounceMs={500}
                value="test"
                placeholder="Search..."
            />
        );

        expect(global.fetch).not.toHaveBeenCalled();

        await vi.runAllTimersAsync();

        expect(global.fetch).toHaveBeenCalled();

        vi.useRealTimers();
    });

    it('clears suggestions when input is empty', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            json: async () => mockSuggestions,
        } as Response);

        const { rerender } = render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                onSearchResults={mockOnSearchResults}
                value="test"
                placeholder="Search..."
            />
        );

        await waitFor(() => {
            expect(mockOnSearchResults).toHaveBeenCalledWith(mockSuggestions);
        });

        rerender(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                onSearchResults={mockOnSearchResults}
                value=""
                placeholder="Search..."
            />
        );

        expect(mockOnSearchResults).toHaveBeenCalledWith([]);
    });

    it('forwards ref correctly', () => {
        const ref = vi.fn();
        render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                ref={ref}
                placeholder="Search..."
            />
        );
        expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });

    it('accepts additional HTML input attributes', () => {
        render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                required
                maxLength={50}
                data-testid="search-input"
                placeholder="Search..."
            />
        );
        const input = screen.getByTestId('search-input');
        expect(input).toHaveAttribute('required');
        expect(input).toHaveAttribute('maxLength', '50');
    });

    it('calls onFocus when input is focused', async () => {
        const user = userEvent.setup();
        const handleFocus = vi.fn();

        render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                onChange={mockOnChange}
                onFocus={handleFocus}
                value=""
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');

        await user.click(input);
        expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('handles disabled state', () => {
        render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                disabled
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');
        expect(input).toBeDisabled();
        expect(input).toHaveClass(
            'disabled:cursor-not-allowed',
            'disabled:opacity-50'
        );
    });

    it('combines variant and size classes correctly', () => {
        render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                variant="outline"
                inputSize="lg"
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');
        expect(input).toHaveClass(
            'border-2',
            'border-input',
            'bg-transparent',
            'h-12',
            'px-4',
            'py-3',
            'text-lg'
        );
    });

    it('has correct accessibility attributes', () => {
        render(
            <SearchInput
                apiUrl="/api/search"
                onSelect={mockOnSelect}
                placeholder="Search..."
            />
        );
        const input = screen.getByPlaceholderText('Search...');
        expect(input).toHaveClass(
            'focus-visible:outline-none',
            'focus-visible:ring-2',
            'focus-visible:ring-ring',
            'focus-visible:ring-offset-2'
        );
    });
});
