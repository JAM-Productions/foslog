import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import CreateListModal from '@/components/modal/create-list-modal';
import { useCreateListModalStore } from '@/lib/create-list-modal-store';
import { compressImageToBase64 } from '@/utils/image-utils';
import { MAX_LIST_IMAGE_LENGTH, MAX_LISTS_PER_USER } from '@/lib/constants';

vi.mock('@/lib/create-list-modal-store', () => ({
    useCreateListModalStore: vi.fn(),
}));

vi.mock('@/utils/image-utils', () => ({
    compressImageToBase64: vi.fn(),
}));

const mockRefresh = vi.fn();
const mockPush = vi.fn();
vi.mock('@/i18n/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: mockPush,
        refresh: mockRefresh,
    })),
}));

import { useAuth } from '@/lib/auth/auth-provider';
vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: vi.fn(),
}));
const mockedUseAuth = vi.mocked(useAuth);

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
            title: 'Create list',
            editTitle: 'Edit list',
            nameLabel: 'Name',
            namePlaceholder: 'e.g. Essential movies',
            imageLabel: 'List image (optional)',
            upload: 'Upload',
            remove: 'Remove',
            descriptionLabel: 'Description (optional)',
            descriptionPlaceholder: 'What is this list about?',
            create: 'Create',
            save: 'Save',
            cancel: 'Cancel',
            close: 'Close',
            listCreated: 'List created',
            listCreateFailed: 'List creation failed',
            listLimitReached: `Limit of ${params?.count ?? 0} lists reached`,
            listUpdated: 'List updated',
            listUpdateFailed: 'List update failed',
            imageTooLarge: 'Image too large',
            imageUpdateFailed: 'Image failed',
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

