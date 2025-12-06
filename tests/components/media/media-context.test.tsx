import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MediaContext } from '@/components/media/media-context';
import { SafeMediaItem } from '@/lib/types';
import { useTranslations } from 'next-intl';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: vi.fn(),
}));

// Mock next/image
vi.mock('next/image', () => ({
    default: ({
        src,
        alt,
        fill,
        className,
    }: {
        src: string;
        alt: string;
        fill?: boolean;
        className?: string;
    }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            data-fill={fill}
            className={className}
        />
    ),
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
    Book: ({ className }: { className?: string }) => (
        <svg
            data-testid="book-icon"
            className={className}
        />
    ),
    Clapperboard: ({ className }: { className?: string }) => (
        <svg
            data-testid="clapperboard-icon"
            className={className}
        />
    ),
    Gamepad2: ({ className }: { className?: string }) => (
        <svg
            data-testid="gamepad2-icon"
            className={className}
        />
    ),
    Music: ({ className }: { className?: string }) => (
        <svg
            data-testid="music-icon"
            className={className}
        />
    ),
    StickyNote: ({ className }: { className?: string }) => (
        <svg
            data-testid="stickynote-icon"
            className={className}
        />
    ),
    Tv: ({ className }: { className?: string }) => (
        <svg
            data-testid="tv-icon"
            className={className}
        />
    ),
}));

