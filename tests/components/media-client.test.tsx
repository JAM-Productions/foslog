import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MediaClient } from '@/app/[locale]/media/[id]/media-client';

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

vi.mock('@/lib/mock-data', () => ({
    mockMediaItems: [
        {
            id: '1',
            title: 'Test Movie',
            type: 'movie',
            description: 'A test movie',
            rating: 8.5,
            year: 2023,
            coverImage: '/test-image.jpg',
        },
        {
            id: '2',
            title: 'Test Series',
            type: 'series',
            description: 'A test series',
            rating: 9.0,
            year: 2022,
            coverImage: '/test-image-2.jpg',
        },
    ],
    mockReviews: [
        {
            id: '1',
            mediaId: '1',
            author: 'John Doe',
            rating: 8,
            text: 'Great movie!',
        },
        {
            id: '2',
            mediaId: '1',
            author: 'Jane Smith',
            rating: 9,
            text: 'Amazing!',
        },
        {
            id: '3',
            mediaId: '2',
            author: 'Bob Johnson',
            rating: 9,
            text: 'Excellent series!',
        },
    ],
}));

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
        render(<MediaClient id="1" />);

        expect(screen.getByTestId('media-details')).toBeInTheDocument();
        expect(screen.getByText(/Test Movie/)).toBeInTheDocument();
    });

    it('renders back button', () => {
        render(<MediaClient id="1" />);

        expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('renders review list when reviews exist', () => {
        render(<MediaClient id="1" />);

        expect(screen.getByTestId('review-list')).toBeInTheDocument();
        expect(screen.getByText(/2 reviews/)).toBeInTheDocument();
    });

    it('renders review form', () => {
        render(<MediaClient id="1" />);

        expect(screen.getByTestId('review-form')).toBeInTheDocument();
    });

    it('displays review count in header', () => {
        render(<MediaClient id="1" />);

        expect(screen.getByText(/Reviews/)).toBeInTheDocument();
        expect(screen.getByText(/\(2\)/)).toBeInTheDocument();
    });

    it('renders media not found when media does not exist', () => {
        render(<MediaClient id="999" />);

        expect(screen.getByText('Media not found')).toBeInTheDocument();
        expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('renders all section headings', () => {
        render(<MediaClient id="1" />);

        expect(screen.getByText('Reviews')).toBeInTheDocument();
        expect(screen.getByText('Leave a Review')).toBeInTheDocument();
    });
});
