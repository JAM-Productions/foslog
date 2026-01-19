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
        expect(screen.getByPlaceholderText('shareThoughts')).toBeInTheDocument();
        expect(screen.getByText('Consumed film')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'submitReview' })).toBeInTheDocument();
    });

    it('renders checkbox with correct label based on media type', () => {
        render(<ReviewForm {...defaultProps} mediaType="Book" />);
        // useTranslations mock lowers case implicitly or we should match usage
        // implementation does `mediaType.toLowerCase()`
        expect(screen.getByText('Consumed book')).toBeInTheDocument();
    });

    it('checkbox is initially unchecked by default', () => {
        render(<ReviewForm {...defaultProps} />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
    });

    it('checkbox is checked if initialConsumedMoreThanOnce is true', () => {
        render(<ReviewForm {...defaultProps} initialConsumedMoreThanOnce={true} />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
    });

    it('checkbox is checked and disabled if hasReviewed is true', () => {
        render(<ReviewForm {...defaultProps} hasReviewed={true} />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
        expect(checkbox).toBeDisabled();
    });

    it('toggles checkbox state when clicked (if not disabled)', () => {
        render(<ReviewForm {...defaultProps} />);
        const checkbox = screen.getByRole('checkbox');

        fireEvent.click(checkbox);
        expect(checkbox).toBeChecked();

        fireEvent.click(checkbox);
        expect(checkbox).not.toBeChecked();
    });

    it('submits the form with correct payload including consumedMoreThanOnce', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        render(<ReviewForm {...defaultProps} />);

        // Fill form
        fireEvent.click(screen.getByRole('button', { name: 'like' })); // Set liked=true
        fireEvent.change(screen.getByPlaceholderText('shareThoughts'), { target: { value: 'Great!' } });
        fireEvent.click(screen.getByRole('checkbox')); // Set consumedMoreThanOnce=true

        // Submit
        fireEvent.click(screen.getByRole('button', { name: 'submitReview' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mediaId: 'media-123',
                    review: {
                        liked: true,
                        text: 'Great!',
                        consumedMoreThanOnce: true,
                    },
                }),
            });
        });
    });

    it('uses "default" translation fallback for unknown media types', () => {
        render(<ReviewForm {...defaultProps} mediaType="unknown-type" />);
        expect(screen.getByText('Consumed default')).toBeInTheDocument();
    });
});
