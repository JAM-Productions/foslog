import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MediaClient } from '@/app/[locale]/media/[id]/media-client';
import { MediaItem, Review, User } from '@/lib/store';

// Mock the sub-components
vi.mock('@/components/media-details', () => ({
    MediaDetails: ({ media }: { media: any }) => (
        <div data-testid="media-details">
            Media Details - {media.title}
        </div>
    ),
}));

vi.mock('@/components/review-form', () => ({
    ReviewForm: () => <div data-testid="review-form">Review Form</div>,
}));

vi.mock('@/components/review-list', () => ({
    ReviewList: ({ reviews }: { reviews: any[] }) => (
        <div data-testid="review-list">Review List - {reviews.length} reviews</div>
    ),
}));

vi.mock('@/components/ui/back-button', () => ({
    BackButton: () => <div data-testid="back-button">Back Button</div>,
}));

const mockMediaItem: MediaItem & { reviews: (Review & { user: User })[] } = {
    id: '1',
    title: 'Test Movie',
    type: 'FILM',
    description: 'A test movie',
    averageRating: 8.5,
    totalReviews: 2,
    year: 2023,
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
