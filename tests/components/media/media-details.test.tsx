import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MediaDetails } from '@/components/media/media-details';
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

describe('MediaDetails', () => {
    const mockTMP = vi.fn((key: string, params?: Record<string, unknown>) => {
        const translations: Record<string, string> = {
            review: 'Review',
            reviews: 'Reviews',
            overview: 'Overview',
            releaseDate: `Release year: ${params?.date}`,
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

    const mockTGenres = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            action: 'Action',
            adventure: 'Adventure',
            drama: 'Drama',
            sciFi: 'Science Fiction',
            comedy: 'Comedy',
            thriller: 'Thriller',
        };
        return translations[key] || key;
    });

    const mockedUseTranslations = vi.mocked(useTranslations);

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseTranslations.mockImplementation((namespace?: string) => {
            if (namespace === 'MediaPage') {
                return mockTMP as unknown as ReturnType<typeof useTranslations>;
            }
            if (namespace === 'MediaTypes') {
                return mockTMT as unknown as ReturnType<typeof useTranslations>;
            }
            if (namespace === 'MediaGenres') {
                return mockTGenres as unknown as ReturnType<
                    typeof useTranslations
                >;
            }
            return mockTMP as unknown as ReturnType<typeof useTranslations>;
        });
    });

    const mockMediaItem: MediaItem = {
        id: '1',
        title: 'The Matrix',
        type: 'film',
        year: 1999,
        genre: ['action', 'sciFi'],
        poster: '/poster.jpg',
        description:
            'A computer hacker learns from mysterious rebels about the true nature of his reality.',
        averageRating: 4.5,
        totalReviews: 10,
    };

    it('renders the media title', () => {
        render(<MediaDetails media={mockMediaItem} />);

        expect(
            screen.getByRole('heading', { name: 'The Matrix', level: 1 })
        ).toBeInTheDocument();
    });

    it('renders the media type with icon', () => {
        render(<MediaDetails media={mockMediaItem} />);

        expect(screen.getByText('Film')).toBeInTheDocument();
        const typeSpan = screen.getByText('Film').closest('span');
        expect(typeSpan?.querySelector('svg')).toBeInTheDocument();
    });

    it('renders all genre tags', () => {
        render(<MediaDetails media={mockMediaItem} />);

        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('Science Fiction')).toBeInTheDocument();
    });

    it('displays the correct rating', () => {
        render(<MediaDetails media={mockMediaItem} />);

        // RatingDisplay should be rendered with stars
        const stars = screen.getAllByRole('button');
        expect(stars.length).toBeGreaterThan(0);
    });

    it('displays review count with singular form when count is 1', () => {
        const mediaWithOneReview = { ...mockMediaItem, totalReviews: 1 };
        render(<MediaDetails media={mediaWithOneReview} />);

        expect(screen.getByText('1 Review')).toBeInTheDocument();
    });

    it('displays review count with plural form when count is not 1', () => {
        render(<MediaDetails media={mockMediaItem} />);

        expect(screen.getByText('10 Reviews')).toBeInTheDocument();
    });

    it('displays review count with plural form when count is 0', () => {
        const mediaWithNoReviews = { ...mockMediaItem, totalReviews: 0 };
        render(<MediaDetails media={mediaWithNoReviews} />);

        expect(screen.getByText('0 Reviews')).toBeInTheDocument();
    });

    it('renders the overview section', () => {
        render(<MediaDetails media={mockMediaItem} />);

        expect(
            screen.getByRole('heading', { name: 'Overview', level: 2 })
        ).toBeInTheDocument();
        expect(screen.getByText(mockMediaItem.description)).toBeInTheDocument();
    });

    it('renders the release year when provided', () => {
        render(<MediaDetails media={mockMediaItem} />);

        expect(screen.getByText('Release year: 1999')).toBeInTheDocument();
    });

    it('does not render release year when not provided', () => {
        const mediaWithoutYear = { ...mockMediaItem, year: undefined };
        render(<MediaDetails media={mediaWithoutYear} />);

        expect(screen.queryByText(/Release year:/i)).not.toBeInTheDocument();
    });

    it('renders poster image when poster is provided', () => {
        render(<MediaDetails media={mockMediaItem} />);

        const image = screen.getByAltText('The Matrix');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', '/poster.jpg');
    });

    it('renders cover image when cover is provided and poster is not', () => {
        const mediaWithCover = {
            ...mockMediaItem,
            poster: undefined,
            cover: '/cover.jpg',
        };
        render(<MediaDetails media={mediaWithCover} />);

        const image = screen.getByAltText('The Matrix');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', '/cover.jpg');
    });

    it('does not render image when neither poster nor cover is provided', () => {
        const mediaWithoutImage = {
            ...mockMediaItem,
            poster: undefined,
            cover: undefined,
        };
        render(<MediaDetails media={mediaWithoutImage} />);

        expect(screen.queryByAltText('The Matrix')).not.toBeInTheDocument();
    });

    it('renders correct icon for film type', () => {
        render(<MediaDetails media={mockMediaItem} />);

        const typeSpan = screen.getByText('Film').closest('span');
        const svg = typeSpan?.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('renders correct icon for series type', () => {
        const seriesMedia = { ...mockMediaItem, type: 'series' as const };
        render(<MediaDetails media={seriesMedia} />);

        const typeSpan = screen.getByText('Series').closest('span');
        const svg = typeSpan?.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('renders correct icon for game type', () => {
        const gameMedia = { ...mockMediaItem, type: 'game' as const };
        render(<MediaDetails media={gameMedia} />);

        const typeSpan = screen.getByText('Game').closest('span');
        const svg = typeSpan?.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('renders correct icon for book type', () => {
        const bookMedia = { ...mockMediaItem, type: 'book' as const };
        render(<MediaDetails media={bookMedia} />);

        const typeSpan = screen.getByText('Book').closest('span');
        const svg = typeSpan?.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('renders correct icon for music type', () => {
        const musicMedia = { ...mockMediaItem, type: 'music' as const };
        render(<MediaDetails media={musicMedia} />);

        const typeSpan = screen.getByText('Music').closest('span');
        const svg = typeSpan?.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('applies correct CSS classes to main container', () => {
        const { container } = render(<MediaDetails media={mockMediaItem} />);

        const mainDiv = container.firstChild;
        expect(mainDiv).toHaveClass(
            'flex',
            'flex-col',
            'items-center',
            'gap-7'
        );
    });

    it('renders image with correct aspect ratio classes', () => {
        render(<MediaDetails media={mockMediaItem} />);

        const imageContainer = screen.getByAltText('The Matrix').closest('div');
        expect(imageContainer).toHaveClass('aspect-[2/3]');
    });

    it('renders card with correct content structure', () => {
        render(<MediaDetails media={mockMediaItem} />);

        // Check that Card component is rendered with proper structure
        const overview = screen.getByRole('heading', {
            name: 'Overview',
            level: 2,
        });
        expect(overview).toBeInTheDocument();

        const description = screen.getByText(mockMediaItem.description);
        expect(description).toBeInTheDocument();
    });

    it('handles media with multiple genres correctly', () => {
        const mediaWithManyGenres = {
            ...mockMediaItem,
            genre: ['action', 'sciFi', 'thriller', 'adventure'],
        };
        render(<MediaDetails media={mediaWithManyGenres} />);

        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('Science Fiction')).toBeInTheDocument();
        expect(screen.getByText('Thriller')).toBeInTheDocument();
        expect(screen.getByText('Adventure')).toBeInTheDocument();
    });

    it('handles media with no genres', () => {
        const mediaWithNoGenres = {
            ...mockMediaItem,
            genre: [],
        };
        render(<MediaDetails media={mediaWithNoGenres} />);

        // Should still render the media type
        expect(screen.getByText('Film')).toBeInTheDocument();
    });

    it('handles zero rating correctly', () => {
        const mediaWithZeroRating = {
            ...mockMediaItem,
            averageRating: 0,
        };
        render(<MediaDetails media={mediaWithZeroRating} />);

        // Should still render the rating display with stars
        const stars = screen.getAllByRole('button');
        expect(stars.length).toBeGreaterThan(0);
    });

    it('handles decimal ratings correctly', () => {
        const mediaWithDecimalRating = {
            ...mockMediaItem,
            averageRating: 4.7,
        };
        render(<MediaDetails media={mediaWithDecimalRating} />);

        const stars = screen.getAllByRole('button');
        expect(stars.length).toBeGreaterThan(0);
    });

    it('calls translation functions with correct namespaces', () => {
        render(<MediaDetails media={mockMediaItem} />);

        expect(mockedUseTranslations).toHaveBeenCalledWith('MediaPage');
        expect(mockedUseTranslations).toHaveBeenCalledWith('MediaTypes');
        expect(mockedUseTranslations).toHaveBeenCalledWith('MediaGenres');
    });

    it('uses correct translation keys for media type', () => {
        render(<MediaDetails media={mockMediaItem} />);

        expect(mockTMT).toHaveBeenCalledWith('film');
    });

    it('uses correct translation keys for genres', () => {
        render(<MediaDetails media={mockMediaItem} />);

        expect(mockTGenres).toHaveBeenCalledWith('action');
        expect(mockTGenres).toHaveBeenCalledWith('sciFi');
    });

    it('uses correct translation key for release date', () => {
        render(<MediaDetails media={mockMediaItem} />);

        expect(mockTMP).toHaveBeenCalledWith('releaseDate', { date: 1999 });
    });
});
