import { MediaDetails } from '@/components/media-details';
import { ReviewCard } from '@/components/review-card';
import { ReviewForm } from '@/components/review-form';
import { ReviewList } from '@/components/review-list';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MediaItem, Review, User } from '@/lib/store';

const mockMediaItems: MediaItem[] = [
    {
        id: '1',
        title: 'Test Movie',
        type: 'film',
        description: 'A test movie',
        averageRating: 8.5,
        totalReviews: 2,
        year: 2023,
    },
];

const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@doe.com',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
};

const mockReviews: (Review & { user: User })[] = [
    {
        id: '1',
        mediaId: '1',
        userId: '1',
        rating: 8,
        review: 'Great movie!',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockUser,
    },
];

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
    }),
}));

vi.mock('@/lib/auth-provider', () => ({
    useAuth: () => ({
        user: mockUser,
    }),
}));

describe('MediaDetails', () => {
    it('renders media details correctly', () => {
        const media = mockMediaItems[0];
        render(<MediaDetails media={media} />);
        expect(screen.getByText(media.title)).toBeInTheDocument();
        expect(screen.getByText(media.type)).toBeInTheDocument();
        expect(screen.getByText(media.description)).toBeInTheDocument();
    });
});

describe('ReviewList', () => {
    it('renders a list of reviews', () => {
        render(<ReviewList reviews={mockReviews} />);
        mockReviews.forEach((review) => {
            expect(screen.getByText(review.review!)).toBeInTheDocument();
        });
    });
});

describe('ReviewCard', () => {
    it('renders a review correctly', () => {
        const review = mockReviews[0];
        render(<ReviewCard review={review} />);
        expect(screen.getByText(review.review!)).toBeInTheDocument();
    });
});

describe('ReviewForm', () => {
  it('renders a review form', () => {
    render(<ReviewForm />);
    expect(screen.getByText('yourRating')).toBeInTheDocument();
    expect(screen.getByLabelText('yourReview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'submitReview' })).toBeInTheDocument();
  });
});
