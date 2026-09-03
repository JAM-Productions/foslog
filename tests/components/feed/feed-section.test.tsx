import { FeedSection } from '@/components/feed/feed-section';
import { MediaType } from '@/lib/store';
import { SafeReviewWithMedia } from '@/lib/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

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

const buildReview = (id: string): SafeReviewWithMedia => ({
    id,
    mediaId: 'media1',
    userId: 'user1',
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
        id: 'user1',
        name: 'Ada',
        email: '',
        joinedAt: new Date(),
        totalFollowers: 0,
        totalFollowing: 0,
    },
});

describe('FeedSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders nothing when nobody reviewed anything recently', () => {
        const { container } = render(
            <FeedSection
                reviews={[]}
                total={0}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    test('renders the section with its reviews', () => {
        render(
            <FeedSection
                reviews={[buildReview('review1')]}
                total={1}
            />
        );

        expect(screen.getByTestId('feed-section')).toBeInTheDocument();
        expect(screen.getByText('title')).toBeInTheDocument();
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    test('hides "see more" when the preview already shows everything', () => {
        render(
            <FeedSection
                reviews={[buildReview('review1')]}
                total={1}
            />
        );

        expect(screen.queryByText('seeMore')).not.toBeInTheDocument();
    });

    test('links to the feed screen when there are more reviews', async () => {
        const user = userEvent.setup();
        render(
            <FeedSection
                reviews={[buildReview('review1')]}
                total={13}
            />
        );

        await user.click(screen.getByText('seeMore'));

        expect(mockPush).toHaveBeenCalledWith('/feed');
    });
});
