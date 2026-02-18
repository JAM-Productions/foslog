import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchInput, Suggestion } from '@/components/input/search-input';
import { useTranslations } from 'next-intl';
import { MediaType } from '@prisma/client';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: vi.fn(),
}));

// Mock the useClickOutside hook - implement a simple version that does nothing
vi.mock('@/hooks/use-click-outside', () => ({
    useClickOutside: vi.fn(() => {
        // Simple mock that doesn't do anything
    }),
}));

// Mock next/image
vi.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt, ...props }: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={src} alt={alt} {...props} />;
    },
}));

describe('SearchInput', () => {
    const mockSetSelectedMedia = vi.fn();
    const mockSetMediaTitle = vi.fn();
    const mockT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            loading: 'Loading...',
            noSuggestions: 'No suggestions found',
        };
        return translations[key] || key;
    });

    const mockedUseTranslations = vi.mocked(useTranslations);

    const mockSuggestions: Suggestion[] = [
        {
            title: 'The Matrix',
            type: 'MOVIE' as MediaType,
            year: 1999,
            poster: 'https://example.com/matrix.jpg',
            description: 'A sci-fi masterpiece',
            genre: ['Sci-Fi'],
        },
        {
            title: 'The Matrix Reloaded',
            type: 'MOVIE' as MediaType,
            year: 2003,
            poster: 'https://example.com/matrix2.jpg',
            description: 'The sequel',
            genre: ['Sci-Fi'],
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseTranslations.mockReturnValue(
            mockT as unknown as ReturnType<typeof useTranslations>
        );
        global.fetch = vi.fn();
    });

    it('renders with default props', () => {
        render(
            <SearchInput
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
            />
        );

        const input = screen.getByPlaceholderText('Search...');
        expect(input).toBeInTheDocument();
        expect(input).toHaveClass(
            'border',
            'border-input',
            'bg-background',
            'h-10',
            'px-4',
            'py-2'
        );
        expect(input).toHaveAttribute('type', 'text');
    });

    it('renders with outline variant', () => {
        render(
            <SearchInput
                variant="outline"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
            />
        );

        const input = screen.getByPlaceholderText('Search...');
        expect(input).toHaveClass('border-2', 'border-input', 'bg-transparent');
    });

    it('renders with filled variant', () => {
        render(
            <SearchInput
                variant="filled"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
            />
        );

        const input = screen.getByPlaceholderText('Search...');
        expect(input).toHaveClass('border-0', 'bg-muted');
    });

    it('renders with small size', () => {
        render(
            <SearchInput
                inputSize="sm"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
            />
        );

        const input = screen.getByPlaceholderText('Search...');
        expect(input).toHaveClass('h-8', 'px-2', 'py-1', 'text-base');
    });

    it('renders with large size', () => {
        render(
            <SearchInput
                inputSize="lg"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
            />
        );

        const input = screen.getByPlaceholderText('Search...');
        expect(input).toHaveClass('h-12', 'px-4', 'py-3', 'text-lg');
    });

    it('applies custom className', () => {
        render(
            <SearchInput
                className="custom-class"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
            />
        );

        const input = screen.getByPlaceholderText('Search...');
        expect(input).toHaveClass('custom-class');
    });

    it('handles change events', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();

        render(
            <SearchInput
                onChange={handleChange}
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
            />
        );

        const input = screen.getByPlaceholderText('Search...');
        await user.type(input, 'Matrix');

        expect(handleChange).toHaveBeenCalled();
    });

    it('displays value prop', () => {
        render(
            <SearchInput
                value="Test Value"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        const input = screen.getByDisplayValue('Test Value');
        expect(input).toBeInTheDocument();
    });

    it('opens dropdown on focus', async () => {
        const user = userEvent.setup();
        render(
            <SearchInput
                value="Matrix"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        const input = screen.getByPlaceholderText('Search...');
        await user.click(input);

        // The dropdown should be visible after focus and there's a value
        await waitFor(() => {
            const dropdown = screen.queryByText('Loading...');
            expect(
                dropdown || screen.queryByText('No suggestions found')
            ).toBeInTheDocument();
        });
    });

    it('clears suggestions when value is empty', async () => {
        const { rerender } = render(
            <SearchInput
                value=""
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        expect(mockSetSelectedMedia).toHaveBeenCalledWith(null);

        rerender(
            <SearchInput
                value=""
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        expect(mockSetSelectedMedia).toHaveBeenCalledWith(null);
    });

    it('fetches suggestions when value changes', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockSuggestions,
        });
        global.fetch = mockFetch;

        render(
            <SearchInput
                value="Matrix"
                placeholder="Search..."
                selectedMediaType="MOVIE"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled();
        });

        const callArgs = mockFetch.mock.calls[0]?.[0];
        expect(callArgs).toContain('/api/search');
        expect(callArgs).toContain('mediatitle=Matrix');
        expect(callArgs).toContain('mediatype=MOVIE');
    });

    it('does not fetch when value is empty', () => {
        const mockFetch = vi.fn();
        global.fetch = mockFetch;

        render(
            <SearchInput
                value=""
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('does not fetch when value is only whitespace', () => {
        const mockFetch = vi.fn();
        global.fetch = mockFetch;

        render(
            <SearchInput
                value="   "
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('renders correctly and initializes state properly', () => {
        render(
            <SearchInput
                value="Matrix"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        const input = screen.getByPlaceholderText('Search...');
        expect(input).toHaveValue('Matrix');
        expect(input).toBeInTheDocument();
    });

    it('handles empty search results', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [],
        });
        global.fetch = mockFetch;

        render(
            <SearchInput
                value="NonexistentMovie"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled();
        });

        expect(mockSetSelectedMedia).toHaveBeenCalledWith(null);
    });

    it('sets selected media when exact match is found', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockSuggestions,
        });
        global.fetch = mockFetch;

        render(
            <SearchInput
                value="The Matrix"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        await waitFor(() => {
            expect(mockSetSelectedMedia).toHaveBeenCalledWith(
                mockSuggestions[0]
            );
        });
    });

    it('clears selected media when no exact match is found', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockSuggestions,
        });
        global.fetch = mockFetch;

        render(
            <SearchInput
                value="Matrix Partial"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled();
        });

        expect(mockSetSelectedMedia).toHaveBeenCalledWith(null);
    });

    it('refetches when selectedMediaType changes', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockSuggestions,
        });
        global.fetch = mockFetch;

        const { rerender } = render(
            <SearchInput
                value="Matrix"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        vi.clearAllMocks();

        rerender(
            <SearchInput
                value="Matrix"
                placeholder="Search..."
                selectedMediaType="MOVIE"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled();
        });

        const callArgs = mockFetch.mock.calls[0]?.[0];
        expect(callArgs).toContain('mediatype=MOVIE');
    });

    it('debounces search requests', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockSuggestions,
        });
        global.fetch = mockFetch;

        const { rerender } = render(
            <SearchInput
                value="M"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        // Simulate multiple rapid changes
        rerender(
            <SearchInput
                value="Ma"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        rerender(
            <SearchInput
                value="Mat"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        // Debounce should reduce the number of fetch calls
        // After all rerenders, we should wait for the debounce timer
        await waitFor(
            () => {
                expect(mockFetch).toHaveBeenCalled();
            },
            { timeout: 1000 }
        );
    });

    it('handles fetch errors gracefully', async () => {
        const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
        global.fetch = mockFetch;

        // This should not throw
        expect(() => {
            render(
                <SearchInput
                    value="Matrix"
                    placeholder="Search..."
                    selectedMediaType="all"
                    setSelectedMedia={mockSetSelectedMedia}
                    setMediaTitle={mockSetMediaTitle}
                    onChange={vi.fn()}
                />
            );
        }).not.toThrow();
    });

    it('forwards ref correctly', () => {
        const ref = vi.fn();
        render(
            <SearchInput
                ref={ref}
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
            />
        );

        expect(ref).toHaveBeenCalled();
    });

    it('respects disabled attribute', () => {
        render(
            <SearchInput
                disabled
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
            />
        );

        const input = screen.getByPlaceholderText('Search...');
        expect(input).toBeDisabled();
    });

    it('filters out duplicate suggestions', async () => {
        const duplicates: Suggestion[] = [
            {
                title: 'The Matrix',
                type: 'MOVIE' as MediaType,
                year: 1999,
                poster: 'https://example.com/matrix.jpg',
                description: 'A sci-fi masterpiece',
                genre: ['Sci-Fi'],
            },
            {
                title: 'The Matrix',
                type: 'MOVIE' as MediaType,
                year: 1999,
                poster: 'https://example.com/matrix.jpg',
                description: 'A duplicate entry',
                genre: ['Sci-Fi'],
            },
            {
                title: 'The Matrix Reloaded',
                type: 'MOVIE' as MediaType,
                year: 2003,
                poster: 'https://example.com/matrix2.jpg',
                description: 'The sequel',
                genre: ['Sci-Fi'],
            },
        ];

        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => duplicates,
        });
        global.fetch = mockFetch;

        const user = userEvent.setup();
        render(
            <SearchInput
                value="Matrix"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        const input = screen.getByPlaceholderText('Search...');
        await user.click(input);

        await waitFor(() => {
            expect(screen.getAllByText('1999')).toHaveLength(1);
            expect(screen.getAllByText('2003')).toHaveLength(1);
        });
    });

    it('renders poster and year in suggestions', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockSuggestions,
        });
        global.fetch = mockFetch;

        const user = userEvent.setup();
        render(
            <SearchInput
                value="Matrix"
                placeholder="Search..."
                selectedMediaType="all"
                setSelectedMedia={mockSetSelectedMedia}
                setMediaTitle={mockSetMediaTitle}
                onChange={vi.fn()}
            />
        );

        const input = screen.getByPlaceholderText('Search...');
        await user.click(input);

        await waitFor(() => {
            expect(screen.getByText('1999')).toBeInTheDocument();
            const img = screen.getByAltText('The Matrix');
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute(
                'src',
                'https://example.com/matrix.jpg'
            );
        });
    });
});
