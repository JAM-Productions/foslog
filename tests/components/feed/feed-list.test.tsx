import { FeedList } from '@/components/feed/feed-list';
import { MediaType } from '@/lib/store';
import { SafeReviewWithMedia } from '@/lib/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

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

const mockPush = vi.fn();
vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

const buildReview = (id: string, userName: string): SafeReviewWithMedia => ({
    id,
    mediaId: 'media1',
    userId: `user-${id}`,
    rating: 4,
    review: 'Loved it',
    createdAt: new Date(),
    updatedAt: new Date(),
    consumedDate: new Date(),
    totalComments: 0,
    totalLikes: 0,
    media: {
        id: 'media1',
        title: 'The Matrix',
        type: 'film' as MediaType,
        genre: ['SciFi'],
        description: 'Desc',
        averageRating: 4.5,
        totalReviews: 2,
        totalLikes: 1,
        totalDislikes: 0,
    },
    user: {
        id: `user-${id}`,
        name: userName,
        email: '',
        joinedAt: new Date(),
        totalFollowers: 0,
        totalFollowing: 0,
    },
});

describe('FeedList', () => {
    test('renders one card per review', () => {
        render(
            <FeedList
                reviews={[
                    buildReview('review1', 'Ada'),
                    buildReview('review2', 'Grace'),
                ]}
            />
        );

        expect(screen.getAllByText('The Matrix')).toHaveLength(2);
    });

    test('credits the author of every review', () => {
        render(<FeedList reviews={[buildReview('review1', 'Ada')]} />);

        expect(screen.getByTestId('review-author')).toHaveTextContent('Ada');
    });

    test('renders an empty grid when there is nothing to show', () => {
        const { container } = render(<FeedList reviews={[]} />);

        expect(container.querySelector('div')?.children).toHaveLength(0);
    });
});