describe('CreateListModal', () => {
    const mockHideModal = vi.fn();
    const mockedUseCreateListModalStore = vi.mocked(useCreateListModalStore);
    const mockedCompressImage = vi.mocked(compressImageToBase64);

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseAuth.mockReturnValue({ user: { id: 'user1' } } as any);
        mockedUseCreateListModalStore.mockReturnValue({
            isModalOpen: true,
            list: null,
            showModal: vi.fn(),
            showEditModal: vi.fn(),
            hideModal: mockHideModal,
        } as any);
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ list: { id: 'newList1' } }),
        } as unknown as Response);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const typeName = async (user: ReturnType<typeof userEvent.setup>) => {
        await user.type(
            screen.getByPlaceholderText('e.g. Essential movies'),
            'Essential movies'
        );
    };

    it('does not render when the modal is closed', () => {
        mockedUseCreateListModalStore.mockReturnValue({
            isModalOpen: false,
            list: null,
            showModal: vi.fn(),
            showEditModal: vi.fn(),
            hideModal: mockHideModal,
        } as any);

        render(<CreateListModal />);

        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('renders the form fields', () => {
        render(<CreateListModal />);

        expect(screen.getByText('Create list')).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('e.g. Essential movies')
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('What is this list about?')
        ).toBeInTheDocument();
        expect(screen.getByText('Upload')).toBeInTheDocument();
    });

    it('disables the create button until the name is long enough', async () => {
        const user = userEvent.setup();
        render(<CreateListModal />);

        const createButton = screen.getByRole('button', { name: 'Create' });
        expect(createButton).toBeDisabled();

        await user.type(
            screen.getByPlaceholderText('e.g. Essential movies'),
            'a'
        );
        expect(createButton).toBeDisabled();

        await user.type(
            screen.getByPlaceholderText('e.g. Essential movies'),
            'bc'
        );
        expect(createButton).toBeEnabled();
    });

    it('creates the list with the trimmed name and no optional fields', async () => {
        const user = userEvent.setup();
        render(<CreateListModal />);

        await typeName(user);
        await user.click(screen.getByRole('button', { name: 'Create' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Essential movies',
                    description: null,
                    image: null,
                }),
            });
        });

        expect(mockShowToast).toHaveBeenCalledWith('List created', 'success');
        expect(mockHideModal).toHaveBeenCalled();
    });

    it('navigates to the list it just created', async () => {
        const user = userEvent.setup();
        render(<CreateListModal />);

        await typeName(user);
        await user.click(screen.getByRole('button', { name: 'Create' }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                '/profile/user1/list/newList1'
            );
        });
        expect(mockRefresh).not.toHaveBeenCalled();
    });

    it('falls back to a refresh when the response carries no list', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({}),
        } as unknown as Response);
        const user = userEvent.setup();
        render(<CreateListModal />);

        await typeName(user);
        await user.click(screen.getByRole('button', { name: 'Create' }));

        await waitFor(() => {
            expect(mockRefresh).toHaveBeenCalled();
        });
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('sends the description when provided', async () => {
        const user = userEvent.setup();
        render(<CreateListModal />);

        await typeName(user);
        await user.type(
            screen.getByPlaceholderText('What is this list about?'),
            'My picks'
        );
        await user.click(screen.getByRole('button', { name: 'Create' }));

        await waitFor(() => {
            const body = JSON.parse(
                (global.fetch as Mock).mock.calls[0][1].body
            );
            expect(body.description).toBe('My picks');
        });
    });

    it('explains the list limit instead of a generic error on 409', async () => {
        const user = userEvent.setup();
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 409,
        } as Response);
        render(<CreateListModal />);

        await typeName(user);
        await user.click(screen.getByRole('button', { name: 'Create' }));

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
                `Limit of ${MAX_LISTS_PER_USER} lists reached`,
                'error'
            );
        });
        expect(mockShowToast).not.toHaveBeenCalledWith(
            'List creation failed',
            'error'
        );
        // The form stays open so the user can cancel or free up a slot.
        expect(mockHideModal).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
    });

    it('shows an error toast when the request fails', async () => {
        const user = userEvent.setup();
        global.fetch = vi.fn().mockResolvedValue({ ok: false } as Response);
        render(<CreateListModal />);

        await typeName(user);
        await user.click(screen.getByRole('button', { name: 'Create' }));

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
                'List creation failed',
                'error'
            );
        });
        expect(mockHideModal).not.toHaveBeenCalled();
    });

    it('attaches the compressed image and allows removing it', async () => {
        const user = userEvent.setup();
        mockedCompressImage.mockResolvedValue('data:image/jpeg;base64,abc');
        render(<CreateListModal />);

        const file = new File(['x'], 'cover.png', { type: 'image/png' });
        await user.upload(screen.getByTestId('create-list-image-input'), file);

        await waitFor(() => {
            expect(screen.getByText('Remove')).toBeInTheDocument();
        });

        await typeName(user);
        await user.click(screen.getByRole('button', { name: 'Create' }));

        await waitFor(() => {
            const body = JSON.parse(
                (global.fetch as Mock).mock.calls[0][1].body
            );
            expect(body.image).toBe('data:image/jpeg;base64,abc');
        });
    });

    it('rejects images that are too large', async () => {
        const user = userEvent.setup();
        mockedCompressImage.mockResolvedValue(
            `data:image/jpeg;base64,${'a'.repeat(MAX_LIST_IMAGE_LENGTH)}`
        );
        render(<CreateListModal />);

        const file = new File(['x'], 'cover.png', { type: 'image/png' });
        await user.upload(screen.getByTestId('create-list-image-input'), file);

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(
                'Image too large',
                'error'
            );
        });
        expect(screen.queryByText('Remove')).not.toBeInTheDocument();
    });

    it('closes and resets the form on cancel', async () => {
        const user = userEvent.setup();
        render(<CreateListModal />);

        await typeName(user);
        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(mockHideModal).toHaveBeenCalled();
        expect(
            screen.getByPlaceholderText('e.g. Essential movies')
        ).toHaveValue('');
    });

    it('closes the modal from the header close button', async () => {
        const user = userEvent.setup();
        render(<CreateListModal />);

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(mockHideModal).toHaveBeenCalled();
    });

    describe('edit mode', () => {
        const existingList = {
            id: 'list1',
            name: 'Essential movies',
            description: 'My picks',
            image: 'data:image/jpeg;base64,abc',
        };

        const openEditing = () => {
            mockedUseCreateListModalStore.mockReturnValue({
                isModalOpen: true,
                list: existingList,
                showModal: vi.fn(),
                showEditModal: vi.fn(),
                hideModal: mockHideModal,
            } as any);
        };

        it('shows the edit title and the save action', () => {
            openEditing();
            render(<CreateListModal />);

            expect(screen.getByText('Edit list')).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Save' })
            ).toBeInTheDocument();
            expect(
                screen.queryByRole('button', { name: 'Create' })
            ).not.toBeInTheDocument();
        });

        it('prefills the fields with the list data', () => {
            openEditing();
            render(<CreateListModal />);

            expect(
                screen.getByPlaceholderText('e.g. Essential movies')
            ).toHaveValue('Essential movies');
            expect(
                screen.getByPlaceholderText('What is this list about?')
            ).toHaveValue('My picks');
            // The existing cover is shown, so it can be removed.
            expect(screen.getByText('Remove')).toBeInTheDocument();
        });

        it('saves the changes with PATCH on the list resource', async () => {
            openEditing();
            const user = userEvent.setup();
            render(<CreateListModal />);

            const nameInput = screen.getByPlaceholderText(
                'e.g. Essential movies'
            );
            await user.clear(nameInput);
            await user.type(nameInput, 'Renamed list');
            await user.click(screen.getByRole('button', { name: 'Save' }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith('/api/list/list1', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: 'Renamed list',
                        description: 'My picks',
                        image: 'data:image/jpeg;base64,abc',
                    }),
                });
            });

            expect(mockShowToast).toHaveBeenCalledWith(
                'List updated',
                'success'
            );
            // Editing happens on the list page itself, so it stays put.
            expect(mockRefresh).toHaveBeenCalled();
            expect(mockPush).not.toHaveBeenCalled();
        });

        it('shows the update error toast when saving fails', async () => {
            openEditing();
            global.fetch = vi.fn().mockResolvedValue({ ok: false } as Response);
            const user = userEvent.setup();
            render(<CreateListModal />);

            await user.click(screen.getByRole('button', { name: 'Save' }));

            await waitFor(() => {
                expect(mockShowToast).toHaveBeenCalledWith(
                    'List update failed',
                    'error'
                );
            });
        });
    });
});
