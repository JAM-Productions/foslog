import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MediaCard from '@/components/media/media-card';
import { MediaItem } from '@/lib/store';
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
        sizes,
    }: {
        src: string;
        alt: string;
        fill?: boolean;
        className?: string;
        sizes?: string;
    }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            data-fill={fill}
            data-sizes={sizes}
            className={className}
        />
    ),
}));

describe('MediaCard', () => {
    const mockT = vi.fn((key: string, params?: Record<string, unknown>) => {
        const translations: Record<string, string> = {
            director: 'Dir.',
            by: 'by',
            more: `+${params?.count}`,
        };
        return translations[key] || key;
    });

    const mockTGenres = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            action: 'Action',
            adventure: 'Adventure',
            drama: 'Drama',
            sciFi: 'Science Fiction',
            comedy: 'Comedy',
            thriller: 'Thriller',
            fantasy: 'Fantasy',
            horror: 'Horror',
        };
        return translations[key] || key;
    });

    const mockTMediaTypes = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            film: 'Film',
            series: 'Series',
            game: 'Game',
            book: 'Book',
            music: 'Music',
            musicSingle: 'Music',
        };
        return translations[key] || key;
    });

    const mockedUseTranslations = vi.mocked(useTranslations);

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseTranslations.mockImplementation((namespace?: string) => {
            if (namespace === 'MediaCard') {
                return mockT as unknown as ReturnType<typeof useTranslations>;
            }
            if (namespace === 'MediaGenres') {
                return mockTGenres as unknown as ReturnType<
                    typeof useTranslations
                >;
            }
            if (namespace === 'MediaTypes') {
                return mockTMediaTypes as unknown as ReturnType<
                    typeof useTranslations
                >;
            }
            return mockT as unknown as ReturnType<typeof useTranslations>;
        });
    });

    const mockMediaItem: MediaItem = {
        id: '1',
        title: 'The Matrix',
        type: 'film',
        year: 1999,
        director: 'Wachowski Sisters',
        genre: ['action', 'sciFi'],
        poster: '/poster.jpg',
        description:
            'A computer hacker learns about the true nature of reality.',
        averageRating: 4.5,
        totalReviews: 150,
        totalLikes: 0,
        totalDislikes: 0,
    };

    describe('Rating and Likes Display', () => {
        it('displays the star rating when averageRating is greater than 0', () => {
            render(<MediaCard media={mockMediaItem} />);

            expect(screen.getByText('4.5')).toBeInTheDocument();
            expect(
                screen.queryByText(/123/)
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(/45/)
            ).not.toBeInTheDocument();
        });

        it('displays likes and dislikes when averageRating is 0', () => {
            const mediaWithLikes = {
                ...mockMediaItem,
                averageRating: 0,
                totalLikes: 123,
                totalDislikes: 45,
            };
            render(<MediaCard media={mediaWithLikes} />);

            expect(screen.queryByText('0.0')).not.toBeInTheDocument();
            expect(screen.getByText('123')).toBeInTheDocument();
            expect(screen.getByText('45')).toBeInTheDocument();
        });

        it('displays nothing when averageRating, likes, and dislikes are all 0', () => {
            const mediaWithNoRatings = {
                ...mockMediaItem,
                averageRating: 0,
                totalLikes: 0,
                totalDislikes: 0,
            };
            render(<MediaCard media={mediaWithNoRatings} />);

            expect(screen.queryByText('0.0')).not.toBeInTheDocument();
            expect(
                screen.queryByText(/123/)
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(/45/)
            ).not.toBeInTheDocument();
        });
    });

    describe('Rendering', () => {
        it('renders the media title', () => {
            render(<MediaCard media={mockMediaItem} />);

            expect(screen.getByText('The Matrix')).toBeInTheDocument();
        });

        it('renders the media type badge', () => {
            render(<MediaCard media={mockMediaItem} />);

            expect(screen.getByText('Film')).toBeInTheDocument();
        });

        it('renders the year badge when year is provided', () => {
            render(<MediaCard media={mockMediaItem} />);

            expect(screen.getByText('1999')).toBeInTheDocument();
        });

        it('does not render year badge when year is not provided', () => {
            const mediaWithoutYear = { ...mockMediaItem, year: undefined };
            render(<MediaCard media={mediaWithoutYear} />);

            expect(screen.queryByText(/\d{4}/)).not.toBeInTheDocument();
        });

        it('renders the poster image when provided', () => {
            render(<MediaCard media={mockMediaItem} />);

            const image = screen.getByAltText('The Matrix');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', '/poster.jpg');
        });

        it('renders the cover image when poster is not provided', () => {
            const mediaWithCover = {
                ...mockMediaItem,
                poster: undefined,
                cover: '/cover.jpg',
            };
            render(<MediaCard media={mediaWithCover} />);

            const image = screen.getByAltText('The Matrix');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', '/cover.jpg');
        });

        it('renders a placeholder icon when no image is provided', () => {
            const mediaWithoutImage = {
                ...mockMediaItem,
                poster: undefined,
                cover: undefined,
            };
            render(<MediaCard media={mediaWithoutImage} />);

            expect(screen.queryByAltText('The Matrix')).not.toBeInTheDocument();
            // Check for SVG icon (media type icon as placeholder)
            const placeholderDiv = screen
                .getByText('Film')
                .closest('div')
                ?.parentElement?.querySelector('.h-16');
            expect(placeholderDiv).toBeInTheDocument();
        });

        it('renders director label when director is provided', () => {
            render(<MediaCard media={mockMediaItem} />);

            expect(
                screen.getByText('Dir. Wachowski Sisters')
            ).toBeInTheDocument();
        });

        it('renders author label when author is provided', () => {
            const bookMedia = {
                ...mockMediaItem,
                type: 'book' as const,
                director: undefined,
                author: 'J.K. Rowling',
            };
            render(<MediaCard media={bookMedia} />);

            expect(screen.getByText('by J.K. Rowling')).toBeInTheDocument();
        });

        it('renders artist label when artist is provided', () => {
            const musicMedia = {
                ...mockMediaItem,
                type: 'music' as const,
                director: undefined,
                author: undefined,
                artist: 'The Beatles',
            };
            render(<MediaCard media={musicMedia} />);

            expect(screen.getByText('The Beatles')).toBeInTheDocument();
        });

        it('does not render creator label when none is provided', () => {
            const mediaWithoutCreator = {
                ...mockMediaItem,
                director: undefined,
                author: undefined,
                artist: undefined,
            };
            const { container } = render(
                <MediaCard media={mediaWithoutCreator} />
            );

            // Check that there's no creator paragraph
            const creatorElements = container.querySelectorAll(
                '.text-muted-foreground.line-clamp-1.text-xs'
            );
            expect(creatorElements.length).toBe(0);
        });

        it('renders up to 5 genre tags', () => {
            render(<MediaCard media={mockMediaItem} />);

            expect(screen.getByText('Action')).toBeInTheDocument();
            expect(screen.getByText('Science Fiction')).toBeInTheDocument();
        });

        it('renders "more" badge when more than 5 genres', () => {
            const mediaWithManyGenres = {
                ...mockMediaItem,
                genre: ['action', 'sciFi', 'thriller', 'adventure', 'drama', 'comedy'],
            };
            render(<MediaCard media={mediaWithManyGenres} />);

            expect(screen.getByText('Action')).toBeInTheDocument();
            expect(screen.getByText('Science Fiction')).toBeInTheDocument();
            expect(screen.getByText('Thriller')).toBeInTheDocument();
            expect(screen.getByText('Adventure')).toBeInTheDocument();
            expect(screen.getByText('Drama')).toBeInTheDocument();
            expect(screen.getByText('+1')).toBeInTheDocument();
        });

        it('does not render "more" badge when 5 or fewer genres', () => {
            render(<MediaCard media={mockMediaItem} />);

            expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
        });

        it('renders the rating display', () => {
            render(<MediaCard media={mockMediaItem} />);

            expect(screen.getByText('4.5')).toBeInTheDocument();
        });

        it('renders the total reviews count', () => {
            render(<MediaCard media={mockMediaItem} />);

            expect(screen.getByText('150')).toBeInTheDocument();
        });

        it('formats large review counts with locale string', () => {
            const mediaWithManyReviews = {
                ...mockMediaItem,
                totalReviews: 1500,
            };
            const { container } = render(
                <MediaCard media={mediaWithManyReviews} />
            );

            // Check that the review count is rendered (formatting may vary by locale)
            const reviewCountDiv = container.querySelector(
                '.text-muted-foreground.flex.items-center.gap-1.text-xs'
            );
            expect(reviewCountDiv?.textContent).toMatch(/1[,\s]?500/);
        });
    });

    describe('Media Type Icons', () => {
        it('renders Clapperboard icon for film type', () => {
            render(<MediaCard media={mockMediaItem} />);

            const typeBadge = screen.getByText('Film').closest('div');
            expect(typeBadge?.querySelector('svg')).toBeInTheDocument();
        });

        it('renders Tv icon for series type', () => {
            const seriesMedia = { ...mockMediaItem, type: 'series' as const };
            render(<MediaCard media={seriesMedia} />);

            const typeBadge = screen.getByText('Series').closest('div');
            expect(typeBadge?.querySelector('svg')).toBeInTheDocument();
        });

        it('renders Gamepad2 icon for game type', () => {
            const gameMedia = { ...mockMediaItem, type: 'game' as const };
            render(<MediaCard media={gameMedia} />);

            const typeBadge = screen.getByText('Game').closest('div');
            expect(typeBadge?.querySelector('svg')).toBeInTheDocument();
        });

        it('renders Book icon for book type', () => {
            const bookMedia = {
                ...mockMediaItem,
                type: 'book' as const,
                director: undefined,
                author: 'Author Name',
            };
            render(<MediaCard media={bookMedia} />);

            const typeBadge = screen.getByText('Book').closest('div');
            expect(typeBadge?.querySelector('svg')).toBeInTheDocument();
        });

        it('renders Music icon for music type', () => {
            const musicMedia = {
                ...mockMediaItem,
                type: 'music' as const,
                director: undefined,
                artist: 'Artist Name',
            };
            render(<MediaCard media={musicMedia} />);

            const typeBadge = screen.getByText('Music').closest('div');
            expect(typeBadge?.querySelector('svg')).toBeInTheDocument();
        });

        it('uses musicSingle translation key for music type', () => {
            const musicMedia = {
                ...mockMediaItem,
                type: 'music' as const,
                director: undefined,
                artist: 'Artist Name',
            };
            render(<MediaCard media={musicMedia} />);

            expect(mockTMediaTypes).toHaveBeenCalledWith('musicSingle');
        });
    });

    describe('StarRating Component', () => {
        it('renders 5 stars', () => {
            const { container } = render(<MediaCard media={mockMediaItem} />);

            const stars = container.querySelectorAll('.relative');
            // Filter to only star elements (they contain Star icons)
            const starElements = Array.from(stars).filter((el) =>
                el.querySelector('svg')
            );
            expect(starElements.length).toBeGreaterThanOrEqual(5);
        });

        it('displays correct rating value', () => {
            render(<MediaCard media={mockMediaItem} />);

            expect(screen.getByText('4.5')).toBeInTheDocument();
        });

        it('handles zero rating', () => {
            const mediaWithZeroRating = {
                ...mockMediaItem,
                averageRating: 0,
            };
            render(<MediaCard media={mediaWithZeroRating} />);

            expect(screen.queryByText('0.0')).not.toBeInTheDocument();
        });

        it('handles full rating of 5', () => {
            const mediaWithFullRating = {
                ...mockMediaItem,
                averageRating: 5,
            };
            render(<MediaCard media={mediaWithFullRating} />);

            expect(screen.getByText('5.0')).toBeInTheDocument();
        });

        it('formats rating to 1 decimal place', () => {
            const mediaWithPreciseRating = {
                ...mockMediaItem,
                averageRating: 3.789,
            };
            render(<MediaCard media={mediaWithPreciseRating} />);

            expect(screen.getByText('3.8')).toBeInTheDocument();
        });
    });

    describe('Styling and Classes', () => {
        it('applies default Card classes', () => {
            const { container } = render(<MediaCard media={mockMediaItem} />);

            const card = container.querySelector('.group');
            expect(card).toHaveClass('transition-all', 'hover:shadow-lg');
        });

        it('applies custom className', () => {
            const { container } = render(
                <MediaCard
                    media={mockMediaItem}
                    className="custom-class"
                />
            );

            const card = container.querySelector('.group');
            expect(card).toHaveClass('custom-class');
        });

        it('applies title attribute to title for tooltips', () => {
            render(<MediaCard media={mockMediaItem} />);

            const title = screen.getByText('The Matrix');
            expect(title).toHaveAttribute('title', 'The Matrix');
        });

        it('applies title attribute to creator label', () => {
            render(<MediaCard media={mockMediaItem} />);

            const creator = screen.getByText('Dir. Wachowski Sisters');
            expect(creator).toHaveAttribute('title', 'Dir. Wachowski Sisters');
        });
    });

    describe('Edge Cases', () => {
        it('handles media with no genres', () => {
            const mediaWithNoGenres = {
                ...mockMediaItem,
                genre: [],
            };
            render(<MediaCard media={mediaWithNoGenres} />);

            // Should still render the card
            expect(screen.getByText('The Matrix')).toBeInTheDocument();
        });

        it('handles media with 1 genre', () => {
            const mediaWithOneGenre = {
                ...mockMediaItem,
                genre: ['action'],
            };
            render(<MediaCard media={mediaWithOneGenre} />);

            expect(screen.getByText('Action')).toBeInTheDocument();
            expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
        });

        it('handles media with exactly 2 genres', () => {
            render(<MediaCard media={mockMediaItem} />);

            expect(screen.getByText('Action')).toBeInTheDocument();
            expect(screen.getByText('Science Fiction')).toBeInTheDocument();
            expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
        });

        it('handles media with 6 genres showing +1', () => {
            const mediaWithSixGenres = {
                ...mockMediaItem,
                genre: ['action', 'sciFi', 'thriller', 'adventure', 'drama', 'comedy'],
            };
            render(<MediaCard media={mediaWithSixGenres} />);

            expect(screen.getByText('Action')).toBeInTheDocument();
            expect(screen.getByText('Science Fiction')).toBeInTheDocument();
            expect(screen.getByText('Thriller')).toBeInTheDocument();
            expect(screen.getByText('Adventure')).toBeInTheDocument();
            expect(screen.getByText('Drama')).toBeInTheDocument();
            expect(screen.getByText('+1')).toBeInTheDocument();
            expect(screen.queryByText('Comedy')).not.toBeInTheDocument();
        });

        it('handles zero reviews', () => {
            const mediaWithNoReviews = {
                ...mockMediaItem,
                totalReviews: 0,
            };
            render(<MediaCard media={mediaWithNoReviews} />);

            expect(screen.getByText('0')).toBeInTheDocument();
        });

        it('handles long titles with line clamp', () => {
            const mediaWithLongTitle = {
                ...mockMediaItem,
                title: 'This is a very long title that should be clamped at two lines to prevent overflow issues',
            };
            render(<MediaCard media={mediaWithLongTitle} />);

            const title = screen.getByText(mediaWithLongTitle.title);
            expect(title).toHaveClass('line-clamp-2');
        });

        it('handles long creator names with line clamp', () => {
            const mediaWithLongCreator = {
                ...mockMediaItem,
                director:
                    'A Very Long Director Name That Should Be Clamped At One Line',
            };
            render(<MediaCard media={mediaWithLongCreator} />);

            const creator = screen.getByText(
                `Dir. ${mediaWithLongCreator.director}`
            );
            expect(creator).toHaveClass('line-clamp-1');
        });
    });

    describe('Translation Keys', () => {
        it('calls translation functions with correct namespaces', () => {
            render(<MediaCard media={mockMediaItem} />);

            expect(mockedUseTranslations).toHaveBeenCalledWith('MediaCard');
            expect(mockedUseTranslations).toHaveBeenCalledWith('MediaGenres');
            expect(mockedUseTranslations).toHaveBeenCalledWith('MediaTypes');
        });

        it('uses correct translation key for director', () => {
            render(<MediaCard media={mockMediaItem} />);

            expect(mockT).toHaveBeenCalledWith('director');
        });

        it('uses correct translation key for author', () => {
            const bookMedia = {
                ...mockMediaItem,
                type: 'book' as const,
                director: undefined,
                author: 'Author Name',
            };
            render(<MediaCard media={bookMedia} />);

            expect(mockT).toHaveBeenCalledWith('by');
        });

        it('uses correct translation key for more badge', () => {
            const mediaWithManyGenres = {
                ...mockMediaItem,
                genre: ['action', 'sciFi', 'thriller', 'adventure', 'drama', 'comedy'],
            };
            render(<MediaCard media={mediaWithManyGenres} />);

            expect(mockT).toHaveBeenCalledWith('more', { count: 1 });
        });

        it('uses correct translation keys for genres', () => {
            render(<MediaCard media={mockMediaItem} />);

            expect(mockTGenres).toHaveBeenCalledWith('action');
            expect(mockTGenres).toHaveBeenCalledWith('sciFi');
        });
    });
});
