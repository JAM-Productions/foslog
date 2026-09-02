import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ListOptions } from '@/components/list/list-options';
import { ListType } from '@prisma/client';

import { useAuth } from '@/lib/auth/auth-provider';
vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: vi.fn(),
}));
const mockedUseAuth = vi.mocked(useAuth);

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

const mockShowEditModal = vi.fn();
vi.mock('@/lib/create-list-modal-store', () => ({
    useCreateListModalStore: () => ({ showEditModal: mockShowEditModal }),
}));

const mockShowModal = vi.fn();
const mockHideModal = vi.fn();
const mockSetIsCTALoading = vi.fn();
vi.mock('@/lib/options-modal-store', () => ({
    useOptionsModalStore: () => ({
        showModal: mockShowModal,
        hideModal: mockHideModal,
        setIsCTALoading: mockSetIsCTALoading,
    }),
}));

const mockShowToast = vi.fn();
vi.mock('@/lib/toast-store', () => ({
    useToastStore: () => ({ showToast: mockShowToast }),
}));

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string, params?: any) => {
        const translations: Record<string, string> = {
            listOptions: 'List options',
            editList: 'Edit list',
            deleteList: 'Delete list',
            deleteListTitle: `Delete ${params?.name ?? ''}`,
            deleteListDescription: 'Are you sure?',
            delete: 'Delete',
            makePublic: 'Make public',
            makePrivate: 'Make private',
            listDeleted: 'List deleted',
            listDeleteFailed: 'List delete failed',
            listMadePublic: 'List is public',
            listMadePrivate: 'List is private',
            listVisibilityFailed: 'Visibility failed',
        };
        return translations[key] || key;
    },
}));

const baseList = {
    id: 'list1',
    name: 'Essential movies',
    description: 'My picks',
    image: 'data:image/jpeg;base64,abc',
    type: ListType.LIST,
    isPublic: false,
};

