import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ListsManager } from '@/components/list/lists-manager';
import { SafeMediaList } from '@/lib/types';
import { ListType } from '@prisma/client';

import { useAuth } from '@/lib/auth/auth-provider';
vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: vi.fn(),
}));
const mockedUseAuth = vi.mocked(useAuth);

const mockRefresh = vi.fn();
const mockPush = vi.fn();
vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

const mockShowModal = vi.fn();
const mockHideModal = vi.fn();
vi.mock('@/lib/options-modal-store', () => ({
    useOptionsModalStore: () => ({
        showModal: mockShowModal,
        hideModal: mockHideModal,
        setIsCTALoading: vi.fn(),
    }),
}));

const mockShowToast = vi.fn();
vi.mock('@/lib/toast-store', () => ({
    useToastStore: () => ({ showToast: mockShowToast }),
}));

vi.mock('@/lib/create-list-modal-store', () => ({
    useCreateListModalStore: () => ({ showModal: vi.fn() }),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, params?: any) => {
        const translations: Record<string, string> = {
            title: `Lists of ${params?.name ?? ''}`,
            noLists: 'No lists yet',
            deleteLists: 'Delete lists',
            selectAll: 'Select all',
            deselectAll: 'Deselect all',
            deleteSelected: params?.count ? `Delete ${params.count}` : 'Delete',
            deleteListsTitle: `Delete ${params?.count ?? 0} lists`,
            deleteListsDescription: 'Are you sure?',
            cancel: 'Cancel',
            delete: 'Delete',
            createList: 'Create list',
            bookmarked: 'Bookmarked',
            itemsCount: `${params?.count ?? 0} items`,
            listsDeleted: `${params?.count ?? 0} lists deleted`,
            listsDeleteFailed: 'Lists delete failed',
            listsPartiallyDeleted: `${params?.count ?? 0} lists could not be deleted`,
        };
        return translations[key] || key;
    },
}));

const lists: SafeMediaList[] = [
    {
        id: 'bookmark1',
        name: 'Bookmarks',
        type: ListType.BOOKMARK,
        totalItems: 4,
    },
    {
        id: 'list1',
        name: 'Essential movies',
        type: ListType.LIST,
        totalItems: 3,
    },
    { id: 'list2', name: 'To watch', type: ListType.LIST, totalItems: 7 },
];

