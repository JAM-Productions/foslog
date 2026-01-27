import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReviewDetailCard } from '@/components/review/review-detail-card';
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

const mockReview: SafeReview = {
    id: '1',
    mediaId: 'media1',
    userId: 'user1',
    rating: 4,
    liked: true,
    review: 'Detailed review content here.',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    consumedMoreThanOnce: false,
    totalComments: 0,
    user: {
        id: 'user1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        joinedAt: new Date(),
        image: '/avatar.jpg',
    },
};

describe('ReviewDetailCard', () => {
    it('renders review content', () => {
        render(<ReviewDetailCard review={mockReview} />);
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(
            screen.getByText('Detailed review content here.')
        ).toBeInTheDocument();
    });

    it('does not render consumed badge when false', () => {
        render(
            <ReviewDetailCard
                review={mockReview}
                mediaType="book"
            />
        );
        expect(screen.queryByText(/Consumed/)).not.toBeInTheDocument();
    });

    it('renders consumed badge when true and mediaType provided', () => {
        const consumedReview = { ...mockReview, consumedMoreThanOnce: true };
        render(
            <ReviewDetailCard
                review={consumedReview}
                mediaType="book"
            />
        );
        expect(screen.getByText('Consumed book')).toBeInTheDocument();
    });

    it('renders default consumed badge when mediaType unknown', () => {
        const consumedReview = { ...mockReview, consumedMoreThanOnce: true };
        render(
            <ReviewDetailCard
                review={consumedReview}
                mediaType="alien-tech"
            />
        );
        expect(screen.getByText('Consumed default')).toBeInTheDocument();
    });
});
