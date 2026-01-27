import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommentList } from '@/components/comment/comment-list';
import { SafeComment } from '@/lib/types';

// Mock CommentCard component
vi.mock('@/components/comment/comment-card', () => ({
    CommentCard: ({ comment }: { comment: SafeComment }) => (
        <div data-testid={`comment-${comment.id}`}>{comment.comment}</div>
    ),
}));

describe('CommentList', () => {
    const mockComments: SafeComment[] = [
        {
            id: 'comment-1',
            comment: 'Great review!',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            reviewId: 'review-1',
            userId: 'user-1',
            user: {
                id: 'user-1',
                name: 'John Doe',
                email: 'johndoe@example.com',
                image: '/avatar.jpg',
                bio: '',
                joinedAt: new Date('2024-01-01'),
            },
        },
        {
            id: 'comment-2',
            comment: 'I totally agree with this.',
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02'),
            reviewId: 'review-1',
            userId: 'user-2',
            user: {
                id: 'user-2',
                name: 'Jane Smith',
                email: 'janesmith@example.com',
                image: undefined,
                bio: '',
                joinedAt: new Date('2024-01-02'),
            },
        },
        {
            id: 'comment-3',
            comment: 'Thanks for sharing!',
            createdAt: new Date('2024-01-03'),
            updatedAt: new Date('2024-01-03'),
            reviewId: 'review-1',
            userId: 'user-3',
            user: {
                id: 'user-3',
                name: 'Bob Johnson',
                email: 'bobjohnson@example.com',
                image: '/avatar3.jpg',
                bio: '',
                joinedAt: new Date('2024-01-03'),
            },
        },
    ];

    it('renders all comments', () => {
        render(<CommentList comments={mockComments} />);

        expect(screen.getByTestId('comment-comment-1')).toBeInTheDocument();
        expect(screen.getByTestId('comment-comment-2')).toBeInTheDocument();
        expect(screen.getByTestId('comment-comment-3')).toBeInTheDocument();
    });

    it('renders comments with correct content', () => {
        render(<CommentList comments={mockComments} />);

        expect(screen.getByText('Great review!')).toBeInTheDocument();
        expect(
            screen.getByText('I totally agree with this.')
        ).toBeInTheDocument();
        expect(screen.getByText('Thanks for sharing!')).toBeInTheDocument();
    });

    it('renders empty list when no comments provided', () => {
        const { container } = render(<CommentList comments={[]} />);

        const commentsContainer = container.querySelector('.space-y-6');
        expect(commentsContainer).toBeInTheDocument();
        expect(commentsContainer?.children).toHaveLength(0);
    });

    it('applies animation classes to comment wrappers', () => {
        const { container } = render(<CommentList comments={mockComments} />);

        const commentWrappers = container.querySelectorAll('.animate-in');
        expect(commentWrappers).toHaveLength(mockComments.length);

        commentWrappers.forEach((wrapper) => {
            expect(wrapper).toHaveClass(
                'animate-in',
                'fade-in',
                'slide-in-from-top-2'
            );
        });
    });

    it('applies staggered animation delays', () => {
        const { container } = render(<CommentList comments={mockComments} />);

        const commentWrappers = container.querySelectorAll('.animate-in');

        commentWrappers.forEach((wrapper, index) => {
            const style = (wrapper as HTMLElement).style;
            expect(style.animationDelay).toBe(`${index * 50}ms`);
        });
    });

    it('renders single comment correctly', () => {
        const singleComment = [mockComments[0]];
        render(<CommentList comments={singleComment} />);

        expect(screen.getByTestId('comment-comment-1')).toBeInTheDocument();
        expect(screen.getByText('Great review!')).toBeInTheDocument();
    });

    it('maintains correct order of comments', () => {
        const { container } = render(<CommentList comments={mockComments} />);

        const commentElements = container.querySelectorAll(
            '[data-testid^="comment-"]'
        );

        expect(commentElements[0]).toHaveAttribute(
            'data-testid',
            'comment-comment-1'
        );
        expect(commentElements[1]).toHaveAttribute(
            'data-testid',
            'comment-comment-2'
        );
        expect(commentElements[2]).toHaveAttribute(
            'data-testid',
            'comment-comment-3'
        );
    });
});
