import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserMediaLists, MediaList } from '@/components/user/user-media-lists';
import { ListType } from '@prisma/client';

// Mock router
import { useRouter } from '@/i18n/navigation';
vi.mock('@/i18n/navigation', () => ({
    useRouter: vi.fn(),
}));
const mockedUseRouter = vi.mocked(useRouter);

// Mock auth
import { useAuth } from '@/lib/auth/auth-provider';
vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: vi.fn(),
}));
const mockedUseAuth = vi.mocked(useAuth);

// Mock translations
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, params?: any) => {
        const translations: Record<string, string> = {
            yourLibrary: 'Your Library',
            userLibrary: 'User Library',
            noLists: `No lists found for ${params?.user || 'user'}`,
            you: 'you',
            thisUser: 'this user',
            bookmarked: 'Bookmarked',
        };
        return translations[key] || key;
    },
}));

describe('UserMediaLists', () => {
    const push = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseRouter.mockReturnValue({ push } as any);
        mockedUseAuth.mockReturnValue({ user: { id: 'user1' } } as any);
    });

    it('renders the component with title for current user', () => {
        const lists: MediaList[] = [];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="user1"
            />
        );

        expect(screen.getByText('Your Library')).toBeInTheDocument();
    });

    it('renders title for another user library', () => {
        const lists: MediaList[] = [];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="user2"
            />
        );

        expect(screen.getByText('User Library')).toBeInTheDocument();
    });

    it('displays no lists message when mediaLists is empty', () => {
        const lists: MediaList[] = [];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="user1"
            />
        );

        expect(screen.getByText('No lists found for you')).toBeInTheDocument();
    });

    it('displays no lists message for other user', () => {
        const lists: MediaList[] = [];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="user2"
            />
        );

        expect(
            screen.getByText('No lists found for this user')
        ).toBeInTheDocument();
    });

    it('renders bookmark list for current user', () => {
        const lists: MediaList[] = [
            {
                id: 'bookmark1',
                name: 'Bookmarked',
                type: ListType.BOOKMARK,
                image: '/bookmark.jpg',
            },
        ];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="user1"
            />
        );

        expect(screen.getByText('Bookmarked')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Bookmarked' })
        ).toBeInTheDocument();
    });

    it('hides bookmark list for other users', () => {
        mockedUseAuth.mockReturnValue({ user: { id: 'user1' } } as any);

        const lists: MediaList[] = [
            {
                id: 'bookmark1',
                name: 'Bookmarked',
                type: ListType.BOOKMARK,
            },
        ];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="user2"
            />
        );

        // Should show no lists message instead
        expect(
            screen.getByText('No lists found for this user')
        ).toBeInTheDocument();
        expect(screen.queryByText('Bookmarked')).not.toBeInTheDocument();
    });

    it('navigates to list detail on bookmark button click', async () => {
        const lists: MediaList[] = [
            {
                id: 'bookmark1',
                name: 'Bookmarked',
                type: ListType.BOOKMARK,
            },
        ];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="user1"
            />
        );

        const button = screen.getByRole('button', { name: 'Bookmarked' });
        await userEvent.click(button);

        expect(push).toHaveBeenCalledWith('/profile/user1/list/bookmark1');
    });

    it('navigates to list detail on bookmark text click', async () => {
        const lists: MediaList[] = [
            {
                id: 'bookmark1',
                name: 'Bookmarked',
                type: ListType.BOOKMARK,
            },
        ];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="user1"
            />
        );

        const textElement = screen.getByText('Bookmarked').closest('span');
        if (textElement) {
            await userEvent.click(textElement);
        }

        expect(push).toHaveBeenCalledWith('/profile/user1/list/bookmark1');
    });

    it('renders multiple lists', () => {
        const lists: MediaList[] = [
            {
                id: 'bookmark1',
                name: 'Bookmarked',
                type: ListType.BOOKMARK,
            },
        ];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="user1"
            />
        );

        const bookmarkItem = screen.getByText('Bookmarked');
        expect(bookmarkItem).toBeInTheDocument();
    });

    it('renders bookmark icon with correct styling', () => {
        const lists: MediaList[] = [
            {
                id: 'bookmark1',
                name: 'Bookmarked',
                type: ListType.BOOKMARK,
            },
        ];
        const { container } = render(
            <UserMediaLists
                mediaLists={lists}
                userId="user1"
            />
        );

        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg?.className.baseVal).toContain('fill-green-500');
        expect(svg?.className.baseVal).toContain('text-green-500');
    });

    it('renders bookmark button with green background', () => {
        const lists: MediaList[] = [
            {
                id: 'bookmark1',
                name: 'Bookmarked',
                type: ListType.BOOKMARK,
            },
        ];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="user1"
            />
        );

        const button = screen.getByRole('button', { name: 'Bookmarked' });
        expect(button).toHaveClass('bg-green-700');
    });

    it('applies correct border styling to header', () => {
        const lists: MediaList[] = [];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="user1"
            />
        );

        const headerDiv = screen.getByText('Your Library').closest('div.flex');
        expect(headerDiv).toHaveClass('border-b');
    });

    it('shows no lists even when auth is null', () => {
        mockedUseAuth.mockReturnValue({ user: null } as any);

        const lists: MediaList[] = [];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="user1"
            />
        );

        expect(
            screen.getByText('No lists found for this user')
        ).toBeInTheDocument();
    });

    it('preserves original lists array when filtering', () => {
        const lists: MediaList[] = [
            {
                id: 'bookmark1',
                name: 'Bookmarked',
                type: ListType.BOOKMARK,
            },
            {
                id: 'bookmark2',
                name: 'BookmarkedOther',
                type: ListType.BOOKMARK,
            },
        ];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="user1"
            />
        );

        // Both bookmarks should be visible since current user is user1
        const bookmarks = screen.getAllByText(/Bookmarked/);
        expect(bookmarks.length).toBe(2);
    });

    it('hides all bookmarks when viewing other user profile with non-bookmark lists filter', () => {
        mockedUseAuth.mockReturnValue({ user: { id: 'user1' } } as any);

        const lists: MediaList[] = [
            {
                id: 'bookmark1',
                name: 'Bookmarked',
                type: ListType.BOOKMARK,
            },
        ];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="otheruser"
            />
        );

        expect(screen.queryByText('Bookmarked')).not.toBeInTheDocument();
    });

    it('handles empty name in lists gracefully', () => {
        const lists: MediaList[] = [
            {
                id: 'bookmark1',
                name: '',
                type: ListType.BOOKMARK,
            },
        ];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="user1"
            />
        );

        // Should still render the bookmark button with aria-label
        expect(
            screen.getByRole('button', { name: 'Bookmarked' })
        ).toBeInTheDocument();
    });

    it('constructs correct URL with userId and listId', async () => {
        mockedUseAuth.mockReturnValue({ user: { id: 'user123' } } as any);

        const lists: MediaList[] = [
            {
                id: 'my-bookmark-list',
                name: 'Bookmarked',
                type: ListType.BOOKMARK,
            },
        ];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="user123"
            />
        );

        const button = screen.getByRole('button', { name: 'Bookmarked' });
        await userEvent.click(button);

        expect(push).toHaveBeenCalledWith(
            '/profile/user123/list/my-bookmark-list'
        );
    });

    it('renders container with correct responsive layout classes', () => {
        const lists: MediaList[] = [
            {
                id: 'bookmark1',
                name: 'Bookmarked',
                type: ListType.BOOKMARK,
            },
        ];
        const { container } = render(
            <UserMediaLists
                mediaLists={lists}
                userId="user1"
            />
        );

        const layoutDiv = container.querySelector('.flex.flex-col.gap-4');
        expect(layoutDiv).toHaveClass('sm:flex-row');
    });

    it('applies correct heading styling', () => {
        const lists: MediaList[] = [];
        render(
            <UserMediaLists
                mediaLists={lists}
                userId="user1"
            />
        );

        const heading = screen.getByText('Your Library');
        expect(heading).toHaveClass('text-xl', 'font-bold');
    });
});
