import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReviewDetailCard } from '@/components/review/review-detail-card';
import { SafeReview } from '@/lib/types';
import { User } from '@/lib/store';

// Mock next-intl
vi.mock('next-intl', () => ({
    useLocale: () => 'en',
}));

// Mock next/image
vi.mock('next/image', () => ({
    default: ({
        src,
        alt,
        width,
        height,
        className,
    }: {
        src: string;
        alt: string;
        width?: number;
        height?: number;
        className?: string;
    }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
        />
    ),
}));

describe('ReviewDetailCard', () => {
    const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg',
        joinedAt: new Date('2023-01-01'),
    };

    const mockReview: SafeReview = {
        id: '1',
        mediaId: 'media-1',
        userId: '1',
        rating: 4,
        review: 'This is a great movie! I really enjoyed it.',
        createdAt: new Date('2024-11-15T10:30:00.000Z'),
        updatedAt: new Date('2024-11-15T10:30:00.000Z'),
        user: mockUser,
    };

    it('renders user name', () => {
        render(<ReviewDetailCard review={mockReview} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders review text', () => {
        render(<ReviewDetailCard review={mockReview} />);
        expect(
            screen.getByText('This is a great movie! I really enjoyed it.')
        ).toBeInTheDocument();
    });

    it('renders user avatar when image is provided', () => {
        render(<ReviewDetailCard review={mockReview} />);
        const avatar = screen.getByAltText('John Doe');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('renders default user icon when image is not provided', () => {
        const reviewWithoutImage = {
            ...mockReview,
            user: { ...mockUser, image: undefined },
        };
        render(<ReviewDetailCard review={reviewWithoutImage} />);
        expect(screen.queryByAltText('John Doe')).not.toBeInTheDocument();
    });

    it('renders formatted date', () => {
        render(<ReviewDetailCard review={mockReview} />);
        expect(screen.getByText('November 15, 2024')).toBeInTheDocument();
    });

    it('handles Date object for createdAt', () => {
        const reviewWithDateObject = {
            ...mockReview,
            createdAt: new Date('2024-12-01T15:45:00.000Z'),
        };
        render(<ReviewDetailCard review={reviewWithDateObject} />);
        expect(screen.getByText('December 1, 2024')).toBeInTheDocument();
    });

    it('handles ISO string for createdAt', () => {
        const reviewWithISOString = {
            ...mockReview,
            createdAt: '2024-10-20T08:20:00.000Z' as unknown as Date,
        };
        render(<ReviewDetailCard review={reviewWithISOString} />);
        expect(screen.getByText('October 20, 2024')).toBeInTheDocument();
    });

    it('renders review rating', () => {
        render(<ReviewDetailCard review={mockReview} />);
        // RatingDisplay component should render stars based on rating
        // This test assumes RatingDisplay is working correctly
        const ratingElements = screen.getAllByRole('img', { hidden: true });
        expect(ratingElements.length).toBeGreaterThan(0);
    });

    it('renders review without review text when not provided', () => {
        const reviewWithoutText = {
            ...mockReview,
            review: undefined,
        };
        render(<ReviewDetailCard review={reviewWithoutText} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(
            screen.queryByText('This is a great movie! I really enjoyed it.')
        ).not.toBeInTheDocument();
    });

    it('applies correct CSS classes', () => {
        const { container } = render(<ReviewDetailCard review={mockReview} />);
        const card = container.firstChild;
        expect(card).toHaveClass('p-4', 'sm:p-6');
    });

    it('renders with different rating values', () => {
        const reviewWithDifferentRating = {
            ...mockReview,
            rating: 5,
        };
        render(<ReviewDetailCard review={reviewWithDifferentRating} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
});
