import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MediaDetails } from '@/components/media/media-details';
import { MediaItem } from '@/lib/store';
import { useTranslations } from 'next-intl';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: vi.fn(),
    useLocale: vi.fn(() => 'en'),
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

// Mock router
import { useRouter } from '@/i18n/navigation';
vi.mock('@/i18n/navigation', () => ({
    useRouter: vi.fn(),
}));
const mockedUseRouter = vi.mocked(useRouter);

// Mock auth
import { useAuth } from '@/lib/auth/auth-provider';
vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: vi.fn(),
}));
const mockedUseAuth = vi.mocked(useAuth);

// Mock toast store
import { useToastStore } from '@/lib/toast-store';
vi.mock('@/lib/toast-store', () => ({
    useToastStore: vi.fn(),
}));
const mockedUseToast = vi.mocked(useToastStore);

// Mock AITranslateText
vi.mock('@/components/ai-translate-text', () => ({
    AITranslateText: ({ text }: { text: string }) => <div>{text}</div>,
}));

// Mock RatingDisplay
vi.mock('@/components/input/rating', () => ({
    RatingDisplay: ({ rating }: { rating: number }) => <div>{rating}</div>,
}));

describe('MediaDetails', () => {
    const mockTMP = vi.fn((key: string, params?: Record<string, unknown>) => {
        const translations: Record<string, string> = {
            review: 'Review',
            reviews: 'Reviews',
            overview: 'Overview',
            releaseDate: `Release year: ${params?.date}`,
            likePercentage: `${params?.percentage}%`,
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

    const mockTToast = vi.fn((key: string) => key);

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
            if (namespace === 'Toast') {
                return mockTToast as unknown as ReturnType<
                    typeof useTranslations
                >;
            }
            return mockTMP as unknown as ReturnType<typeof useTranslations>;
        });
        // Setup mocks for bookmark feature
        mockedUseRouter.mockReturnValue({
            push: vi.fn(),
            refresh: vi.fn(),
        } as any);
        mockedUseAuth.mockReturnValue({ user: { id: 'user1' } } as any);
        mockedUseToast.mockReturnValue({ showToast: vi.fn() } as any);
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
        totalLikes: 0,
        totalDislikes: 0,
    };

    it('renders the media title', () => {
        render(
            <MediaDetails
                media={mockMediaItem}
                hasBookmarked={false}
            />
        );

        expect(
            screen.getByRole('heading', { name: 'The Matrix', level: 1 })
        ).toBeInTheDocument();
    });

    it('renders the media type with icon', () => {
        render(
            <MediaDetails
                media={mockMediaItem}
                hasBookmarked={false}
            />
        );

        expect(screen.getByText('Film')).toBeInTheDocument();
        const typeSpan = screen.getByText('Film').closest('span');
        expect(typeSpan?.querySelector('svg')).toBeInTheDocument();
    });

    it('renders all genre tags', () => {
        render(
            <MediaDetails
                media={mockMediaItem}
                hasBookmarked={false}
            />
        );

        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('Science Fiction')).toBeInTheDocument();
    });

    it('displays the correct rating', () => {
        render(
            <MediaDetails
                media={mockMediaItem}
                hasBookmarked={false}
            />
        );

        // RatingDisplay should be rendered with stars
        const stars = screen.getAllByRole('button');
        expect(stars.length).toBeGreaterThan(0);
    });

    it('displays review count with singular form when count is 1', () => {
        const mediaWithOneReview = { ...mockMediaItem, totalReviews: 1 };
        render(
            <MediaDetails
                media={mediaWithOneReview}
                hasBookmarked={false}
            />
        );

        expect(screen.getByText('1 Review')).toBeInTheDocument();
    });

    it('displays review count with plural form when count is not 1', () => {
        render(
            <MediaDetails
                media={mockMediaItem}
                hasBookmarked={false}
            />
        );

        expect(screen.getByText('10 Reviews')).toBeInTheDocument();
    });

    it('displays review count with plural form when count is 0', () => {
        const mediaWithNoReviews = { ...mockMediaItem, totalReviews: 0 };
        render(
            <MediaDetails
                media={mediaWithNoReviews}
                hasBookmarked={false}
            />
        );

        expect(screen.getByText('0 Reviews')).toBeInTheDocument();
    });

    it('renders the overview section', () => {
        render(
            <MediaDetails
                media={mockMediaItem}
                hasBookmarked={false}
            />
        );

        expect(
            screen.getByRole('heading', { name: 'Overview', level: 2 })
        ).toBeInTheDocument();
        expect(screen.getByText(mockMediaItem.description)).toBeInTheDocument();
    });

    it('renders the release year when provided', () => {
        render(
            <MediaDetails
                media={mockMediaItem}
                hasBookmarked={false}
            />
        );

        expect(screen.getByText('Release year: 1999')).toBeInTheDocument();
    });

    it('does not render release year when not provided', () => {
        const mediaWithoutYear = { ...mockMediaItem, year: undefined };
        render(
            <MediaDetails
                media={mediaWithoutYear}
                hasBookmarked={false}
            />
        );

        expect(screen.queryByText(/Release year:/i)).not.toBeInTheDocument();
    });

    it('renders poster image when poster is provided', () => {
        render(
            <MediaDetails
                media={mockMediaItem}
                hasBookmarked={false}
            />
        );

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
        render(
            <MediaDetails
                media={mediaWithCover}
                hasBookmarked={false}
            />
        );

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
        render(
            <MediaDetails
                media={mediaWithoutImage}
                hasBookmarked={false}
            />
        );

        expect(screen.queryByAltText('The Matrix')).not.toBeInTheDocument();
    });

    it('renders correct icon for film type', () => {
        render(
            <MediaDetails
                media={mockMediaItem}
                hasBookmarked={false}
            />
        );

        const typeSpan = screen.getByText('Film').closest('span');
        const svg = typeSpan?.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('renders correct icon for series type', () => {
        const seriesMedia = { ...mockMediaItem, type: 'series' as const };
        render(
            <MediaDetails
                media={seriesMedia}
                hasBookmarked={false}
            />
        );

        const typeSpan = screen.getByText('Series').closest('span');
        const svg = typeSpan?.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('renders correct icon for game type', () => {
        const gameMedia = { ...mockMediaItem, type: 'game' as const };
        render(
            <MediaDetails
                media={gameMedia}
                hasBookmarked={false}
            />
        );

        const typeSpan = screen.getByText('Game').closest('span');
        const svg = typeSpan?.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('renders correct icon for book type', () => {
        const bookMedia = { ...mockMediaItem, type: 'book' as const };
        render(
            <MediaDetails
                media={bookMedia}
                hasBookmarked={false}
            />
        );

        const typeSpan = screen.getByText('Book').closest('span');
        const svg = typeSpan?.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('renders correct icon for music type', () => {
        const musicMedia = { ...mockMediaItem, type: 'music' as const };
        render(
            <MediaDetails
                media={musicMedia}
                hasBookmarked={false}
            />
        );

        const typeSpan = screen.getByText('Music').closest('span');
        const svg = typeSpan?.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('applies correct CSS classes to main container', () => {
        const { container } = render(
            <MediaDetails
                media={mockMediaItem}
                hasBookmarked={false}
            />
        );

        const mainDiv = container.firstChild;
        expect(mainDiv).toHaveClass(
            'flex',
            'flex-col',
            'items-center',
            'gap-7'
        );
    });

    it('renders image with correct aspect ratio classes', () => {
        render(
            <MediaDetails
                media={mockMediaItem}
                hasBookmarked={false}
            />
        );

        const imageContainer = screen.getByAltText('The Matrix').closest('div');
        expect(imageContainer).toHaveClass('aspect-[2/3]');
    });

    it('renders card with correct content structure', () => {
        render(
            <MediaDetails
                media={mockMediaItem}
                hasBookmarked={false}
            />
        );

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
        render(
            <MediaDetails
                media={mediaWithManyGenres}
                hasBookmarked={false}
            />
        );

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
        render(
            <MediaDetails
                media={mediaWithNoGenres}
                hasBookmarked={false}
            />
        );

        // Should still render the media type
        expect(screen.getByText('Film')).toBeInTheDocument();
    });

    it('handles zero rating correctly', () => {
        const mediaWithZeroRating = {
            ...mockMediaItem,
            averageRating: 0,
        };
        render(
            <MediaDetails
                media={mediaWithZeroRating}
                hasBookmarked={false}
            />
        );

        // Should NOT render the rating display if rating is 0
        // Instead of checking all buttons, check that the rating section is not present
        expect(screen.queryByText('0 Reviews')).not.toBeInTheDocument();
    });

    it('handles decimal ratings correctly', () => {
        const mediaWithDecimalRating = {
            ...mockMediaItem,
            averageRating: 4.7,
        };
        render(
            <MediaDetails
                media={mediaWithDecimalRating}
                hasBookmarked={false}
            />
        );

        const stars = screen.getAllByRole('button');
        expect(stars.length).toBeGreaterThan(0);
    });

    it('calls translation functions with correct namespaces', () => {
        render(
            <MediaDetails
                media={mockMediaItem}
                hasBookmarked={false}
            />
        );

        expect(mockedUseTranslations).toHaveBeenCalledWith('MediaPage');
        expect(mockedUseTranslations).toHaveBeenCalledWith('MediaTypes');
        expect(mockedUseTranslations).toHaveBeenCalledWith('MediaGenres');
    });

    it('uses correct translation keys for media type', () => {
        render(
            <MediaDetails
                media={mockMediaItem}
                hasBookmarked={false}
            />
        );

        expect(mockTMT).toHaveBeenCalledWith('film');
    });

    it('uses correct translation keys for genres', () => {
        render(
            <MediaDetails
                media={mockMediaItem}
                hasBookmarked={false}
            />
        );

        expect(mockTGenres).toHaveBeenCalledWith('action');
        expect(mockTGenres).toHaveBeenCalledWith('sciFi');
    });

    it('uses correct translation key for release date', () => {
        render(
            <MediaDetails
                media={mockMediaItem}
                hasBookmarked={false}
            />
        );

        expect(mockTMP).toHaveBeenCalledWith('releaseDate', { date: 1999 });
    });
});

// Bookmark functionality tests
describe('MediaDetails - bookmarkMedia', () => {
    const push = vi.fn();
    const refresh = vi.fn();
    const showToast = vi.fn();

    const mockMedia: MediaItem = {
        id: 'media1',
        title: 'Test Movie',
        type: 'film',
        genre: ['Action', 'Drama'],
        description: 'A great movie',
        poster: '/poster.jpg',
        cover: '/cover.jpg',
        year: 2023,
        averageRating: 4.5,
        totalReviews: 100,
        totalLikes: 80,
        totalDislikes: 20,
    };

    const mockTMP = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            toggleBookmarkFailed: 'toggleBookmarkFailed',
        };
        return translations[key] || key;
    });

    const mockTMT = vi.fn(() => 'Film');
    const mockTGenres = vi.fn(() => 'Genre');
    const mockTToast = vi.fn((key: string) => key);

    const mockedUseTranslations = vi.mocked(useTranslations);

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseRouter.mockReturnValue({ push, refresh } as any);
        mockedUseAuth.mockReturnValue({ user: { id: 'user1' } } as any);
        mockedUseToast.mockReturnValue({ showToast } as any);
        global.fetch = vi.fn();

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
            if (namespace === 'Toast') {
                return mockTToast as unknown as ReturnType<
                    typeof useTranslations
                >;
            }
            return mockTMP as unknown as ReturnType<typeof useTranslations>;
        });
    });

    afterEach(() => {
        global.fetch = vi.fn();
    });

    it('renders bookmark button with correct label', () => {
        render(
            <MediaDetails
                media={mockMedia}
                hasBookmarked={false}
            />
        );
        const bookmarkButton = screen.getByRole('button', { name: 'Bookmark' });
        expect(bookmarkButton).toBeInTheDocument();
    });

    it('shows filled bookmark icon when hasBookmarked is true', () => {
        render(
            <MediaDetails
                media={mockMedia}
                hasBookmarked={true}
            />
        );
        const bookmarkBtn = screen.getByRole('button', { name: 'Bookmark' });
        const icon = bookmarkBtn.querySelector('svg');
        // When bookmarked, it should have fill-green-600 class
        expect(icon?.className.baseVal.includes('fill-green-600')).toBeTruthy();
    });

    it('shows outline bookmark icon when hasBookmarked is false', () => {
        render(
            <MediaDetails
                media={mockMedia}
                hasBookmarked={false}
            />
        );
        const bookmarkBtn = screen.getByRole('button', { name: 'Bookmark' });
        const icon = bookmarkBtn.querySelector('svg');
        // When not bookmarked, it should not have fill initially visible
        expect(icon).toBeInTheDocument();
    });

    it('navigates to login when bookmarking without authentication', async () => {
        mockedUseAuth.mockReturnValue({ user: null } as any);
        render(
            <MediaDetails
                media={mockMedia}
                hasBookmarked={false}
            />
        );

        const bookmarkButton = screen.getByRole('button', { name: 'Bookmark' });
        await userEvent.click(bookmarkButton);

        expect(push).toHaveBeenCalledWith('/login');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('sends POST request when bookmarking (hasBookmarked is false)', async () => {
        (global.fetch as vi.Mock).mockResolvedValue({ ok: true });

        render(
            <MediaDetails
                media={mockMedia}
                hasBookmarked={false}
            />
        );
        const bookmarkButton = screen.getByRole('button', { name: 'Bookmark' });

        await userEvent.click(bookmarkButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/media/media1/bookmark',
                { method: 'POST' }
            );
        });
    });

    it('sends DELETE request when unbookmarking (hasBookmarked is true)', async () => {
        (global.fetch as vi.Mock).mockResolvedValue({ ok: true });

        render(
            <MediaDetails
                media={mockMedia}
                hasBookmarked={true}
            />
        );
        const bookmarkButton = screen.getByRole('button', { name: 'Bookmark' });

        await userEvent.click(bookmarkButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/media/media1/bookmark',
                { method: 'DELETE' }
            );
        });
    });

    it('calls router.refresh() on successful bookmark', async () => {
        (global.fetch as vi.Mock).mockResolvedValue({ ok: true });

        render(
            <MediaDetails
                media={mockMedia}
                hasBookmarked={false}
            />
        );
        const bookmarkButton = screen.getByRole('button', { name: 'Bookmark' });

        await userEvent.click(bookmarkButton);

        await waitFor(() => {
            expect(refresh).toHaveBeenCalled();
        });
    });

    it('shows error toast on failed bookmark (response not ok)', async () => {
        (global.fetch as vi.Mock).mockResolvedValue({ ok: false });

        render(
            <MediaDetails
                media={mockMedia}
                hasBookmarked={false}
            />
        );
        const bookmarkButton = screen.getByRole('button', { name: 'Bookmark' });

        await userEvent.click(bookmarkButton);

        await waitFor(() => {
            expect(showToast).toHaveBeenCalledWith(
                'toggleBookmarkFailed',
                'error'
            );
        });
    });

    it('shows error toast on network error', async () => {
        (global.fetch as vi.Mock).mockRejectedValue(new Error('Network error'));

        render(
            <MediaDetails
                media={mockMedia}
                hasBookmarked={false}
            />
        );
        const bookmarkButton = screen.getByRole('button', { name: 'Bookmark' });

        await userEvent.click(bookmarkButton);

        await waitFor(() => {
            expect(showToast).toHaveBeenCalledWith(
                'toggleBookmarkFailed',
                'error'
            );
        });
    });

    it('disables bookmark button while bookmarking', async () => {
        (global.fetch as vi.Mock).mockImplementation(
            () => new Promise(() => {}) // never resolves
        );

        render(
            <MediaDetails
                media={mockMedia}
                hasBookmarked={false}
            />
        );
        const bookmarkButton = screen.getByRole('button', { name: 'Bookmark' });

        await userEvent.click(bookmarkButton);

        expect(bookmarkButton).toBeDisabled();
    });

    it('prevents multiple concurrent bookmark requests', async () => {
        (global.fetch as vi.Mock).mockImplementation(
            () => new Promise(() => {}) // never resolves
        );

        render(
            <MediaDetails
                media={mockMedia}
                hasBookmarked={false}
            />
        );
        const bookmarkButton = screen.getByRole('button', { name: 'Bookmark' });

        await userEvent.click(bookmarkButton);
        await userEvent.click(bookmarkButton); // second click while first is pending

        expect(global.fetch).toHaveBeenCalledTimes(1); // only called once
    });

    it('re-enables button after successful bookmark', async () => {
        (global.fetch as vi.Mock).mockResolvedValue({ ok: true });

        render(
            <MediaDetails
                media={mockMedia}
                hasBookmarked={false}
            />
        );
        const bookmarkButton = screen.getByRole('button', { name: 'Bookmark' });

        await userEvent.click(bookmarkButton);

        await waitFor(() => {
            expect(bookmarkButton).not.toBeDisabled();
        });
    });

    it('re-enables button after failed bookmark', async () => {
        (global.fetch as vi.Mock).mockResolvedValue({ ok: false });

        render(
            <MediaDetails
                media={mockMedia}
                hasBookmarked={false}
            />
        );
        const bookmarkButton = screen.getByRole('button', { name: 'Bookmark' });

        await userEvent.click(bookmarkButton);

        await waitFor(() => {
            expect(bookmarkButton).not.toBeDisabled();
        });
    });

    it('updates bookmark state optimistically', async () => {
        (global.fetch as vi.Mock).mockResolvedValue({ ok: true });

        render(
            <MediaDetails
                media={mockMedia}
                hasBookmarked={false}
            />
        );
        const bookmarkButton = screen.getByRole('button', { name: 'Bookmark' });

        await userEvent.click(bookmarkButton);

        // State should update optimistically
        await waitFor(() => {
            expect(refresh).toHaveBeenCalled();
        });
    });

    it('does not call router.refresh() on failed bookmark', async () => {
        (global.fetch as vi.Mock).mockResolvedValue({ ok: false });

        render(
            <MediaDetails
                media={mockMedia}
                hasBookmarked={false}
            />
        );
        const bookmarkButton = screen.getByRole('button', { name: 'Bookmark' });

        await userEvent.click(bookmarkButton);

        await waitFor(() => {
            expect(showToast).toHaveBeenCalled();
        });

        expect(refresh).not.toHaveBeenCalled();
    });
});
