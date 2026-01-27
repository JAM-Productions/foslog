import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommentForm } from '@/components/comment/comment-form';

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
                commentCreated: 'Comment created successfully',
                commentCreateFailed: 'Failed to create comment',
            },
            ReviewPage: {
                yourComment: 'Your Comment',
                shareReviewThoughts: 'Share your thoughts about this review...',
                sendComment: 'Send Comment',
            },
        };
        return translations[namespace]?.[key] || key;
    },
}));

const mockShowToast = vi.fn();
vi.mock('@/lib/toast-store', () => ({
    useToastStore: () => ({
        showToast: mockShowToast,
    }),
}));

describe('CommentForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    const defaultProps = {
        reviewId: 'review-123',
    };

    it('renders the form correctly', () => {
        render(<CommentForm {...defaultProps} />);

        expect(screen.getByText('Your Comment')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(
                'Share your thoughts about this review...'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Send Comment' })
        ).toBeInTheDocument();
    });

    it('updates comment text on user input', () => {
        render(<CommentForm {...defaultProps} />);

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        fireEvent.change(textarea, {
            target: { value: 'This is a great review!' },
        });

        expect(textarea.value).toBe('This is a great review!');
    });

    it('submits form with correct data', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(<CommentForm {...defaultProps} />);

        const textarea = screen.getByRole('textbox');
        const submitButton = screen.getByRole('button', {
            name: 'Send Comment',
        });

        fireEvent.change(textarea, {
            target: { value: 'This is my comment' },
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/comment',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        reviewId: 'review-123',
                        comment: 'This is my comment',
                    }),
                })
            );
        });
    });

    it('shows success toast and refreshes on successful submission', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(<CommentForm {...defaultProps} />);

        const textarea = screen.getByRole('textbox');
        const submitButton = screen.getByRole('button', {
            name: 'Send Comment',
        });

        fireEvent.change(textarea, {
            target: { value: 'Great review!' },
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
                'Comment created successfully',
                'success'
            );
            expect(mockRouterRefresh).toHaveBeenCalled();
        });
    });

    it('shows error toast on failed submission', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: false,
        });

        render(<CommentForm {...defaultProps} />);

        const textarea = screen.getByRole('textbox');
        const submitButton = screen.getByRole('button', {
            name: 'Send Comment',
        });

        fireEvent.change(textarea, { target: { value: 'Test comment' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
                'Failed to create comment',
                'error'
            );
        });
    });

    it('handles network error', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
            new Error('Network error')
        );

        render(<CommentForm {...defaultProps} />);

        const textarea = screen.getByRole('textbox');
        const submitButton = screen.getByRole('button', {
            name: 'Send Comment',
        });

        fireEvent.change(textarea, { target: { value: 'Test comment' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
                'Failed to create comment',
                'error'
            );
        });
    });

    it('disables form during submission', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(
                        () => resolve({ ok: true, json: async () => ({}) }),
                        100
                    )
                )
        );

        render(<CommentForm {...defaultProps} />);

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        const submitButton = screen.getByRole('button', {
            name: 'Send Comment',
        }) as HTMLButtonElement;

        fireEvent.change(textarea, { target: { value: 'Test' } });
        fireEvent.click(submitButton);

        // During submission
        expect(textarea.disabled).toBe(true);
        expect(submitButton.disabled).toBe(true);

        await waitFor(() => {
            expect(mockRouterRefresh).toHaveBeenCalled();
        });
    });

    it('shows loading spinner during submission', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(
                        () => resolve({ ok: true, json: async () => ({}) }),
                        100
                    )
                )
        );

        render(<CommentForm {...defaultProps} />);

        const textarea = screen.getByRole('textbox');
        const submitButton = screen.getByRole('button', {
            name: 'Send Comment',
        });

        fireEvent.change(textarea, { target: { value: 'Test' } });
        fireEvent.click(submitButton);

        // Check for loading spinner
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();

        await waitFor(() => {
            expect(mockRouterRefresh).toHaveBeenCalled();
        });
    });

    it('allows empty comment submission', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        render(<CommentForm {...defaultProps} />);

        const submitButton = screen.getByRole('button', {
            name: 'Send Comment',
        });

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/comment',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        reviewId: 'review-123',
                        comment: '',
                    }),
                })
            );
        });
    });

    it('clears error state on new submission', async () => {
        (global.fetch as ReturnType<typeof vi.fn>)
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

        render(<CommentForm {...defaultProps} />);

        const textarea = screen.getByRole('textbox');
        const submitButton = screen.getByRole('button', {
            name: 'Send Comment',
        });

        // First submission fails
        fireEvent.change(textarea, { target: { value: 'Test 1' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
                'Failed to create comment',
                'error'
            );
        });

        // Second submission succeeds
        vi.clearAllMocks();
        fireEvent.change(textarea, { target: { value: 'Test 2' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
                'Comment created successfully',
                'success'
            );
        });
    });

    it('has correct textarea rows attribute', () => {
        render(<CommentForm {...defaultProps} />);

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        expect(textarea.rows).toBe(4);
    });

    it('has correct label association', () => {
        render(<CommentForm {...defaultProps} />);

        const label = screen.getByText('Your Comment');
        const textarea = screen.getByRole('textbox');

        expect(label).toHaveAttribute('for', 'comment');
        expect(textarea).toHaveAttribute('id', 'comment');
    });
});
