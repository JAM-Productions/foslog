import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import AddToListModal from '@/components/modal/add-to-list-modal';
import { useAddToListModalStore } from '@/lib/add-to-list-modal-store';
import { useAuth } from '@/lib/auth/auth-provider';

vi.mock('@/lib/add-to-list-modal-store', () => ({
    useAddToListModalStore: vi.fn(),
}));

const mockRefresh = vi.fn();
const mockPush = vi.fn();
vi.mock('@/i18n/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: mockPush,
        refresh: mockRefresh,
    })),
}));

vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: vi.fn(),
}));

const mockShowToast = vi.fn();
vi.mock('@/lib/toast-store', () => ({
    useToastStore: vi.fn(() => ({
        showToast: mockShowToast,
    })),
}));

vi.mock('@/hooks/use-body-scroll-lock', () => ({
    useBodyScrollLock: vi.fn(),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, params?: any) => {
        const translations: Record<string, string> = {
            title: 'Add to a list',
            searchPlaceholder: 'Search your lists',
            add: 'Add',
            added: 'Added',
            noLists: 'You have no lists yet',
            noResults: 'No lists match your search',
            loadError: 'Could not load your lists',
            itemsCount: `${params?.count ?? 0} items`,
            bookmarked: 'Bookmarked',
            close: 'Close',
            toggleListFailed: 'Toggle failed',
        };
        return translations[key] || key;
    },
}));

vi.mock('@/components/modal/modal', () => ({
    default: ({
        children,
        isModalOpen,
    }: {
        children: React.ReactNode;
        isModalOpen: boolean;
    }) => (isModalOpen ? <div data-testid="modal">{children}</div> : null),
}));

const bookmarkEntry = {
    id: 'bookmark1',
    name: 'Bookmarks',
    type: 'BOOKMARK',
    totalItems: 4,
    containsMedia: false,
};

const listEntries = [
    {
        id: 'list1',
        name: 'Essential movies',
        type: 'LIST',
        totalItems: 12,
        containsMedia: false,
    },
    {
        id: 'list2',
        name: 'To watch',
        type: 'LIST',
        totalItems: 3,
        containsMedia: true,
    },
];

