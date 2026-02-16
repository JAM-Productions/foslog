import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommentCard } from '@/components/comment/comment-card';
import { SafeComment } from '@/lib/types';

// Mock dependencies
const mockRouterPush = vi.fn();
const mockRouterRefresh = vi.fn();

vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({
        push: mockRouterPush,
        refresh: mockRouterRefresh,
    }),
}));

vi.mock('next-intl', () => ({
    useTranslations: (namespace: string) => (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            Toast: {
                commentDeleted: 'Comment deleted successfully',
                commentDeleteFailed: 'Failed to delete comment',
            },
            CTA: {
                delete: 'Delete',
            },
            ReviewPage: {
                deleteCommentTitle: 'Delete Comment',
                deleteCommentDescription:
                    'Are you sure you want to delete this comment?',
            },
        };
        return translations[namespace]?.[key] || key;
    },
}));

const mockShowModal = vi.fn();
const mockSetIsCTALoading = vi.fn();
const mockHideModal = vi.fn();

vi.mock('@/lib/options-modal-store', () => ({
    useOptionsModalStore: () => ({
        showModal: mockShowModal,
        setIsCTALoading: mockSetIsCTALoading,
        hideModal: mockHideModal,
    }),
}));

const mockShowToast = vi.fn();
vi.mock('@/lib/toast-store', () => ({
    useToastStore: () => ({
        showToast: mockShowToast,
    }),
}));

const mockCurrentUser = { id: 'user-1', name: 'Test User' };
vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: () => ({
        user: mockCurrentUser,
    }),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
    default: ({
        src,
        alt,
        ...props
    }: {
        src: string;
        alt: string;
        width: number;
        height: number;
    }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            {...props}
        />
    ),
}));

describe('CommentCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    const mockComment: SafeComment = {
        id: 'comment-1',
        comment: 'This is a test comment',
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
            totalFollowers: 0,
            totalFollowing: 0,
        },
    };

    it('renders comment with user information', () => {
        render(<CommentCard comment={mockComment} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    });

    it('renders user avatar when image is provided', () => {
        render(<CommentCard comment={mockComment} />);

        const avatar = screen.getByAltText('John Doe');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src', '/avatar.jpg');
    });

    it('renders default avatar icon when no image provided', () => {
        const commentWithoutImage = {
            ...mockComment,
            user: { ...mockComment.user, image: undefined },
        };

        const { container } = render(
            <CommentCard comment={commentWithoutImage} />
        );

        const defaultAvatar = container.querySelector(
            '.h-10.w-10.rounded-full.border'
        );
        expect(defaultAvatar).toBeInTheDocument();
    });

    it('navigates to user profile when clicking avatar', () => {
        render(<CommentCard comment={mockComment} />);

        const avatar = screen.getByAltText('John Doe').parentElement;
        fireEvent.click(avatar!);

        expect(mockRouterPush).toHaveBeenCalledWith('/profile/user-1');
    });

    it('navigates to user profile when clicking username', () => {
        render(<CommentCard comment={mockComment} />);

        const username = screen.getByText('John Doe');
        fireEvent.click(username);

        expect(mockRouterPush).toHaveBeenCalledWith('/profile/user-1');
    });

    it('shows delete button only for comment owner', () => {
        render(<CommentCard comment={mockComment} />);

        const deleteButton = screen.getByRole('button');
        expect(deleteButton).toBeInTheDocument();
    });

    it('does not show delete button for non-owner', () => {
        const otherUserComment = {
            ...mockComment,
            userId: 'user-2',
            user: { ...mockComment.user, id: 'user-2' },
        };

        render(<CommentCard comment={otherUserComment} />);

        const buttons = screen.queryAllByRole('button');
        expect(buttons).toHaveLength(0);
    });

    it('opens delete modal when clicking delete button', () => {
        render(<CommentCard comment={mockComment} />);

        const deleteButton = screen.getByRole('button');
        fireEvent.click(deleteButton);

        expect(mockShowModal).toHaveBeenCalledWith(
            'Delete Comment',
            'Are you sure you want to delete this comment?',
            'Delete',
            expect.any(Function)
        );
    });

    it('successfully deletes comment', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        render(<CommentCard comment={mockComment} />);

        const deleteButton = screen.getByRole('button');
        fireEvent.click(deleteButton);

        // Get the delete callback function that was passed to showModal
        const deleteCallback = mockShowModal.mock.calls[0][3];
        await deleteCallback();

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/comment',
                expect.objectContaining({
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        commentId: 'comment-1',
                    }),
                })
            );
        });

        expect(mockRouterRefresh).toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalledWith(
            'Comment deleted successfully',
            'success'
        );
        expect(mockSetIsCTALoading).toHaveBeenCalledWith(false);
        expect(mockHideModal).toHaveBeenCalled();
    });

    it('handles delete error', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: false,
        });

        render(<CommentCard comment={mockComment} />);

        const deleteButton = screen.getByRole('button');
        fireEvent.click(deleteButton);

        const deleteCallback = mockShowModal.mock.calls[0][3];
        await deleteCallback();

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
                'Failed to delete comment',
                'error'
            );
        });

        expect(mockSetIsCTALoading).toHaveBeenCalledWith(false);
        expect(mockHideModal).toHaveBeenCalled();
    });

    it('handles network error during delete', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
            new Error('Network error')
        );

        render(<CommentCard comment={mockComment} />);

        const deleteButton = screen.getByRole('button');
        fireEvent.click(deleteButton);

        const deleteCallback = mockShowModal.mock.calls[0][3];
        await deleteCallback();

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
                'Failed to delete comment',
                'error'
            );
        });
    });

    it('sets loading state during delete', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        render(<CommentCard comment={mockComment} />);

        const deleteButton = screen.getByRole('button');
        fireEvent.click(deleteButton);

        const deleteCallback = mockShowModal.mock.calls[0][3];
        const deletePromise = deleteCallback();

        expect(mockSetIsCTALoading).toHaveBeenCalledWith(true);

        await deletePromise;

        expect(mockSetIsCTALoading).toHaveBeenCalledWith(false);
    });
});
