import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewForm } from '@/components/review/review-form';

// Mock dependencies
const mockRouterPush = vi.fn();
const mockRouterRefresh = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockRouterPush,
        refresh: mockRouterRefresh,
    }),
}));

vi.mock('next-intl', () => ({
    useTranslations: (namespace: string) => (key: string) => {
        if (namespace === 'ConsumedMoreThanOnce') {
            return `Consumed ${key}`;
        }
        return key;
    },
}));

const mockShowToast = vi.fn();
vi.mock('@/lib/toast-store', () => ({
    useToastStore: () => ({
        showToast: mockShowToast,
    }),
}));

const mockUser = { id: 'user-1', name: 'Test User' };
vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: () => ({
        user: mockUser,
    }),
}));

describe('ReviewForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    const defaultProps = {
        mediaId: 'media-123',
        mediaType: 'film',
    };

    it('renders the form correctly', () => {
        render(<ReviewForm {...defaultProps} />);
        expect(screen.getByText('yourRating')).toBeInTheDocument();
        expect(screen.getByText('Consumed film')).toBeInTheDocument();
    });

    it('checkbox is initially unchecked', () => {
        render(<ReviewForm {...defaultProps} />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
    });

    it('submits consumedMoreThanOnce as true when checked manually', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        render(<ReviewForm {...defaultProps} />);

        fireEvent.click(screen.getByRole('button', { name: 'like' }));
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: 'submitReview' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/review', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"consumedMoreThanOnce":true'),
            }));
        });
    });

    it('submits consumedMoreThanOnce as false when NOT checked', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        render(<ReviewForm {...defaultProps} />);

        fireEvent.click(screen.getByRole('button', { name: 'like' }));
        fireEvent.click(screen.getByRole('button', { name: 'submitReview' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/review', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"consumedMoreThanOnce":false'),
            }));
        });
    });

    it('submits consumedMoreThanOnce as true when hasReviewed is true', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        // Pass hasReviewed=true
        render(<ReviewForm {...defaultProps} hasReviewed={true} />);

        // Checkbox visual check
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
        expect(checkbox).toBeDisabled();

        // Submit
        fireEvent.click(screen.getByRole('button', { name: 'like' })); // Re-rate or just submit?
        // Note: Logic says disabled if rating==0 AND liked==null.
        // We set like to enable submit button.

        fireEvent.click(screen.getByRole('button', { name: 'submitReview' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/review', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"consumedMoreThanOnce":true'),
            }));
        });
    });
});
