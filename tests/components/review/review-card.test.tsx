import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReviewCard } from '@/components/review/review-card';
import { SafeReview } from '@/lib/types';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: vi.fn(() => (key: string) => key),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
    })),
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

// Mock lucide-react
vi.mock('lucide-react', () => ({
    User: ({ className }: { className?: string }) => (
        <svg
            data-testid="user-icon"
            className={className}
        />
    ),
    Star: ({ className }: { className?: string }) => (
        <svg
            data-testid="star-icon"
            className={className}
        />
    ),
    ThumbsUp: ({ className }: { className?: string }) => (
        <svg
            data-testid="thumbs-up-icon"
            className={className}
        />
    ),
    ThumbsDown: ({ className }: { className?: string }) => (
        <svg
            data-testid="thumbs-down-icon"
            className={className}
        />
    ),
}));

describe('ReviewCard', () => {
    const mockUser = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        image: null,
        joinedAt: new Date(),
    };

    const mockReviewWithRating: SafeReview = {
        id: '1',
        mediaId: 'media-1',
        userId: 'user-1',
        rating: 4,
        liked: null,
        review: 'This is a great movie!',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockUser,
    };

    const mockReviewWithLike: SafeReview = {
        id: '2',
        mediaId: 'media-2',
        userId: 'user-1',
        rating: null,
        liked: true,
        review: 'I liked this movie.',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockUser,
    };

    const mockReviewWithDislike: SafeReview = {
        id: '3',
        mediaId: 'media-3',
        userId: 'user-1',
        rating: null,
        liked: false,
        review: 'I disliked this movie.',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockUser,
    };

    it('renders the rating when a rating is present', () => {
        render(<ReviewCard review={mockReviewWithRating} />);
        expect(screen.queryAllByTestId('star-icon').length).toBeGreaterThan(0);
        expect(screen.queryByTestId('thumbs-up-icon')).not.toBeInTheDocument();
        expect(screen.queryByTestId('thumbs-down-icon')).not.toBeInTheDocument();
    });

    it('renders the like icon when no rating is present and the review is liked', () => {
        render(<ReviewCard review={mockReviewWithLike} />);
        expect(screen.getByTestId('thumbs-up-icon')).toBeInTheDocument();
        expect(screen.queryByTestId('star-icon')).not.toBeInTheDocument();
        expect(screen.queryByTestId('thumbs-down-icon')).not.toBeInTheDocument();
    });

    it('renders the dislike icon when no rating is present and the review is disliked', () => {
        render(<ReviewCard review={mockReviewWithDislike} />);
        expect(screen.getByTestId('thumbs-down-icon')).toBeInTheDocument();
        expect(screen.queryByTestId('star-icon')).not.toBeInTheDocument();
        expect(screen.queryByTestId('thumbs-up-icon')).not.toBeInTheDocument();
    });
});
