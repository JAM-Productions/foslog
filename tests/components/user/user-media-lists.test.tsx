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

// Mock the create list modal store
import { useCreateListModalStore } from '@/lib/create-list-modal-store';
vi.mock('@/lib/create-list-modal-store', () => ({
    useCreateListModalStore: vi.fn(),
}));
const mockedUseCreateListModalStore = vi.mocked(useCreateListModalStore);

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
            createList: 'Create list',
            seeMore: 'See more',
            itemsCount: `${params?.count ?? 0} items`,
        };
        return translations[key] || key;
    },
}));

const bookmarkList: MediaList = {
    id: 'bookmark1',
    name: 'Bookmarks',
    type: ListType.BOOKMARK,
    totalItems: 4,
};

const customList: MediaList = {
    id: 'list1',
    name: 'Essential movies',
    type: ListType.LIST,
    image: '/list.jpg',
    totalItems: 12,
};

describe('UserMediaLists', () => {
    const push = vi.fn();
    const showModal = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseRouter.mockReturnValue({ push } as any);
        mockedUseAuth.mockReturnValue({ user: { id: 'user1' } } as any);
        mockedUseCreateListModalStore.mockReturnValue({ showModal } as any);
    });

    it('renders the component with title for current user', () => {
        render(
            <UserMediaLists
                mediaLists={[]}
                total={0}
                userId="user1"
            />
        );

        expect(screen.getByText('Your Library')).toBeInTheDocument();
    });

    it('renders title for another user library', () => {
        render(
            <UserMediaLists
                mediaLists={[]}
                total={0}
                userId="user2"
            />
        );

        expect(screen.getByText('User Library')).toBeInTheDocument();
    });

    it('displays no lists message when mediaLists is empty', () => {
        render(
            <UserMediaLists
                mediaLists={[]}
                total={0}
                userId="user1"
            />
        );

        expect(screen.getByText('No lists found for you')).toBeInTheDocument();
    });

    it('displays no lists message for other user', () => {
        render(
            <UserMediaLists
                mediaLists={[]}
                total={0}
                userId="user2"
            />
        );

        expect(
            screen.getByText('No lists found for this user')
        ).toBeInTheDocument();
    });

    it('renders bookmark list for current user', () => {
        render(
            <UserMediaLists
                mediaLists={[bookmarkList]}
                total={1}
                userId="user1"
            />
        );

        expect(screen.getByText('Bookmarked')).toBeInTheDocument();
        expect(screen.getByTestId('bookmark-list-button')).toBeInTheDocument();
        expect(screen.getByText('4 items')).toBeInTheDocument();
    });

    it('renders custom lists', () => {
        render(
            <UserMediaLists
                mediaLists={[customList]}
                total={1}
                userId="user1"
            />
        );

        expect(screen.getByText('Essential movies')).toBeInTheDocument();
        expect(screen.getByTestId('media-list-button')).toBeInTheDocument();
        expect(screen.getByText('12 items')).toBeInTheDocument();
    });

    it('navigates to list detail on bookmark button click', async () => {
        const user = userEvent.setup();
        render(
            <UserMediaLists
                mediaLists={[bookmarkList]}
                total={1}
                userId="user1"
            />
        );

        await user.click(screen.getByTestId('bookmark-list-button'));

        expect(push).toHaveBeenCalledWith('/profile/user1/list/bookmark1');
    });

    it('navigates to list detail on custom list name click', async () => {
        const user = userEvent.setup();
        render(
            <UserMediaLists
                mediaLists={[customList]}
                total={1}
                userId="user1"
            />
        );

        await user.click(screen.getByTestId('media-list-name-button'));

        expect(push).toHaveBeenCalledWith('/profile/user1/list/list1');
    });

    it('shows the create list button to the profile owner', () => {
        render(
            <UserMediaLists
                mediaLists={[]}
                total={0}
                userId="user1"
            />
        );

        expect(screen.getByTestId('create-list-button')).toBeInTheDocument();
    });

    it('hides the create list button from other users', () => {
        render(
            <UserMediaLists
                mediaLists={[]}
                total={0}
                userId="user2"
            />
        );

        expect(
            screen.queryByTestId('create-list-button')
        ).not.toBeInTheDocument();
    });

    it('opens the create list modal when the create button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <UserMediaLists
                mediaLists={[]}
                total={0}
                userId="user1"
            />
        );

        await user.click(screen.getByTestId('create-list-button'));

        expect(showModal).toHaveBeenCalled();
    });

    it('shows the mobile see more button when there are more lists than shown', async () => {
        const user = userEvent.setup();
        render(
            <UserMediaLists
                mediaLists={[customList]}
                total={8}
                userId="user1"
            />
        );

        const seeMore = screen.getByTestId('see-more-lists-button');
        expect(seeMore).toBeInTheDocument();

        await user.click(seeMore);

        expect(push).toHaveBeenCalledWith('/profile/user1/lists');
    });

    it('shows the see more card alongside the lists', async () => {
        const user = userEvent.setup();
        render(
            <UserMediaLists
                mediaLists={[customList]}
                total={8}
                userId="user1"
            />
        );

        const seeMoreCard = screen.getByTestId('see-more-lists-card');
        expect(seeMoreCard).toBeInTheDocument();
        // It sits in the same row as the list cards.
        expect(seeMoreCard.parentElement).toBe(
            screen.getByTestId('media-list-button').closest('div')
                ?.parentElement
        );

        await user.click(seeMoreCard);

        expect(push).toHaveBeenCalledWith('/profile/user1/lists');
    });

    it('hides both see more affordances when every list is shown', () => {
        render(
            <UserMediaLists
                mediaLists={[customList]}
                total={1}
                userId="user1"
            />
        );

        expect(
            screen.queryByTestId('see-more-lists-button')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('see-more-lists-card')
        ).not.toBeInTheDocument();
    });

    it('renders bookmark and custom lists together', () => {
        render(
            <UserMediaLists
                mediaLists={[bookmarkList, customList]}
                total={2}
                userId="user1"
            />
        );

        expect(screen.getByTestId('bookmark-list-button')).toBeInTheDocument();
        expect(screen.getByTestId('media-list-button')).toBeInTheDocument();
    });
});
