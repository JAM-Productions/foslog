import { FeedFilterTabs } from '@/components/feed/feed-filter-tabs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
    usePathname: () => '/en/feed',
    useSearchParams: () => mockSearchParams,
}));

describe('FeedFilterTabs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Array.from(mockSearchParams.keys()).forEach((key) => {
            mockSearchParams.delete(key);
        });
    });

    test('marks the active tab', () => {
        render(<FeedFilterTabs selectedFilter="following" />);

        expect(
            screen.getByRole('button', { name: /filterFollowing/i })
        ).toHaveAttribute('aria-pressed', 'true');
        expect(
            screen.getByRole('button', { name: /filterAll/i })
        ).toHaveAttribute('aria-pressed', 'false');
    });

    test('switches to the following feed', async () => {
        const user = userEvent.setup();
        render(<FeedFilterTabs selectedFilter="all" />);

        await user.click(
            screen.getByRole('button', { name: /filterFollowing/i })
        );

        expect(mockPush).toHaveBeenCalledWith('/en/feed?filter=following');
    });

    test('drops the filter param when going back to everyone', async () => {
        const user = userEvent.setup();
        mockSearchParams.set('filter', 'following');
        render(<FeedFilterTabs selectedFilter="following" />);

        await user.click(screen.getByRole('button', { name: /filterAll/i }));

        expect(mockPush).toHaveBeenCalledWith('/en/feed');
    });

    test('resets pagination when the feed changes', async () => {
        const user = userEvent.setup();
        mockSearchParams.set('page', '4');
        render(<FeedFilterTabs selectedFilter="all" />);

        await user.click(
            screen.getByRole('button', { name: /filterFollowing/i })
        );

        expect(mockPush).toHaveBeenCalledWith('/en/feed?filter=following');
    });
});
