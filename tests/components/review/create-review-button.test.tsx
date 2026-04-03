import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { CreateReviewButton } from '@/components/review/create-review-button';

const mockPush = vi.fn();
const mockSetIsReviewModalOpen = vi.fn();
let mockUser: { id: string } | null = { id: 'user-1' };

vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: () => ({
        user: mockUser,
    }),
}));

vi.mock('@/lib/store', () => ({
    useAppStore: () => ({
        setIsReviewModalOpen: mockSetIsReviewModalOpen,
    }),
}));

vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

vi.mock('lucide-react', () => ({
    Plus: ({ className }: { className?: string }) => (
        <svg
            data-testid="plus-icon"
            className={className}
        />
    ),
}));

describe('CreateReviewButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUser = { id: 'user-1' };
    });

    it('opens the review modal when authenticated (nav variant)', async () => {
        const user = userEvent.setup();
        render(<CreateReviewButton variant="nav" />);

        const button = screen.getByRole('button', { name: 'logReview' });
        await user.click(button);

        expect(mockSetIsReviewModalOpen).toHaveBeenCalledWith(true);
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('redirects to login when unauthenticated (fab variant)', async () => {
        mockUser = null;
        const user = userEvent.setup();
        render(<CreateReviewButton variant="fab" />);

        const button = screen.getByRole('button', { name: 'logReview' });
        await user.click(button);

        expect(mockPush).toHaveBeenCalledWith('/login');
        expect(mockSetIsReviewModalOpen).not.toHaveBeenCalled();
    });
});
