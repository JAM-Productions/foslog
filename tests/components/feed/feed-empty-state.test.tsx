import { FeedEmptyState } from '@/components/feed/feed-empty-state';
import { useAuth } from '@/lib/auth/auth-provider';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

const mockPush = vi.fn();
vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: vi.fn(),
}));

const signedIn = (isAuthenticated: boolean) => {
    vi.mocked(useAuth).mockReturnValue({
        isAuthenticated,
        isLoading: false,
    } as unknown as ReturnType<typeof useAuth>);
};

describe('FeedEmptyState', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        signedIn(true);
    });

    test('explains that nobody has reviewed anything lately', () => {
        render(<FeedEmptyState filter="all" />);

        expect(screen.getByText('noReviews')).toBeInTheDocument();
        expect(
            screen.queryByText('loginToSeeFollowing')
        ).not.toBeInTheDocument();
    });

    test('explains that the followed people have been quiet', () => {
        render(<FeedEmptyState filter="following" />);

        expect(screen.getByText('noFollowingReviews')).toBeInTheDocument();
        expect(
            screen.queryByText('loginToSeeFollowing')
        ).not.toBeInTheDocument();
    });

    test('invites anonymous visitors to log in', async () => {
        const user = userEvent.setup();
        signedIn(false);
        render(<FeedEmptyState filter="following" />);

        await user.click(screen.getByText('loginToSeeFollowing'));

        expect(mockPush).toHaveBeenCalledWith('/login');
    });
});
