import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MediaContext } from '@/components/media/media-context';
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

describe('MediaContext', () => {
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

    it('renders media title', () => {
        render(<MediaContext media={mockMediaItem} />);
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    it('renders media type', () => {
        render(<MediaContext media={mockMediaItem} />);
        expect(screen.getByText('Film')).toBeInTheDocument();
    });

    it('renders media genres', () => {
        render(<MediaContext media={mockMediaItem} />);
        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('Science Fiction')).toBeInTheDocument();
    });

    it('renders media description', () => {
        render(<MediaContext media={mockMediaItem} />);
        expect(
            screen.getByText(
                'A computer hacker learns from mysterious rebels about the true nature of his reality.'
            )
        ).toBeInTheDocument();
    });

    it('renders average rating and total reviews', () => {
        render(<MediaContext media={mockMediaItem} />);
        expect(screen.getByText('10 Reviews')).toBeInTheDocument();
    });

    it('renders singular review text when totalReviews is 1', () => {
        const mediaWithOneReview = { ...mockMediaItem, totalReviews: 1 };
        render(<MediaContext media={mediaWithOneReview} />);
        expect(screen.getByText('1 Review')).toBeInTheDocument();
    });

    it('renders release year when provided', () => {
        render(<MediaContext media={mockMediaItem} />);
        expect(screen.getByText('Release year: 1999')).toBeInTheDocument();
    });

    it('does not render release year when not provided', () => {
        const mediaWithoutYear = { ...mockMediaItem, year: undefined };
        render(<MediaContext media={mediaWithoutYear} />);
        expect(screen.queryByText(/Release year/)).not.toBeInTheDocument();
    });

    it('renders poster image when provided', () => {
        render(<MediaContext media={mockMediaItem} />);
        const image = screen.getByAltText('The Matrix');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', '/poster.jpg');
    });

    it('renders cover image when poster is not provided', () => {
        const mediaWithCover = {
            ...mockMediaItem,
            poster: undefined,
            cover: '/cover.jpg',
        };
        render(<MediaContext media={mediaWithCover} />);
        const image = screen.getByAltText('The Matrix');
        expect(image).toHaveAttribute('src', '/cover.jpg');
    });

    it('does not render image when neither poster nor cover is provided', () => {
        const mediaWithoutImage = {
            ...mockMediaItem,
            poster: undefined,
            cover: undefined,
        };
        render(<MediaContext media={mediaWithoutImage} />);
        expect(screen.queryByAltText('The Matrix')).not.toBeInTheDocument();
    });

    it('renders overview heading', () => {
        render(<MediaContext media={mockMediaItem} />);
        expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    it('renders correct icon for different media types', () => {
        const seriesMedia = { ...mockMediaItem, type: 'series' as const };
        const { rerender } = render(<MediaContext media={mockMediaItem} />);
        expect(screen.getByText('Film')).toBeInTheDocument();

        rerender(<MediaContext media={seriesMedia} />);
        expect(screen.getByText('Series')).toBeInTheDocument();
    });
});