describe('ListsManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseAuth.mockReturnValue({ user: { id: 'user1' } } as any);
        global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderManager = (userId = 'user1', items = lists) =>
        render(
            <ListsManager
                lists={items}
                userId={userId}
                userName="Alice"
            />
        );

    const startSelecting = async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(screen.getByTestId('start-delete-lists-button'));
    };

    it('shows the create and delete buttons to the owner', () => {
        renderManager();

        expect(screen.getByTestId('create-list-button')).toBeInTheDocument();
        expect(
            screen.getByTestId('start-delete-lists-button')
        ).toBeInTheDocument();
    });

    it('hides both buttons from a visitor', () => {
        renderManager('user2');

        expect(
            screen.queryByTestId('create-list-button')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('start-delete-lists-button')
        ).not.toBeInTheDocument();
    });

    it('hides the delete button when only the bookmark list exists', () => {
        renderManager('user1', [lists[0]]);

        expect(
            screen.queryByTestId('start-delete-lists-button')
        ).not.toBeInTheDocument();
    });

    it('swaps the buttons for cancel and delete when selecting', async () => {
        const user = userEvent.setup();
        renderManager();

        await startSelecting(user);

        expect(
            screen.queryByTestId('create-list-button')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('start-delete-lists-button')
        ).not.toBeInTheDocument();
        expect(
            screen.getByTestId('cancel-delete-lists-button')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('confirm-delete-lists-button')
        ).toBeInTheDocument();
    });

    it('shows checkboxes on the deletable lists only', async () => {
        const user = userEvent.setup();
        renderManager();

        await startSelecting(user);

        expect(screen.getByTestId('list-checkbox-list1')).toBeInTheDocument();
        expect(screen.getByTestId('list-checkbox-list2')).toBeInTheDocument();
        expect(
            screen.queryByTestId('list-checkbox-bookmark1')
        ).not.toBeInTheDocument();
    });

    it('disables the confirm button until something is selected', async () => {
        const user = userEvent.setup();
        renderManager();

        await startSelecting(user);
        expect(
            screen.getByTestId('confirm-delete-lists-button')
        ).toBeDisabled();

        await user.click(screen.getAllByTestId('media-list-button')[0]);
        expect(screen.getByTestId('confirm-delete-lists-button')).toBeEnabled();
    });

    it('counts the selected lists in the button label', async () => {
        const user = userEvent.setup();
        renderManager();

        await startSelecting(user);
        expect(
            screen.getByTestId('confirm-delete-lists-button')
        ).toHaveTextContent('Delete');

        const cards = screen.getAllByTestId('media-list-button');
        await user.click(cards[0]);
        expect(
            screen.getByTestId('confirm-delete-lists-button')
        ).toHaveTextContent('Delete 1');

        await user.click(cards[1]);
        expect(
            screen.getByTestId('confirm-delete-lists-button')
        ).toHaveTextContent('Delete 2');
    });

    it('selects every deletable list at once, leaving the bookmark out', async () => {
        const user = userEvent.setup();
        renderManager();

        await startSelecting(user);
        await user.click(screen.getByTestId('select-all-lists-button'));

        expect(screen.getByTestId('list-checkbox-list1')).toHaveAttribute(
            'data-checked',
            'true'
        );
        expect(screen.getByTestId('list-checkbox-list2')).toHaveAttribute(
            'data-checked',
            'true'
        );
        expect(
            screen.getByTestId('confirm-delete-lists-button')
        ).toHaveTextContent('Delete 2');
    });

    it('clears the selection from the deselect all button', async () => {
        const user = userEvent.setup();
        renderManager();

        await startSelecting(user);
        await user.click(screen.getByTestId('select-all-lists-button'));
        await user.click(screen.getByTestId('deselect-all-lists-button'));

        expect(screen.getByTestId('list-checkbox-list1')).toHaveAttribute(
            'data-checked',
            'false'
        );
        expect(screen.getByTestId('list-checkbox-list2')).toHaveAttribute(
            'data-checked',
            'false'
        );
        expect(
            screen.getByTestId('confirm-delete-lists-button')
        ).toBeDisabled();
    });

    it('disables each selection button when it would do nothing', async () => {
        const user = userEvent.setup();
        renderManager();

        await startSelecting(user);
        expect(screen.getByTestId('select-all-lists-button')).toBeEnabled();
        expect(screen.getByTestId('deselect-all-lists-button')).toBeDisabled();

        await user.click(screen.getByTestId('select-all-lists-button'));

        expect(screen.getByTestId('select-all-lists-button')).toBeDisabled();
        expect(screen.getByTestId('deselect-all-lists-button')).toBeEnabled();
    });

    it('toggles a selection off when clicked twice', async () => {
        const user = userEvent.setup();
        renderManager();

        await startSelecting(user);
        const card = screen.getAllByTestId('media-list-button')[0];

        await user.click(card);
        expect(screen.getByTestId('list-checkbox-list1')).toHaveAttribute(
            'data-checked',
            'true'
        );

        await user.click(card);
        expect(screen.getByTestId('list-checkbox-list1')).toHaveAttribute(
            'data-checked',
            'false'
        );
    });

    it('does not navigate while selecting', async () => {
        const user = userEvent.setup();
        renderManager();

        await startSelecting(user);
        await user.click(screen.getAllByTestId('media-list-button')[0]);

        expect(mockPush).not.toHaveBeenCalled();
    });

    it('navigates normally when not selecting', async () => {
        const user = userEvent.setup();
        renderManager();

        await user.click(screen.getAllByTestId('media-list-button')[0]);

        expect(mockPush).toHaveBeenCalledWith('/profile/user1/list/list1');
    });

    it('leaves selection mode and clears the selection on cancel', async () => {
        const user = userEvent.setup();
        renderManager();

        await startSelecting(user);
        await user.click(screen.getAllByTestId('media-list-button')[0]);
        await user.click(screen.getByTestId('cancel-delete-lists-button'));

        expect(screen.getByTestId('create-list-button')).toBeInTheDocument();
        expect(
            screen.queryByTestId('list-checkbox-list1')
        ).not.toBeInTheDocument();

        // Re-entering starts from an empty selection.
        await startSelecting(user);
        expect(
            screen.getByTestId('confirm-delete-lists-button')
        ).toBeDisabled();
    });

    it('asks for confirmation before deleting', async () => {
        const user = userEvent.setup();
        renderManager();

        await startSelecting(user);
        await user.click(screen.getAllByTestId('media-list-button')[0]);
        await user.click(screen.getByTestId('confirm-delete-lists-button'));

        expect(mockShowModal).toHaveBeenCalledWith(
            'Delete 1 lists',
            'Are you sure?',
            'Delete',
            expect.any(Function)
        );
        // The confirmation still spells out what is being removed.
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('deletes every selected list once confirmed', async () => {
        const user = userEvent.setup();
        renderManager();

        await startSelecting(user);
        const cards = screen.getAllByTestId('media-list-button');
        await user.click(cards[0]);
        await user.click(cards[1]);
        await user.click(screen.getByTestId('confirm-delete-lists-button'));

        await mockShowModal.mock.calls[0][3]();

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/list/list1', {
                method: 'DELETE',
            });
        });
        expect(global.fetch).toHaveBeenCalledWith('/api/list/list2', {
            method: 'DELETE',
        });
        expect(mockShowToast).toHaveBeenCalledWith(
            '2 lists deleted',
            'success'
        );
        expect(mockRefresh).toHaveBeenCalled();
        expect(screen.getByTestId('create-list-button')).toBeInTheDocument();
    });

    it('reports when every delete fails', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false } as Response);
        const user = userEvent.setup();
        renderManager();

        await startSelecting(user);
        await user.click(screen.getAllByTestId('media-list-button')[0]);
        await user.click(screen.getByTestId('confirm-delete-lists-button'));

        await mockShowModal.mock.calls[0][3]();

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
                'Lists delete failed',
                'error'
            );
        });
        expect(mockRefresh).not.toHaveBeenCalled();
    });

    it('reports a partial failure', async () => {
        global.fetch = vi
            .fn()
            .mockResolvedValueOnce({ ok: true } as Response)
            .mockResolvedValueOnce({ ok: false } as Response);
        const user = userEvent.setup();
        renderManager();

        await startSelecting(user);
        const cards = screen.getAllByTestId('media-list-button');
        await user.click(cards[0]);
        await user.click(cards[1]);
        await user.click(screen.getByTestId('confirm-delete-lists-button'));

        await mockShowModal.mock.calls[0][3]();

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
                '1 lists could not be deleted',
                'info'
            );
        });
        expect(mockRefresh).toHaveBeenCalled();
    });

    it('renders the empty message when there are no lists', () => {
        renderManager('user1', []);

        expect(screen.getByText('No lists yet')).toBeInTheDocument();
    });
});