describe('AddToListModal', () => {
    const mockHideModal = vi.fn();
    const mockedUseAddToListModalStore = vi.mocked(useAddToListModalStore);
    const mockedUseAuth = vi.mocked(useAuth);

    const mockFetchOk = (payload: unknown) =>
        vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(payload),
        } as unknown as Response);

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseAddToListModalStore.mockReturnValue({
            isModalOpen: true,
            mediaId: 'media1',
            mediaTitle: 'The Matrix',
            showModal: vi.fn(),
            hideModal: mockHideModal,
        } as any);
        mockedUseAuth.mockReturnValue({ user: { id: 'user1' } } as any);
        global.fetch = mockFetchOk({
            bookmark: bookmarkEntry,
            lists: listEntries,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const waitForLoad = async () => {
        await waitFor(() => {
            expect(screen.getByText('Essential movies')).toBeInTheDocument();
        });
    };

    it('does not render when the modal is closed', () => {
        mockedUseAddToListModalStore.mockReturnValue({
            isModalOpen: false,
            mediaId: '',
            mediaTitle: '',
            showModal: vi.fn(),
            hideModal: mockHideModal,
        } as any);

        render(<AddToListModal />);

        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('fetches the lists for the given media', async () => {
        render(<AddToListModal />);

        await waitForLoad();

        expect(global.fetch).toHaveBeenCalledWith('/api/list?mediaId=media1');
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    it('renders the bookmark list separated from the rest', async () => {
        render(<AddToListModal />);
        await waitForLoad();

        expect(screen.getByTestId('list-row-bookmark')).toBeInTheDocument();
        expect(screen.getByText('Bookmarked')).toBeInTheDocument();
        expect(screen.getByTestId('list-row-list1')).toBeInTheDocument();
        expect(screen.getByTestId('list-row-list2')).toBeInTheDocument();
    });

    it('shows "Added" for lists that already hold the media', async () => {
        render(<AddToListModal />);
        await waitForLoad();

        expect(screen.getByTestId('toggle-list1')).toHaveTextContent('Add');
        expect(screen.getByTestId('toggle-list2')).toHaveTextContent('Added');
    });

    it('renders the bookmark row even when the user has no bookmark list', async () => {
        global.fetch = mockFetchOk({ bookmark: null, lists: listEntries });
        render(<AddToListModal />);
        await waitForLoad();

        expect(screen.getByTestId('list-row-bookmark')).toBeInTheDocument();
        expect(screen.getByTestId('toggle-bookmark')).toHaveTextContent('Add');
    });

    it('filters the lists by name', async () => {
        const user = userEvent.setup();
        render(<AddToListModal />);
        await waitForLoad();

        await user.type(
            screen.getByPlaceholderText('Search your lists'),
            'essential'
        );

        expect(screen.getByText('Essential movies')).toBeInTheDocument();
        expect(screen.queryByText('To watch')).not.toBeInTheDocument();
    });

    it('keeps the bookmark row visible while searching', async () => {
        const user = userEvent.setup();
        render(<AddToListModal />);
        await waitForLoad();

        await user.type(
            screen.getByPlaceholderText('Search your lists'),
            'zzz'
        );

        expect(screen.getByTestId('list-row-bookmark')).toBeInTheDocument();
        expect(screen.getByText('Bookmarked')).toBeInTheDocument();
    });

    it('shows an empty message when nothing matches the search', async () => {
        const user = userEvent.setup();
        render(<AddToListModal />);
        await waitForLoad();

        await user.type(
            screen.getByPlaceholderText('Search your lists'),
            'zzz'
        );

        expect(
            screen.getByText('No lists match your search')
        ).toBeInTheDocument();
    });

    it('adds the media to a list with PUT and flips the button', async () => {
        const user = userEvent.setup();
        render(<AddToListModal />);
        await waitForLoad();

        await user.click(screen.getByTestId('toggle-list1'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/list', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mediaId: 'media1', listId: 'list1' }),
            });
        });
        expect(screen.getByTestId('toggle-list1')).toHaveTextContent('Added');
        expect(screen.getByTestId('list-row-list1')).toHaveTextContent(
            '13 items'
        );
    });

    it('removes the media from a list with DELETE and flips the button back', async () => {
        const user = userEvent.setup();
        render(<AddToListModal />);
        await waitForLoad();

        await user.click(screen.getByTestId('toggle-list2'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/list', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mediaId: 'media1', listId: 'list2' }),
            });
        });
        expect(screen.getByTestId('toggle-list2')).toHaveTextContent('Add');
    });

    it('uses the bookmark endpoint for the bookmark row', async () => {
        const user = userEvent.setup();
        render(<AddToListModal />);
        await waitForLoad();

        await user.click(screen.getByTestId('toggle-bookmark'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/media/media1/bookmark',
                { method: 'POST' }
            );
        });
        expect(screen.getByTestId('toggle-bookmark')).toHaveTextContent(
            'Added'
        );
    });

    it('rolls back and toasts when the toggle request fails', async () => {
        const user = userEvent.setup();
        render(<AddToListModal />);
        await waitForLoad();

        (global.fetch as Mock).mockResolvedValueOnce({
            ok: false,
        } as Response);

        await user.click(screen.getByTestId('toggle-list1'));

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
                'Toggle failed',
                'error'
            );
        });
        expect(screen.getByTestId('toggle-list1')).toHaveTextContent('Add');
        expect(screen.getByTestId('list-row-list1')).toHaveTextContent(
            '12 items'
        );
    });

    it('shows an error message when the lists cannot be loaded', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false } as Response);
        render(<AddToListModal />);

        await waitFor(() => {
            expect(
                screen.getByText('Could not load your lists')
            ).toBeInTheDocument();
        });
    });

    it('opens the list page and closes the modal when a list is clicked', async () => {
        const user = userEvent.setup();
        render(<AddToListModal />);
        await waitForLoad();

        await user.click(screen.getByTestId('navigate-list1'));

        expect(mockHideModal).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/profile/user1/list/list1');
    });

    it('opens the bookmark list page when the bookmark row is clicked', async () => {
        const user = userEvent.setup();
        render(<AddToListModal />);
        await waitForLoad();

        await user.click(screen.getByTestId('navigate-bookmark'));

        expect(mockPush).toHaveBeenCalledWith('/profile/user1/list/bookmark1');
    });

    it('does not navigate from the bookmark placeholder', async () => {
        const user = userEvent.setup();
        global.fetch = mockFetchOk({ bookmark: null, lists: listEntries });
        render(<AddToListModal />);
        await waitForLoad();

        await user.click(screen.getByTestId('navigate-bookmark'));

        expect(mockPush).not.toHaveBeenCalled();
    });

    it('refreshes the route on close only when something changed', async () => {
        const user = userEvent.setup();
        render(<AddToListModal />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: 'Close' }));
        expect(mockHideModal).toHaveBeenCalled();
        expect(mockRefresh).not.toHaveBeenCalled();
    });

    it('refreshes the route on close after a change', async () => {
        const user = userEvent.setup();
        render(<AddToListModal />);
        await waitForLoad();

        await user.click(screen.getByTestId('toggle-list1'));
        await waitFor(() => {
            expect(screen.getByTestId('toggle-list1')).toHaveTextContent(
                'Added'
            );
        });

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(mockRefresh).toHaveBeenCalled();
    });
});
