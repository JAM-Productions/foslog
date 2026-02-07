import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReviewCard } from '@/components/review/review-card';
import { SafeReview } from '@/lib/types';

// Mock translations
vi.mock('next-intl', () => ({
    useTranslations: (namespace: string) => (key: string) => {
        if (namespace === 'ConsumedMoreThanOnce') return `Consumed ${key}`;
        if (namespace === 'MediaPage') return key;
        return key;
    },
    useLocale: () => 'en',
}));

// Mock router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

const mockReview: SafeReview = {
    id: '1',
    mediaId: 'media1',
    userId: 'user1',
    rating: 4,
    liked: true,
    review: 'Great stuff!',
    createdAt: new Date(),
    updatedAt: new Date(),
    consumedMoreThanOnce: false,
    totalComments: 0,
    totalLikes: 10,
    user: {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        joinedAt: new Date(),
        image: '/avatar.jpg',
    },
};

describe('ReviewCard', () => {
    it('renders review content', () => {
        render(<ReviewCard review={mockReview} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Great stuff!')).toBeInTheDocument();
    });

    it('does not render consumed badge when false', () => {
        render(
            <ReviewCard
                review={mockReview}
                mediaType="film"
            />
        );
        expect(screen.queryByText(/Consumed/)).not.toBeInTheDocument();
    });

    it('renders consumed badge when true and mediaType provided', () => {
        const consumedReview = { ...mockReview, consumedMoreThanOnce: true };
        render(
            <ReviewCard
                review={consumedReview}
                mediaType="film"
            />
        );
        expect(screen.getByText('Consumed film')).toBeInTheDocument();
    });

    it('renders default consumed badge when mediaType unknown', () => {
        const consumedReview = { ...mockReview, consumedMoreThanOnce: true };
        render(
            <ReviewCard
                review={consumedReview}
                mediaType="unknown"
            />
        );
        expect(screen.getByText('Consumed default')).toBeInTheDocument();
    });

    it('does not render consumed badge when mediaType missing', () => {
        const consumedReview = { ...mockReview, consumedMoreThanOnce: true };
        render(<ReviewCard review={consumedReview} />); // No mediaType
        expect(screen.queryByText(/Consumed/)).not.toBeInTheDocument();
    });
});
