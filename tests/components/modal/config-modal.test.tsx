import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ConfigModal from '@/components/modal/config-modal';
import { useAppStore } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/auth-provider';
import { useOptionsModalStore } from '@/lib/options-modal-store';

vi.mock('@/lib/store', () => ({
    useAppStore: vi.fn(),
}));

vi.mock('next-intl', () => ({
    useTranslations: vi.fn(),
}));

vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: vi.fn(),
}));

vi.mock('@/lib/options-modal-store', () => ({
    useOptionsModalStore: vi.fn(),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('@/i18n/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: mockPush,
        refresh: mockRefresh,
    })),
}));

vi.mock('@/lib/toast-store', () => ({
    useToastStore: vi.fn(() => ({
        showToast: vi.fn(),
    })),
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

vi.mock('@/components/header/language-selector', () => ({
    default: () => <div data-testid="language-selector">Language Selector</div>,
}));

vi.mock('@/components/theme/theme-toggle', () => ({
    default: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

describe('ConfigModal', () => {
    const mockSetIsConfigModalOpen = vi.fn();
    const mockShowModal = vi.fn();
    const mockSetIsCTALoading = vi.fn();
    const mockHideModal = vi.fn();
    const mockedUseAppStore = vi.mocked(useAppStore);
    const mockedUseTranslations = vi.mocked(useTranslations);
    const mockedUseAuth = vi.mocked(useAuth);
    const mockedUseOptionsModalStore = vi.mocked(useOptionsModalStore);

    const mockConfigModalT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            settings: 'Settings',
            language: 'Language',
            theme: 'Theme',
            updateName: 'Update Name',
            namePlaceholder: 'Enter new name',
            deleteAccount: 'Delete Account',
            deleteAccountTitle: 'Delete Account',
            deleteAccountDescription:
                'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
        };
        return translations[key] || key;
    });

    const mockCTAT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            delete: 'Delete',
            save: 'Save',
        };
        return translations[key] || key;
    });

    const mockToastT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            accountDeleted: 'Account deleted successfully. Goodbye!',
            accountDeleteFailed: 'Failed to delete account. Please try again.',
            nameUpdated: 'Name updated successfully!',
            nameUpdateFailed: 'Failed to update name. Please try again.',
        };
        return translations[key] || key;
    });

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset the mock implementations
        mockConfigModalT.mockImplementation((key: string) => {
            const translations: Record<string, string> = {
                settings: 'Settings',
                language: 'Language',
                theme: 'Theme',
                updateName: 'Update Name',
                namePlaceholder: 'Enter new name',
                deleteAccount: 'Delete Account',
                deleteAccountTitle: 'Delete Account',
                deleteAccountDescription:
                    'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
            };
            return translations[key] || key;
        });

        mockCTAT.mockImplementation((key: string) => {
            const translations: Record<string, string> = {
                delete: 'Delete',
                save: 'Save',
            };
            return translations[key] || key;
        });

        mockToastT.mockImplementation((key: string) => {
            const translations: Record<string, string> = {
                accountDeleted: 'Account deleted successfully. Goodbye!',
                accountDeleteFailed:
                    'Failed to delete account. Please try again.',
                nameUpdated: 'Name updated successfully!',
                nameUpdateFailed: 'Failed to update name. Please try again.',
            };
            return translations[key] || key;
        });

        mockedUseTranslations.mockImplementation((namespace?: string) => {
            if (namespace === 'ConfigModal') {
                return mockConfigModalT as unknown as ReturnType<
                    typeof useTranslations
                >;
            }
            if (namespace === 'CTA') {
                return mockCTAT as unknown as ReturnType<typeof useTranslations>;
            }
            if (namespace === 'Toast') {
                return mockToastT as unknown as ReturnType<
                    typeof useTranslations
                >;
            }
            return vi.fn() as unknown as ReturnType<typeof useTranslations>;
        });
        mockedUseAppStore.mockReturnValue({
            isConfigModalOpen: false,
            setIsConfigModalOpen: mockSetIsConfigModalOpen,
        } as unknown as ReturnType<typeof useAppStore>);
        mockedUseAuth.mockReturnValue({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
        });
        mockedUseOptionsModalStore.mockReturnValue({
            showModal: mockShowModal,
            setIsCTALoading: mockSetIsCTALoading,
            hideModal: mockHideModal,
        } as unknown as ReturnType<typeof useOptionsModalStore>);
    });

    describe('when modal is closed', () => {
        it('does not render modal content', () => {
            render(<ConfigModal />);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });
    });

    describe('when modal is open', () => {
        beforeEach(() => {
            mockedUseAppStore.mockReturnValue({
                isConfigModalOpen: true,
                setIsConfigModalOpen: mockSetIsConfigModalOpen,
            } as unknown as ReturnType<typeof useAppStore>);
        });

        it('renders the modal with settings heading', () => {
            render(<ConfigModal />);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
            expect(
                screen.getByRole('heading', { name: /settings/i })
            ).toBeInTheDocument();
        });

        it('displays settings heading with correct text', () => {
            render(<ConfigModal />);

            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toHaveTextContent('Settings');
        });

        it('renders close button', () => {
            render(<ConfigModal />);

            const closeButton = screen.getByRole('button', { name: /close/i });
            expect(closeButton).toBeInTheDocument();
        });

        it('calls setIsConfigModalOpen with false when close button is clicked', async () => {
            const user = userEvent.setup();
            render(<ConfigModal />);

            const closeButton = screen.getByRole('button', { name: /close/i });
            await user.click(closeButton);

            expect(mockSetIsConfigModalOpen).toHaveBeenCalledWith(false);
            expect(mockSetIsConfigModalOpen).toHaveBeenCalledTimes(1);
        });

        it('renders language section', () => {
            render(<ConfigModal />);

            expect(screen.getByText('Language')).toBeInTheDocument();
            expect(screen.getByTestId('language-selector')).toBeInTheDocument();
        });

        it('renders theme section', () => {
            render(<ConfigModal />);

            expect(screen.getByText('Theme')).toBeInTheDocument();
            expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
        });

        it('has proper layout structure', () => {
            render(<ConfigModal />);

            const heading = screen.getByRole('heading', { name: /settings/i });
            expect(heading).toHaveClass('text-2xl', 'font-semibold');
        });

        it('close button has correct positioning and styling', () => {
            render(<ConfigModal />);

            const closeButton = screen.getByRole('button', { name: /close/i });
            expect(closeButton).toHaveClass('absolute', 'right-0');
        });

        it('language section has proper layout classes', () => {
            render(<ConfigModal />);

            const languageText = screen.getByText('Language');
            const languageSection = languageText.closest('div');
            expect(languageSection).toHaveClass(
                'flex',
                'items-center',
                'justify-between',
                'border-b',
                'pb-2'
            );
        });

        it('theme section has proper layout classes', () => {
            render(<ConfigModal />);

            const themeText = screen.getByText('Theme');
            const themeSection = themeText.closest('div');
            expect(themeSection).toHaveClass(
                'flex',
                'items-center',
                'justify-between',
                'border-b',
                'pb-2'
            );
        });

        it('calls translation function with correct keys', () => {
            render(<ConfigModal />);

            expect(mockConfigModalT).toHaveBeenCalledWith('settings');
            expect(mockConfigModalT).toHaveBeenCalledWith('language');
            expect(mockConfigModalT).toHaveBeenCalledWith('theme');
        });

        it('renders both LanguageSelector and ThemeToggle components', () => {
            render(<ConfigModal />);

            expect(screen.getByTestId('language-selector')).toBeInTheDocument();
            expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
        });

        it('has correct spacing between sections', () => {
            render(<ConfigModal />);

            const languageText = screen.getByText('Language');
            const sectionsContainer = languageText.closest('.space-y-8');
            expect(sectionsContainer).toHaveClass('mb-2', 'space-y-8');
        });

        it('heading container has correct layout', () => {
            render(<ConfigModal />);

            const heading = screen.getByRole('heading', { name: /settings/i });
            const headingContainer = heading.closest('.relative');
            expect(headingContainer).toHaveClass(
                'relative',
                'mb-10',
                'flex',
                'w-full',
                'flex-col',
                'items-center',
                'justify-between',
                'text-center'
            );
        });
    });

    describe('integration with useAppStore', () => {
        it('uses isConfigModalOpen state from store', () => {
            mockedUseAppStore.mockReturnValue({
                isConfigModalOpen: true,
                setIsConfigModalOpen: mockSetIsConfigModalOpen,
            } as unknown as ReturnType<typeof useAppStore>);

            render(<ConfigModal />);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('does not render when isConfigModalOpen is false', () => {
            mockedUseAppStore.mockReturnValue({
                isConfigModalOpen: false,
                setIsConfigModalOpen: mockSetIsConfigModalOpen,
            } as unknown as ReturnType<typeof useAppStore>);

            render(<ConfigModal />);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });

        it('calls useAppStore hook', () => {
            render(<ConfigModal />);

            expect(mockedUseAppStore).toHaveBeenCalled();
        });
    });

    describe('translations', () => {
        it('uses ConfigModal translation namespace', () => {
            render(<ConfigModal />);

            expect(mockedUseTranslations).toHaveBeenCalledWith('ConfigModal');
        });

        it('displays translated settings title', () => {
            mockedUseAppStore.mockReturnValue({
                isConfigModalOpen: true,
                setIsConfigModalOpen: mockSetIsConfigModalOpen,
            } as unknown as ReturnType<typeof useAppStore>);

            mockConfigModalT.mockImplementation((key: string) => {
                if (key === 'settings') return 'Configuración';
                if (key === 'language') return 'Language';
                if (key === 'theme') return 'Theme';
                return key;
            });

            render(<ConfigModal />);

            expect(
                screen.getByRole('heading', { name: /configuración/i })
            ).toBeInTheDocument();
        });

        it('displays translated language label', () => {
            mockedUseAppStore.mockReturnValue({
                isConfigModalOpen: true,
                setIsConfigModalOpen: mockSetIsConfigModalOpen,
            } as unknown as ReturnType<typeof useAppStore>);

            mockConfigModalT.mockImplementation((key: string) => {
                if (key === 'language') return 'Idioma';
                if (key === 'settings') return 'Settings';
                if (key === 'theme') return 'Theme';
                return key;
            });

            render(<ConfigModal />);

            expect(screen.getByText('Idioma')).toBeInTheDocument();
        });

        it('displays translated theme label', () => {
            mockedUseAppStore.mockReturnValue({
                isConfigModalOpen: true,
                setIsConfigModalOpen: mockSetIsConfigModalOpen,
            } as unknown as ReturnType<typeof useAppStore>);

            mockConfigModalT.mockImplementation((key: string) => {
                if (key === 'theme') return 'Tema';
                if (key === 'settings') return 'Settings';
                if (key === 'language') return 'Language';
                return key;
            });

            render(<ConfigModal />);

            expect(screen.getByText('Tema')).toBeInTheDocument();
        });
    });

    describe('update name functionality', () => {
        describe('when user is not authenticated', () => {
            beforeEach(() => {
                mockedUseAppStore.mockReturnValue({
                    isConfigModalOpen: true,
                    setIsConfigModalOpen: mockSetIsConfigModalOpen,
                } as unknown as ReturnType<typeof useAppStore>);
                mockedUseAuth.mockReturnValue({
                    user: null,
                    session: null,
                    isLoading: false,
                    isAuthenticated: false,
                });
            });

            it('does not render update name section', () => {
                render(<ConfigModal />);

                expect(screen.queryByText('Update Name')).not.toBeInTheDocument();
            });
        });

        describe('when user is authenticated', () => {
            beforeEach(() => {
                mockedUseAppStore.mockReturnValue({
                    isConfigModalOpen: true,
                    setIsConfigModalOpen: mockSetIsConfigModalOpen,
                } as unknown as ReturnType<typeof useAppStore>);
                mockedUseAuth.mockReturnValue({
                    user: {
                        id: 'user-1',
                        name: 'Test User',
                        email: 'test@example.com',
                    },
                    session: { userId: 'user-1' },
                    isLoading: false,
                    isAuthenticated: true,
                } as unknown as ReturnType<typeof useAuth>);
                vi.stubGlobal('fetch', vi.fn());
            });

            afterEach(() => {
                vi.unstubAllGlobals();
            });

            it('renders update name section', () => {
                render(<ConfigModal />);

                expect(screen.getByText('Update Name')).toBeInTheDocument();
                expect(
                    screen.getByPlaceholderText('Enter new name')
                ).toBeInTheDocument();
                expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
            });

            it('save button is disabled initially', () => {
                render(<ConfigModal />);

                const saveButton = screen.getByRole('button', { name: /save/i });
                expect(saveButton).toBeDisabled();
            });

            it('save button is enabled after name change', async () => {
                const user = userEvent.setup();
                render(<ConfigModal />);

                const input = screen.getByPlaceholderText('Enter new name');
                await user.clear(input);
                await user.type(input, 'New Name');

                const saveButton = screen.getByRole('button', { name: /save/i });
                expect(saveButton).not.toBeDisabled();
            });

            it('save button is disabled if name is too short', async () => {
                const user = userEvent.setup();
                render(<ConfigModal />);

                const input = screen.getByPlaceholderText('Enter new name');
                await user.clear(input);
                await user.type(input, 'A');

                const saveButton = screen.getByRole('button', { name: /save/i });
                expect(saveButton).toBeDisabled();
            });

            it('successfully updates name and shows success toast', async () => {
                (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
                    ok: true,
                    json: async () => ({
                        message: 'Name updated successfully',
                        user: { id: 'user-1', name: 'New Name' },
                    }),
                });

                const user = userEvent.setup();
                render(<ConfigModal />);

                const input = screen.getByPlaceholderText('Enter new name');
                await user.clear(input);
                await user.type(input, 'New Name');

                const saveButton = screen.getByRole('button', { name: /save/i });
                await user.click(saveButton);

                expect(global.fetch).toHaveBeenCalledWith('/api/user', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: 'New Name' }),
                });

                expect(mockRefresh).toHaveBeenCalled();
            });

            it('shows error toast on failed name update', async () => {
                (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
                    ok: false,
                    status: 500,
                });

                const user = userEvent.setup();
                render(<ConfigModal />);

                const input = screen.getByPlaceholderText('Enter new name');
                await user.clear(input);
                await user.type(input, 'New Name');

                const saveButton = screen.getByRole('button', { name: /save/i });
                await user.click(saveButton);

                expect(global.fetch).toHaveBeenCalled();
            });
        });
    });

    describe('delete account functionality', () => {
        describe('when user is not authenticated', () => {
            beforeEach(() => {
                mockedUseAppStore.mockReturnValue({
                    isConfigModalOpen: true,
                    setIsConfigModalOpen: mockSetIsConfigModalOpen,
                } as unknown as ReturnType<typeof useAppStore>);
                mockedUseAuth.mockReturnValue({
                    user: null,
                    session: null,
                    isLoading: false,
                    isAuthenticated: false,
                });
            });

            it('does not render delete account section', () => {
                render(<ConfigModal />);

                expect(
                    screen.queryByText('Delete Account')
                ).not.toBeInTheDocument();
            });

            it('does not render delete button', () => {
                render(<ConfigModal />);

                const deleteButtons = screen
                    .queryAllByRole('button')
                    .filter((btn) => btn.textContent === 'Delete');
                expect(deleteButtons).toHaveLength(0);
            });
        });

        describe('when user is authenticated', () => {
            beforeEach(() => {
                mockedUseAppStore.mockReturnValue({
                    isConfigModalOpen: true,
                    setIsConfigModalOpen: mockSetIsConfigModalOpen,
                } as unknown as ReturnType<typeof useAppStore>);
                mockedUseAuth.mockReturnValue({
                    user: {
                        id: 'user-1',
                        name: 'Test User',
                        email: 'test@example.com',
                    },
                    session: { userId: 'user-1' },
                    isLoading: false,
                    isAuthenticated: true,
                } as unknown as ReturnType<typeof useAuth>);
            });

            it('renders delete account section', () => {
                render(<ConfigModal />);

                expect(screen.getByText('Delete Account')).toBeInTheDocument();
            });

            it('renders delete button', () => {
                render(<ConfigModal />);

                const deleteButton = screen.getByRole('button', {
                    name: /delete/i,
                });
                expect(deleteButton).toBeInTheDocument();
            });

            it('delete button has destructive variant', () => {
                render(<ConfigModal />);

                const deleteButton = screen.getByRole('button', {
                    name: /delete/i,
                });
                expect(deleteButton).toHaveClass('bg-destructive');
            });

            it('delete account section has proper layout classes', () => {
                render(<ConfigModal />);

                const deleteAccountText = screen.getByText('Delete Account');
                const deleteAccountSection = deleteAccountText.closest('div');
                expect(deleteAccountSection).toHaveClass(
                    'flex',
                    'items-center',
                    'justify-between',
                    'border-b',
                    'pb-2'
                );
            });

            it('calls showModal with correct parameters when delete button is clicked', async () => {
                const user = userEvent.setup();
                render(<ConfigModal />);

                const deleteButton = screen.getByRole('button', {
                    name: /delete/i,
                });
                await user.click(deleteButton);

                expect(mockShowModal).toHaveBeenCalledWith(
                    'Delete Account',
                    'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
                    'Delete',
                    expect.any(Function)
                );
                expect(mockShowModal).toHaveBeenCalledTimes(1);
            });

            it('shows confirmation modal before deleting account', async () => {
                const user = userEvent.setup();
                render(<ConfigModal />);

                const deleteButton = screen.getByRole('button', {
                    name: /delete/i,
                });
                await user.click(deleteButton);

                expect(mockShowModal).toHaveBeenCalled();
            });

            describe('handleDeleteAccount callback', () => {
                beforeEach(() => {
                    global.fetch = vi.fn();
                });

                it('successfully deletes account and shows success toast', async () => {
                    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
                        ok: true,
                        json: async () => ({ message: 'User deleted successfully' }),
                    });

                    const user = userEvent.setup();
                    render(<ConfigModal />);

                    const deleteButton = screen.getByRole('button', {
                        name: /delete/i,
                    });
                    await user.click(deleteButton);

                    // Get the callback function passed to showModal
                    const ctaAction = mockShowModal.mock.calls[0][3];
                    expect(typeof ctaAction).toBe('function');

                    // Execute the callback
                    await ctaAction();

                    expect(mockSetIsCTALoading).toHaveBeenCalledWith(true);
                    expect(global.fetch).toHaveBeenCalledWith('/api/user', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    expect(mockHideModal).toHaveBeenCalled();
                    expect(mockSetIsConfigModalOpen).toHaveBeenCalledWith(false);
                    expect(mockSetIsCTALoading).toHaveBeenCalledWith(false);
                    expect(mockPush).toHaveBeenCalledWith('/');
                });

                it('shows error toast on failed deletion', async () => {
                    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
                        ok: false,
                        status: 500,
                    });

                    const user = userEvent.setup();
                    render(<ConfigModal />);

                    const deleteButton = screen.getByRole('button', {
                        name: /delete/i,
                    });
                    await user.click(deleteButton);

                    const ctaAction = mockShowModal.mock.calls[0][3];
                    await ctaAction();

                    expect(mockHideModal).not.toHaveBeenCalled();
                    expect(mockSetIsCTALoading).toHaveBeenCalledWith(false);
                });

                it('shows error toast on network error', async () => {
                    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
                        new Error('Network error')
                    );

                    const user = userEvent.setup();
                    render(<ConfigModal />);

                    const deleteButton = screen.getByRole('button', {
                        name: /delete/i,
                    });
                    await user.click(deleteButton);

                    const ctaAction = mockShowModal.mock.calls[0][3];
                    await ctaAction();

                    expect(mockSetIsCTALoading).toHaveBeenCalledWith(false);
                });

                it('sets loading state correctly during deletion', async () => {
                    let resolvePromise: (value: unknown) => void;
                    const fetchPromise = new Promise((resolve) => {
                        resolvePromise = resolve;
                    });

                    (global.fetch as ReturnType<typeof vi.fn>).mockReturnValue(
                        fetchPromise
                    );

                    const user = userEvent.setup();
                    render(<ConfigModal />);

                    const deleteButton = screen.getByRole('button', {
                        name: /delete/i,
                    });
                    await user.click(deleteButton);

                    const ctaAction = mockShowModal.mock.calls[0][3];
                    const deletePromise = ctaAction();

                    // Loading should be set to true
                    expect(mockSetIsCTALoading).toHaveBeenCalledWith(true);

                    // Resolve the fetch
                    resolvePromise!({
                        ok: true,
                        json: async () => ({ message: 'User deleted successfully' }),
                    });

                    await deletePromise;

                    // Loading should be set to false
                    expect(mockSetIsCTALoading).toHaveBeenCalledWith(false);
                });
            });
        });
    });
});
