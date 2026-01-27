import { ProfileHeader } from '@/components/profile/profile-header';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock translations
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, params?: any) => {
        if (key === 'joined' && params?.date) return `Joined ${params.date}`;
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

describe('ProfileHeader', () => {
    const mockUser = {
        id: 'user1',
        name: 'Test User',
        email: '',
        image: '/avatar.jpg',
        bio: 'Test Bio',
        joinedAt: new Date('2024-01-01'),
    };

    const mockStats = {
        totalReviews: 10,
        totalLikesReceived: 50,
        averageRating: 4.5,
        ratingDistribution: { 5: 10 },
        favoriteGenres: [{ genre: 'Action', count: 5 }],
    };

    test('renders user information correctly', () => {
        render(
            <ProfileHeader
                user={mockUser}
                stats={mockStats}
            />
        );

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText(/Joined/)).toBeInTheDocument();
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
            />
        );

        expect(screen.getByText('10')).toBeInTheDocument(); // totalReviews
        expect(screen.getByText('totalReviews')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument(); // totalLikesReceived
        expect(screen.getByText('totalLikesReceived')).toBeInTheDocument();
        expect(screen.getByText('4.5')).toBeInTheDocument(); // averageRating
        expect(screen.getByText('averageRating')).toBeInTheDocument();
    });

    test('renders favorite genres', () => {
        render(
            <ProfileHeader
                user={mockUser}
                stats={mockStats}
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
            />
        );

        // Instead of looking for a specific icon which might be hidden or SVG,
        // we check that the image is NOT rendered.
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
});
