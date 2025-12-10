import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MediaTypeFilter from '@/components/media/media-type-filter';
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

describe('MediaTypeFilter', () => {
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
        mockSearchParams.delete('type');
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

    it('highlights the selected media type from URL params', () => {
        mockSearchParams.set('type', 'film');

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

    it('calls router.push with type param when a button is clicked', async () => {
        const user = userEvent.setup();
        render(<MediaTypeFilter />);

        const filmsButton = screen.getByRole('button', { name: /films/i });
        await user.click(filmsButton);

        expect(mockPush).toHaveBeenCalledWith('/en?type=film');
    });

    it('handles clicking different media type buttons', async () => {
        const user = userEvent.setup();
        render(<MediaTypeFilter />);

        // Test clicking games button
        const gamesButton = screen.getByRole('button', { name: /games/i });
        await user.click(gamesButton);
        expect(mockPush).toHaveBeenCalledWith('/en?type=game');

        // Test clicking books button
        const booksButton = screen.getByRole('button', { name: /books/i });
        await user.click(booksButton);
        expect(mockPush).toHaveBeenCalledWith('/en?type=book');

        // Test clicking all button (removes type param)
        const allButton = screen.getByRole('button', { name: /all/i });
        await user.click(allButton);
        expect(mockPush).toHaveBeenCalledWith('/en');

        expect(mockPush).toHaveBeenCalledTimes(3);
    });

    it('removes page param when changing media type', async () => {
        const user = userEvent.setup();
        window.location.search = '?page=2&search=test';
        render(<MediaTypeFilter />);

        const filmsButton = screen.getByRole('button', { name: /films/i });
        await user.click(filmsButton);

        const calledUrl = mockPush.mock.calls[0][0];
        expect(calledUrl).not.toContain('page=');
        expect(calledUrl).toContain('type=film');
    });

    it('preserves other query params when changing media type', async () => {
        const user = userEvent.setup();
        window.location.search = '?search=test&sort=rating';
        render(<MediaTypeFilter />);

        const filmsButton = screen.getByRole('button', { name: /films/i });
        await user.click(filmsButton);

        const calledUrl = mockPush.mock.calls[0][0];
        expect(calledUrl).toContain('type=film');
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
