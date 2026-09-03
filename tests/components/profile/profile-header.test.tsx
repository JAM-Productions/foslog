import { ProfileHeader } from '@/components/profile/profile-header';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach } from 'vitest';

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockShowToast = vi.fn();
const mockShowModal = vi.fn();
const mockShowImportModal = vi.fn();
const mockUseAuth = vi.fn();

// Mock translations
vi.mock('next-intl', () => ({
    useLocale: () => 'en',
    useTranslations: () => (key: string, params?: any) => {
        if (params?.date) return `${key} ${params.date}`;
        if (params?.year) return `${key} ${params.year}`;
        return key;
    },
}));

// Mock next/image
vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: any) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            {...props}
        />
    ),
}));

// Mock RatingDistribution component to isolate ProfileHeader test
vi.mock('@/components/profile/rating-distribution', () => ({
    RatingDistribution: () => <div data-testid="rating-distribution" />,
}));

// Mock auth provider
vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: () => mockUseAuth(),
}));

// Mock navigation
vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: mockRefresh,
    }),
}));

// Mock toast store
vi.mock('@/lib/toast-store', () => ({
    useToastStore: () => ({
        showToast: mockShowToast,
    }),
}));

// Mock follows modal store
vi.mock('@/lib/follows-modal-store', () => ({
    useFollowsModalStore: () => ({
        showModal: mockShowModal,
    }),
}));

// Mock import reviews modal store
vi.mock('@/lib/import-reviews-modal-store', () => ({
    useImportReviewsModalStore: () => ({
        showModal: mockShowImportModal,
    }),
}));

