import { ProfileReviewCard } from '@/components/profile/profile-review-card';
import { MediaType } from '@/lib/store';
import { SafeReviewWithMedia } from '@/lib/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock translations
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

// Mock next/image
vi.mock('next/image', () => ({
    default: ({ src, alt, fill, ...props }: any) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            data-fill={fill}
            {...props}
        />
    ),
}));

vi.mock('next/link', () => ({
    default: ({
        children,
        href,
    }: {
        children: React.ReactNode;
        href: string;
    }) => <a href={href}>{children}</a>,
}));

// Mock router
vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

describe('ProfileReviewCard', () => {
    const mockReview: SafeReviewWithMedia = {
        id: 'review1',
        rating: 5,
        liked: true,
        review: 'Great movie!',
        mediaId: 'media1',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        totalComments: 0,
        media: {
            id: 'media1',
            title: 'The Matrix',
            type: 'film' as MediaType,
            poster: '/poster.jpg',
            genre: ['SciFi'],
            description: 'Desc',
            averageRating: 5,
            totalReviews: 1,
            totalLikes: 1,
            totalDislikes: 0,
        },
        user: {
            id: 'user1',
            name: 'User 1',
            email: '',
            joinedAt: new Date(),
        },
    };

    test('renders review details correctly', () => {
        render(<ProfileReviewCard review={mockReview} />);

        expect(screen.getByText('The Matrix')).toBeInTheDocument();
        expect(screen.getByText(/Great movie!/)).toBeInTheDocument();
        expect(screen.getByAltText('The Matrix')).toHaveAttribute(
            'src',
            '/poster.jpg'
        );
    });

    test('renders without poster if media has no poster', () => {
        const reviewNoPoster = {
            ...mockReview,
            media: { ...mockReview.media, poster: undefined },
        };
        render(<ProfileReviewCard review={reviewNoPoster} />);

        // Should render initials or fallback, but definitely not the img tag with poster source
        expect(screen.queryByAltText('The Matrix')).not.toBeInTheDocument();
    });
});