describe('ListOptions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseAuth.mockReturnValue({ user: { id: 'user1' } } as any);
        global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderOptions = (
        overrides: Partial<typeof baseList> = {},
        userId = 'user1'
    ) =>
        render(
            <ListOptions
                list={{ ...baseList, ...overrides }}
                userId={userId}
            />
        );

    it('renders the options button for the owner', () => {
        renderOptions();

        expect(screen.getByTestId('list-options-button')).toBeInTheDocument();
    });

    it('renders nothing for a visitor', () => {
        renderOptions({}, 'user2');

        expect(
            screen.queryByTestId('list-options-button')
        ).not.toBeInTheDocument();
    });

    it('renders nothing for the bookmark list', () => {
        renderOptions({ type: ListType.BOOKMARK });

        expect(
            screen.queryByTestId('list-options-button')
        ).not.toBeInTheDocument();
    });

    it('keeps the dropdown closed until the button is clicked', async () => {
        const user = userEvent.setup();
        renderOptions();

        expect(
            screen.queryByTestId('edit-list-option')
        ).not.toBeInTheDocument();

        await user.click(screen.getByTestId('list-options-button'));

        expect(screen.getByTestId('edit-list-option')).toBeInTheDocument();
        expect(screen.getByTestId('delete-list-option')).toBeInTheDocument();
    });

    it('opens the edit modal seeded with the list data', async () => {
        const user = userEvent.setup();
        renderOptions();

        await user.click(screen.getByTestId('list-options-button'));
        await user.click(screen.getByTestId('edit-list-option'));

        expect(mockShowEditModal).toHaveBeenCalledWith({
            id: 'list1',
            name: 'Essential movies',
            description: 'My picks',
            image: 'data:image/jpeg;base64,abc',
        });
        // The dropdown closes behind the modal.
        expect(
            screen.queryByTestId('edit-list-option')
        ).not.toBeInTheDocument();
    });

    it('asks for confirmation before deleting', async () => {
        const user = userEvent.setup();
        renderOptions();

        await user.click(screen.getByTestId('list-options-button'));
        await user.click(screen.getByTestId('delete-list-option'));

        expect(mockShowModal).toHaveBeenCalledWith(
            'Delete Essential movies',
            'Are you sure?',
            'Delete',
            expect.any(Function)
        );
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('deletes the list and returns to the profile once confirmed', async () => {
        const user = userEvent.setup();
        renderOptions();

        await user.click(screen.getByTestId('list-options-button'));
        await user.click(screen.getByTestId('delete-list-option'));

        const confirm = mockShowModal.mock.calls[0][3];
        await confirm();

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/list/list1', {
                method: 'DELETE',
            });
        });
        expect(mockShowToast).toHaveBeenCalledWith('List deleted', 'success');
        expect(mockPush).toHaveBeenCalledWith('/profile/user1');
    });

    describe('visibility', () => {
        it('offers to publish a private list', async () => {
            const user = userEvent.setup();
            renderOptions();

            await user.click(screen.getByTestId('list-options-button'));

            const option = screen.getByTestId('toggle-visibility-option');
            expect(option).toHaveTextContent('Make public');
            expect(option).toHaveAttribute('data-public', 'false');
        });

        it('offers to unpublish a public list', async () => {
            const user = userEvent.setup();
            renderOptions({ isPublic: true });

            await user.click(screen.getByTestId('list-options-button'));

            expect(
                screen.getByTestId('toggle-visibility-option')
            ).toHaveTextContent('Make private');
        });

        it('publishes the list, keeping the menu open', async () => {
            const user = userEvent.setup();
            renderOptions();

            await user.click(screen.getByTestId('list-options-button'));
            await user.click(screen.getByTestId('toggle-visibility-option'));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/list/list1/visibility',
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isPublic: true }),
                    }
                );
            });
            expect(mockShowToast).toHaveBeenCalledWith(
                'List is public',
                'success'
            );
            expect(mockRefresh).toHaveBeenCalled();
            // The option stays on screen showing the new state.
            expect(
                screen.getByTestId('toggle-visibility-option')
            ).toHaveTextContent('Make private');
        });

        it('makes a public list private again', async () => {
            const user = userEvent.setup();
            renderOptions({ isPublic: true });

            await user.click(screen.getByTestId('list-options-button'));
            await user.click(screen.getByTestId('toggle-visibility-option'));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/list/list1/visibility',
                    expect.objectContaining({
                        body: JSON.stringify({ isPublic: false }),
                    })
                );
            });
            expect(mockShowToast).toHaveBeenCalledWith(
                'List is private',
                'success'
            );
        });

        it('flips the label and disables the option while in flight', async () => {
            let resolveRequest: (value: unknown) => void = () => {};
            global.fetch = vi.fn().mockReturnValue(
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
            );
            const user = userEvent.setup();
            renderOptions();

            await user.click(screen.getByTestId('list-options-button'));
            await user.click(screen.getByTestId('toggle-visibility-option'));

            // Still in flight, yet the label already shows the new state.
            const option = screen.getByTestId('toggle-visibility-option');
            expect(option).toHaveAttribute('data-public', 'true');
            expect(option).toHaveTextContent('Make private');
            expect(option).toBeDisabled();
            // Greyed out and click-through disabled, like the modal's button.
            expect(option.className).toContain('disabled:opacity-50');
            expect(option.className).toContain('disabled:pointer-events-none');
            // The menu itself stays usable, so it can still be closed.
            expect(screen.getByTestId('list-options-button')).toBeEnabled();

            resolveRequest({ ok: true });

            await waitFor(() => {
                expect(
                    screen.getByTestId('toggle-visibility-option')
                ).toBeEnabled();
            });
        });

        it('rolls the label back when the request fails', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: false } as Response);
            const user = userEvent.setup();
            renderOptions();

            await user.click(screen.getByTestId('list-options-button'));
            await user.click(screen.getByTestId('toggle-visibility-option'));

            await waitFor(() => {
                expect(mockShowToast).toHaveBeenCalledWith(
                    'Visibility failed',
                    'error'
                );
            });

            const option = screen.getByTestId('toggle-visibility-option');
            expect(option).toHaveAttribute('data-public', 'false');
            expect(option).toHaveTextContent('Make public');
            expect(option).toBeEnabled();
        });

        it('does not carry the optimistic value over to another list', async () => {
            const user = userEvent.setup();
            const { rerender } = render(
                <ListOptions
                    list={{ ...baseList, id: 'list1', isPublic: false }}
                    userId="user1"
                />
            );

            await user.click(screen.getByTestId('list-options-button'));
            await user.click(screen.getByTestId('toggle-visibility-option'));
            await waitFor(() => {
                expect(
                    screen.getByTestId('toggle-visibility-option')
                ).toHaveAttribute('data-public', 'true');
            });

            // Navigating between lists reuses this component instance, so the
            // optimistic value must not leak into the next list.
            rerender(
                <ListOptions
                    list={{ ...baseList, id: 'list2', isPublic: false }}
                    userId="user1"
                />
            );

            expect(
                screen.getByTestId('toggle-visibility-option')
            ).toHaveAttribute('data-public', 'false');
        });

        it('follows the server value once the page refreshes', async () => {
            const { rerender } = render(
                <ListOptions
                    list={{ ...baseList, isPublic: false }}
                    userId="user1"
                />
            );

            rerender(
                <ListOptions
                    list={{ ...baseList, isPublic: true }}
                    userId="user1"
                />
            );

            const user = userEvent.setup();
            await user.click(screen.getByTestId('list-options-button'));

            expect(
                screen.getByTestId('toggle-visibility-option')
            ).toHaveAttribute('data-public', 'true');
        });

        it('toasts and does not refresh when the toggle fails', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: false } as Response);
            const user = userEvent.setup();
            renderOptions();

            await user.click(screen.getByTestId('list-options-button'));
            await user.click(screen.getByTestId('toggle-visibility-option'));

            await waitFor(() => {
                expect(mockShowToast).toHaveBeenCalledWith(
                    'Visibility failed',
                    'error'
                );
            });
            expect(mockRefresh).not.toHaveBeenCalled();
        });
    });

    it('keeps the user on the list when the delete fails', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false } as Response);
        const user = userEvent.setup();
        renderOptions();

        await user.click(screen.getByTestId('list-options-button'));
        await user.click(screen.getByTestId('delete-list-option'));

        const confirm = mockShowModal.mock.calls[0][3];
        await confirm();

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
                'List delete failed',
                'error'
            );
        });
        expect(mockPush).not.toHaveBeenCalled();
    });
});
