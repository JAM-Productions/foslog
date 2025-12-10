import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchBar from '@/components/header/search-bar';
import { useTranslations } from 'next-intl';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: vi.fn(),
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockPathname = '/en';
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    usePathname: () => mockPathname,
    useSearchParams: () => mockSearchParams,
}));

describe('SearchBar', () => {
    const mockT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            searchPlaceholder: 'Search films, books, games...',
        };
        return translations[key] || key;
    });

    const mockedUseTranslations = vi.mocked(useTranslations);

    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchParams.delete('search');
        mockSearchParams.delete('page');
        mockedUseTranslations.mockReturnValue(
            mockT as unknown as ReturnType<typeof useTranslations>
        );
        // Mock window.location.search
        Object.defineProperty(window, 'location', {
            value: {
                search: '',
            },
            writable: true,
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

    it('displays current search query value from URL params', () => {
        mockSearchParams.set('search', 'test query');

        render(<SearchBar />);

        const input = screen.getByDisplayValue('test query');
        expect(input).toBeInTheDocument();
    });

    it('updates local state when input value changes', async () => {
        const user = userEvent.setup();
        render(<SearchBar />);

        const input = screen.getByPlaceholderText(
            'Search films, books, games...'
        );
        await user.type(input, 'new search');

        expect(input).toHaveValue('new search');
    });

    it('calls router.push with search param when Enter is pressed', async () => {
        const user = userEvent.setup();
        render(<SearchBar />);

        const input = screen.getByPlaceholderText(
            'Search films, books, games...'
        );
        await user.type(input, 'test search{Enter}');

        expect(mockPush).toHaveBeenCalledWith('/en?search=test+search');
    });

    it('calls router.push with search param when search button is clicked', async () => {
        const user = userEvent.setup();
        render(<SearchBar />);

        const input = screen.getByPlaceholderText(
            'Search films, books, games...'
        );
        await user.type(input, 'test search');

        const searchButton = screen.getByRole('button', { name: 'Search' });
        await user.click(searchButton);

        expect(mockPush).toHaveBeenCalledWith('/en?search=test+search');
    });

    it('removes search param when input is empty', async () => {
        const user = userEvent.setup();
        mockSearchParams.set('search', 'existing query');
        render(<SearchBar />);

        const input = screen.getByDisplayValue('existing query');
        await user.clear(input);
        await user.click(screen.getByRole('button', { name: 'Search' }));

        expect(mockPush).toHaveBeenCalledWith('/en');
    });

    it('removes page param when searching', async () => {
        const user = userEvent.setup();
        window.location.search = '?page=2&type=film';
        render(<SearchBar />);

        const input = screen.getByPlaceholderText(
            'Search films, books, games...'
        );
        await user.type(input, 'test{Enter}');

        const calledUrl = mockPush.mock.calls[0][0];
        expect(calledUrl).not.toContain('page=');
        expect(calledUrl).toContain('search=test');
    });

    it('trims whitespace from search query', async () => {
        const user = userEvent.setup();
        render(<SearchBar />);

        const input = screen.getByPlaceholderText(
            'Search films, books, games...'
        );
        await user.type(input, '  test search  {Enter}');

        expect(mockPush).toHaveBeenCalledWith('/en?search=test+search');
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

    it('renders search button with CornerDownRight icon', () => {
        render(<SearchBar />);

        const searchButton = screen.getByRole('button', { name: 'Search' });
        expect(searchButton).toBeInTheDocument();
        expect(searchButton.querySelector('svg')).toBeInTheDocument();
    });
});
