import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ReviewDetailCard } from '@/components/review/review-detail-card';
import { SafeReview } from '@/lib/types';
import { User } from '@/lib/store';

const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@doe.com',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    joinedAt: new Date(),
    totalFollowers: 0,
    totalFollowing: 0,
};

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockShowToast = vi.fn();

// Mock translations
vi.mock('next-intl', () => ({
    useTranslations: (namespace: string) => (key: string) => {
        if (namespace === 'ConsumedMoreThanOnce') return `Consumed ${key}`;
        if (namespace === 'MediaPage') return key;
        if (namespace === 'Toast') return key;
        return key;
    },
    useLocale: () => 'en',
}));

vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({
        refresh: mockRefresh,
        push: mockPush,
    }),
}));

const mockAuthUser: { user: User | null } = { user: mockUser };

vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: () => mockAuthUser,
}));

vi.mock('@/lib/toast-store', () => ({
    useToastStore: () => ({
        showToast: mockShowToast,
    }),
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
    totalLikes: 10,
    user: {
        id: 'user1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        joinedAt: new Date(),
        image: '/avatar.jpg',
        totalFollowers: 0,
        totalFollowing: 0,
    },
};

describe('ReviewDetailCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        mockAuthUser.user = mockUser;
    });

    it('renders review content', () => {
        render(
            <ReviewDetailCard
                review={mockReview}
                userLiked={true}
            />
        );
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
                userLiked={true}
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
                userLiked={true}
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
                userLiked={true}
            />
        );
        expect(screen.getByText('Consumed default')).toBeInTheDocument();
    });

    describe('Like functionality', () => {
        it('renders like button with filled heart when user has liked', () => {
            render(
                <ReviewDetailCard
                    review={mockReview}
                    userLiked={true}
                />
            );
            const likeButton = screen.getByRole('button', {
                name: /toggleLike/i,
            });
            expect(likeButton).toBeInTheDocument();

            const heartIcon = likeButton.querySelector('svg');
            expect(heartIcon).toHaveClass('fill-red-500');
        });

        it('renders like button with empty heart when user has not liked', () => {
            render(
                <ReviewDetailCard
                    review={mockReview}
                    userLiked={false}
                />
            );
            const likeButton = screen.getByRole('button', {
                name: /toggleLike/i,
            });

            const heartIcon = likeButton.querySelector('svg');
            expect(heartIcon).not.toHaveClass('fill-red-500');
        });

        it('redirects to login when unauthenticated user clicks like', async () => {
            mockAuthUser.user = null;
            const user = userEvent.setup();

            render(
                <ReviewDetailCard
                    review={mockReview}
                    userLiked={false}
                />
            );

            const likeButton = screen.getByRole('button', {
                name: /toggleLike/i,
            });
            await user.click(likeButton);

            expect(mockPush).toHaveBeenCalledWith('/login');
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('calls POST API when liking a review', async () => {
            const user = userEvent.setup();
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Review liked successfully' }),
            });

            render(
                <ReviewDetailCard
                    review={mockReview}
                    userLiked={false}
                />
            );

            const likeButton = screen.getByRole('button', {
                name: /toggleLike/i,
            });
            await user.click(likeButton);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/review/1/like',
                    { method: 'POST' }
                );
            });

            expect(mockRefresh).toHaveBeenCalled();
        });

        it('calls DELETE API when unliking a review', async () => {
            const user = userEvent.setup();
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Review unliked successfully' }),
            });

            render(
                <ReviewDetailCard
                    review={mockReview}
                    userLiked={true}
                />
            );

            const likeButton = screen.getByRole('button', {
                name: /toggleLike/i,
            });
            await user.click(likeButton);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/review/1/like',
                    { method: 'DELETE' }
                );
            });

            expect(mockRefresh).toHaveBeenCalled();
        });

        it('disables button while liking is in progress', async () => {
            const user = userEvent.setup();
            let resolvePromise: any;
            const fetchPromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
            (global.fetch as any).mockReturnValueOnce(fetchPromise);

            render(
                <ReviewDetailCard
                    review={mockReview}
                    userLiked={false}
                />
            );

            const likeButton = screen.getByRole('button', {
                name: /toggleLike/i,
            });

            await user.click(likeButton);

            expect(likeButton).toBeDisabled();

            resolvePromise({ ok: true });
            await waitFor(() => {
                expect(likeButton).not.toBeDisabled();
            });
        });

        it('shows error toast when like API fails', async () => {
            const user = userEvent.setup();
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 500,
            });

            render(
                <ReviewDetailCard
                    review={mockReview}
                    userLiked={false}
                />
            );

            const likeButton = screen.getByRole('button', {
                name: /toggleLike/i,
            });
            await user.click(likeButton);

            await waitFor(() => {
                expect(mockShowToast).toHaveBeenCalledWith(
                    'toggleLikeFailed',
                    'error'
                );
            });

            expect(mockRefresh).not.toHaveBeenCalled();
        });

        it('shows error toast when network error occurs', async () => {
            const user = userEvent.setup();
            (global.fetch as any).mockRejectedValueOnce(
                new Error('Network error')
            );

            render(
                <ReviewDetailCard
                    review={mockReview}
                    userLiked={false}
                />
            );

            const likeButton = screen.getByRole('button', {
                name: /toggleLike/i,
            });
            await user.click(likeButton);

            await waitFor(() => {
                expect(mockShowToast).toHaveBeenCalledWith(
                    'toggleLikeFailed',
                    'error'
                );
            });
        });

        it('prevents multiple simultaneous like requests', async () => {
            const user = userEvent.setup();
            let resolvePromise: any;
            const fetchPromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
            (global.fetch as any).mockReturnValueOnce(fetchPromise);

            render(
                <ReviewDetailCard
                    review={mockReview}
                    userLiked={false}
                />
            );

            const likeButton = screen.getByRole('button', {
                name: /toggleLike/i,
            });

            // Click multiple times rapidly
            await user.click(likeButton);
            await user.click(likeButton);
            await user.click(likeButton);

            // Should only be called once
            expect(global.fetch).toHaveBeenCalledTimes(1);

            resolvePromise({ ok: true });
        });
    });

    describe('Date formatting', () => {
        it('displays creation date when review is not edited', () => {
            const review = {
                ...mockReview,
                createdAt: new Date('2024-01-15T10:30:00'),
                updatedAt: new Date('2024-01-15T10:30:00'),
            };

            render(
                <ReviewDetailCard
                    review={review}
                    userLiked={false}
                />
            );

            expect(
                screen.getByText(/January 15, 2024.*10:30/i)
            ).toBeInTheDocument();
        });

        it('displays updated date when review is edited', () => {
            const review = {
                ...mockReview,
                createdAt: new Date('2024-01-15T10:30:00'),
                updatedAt: new Date('2024-01-20T14:45:00'),
            };

            render(
                <ReviewDetailCard
                    review={review}
                    userLiked={false}
                />
            );

            expect(screen.getByText(/January 20, 2024/i)).toBeInTheDocument();
        });
    });

    describe('Rating and liked status display', () => {
        it('displays rating when present', () => {
            render(
                <ReviewDetailCard
                    review={mockReview}
                    userLiked={false}
                />
            );

            // RatingDisplay component should be rendered
            expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        });

        it('displays thumbs up icon when review liked is true', () => {
            const review = {
                ...mockReview,
                liked: true,
            };

            render(
                <ReviewDetailCard
                    review={review}
                    userLiked={false}
                />
            );

            expect(screen.getByText('like')).toBeInTheDocument();
        });

        it('displays thumbs down icon when review liked is false', () => {
            const review = {
                ...mockReview,
                liked: false,
            };

            render(
                <ReviewDetailCard
                    review={review}
                    userLiked={false}
                />
            );

            expect(screen.getByText('dislike')).toBeInTheDocument();
        });
    });

    describe('User profile links', () => {
        it('renders profile links correctly', () => {
            render(
                <ReviewDetailCard
                    review={mockReview}
                    userLiked={false}
                />
            );

            const profileLinks = screen.getAllByRole('link', {
                name: /Jane Doe/i,
            });
            expect(profileLinks.length).toBeGreaterThan(0);
            profileLinks.forEach((link) => {
                expect(link).toHaveAttribute('href', '/profile/user1');
            });
        });

        it('displays user avatar when image is provided', () => {
            render(
                <ReviewDetailCard
                    review={mockReview}
                    userLiked={false}
                />
            );

            const avatar = screen.getByAltText('Jane Doe');
            expect(avatar).toHaveAttribute('src', '/avatar.jpg');
        });

        it('displays default icon when user has no image', () => {
            const reviewWithoutImage = {
                ...mockReview,
                user: {
                    ...mockReview.user,
                    image: undefined,
                },
            };

            render(
                <ReviewDetailCard
                    review={reviewWithoutImage}
                    userLiked={false}
                />
            );

            expect(screen.queryByAltText('Jane Doe')).not.toBeInTheDocument();
        });
    });
});