describe('ProfileHeader', () => {
    const mockUser = {
        id: 'user1',
        name: 'Test User',
        email: '',
        image: '/avatar.jpg',
        bio: 'Test Bio',
        joinedAt: new Date('2024-01-01'),
        totalFollowers: 100,
        totalFollowing: 50,
    };

    const mockStats = {
        totalReviews: 10,
        totalLikesReceived: 50,
        totalLikesGiven: 4,
        totalDislikesGiven: 1,
        averageRating: 4.5,
        activityYear: 2026,
        reviewsThisYear: 3,
        lastReviewAt: new Date('2024-06-01'),
        mediaTypeBreakdown: [
            { type: 'film' as const, count: 7 },
            { type: 'book' as const, count: 3 },
        ],
        ratingDistribution: { 5: 10 },
        favoriteGenres: [{ genre: 'Action', count: 5 }],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({ user: null });
    });

    test('renders user information correctly', () => {
        render(
            <ProfileHeader
                user={mockUser}
                stats={mockStats}
                isUserFollowing={false}
            />
        );

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText(/memberSince/)).toBeInTheDocument();
        expect(screen.getByText(/lastReview/)).toBeInTheDocument();
        expect(screen.getByText('Test Bio')).toBeInTheDocument();
        expect(screen.getByAltText('Test User')).toHaveAttribute(
            'src',
            '/avatar.jpg'
        );
    });

    test('renders statistics correctly', () => {
        render(
            <ProfileHeader
                user={mockUser}
                stats={mockStats}
                isUserFollowing={false}
            />
        );

        // Check for followers and following
        expect(screen.getByText('100')).toBeInTheDocument(); // totalFollowers
        expect(screen.getByText('totalFollowers')).toBeInTheDocument();
        expect(screen.getAllByText('50').length).toBeGreaterThanOrEqual(2); // totalFollowing and totalLikesReceived
        expect(screen.getByText('totalFollowing')).toBeInTheDocument();

        // Check for review stats
        expect(screen.getByText('10')).toBeInTheDocument(); // totalReviews
        expect(screen.getByText('totalReviews')).toBeInTheDocument();
        expect(screen.getByText('totalLikesReceived')).toBeInTheDocument();
        expect(screen.getByText('4.5')).toBeInTheDocument(); // averageRating
        expect(screen.getByText('averageRating')).toBeInTheDocument();
        // The activity metric names the year it covers.
        expect(screen.getByText('reviewsThisYear 2026')).toBeInTheDocument();
        expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
    });

    test('renders the media type breakdown', () => {
        render(
            <ProfileHeader
                user={mockUser}
                stats={mockStats}
                isUserFollowing={false}
            />
        );

        expect(
            screen.getByRole('button', { name: 'activityByType' })
        ).toBeInTheDocument();
        expect(screen.getByText('films')).toBeInTheDocument();
        expect(screen.getByText('books')).toBeInTheDocument();
        expect(screen.getByText('· 70%')).toBeInTheDocument();
        expect(screen.getByText('· 30%')).toBeInTheDocument();
    });

    test('hides the insight cards when the user has no activity', () => {
        render(
            <ProfileHeader
                user={mockUser}
                stats={{
                    totalReviews: 0,
                    totalLikesReceived: 0,
                    totalLikesGiven: 0,
                    totalDislikesGiven: 0,
                    averageRating: 0,
                    activityYear: 2026,
                    reviewsThisYear: 0,
                    lastReviewAt: null,
                    mediaTypeBreakdown: [],
                    ratingDistribution: {},
                    favoriteGenres: [],
                }}
                isUserFollowing={false}
            />
        );

        expect(screen.queryByText('activityByType')).not.toBeInTheDocument();
        expect(screen.queryByText('favoriteGenres')).not.toBeInTheDocument();
        expect(screen.queryByText(/lastReview/)).not.toBeInTheDocument();
        expect(screen.getByText('—')).toBeInTheDocument(); // no average rating yet
    });

    test('renders favorite genres', () => {
        render(
            <ProfileHeader
                user={mockUser}
                stats={mockStats}
                isUserFollowing={false}
            />
        );

        expect(screen.getByText('favoriteGenres')).toBeInTheDocument();
        expect(screen.getByText('Action (5)')).toBeInTheDocument();
    });

    test('renders placeholder avatar when no image provided', () => {
        const userWithoutImage = { ...mockUser, image: undefined };
        render(
            <ProfileHeader
                user={userWithoutImage}
                stats={mockStats}
                isUserFollowing={false}
            />
        );

        // Instead of looking for a specific icon which might be hidden or SVG,
        // we check that the image is NOT rendered.
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    test('redirects to login when clicking followers count without authentication', async () => {
        const user = userEvent.setup();
        mockUseAuth.mockReturnValue({ user: null });

        render(
            <ProfileHeader
                user={mockUser}
                stats={mockStats}
                isUserFollowing={false}
            />
        );

        const followersElement =
            screen.getByText('totalFollowers').parentElement;
        if (followersElement) {
            await user.click(followersElement);
        }

        expect(mockPush).toHaveBeenCalledWith('/login');
        expect(mockShowModal).not.toHaveBeenCalled();
    });

    test('opens followers modal when clicking followers count with authentication', async () => {
        const user = userEvent.setup();
        mockUseAuth.mockReturnValue({
            user: { id: 'current-user', name: 'Current User' },
        });

        render(
            <ProfileHeader
                user={mockUser}
                stats={mockStats}
                isUserFollowing={false}
            />
        );

        const followersElement =
            screen.getByText('totalFollowers').parentElement;
        if (followersElement) {
            await user.click(followersElement);
        }

        expect(mockShowModal).toHaveBeenCalledWith(
            'user1',
            'Test User',
            'followers'
        );
        expect(mockPush).not.toHaveBeenCalledWith('/login');
    });

    test('redirects to login when clicking following count without authentication', async () => {
        const user = userEvent.setup();
        mockUseAuth.mockReturnValue({ user: null });

        render(
            <ProfileHeader
                user={mockUser}
                stats={mockStats}
                isUserFollowing={false}
            />
        );

        const followingElement =
            screen.getByText('totalFollowing').parentElement;
        if (followingElement) {
            await user.click(followingElement);
        }

        expect(mockPush).toHaveBeenCalledWith('/login');
        expect(mockShowModal).not.toHaveBeenCalled();
    });

    test('opens following modal when clicking following count with authentication', async () => {
        const user = userEvent.setup();
        mockUseAuth.mockReturnValue({
            user: { id: 'current-user', name: 'Current User' },
        });

        render(
            <ProfileHeader
                user={mockUser}
                stats={mockStats}
                isUserFollowing={false}
            />
        );

        const followingElement =
            screen.getByText('totalFollowing').parentElement;
        if (followingElement) {
            await user.click(followingElement);
        }

        expect(mockShowModal).toHaveBeenCalledWith(
            'user1',
            'Test User',
            'following'
        );
        expect(mockPush).not.toHaveBeenCalledWith('/login');
    });
});
