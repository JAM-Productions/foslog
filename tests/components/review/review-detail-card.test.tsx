import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewDetailCard } from '@/components/review/review-detail-card';
import { SafeReview } from '@/lib/types';
import { useLocale } from 'next-intl';

// Mock next/link
vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
    useLocale: vi.fn(),
    useTranslations: vi.fn(() => (key: string) => key),
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
    Calendar: ({ className }: { className?: string }) => (
        <svg
            data-testid="calendar-icon"
            className={className}
        />
    ),
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

describe('ReviewDetailCard', () => {
    const mockedUseLocale = vi.mocked(useLocale);

    const mockReview: SafeReview = {
        id: '1',
        mediaId: 'media-1',
        userId: 'user-1',
        rating: 4,
        review: 'This is a great movie! Really enjoyed it.',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
        user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
            image: 'https://example.com/avatar.jpg',
            joinedAt: new Date('2023-01-01'),
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseLocale.mockReturnValue('en');
    });

    it('renders review content correctly', () => {
        render(<ReviewDetailCard review={mockReview} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(
            screen.getByText('This is a great movie! Really enjoyed it.')
        ).toBeInTheDocument();
    });

    it('renders user avatar when image is provided', () => {
        render(<ReviewDetailCard review={mockReview} />);

        const avatar = screen.getByAltText('John Doe');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
        expect(avatar).toHaveClass('h-10', 'w-10', 'rounded-full');
    });

    it('renders user icon when no image is provided', () => {
        const reviewWithoutImage: SafeReview = {
            ...mockReview,
            user: {
                ...mockReview.user,
                image: undefined,
            },
        };

        render(<ReviewDetailCard review={reviewWithoutImage} />);

        const userIcon = screen.getByTestId('user-icon');
        expect(userIcon).toBeInTheDocument();
        expect(userIcon).toHaveClass('h-7', 'w-7');
    });

    it('displays the rating correctly', () => {
        render(<ReviewDetailCard review={mockReview} />);

        // RatingDisplay should render the stars
        const stars = screen.getAllByTestId('star-icon');
        expect(stars.length).toBeGreaterThan(0);
    });

    it('displays calendar icon', () => {
        render(<ReviewDetailCard review={mockReview} />);

        const calendarIcon = screen.getByTestId('calendar-icon');
        expect(calendarIcon).toBeInTheDocument();
        expect(calendarIcon).toHaveClass('h-4', 'w-4', 'flex-shrink-0');
    });

    it('formats date correctly for creation date', () => {
        render(<ReviewDetailCard review={mockReview} />);

        // The date should be formatted based on the locale
        const dateText = screen.getByText(/January 15, 2024/);
        expect(dateText).toBeInTheDocument();
    });

    it('displays updated date when review is edited', () => {
        const editedReview: SafeReview = {
            ...mockReview,
            updatedAt: new Date('2024-01-20T14:30:00Z'),
        };

        render(<ReviewDetailCard review={editedReview} />);

        // Should show the updated date, not the created date
        const dateText = screen.getByText(/January 20, 2024/);
        expect(dateText).toBeInTheDocument();
    });

    it('displays created date when review is not edited', () => {
        render(<ReviewDetailCard review={mockReview} />);

        // Should show the created date
        const dateText = screen.getByText(/January 15, 2024/);
        expect(dateText).toBeInTheDocument();
    });

    it('applies correct CSS classes to card', () => {
        const { container } = render(<ReviewDetailCard review={mockReview} />);

        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass('p-4', 'sm:p-6');
    });

    it('renders with string date values', () => {
        const reviewWithStringDates: SafeReview = {
            ...mockReview,
            createdAt: '2024-01-15T10:00:00Z' as unknown as Date,
            updatedAt: '2024-01-15T10:00:00Z' as unknown as Date,
        };

        render(<ReviewDetailCard review={reviewWithStringDates} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('uses correct locale for date formatting', () => {
        mockedUseLocale.mockReturnValue('es');

        render(<ReviewDetailCard review={mockReview} />);

        // The date should be formatted based on the Spanish locale
        const dateText = screen.getByText(/enero/i);
        expect(dateText).toBeInTheDocument();
    });

    it('handles missing review text', () => {
        const reviewWithoutText: SafeReview = {
            ...mockReview,
            review: undefined,
        };

        render(<ReviewDetailCard review={reviewWithoutText} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        // Should still render without crashing
    });

    it('applies responsive padding classes', () => {
        const { container } = render(<ReviewDetailCard review={mockReview} />);

        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass('p-4', 'sm:p-6');
    });

    it('applies responsive margin classes to date section', () => {
        const { container } = render(<ReviewDetailCard review={mockReview} />);

        const dateSection = container.querySelector('.mt-3');
        expect(dateSection).toBeInTheDocument();
        expect(dateSection).toHaveClass('mt-3', 'sm:mt-4');
    });

    it('displays like icon when review is liked', () => {
        const likedReview: SafeReview = {
            ...mockReview,
            liked: true,
        };

        render(<ReviewDetailCard review={likedReview} />);

        const thumbsUpIcon = screen.getByTestId('thumbs-up-icon');
        expect(thumbsUpIcon).toBeInTheDocument();
        expect(thumbsUpIcon).toHaveClass('h-4', 'w-4', 'shrink-0', 'text-green-600');
    });

    it('displays dislike icon when review is disliked', () => {
        const dislikedReview: SafeReview = {
            ...mockReview,
            liked: false,
        };

        render(<ReviewDetailCard review={dislikedReview} />);

        const thumbsDownIcon = screen.getByTestId('thumbs-down-icon');
        expect(thumbsDownIcon).toBeInTheDocument();
        expect(thumbsDownIcon).toHaveClass('h-4', 'w-4', 'shrink-0', 'text-red-600');
    });

    it('does not display like/dislike when liked is null', () => {
        const neutralReview: SafeReview = {
            ...mockReview,
            liked: null,
        };

        render(<ReviewDetailCard review={neutralReview} />);

        expect(screen.queryByTestId('thumbs-up-icon')).not.toBeInTheDocument();
        expect(screen.queryByTestId('thumbs-down-icon')).not.toBeInTheDocument();
    });

    it('displays both rating and like/dislike when both are present', () => {
        const reviewWithBoth: SafeReview = {
            ...mockReview,
            rating: 4,
            liked: true,
        };

        render(<ReviewDetailCard review={reviewWithBoth} />);

        const stars = screen.getAllByTestId('star-icon');
        expect(stars.length).toBeGreaterThan(0);
        
        const thumbsUpIcon = screen.getByTestId('thumbs-up-icon');
        expect(thumbsUpIcon).toBeInTheDocument();
    });
});
