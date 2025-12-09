import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MediaClient } from '@/app/[locale]/media/[id]/media-client';
import { SafeMediaItemWithReviews } from '@/lib/types';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
    usePathname: vi.fn(),
}));

vi.mock('@/components/pagination/pagination', () => ({
    default: ({
        currentPage,
        totalPages,
    }: {
        currentPage: number;
        totalPages: number;
    }) => (
        <div data-testid="pagination">
            Pagination - Page {currentPage} of {totalPages}
        </div>
    ),
}));

// Mock the sub-components
vi.mock('@/components/media/media-details', () => ({
    MediaDetails: ({ media }: { media: any }) => (
        <div data-testid="media-details">
            Media Details - {media.title}
        </div>
    ),
}));

vi.mock('@/components/review/review-form', () => ({
    ReviewForm: () => <div data-testid="review-form">Review Form</div>,
}));

vi.mock('@/components/review/review-list', () => ({
    ReviewList: ({ reviews }: { reviews: any[] }) => (
        <div data-testid="review-list">Review List - {reviews.length} reviews</div>
    ),
}));

vi.mock('@/components/button/back-button', () => ({
    BackButton: () => <div data-testid="back-button">Back Button</div>,
}));

const mockMediaItem: SafeMediaItemWithReviews = {
    id: '1',
    title: 'Test Movie',
    type: 'film',
    description: 'A test movie',
    genre: ['Drama'],
    averageRating: 8.5,
    totalReviews: 2,
    totalLikes: 1,
    totalDislikes: 0,
    year: 2023,
    totalPages: 1,
    currentPage: 1,
    reviews: [
        {
            id: '1',
            mediaId: '1',
            userId: '1',
            rating: 8,
            review: 'Great movie!',
            createdAt: new Date(),
            updatedAt: new Date(),
            user: {
                id: '1',
                name: 'John Doe',
                email: 'john@doe.com',
                joinedAt: new Date(),
            },
        },
        {
            id: '2',
            mediaId: '1',
            userId: '2',
            rating: 9,
            review: 'Amazing!',
            createdAt: new Date(),
            updatedAt: new Date(),
            user: {
                id: '2',
                name: 'Jane Smith',
                email: 'jane@smith.com',
                joinedAt: new Date(),
            },
        },
    ],
};

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const translations: Record<string, string> = {
            mediaNotFound: 'Media not found',
            reviews: 'Reviews',
            noReviews: 'No reviews yet',
            leaveReview: 'Leave a Review',
        };
        return translations[key] || key;
    },
}));

describe('MediaClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders media details when media is found', () => {
        render(<MediaClient mediaItem={mockMediaItem} />);

        expect(screen.getByTestId('media-details')).toBeInTheDocument();
        expect(screen.getByText(/Test Movie/)).toBeInTheDocument();
    });

    it('renders back button', () => {
        render(<MediaClient mediaItem={mockMediaItem} />);

        expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('renders review list when reviews exist', () => {
        render(<MediaClient mediaItem={mockMediaItem} />);

        expect(screen.getByTestId('review-list')).toBeInTheDocument();
        expect(screen.getByText(/2 reviews/)).toBeInTheDocument();
    });

    it('renders review form', () => {
        render(<MediaClient mediaItem={mockMediaItem} />);

        expect(screen.getByTestId('review-form')).toBeInTheDocument();
    });

    it('displays review count in header', () => {
        render(<MediaClient mediaItem={mockMediaItem} />);

        expect(screen.getByText(/Reviews/)).toBeInTheDocument();
        expect(screen.getByText(/\(2\)/)).toBeInTheDocument();
    });

    it('renders all section headings', () => {
        render(<MediaClient mediaItem={mockMediaItem} />);

        expect(screen.getByText('Reviews')).toBeInTheDocument();
        expect(screen.getByText('Leave a Review')).toBeInTheDocument();
    });
});