describe('MediaContext', () => {
    const mockTRP = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            reviewFor: 'Review for',
        };
        return translations[key] || key;
    });

    const mockTMT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            film: 'Film',
            series: 'Series',
            game: 'Game',
            book: 'Book',
            music: 'Music',
        };
        return translations[key] || key;
    });

    const mockedUseTranslations = vi.mocked(useTranslations);

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseTranslations.mockImplementation((namespace?: string) => {
            if (namespace === 'ReviewPage') {
                return mockTRP as unknown as ReturnType<typeof useTranslations>;
            }
            if (namespace === 'MediaTypes') {
                return mockTMT as unknown as ReturnType<typeof useTranslations>;
            }
            return mockTRP as unknown as ReturnType<typeof useTranslations>;
        });
    });

    const mockMediaWithPoster: SafeMediaItem = {
        id: '1',
        title: 'The Matrix',
        type: 'film',
        year: 1999,
        director: 'The Wachowskis',
        genre: ['action', 'sciFi'],
        poster: 'https://example.com/matrix-poster.jpg',
        description:
            'A computer hacker learns about the true nature of reality.',
        averageRating: 4.5,
        totalReviews: 100,
    };

    const mockMediaWithoutPoster: SafeMediaItem = {
        id: '2',
        title: 'The Great Gatsby',
        type: 'book',
        year: 1925,
        author: 'F. Scott Fitzgerald',
        genre: ['drama', 'romance'],
        description: 'A story of wealth, love, and tragedy.',
        averageRating: 4.2,
        totalReviews: 50,
    };

    it('renders media title correctly', () => {
        render(<MediaContext media={mockMediaWithPoster} />);

        expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    it('renders "Review for" label', () => {
        render(<MediaContext media={mockMediaWithPoster} />);

        expect(screen.getByText('Review for')).toBeInTheDocument();
    });

    it('renders poster image when provided', () => {
        render(<MediaContext media={mockMediaWithPoster} />);

        const poster = screen.getByAltText('The Matrix');
        expect(poster).toBeInTheDocument();
        expect(poster).toHaveAttribute(
            'src',
            'https://example.com/matrix-poster.jpg'
        );
        expect(poster).toHaveClass('object-cover');
    });

    it('renders fallback icon when poster is not provided', () => {
        render(<MediaContext media={mockMediaWithoutPoster} />);

        const bookIcons = screen.getAllByTestId('book-icon');
        expect(bookIcons[0]).toBeInTheDocument();
        expect(bookIcons[0]).toHaveClass('h-16', 'w-16');
    });

    it('renders correct icon for film type', () => {
        render(<MediaContext media={mockMediaWithPoster} />);

        const filmIcon = screen.getByTestId('clapperboard-icon');
        expect(filmIcon).toBeInTheDocument();
    });

    it('renders correct icon for series type', () => {
        const seriesMedia: SafeMediaItem = {
            ...mockMediaWithoutPoster,
            type: 'series',
        };

        render(<MediaContext media={seriesMedia} />);

        const seriesIcons = screen.getAllByTestId('tv-icon');
        expect(seriesIcons[0]).toBeInTheDocument();
        expect(seriesIcons[0]).toHaveClass('h-16', 'w-16');
    });

    it('renders correct icon for game type', () => {
        const gameMedia: SafeMediaItem = {
            ...mockMediaWithoutPoster,
            type: 'game',
        };

        render(<MediaContext media={gameMedia} />);

        const gameIcons = screen.getAllByTestId('gamepad2-icon');
        expect(gameIcons[0]).toBeInTheDocument();
        expect(gameIcons[0]).toHaveClass('h-16', 'w-16');
    });

    it('renders correct icon for book type', () => {
        render(<MediaContext media={mockMediaWithoutPoster} />);

        const bookIcons = screen.getAllByTestId('book-icon');
        expect(bookIcons[0]).toBeInTheDocument();
        expect(bookIcons[0]).toHaveClass('h-16', 'w-16');
    });

    it('renders correct icon for music type', () => {
        const musicMedia: SafeMediaItem = {
            ...mockMediaWithoutPoster,
            type: 'music',
        };

        render(<MediaContext media={musicMedia} />);

        const musicIcons = screen.getAllByTestId('music-icon');
        expect(musicIcons[0]).toBeInTheDocument();
        expect(musicIcons[0]).toHaveClass('h-16', 'w-16');
    });

    it('displays translated media type', () => {
        render(<MediaContext media={mockMediaWithPoster} />);

        expect(screen.getByText('Film')).toBeInTheDocument();
    });

    it('applies correct aspect ratio to poster', () => {
        const { container } = render(
            <MediaContext media={mockMediaWithPoster} />
        );

        const posterContainer = container.querySelector('.aspect-\\[2\\/3\\]');
        expect(posterContainer).toBeInTheDocument();
    });

    it('applies responsive width classes to poster', () => {
        const { container } = render(
            <MediaContext media={mockMediaWithPoster} />
        );

        const posterContainer = container.querySelector('.aspect-\\[2\\/3\\]');
        expect(posterContainer).toHaveClass('w-32', 'sm:w-full');
    });

    it('applies correct border radius classes', () => {
        render(<MediaContext media={mockMediaWithPoster} />);

        const poster = screen.getByAltText('The Matrix');
        expect(poster).toHaveClass(
            'rounded-l-lg',
            'sm:rounded-t-lg',
            'sm:rounded-b-none'
        );
    });

    it('renders media type badge with icon and text', () => {
        render(<MediaContext media={mockMediaWithPoster} />);

        const badge = screen.getByText('Film').closest('span');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass(
            'bg-secondary',
            'text-secondary-foreground',
            'rounded'
        );

        const badgeIcon = screen
            .getByText('Film')
            .parentElement?.querySelector('svg');
        expect(badgeIcon).toBeInTheDocument();
    });

    it('applies correct text styling to title', () => {
        render(<MediaContext media={mockMediaWithPoster} />);

        const title = screen.getByText('The Matrix');
        expect(title).toHaveClass(
            'text-foreground',
            'text-lg',
            'leading-tight',
            'font-semibold'
        );
    });

    it('applies correct styling to "Review for" label', () => {
        render(<MediaContext media={mockMediaWithPoster} />);

        const label = screen.getByText('Review for');
        expect(label).toHaveClass(
            'text-muted-foreground',
            'text-xs',
            'font-medium',
            'tracking-wide',
            'uppercase'
        );
    });

    it('uses StickyNote icon as fallback for unknown media type', () => {
        const unknownMedia: SafeMediaItem = {
            ...mockMediaWithoutPoster,
            type: 'unknown' as SafeMediaItem['type'],
        };

        render(<MediaContext media={unknownMedia} />);

        const fallbackIcons = screen.getAllByTestId('stickynote-icon');
        expect(fallbackIcons[0]).toBeInTheDocument();
        expect(fallbackIcons[0]).toHaveClass('h-16', 'w-16');
    });

    it('renders responsive layout classes', () => {
        render(<MediaContext media={mockMediaWithPoster} />);

        const title = screen.getByText('The Matrix');
        const layout = title.closest('.flex.flex-col')?.parentElement;
        expect(layout).toBeInTheDocument();
    });

    it('applies responsive padding to content section', () => {
        render(<MediaContext media={mockMediaWithPoster} />);

        const contentSection = screen
            .getByText('The Matrix')
            .closest('.flex.flex-col');
        expect(contentSection).toHaveClass('p-4', 'sm:p-5');
    });

    it('applies responsive gap classes to content section', () => {
        render(<MediaContext media={mockMediaWithPoster} />);

        const contentSection = screen
            .getByText('The Matrix')
            .closest('.flex.flex-col');
        expect(contentSection).toHaveClass('gap-2', 'sm:gap-3');
    });
});
