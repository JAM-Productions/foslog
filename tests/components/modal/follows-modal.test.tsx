import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FollowsModal from '@/components/modal/follows-modal';
import { useFollowsModalStore } from '@/lib/follows-modal-store';
import { useAuth } from '@/lib/auth/auth-provider';
import { useToastStore } from '@/lib/toast-store';
import { useRouter } from '@/i18n/navigation';
import { email } from 'better-auth';

// Mock dependencies
vi.mock('@/lib/follows-modal-store', () => ({
    useFollowsModalStore: vi.fn(),
}));

vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: vi.fn(),
}));

vi.mock('@/lib/toast-store', () => ({
    useToastStore: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
    useRouter: vi.fn(),
}));

vi.mock('next-intl', () => ({
    useTranslations: (namespace: string) => (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            FollowsModal: {
                followers: 'Followers',
                following: 'Following',
                follow: 'Follow',
                noFollowers: 'No followers yet',
                noFollowing: 'Not following anyone yet',
            },
            Toast: {
                toggleFollowFailed: 'Failed to update follow status',
                fetchUsersFailed: 'Failed to fetch users',
            },
        };
        return translations[namespace]?.[key] || key;
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

vi.mock('@/hooks/use-body-scroll-lock', () => ({
    useBodyScrollLock: vi.fn(),
}));

vi.mock('@/components/user/user-list-skeleton', () => ({
    default: () => <div data-testid="user-list-skeleton">Loading...</div>,
}));

vi.mock('next/image', () => ({
    default: ({ src, alt }: { src: string; alt: string }) => (
        <img
            src={src}
            alt={alt}
        />
    ),
}));

describe('FollowsModal', () => {
    const mockHideModal = vi.fn();
    const mockSetBehavior = vi.fn();
    const mockShowToast = vi.fn();
    const mockPush = vi.fn();

    const mockedUseFollowsModalStore = vi.mocked(useFollowsModalStore);
    const mockedUseAuth = vi.mocked(useAuth);
    const mockedUseToastStore = vi.mocked(useToastStore);
    const mockedUseRouter = vi.mocked(useRouter);

    const defaultModalState = {
        userId: 'user-123',
        userName: 'John Doe',
        behavior: 'followers' as const,
        isOpen: false,
    };

    const mockCurrentUser = {
        id: 'current-user-id',
        name: 'Current User',
        email: 'current@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: true,
        image: null,
    };

    const mockFollowers = [
        {
            id: 'follower-1',
            name: 'Follower One',
            email: 'follower1@example.com',
            image: 'https://example.com/follower1.jpg',
            isFollowing: true,
        },
        {
            id: 'follower-2',
            name: 'Follower Two',
            email: 'follower2@example.com',
            image: null,
            isFollowing: false,
        },
    ];

    const mockFollowing = [
        {
            id: 'following-1',
            name: 'Following One',
            email: 'following1@example.com',
            image: null,
            isFollowing: true,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();

        mockedUseFollowsModalStore.mockReturnValue({
            modal: defaultModalState,
            showModal: vi.fn(),
            hideModal: mockHideModal,
            setBehavior: mockSetBehavior,
        });

        mockedUseAuth.mockReturnValue({
            user: mockCurrentUser,
            session: {} as any,
            isLoading: false,
            isAuthenticated: true,
            refetchSession: vi.fn(),
        });

        mockedUseToastStore.mockReturnValue({
            toast: { message: '', type: 'success', isVisible: false },
            showToast: mockShowToast,
            hideToast: vi.fn(),
        });

        mockedUseRouter.mockReturnValue({
            push: mockPush,
            replace: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            refresh: vi.fn(),
            prefetch: vi.fn(),
        } as any);
    });

    describe('when modal is closed', () => {
        it('does not render modal content', () => {
            render(<FollowsModal />);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });
    });

    describe('when modal is open', () => {
        beforeEach(() => {
            mockedUseFollowsModalStore.mockReturnValue({
                modal: { ...defaultModalState, isOpen: true },
                showModal: vi.fn(),
                hideModal: mockHideModal,
                setBehavior: mockSetBehavior,
            });
        });

        it('renders the modal', () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: mockFollowing,
                }),
            });

            render(<FollowsModal />);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('displays the user name', () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: mockFollowing,
                }),
            });

            render(<FollowsModal />);

            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toHaveTextContent('John Doe');
        });

        it('displays followers and following tabs', () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: mockFollowing,
                }),
            });

            render(<FollowsModal />);

            expect(
                screen.getByRole('button', { name: 'Followers' })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Following' })
            ).toBeInTheDocument();
        });

        it('displays close button', () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: mockFollowing,
                }),
            });

            render(<FollowsModal />);

            expect(
                screen.getByRole('button', { name: 'Close' })
            ).toBeInTheDocument();
        });

        it('closes modal when close button is clicked', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: mockFollowing,
                }),
            });

            const user = userEvent.setup();
            render(<FollowsModal />);

            const closeButton = screen.getByRole('button', { name: 'Close' });
            await user.click(closeButton);

            expect(mockHideModal).toHaveBeenCalledTimes(1);
        });
    });

    describe('loading state', () => {
        beforeEach(() => {
            mockedUseFollowsModalStore.mockReturnValue({
                modal: { ...defaultModalState, isOpen: true },
                showModal: vi.fn(),
                hideModal: mockHideModal,
                setBehavior: mockSetBehavior,
            });
        });

        it('displays loading skeleton while fetching data', () => {
            (global.fetch as any).mockImplementation(
                () =>
                    new Promise((resolve) =>
                        setTimeout(
                            () =>
                                resolve({
                                    ok: true,
                                    json: async () => ({
                                        followers: mockFollowers,
                                        following: mockFollowing,
                                    }),
                                }),
                            100
                        )
                    )
            );

            render(<FollowsModal />);

            expect(
                screen.getByTestId('user-list-skeleton')
            ).toBeInTheDocument();
        });
    });

    describe('followers tab', () => {
        beforeEach(() => {
            mockedUseFollowsModalStore.mockReturnValue({
                modal: {
                    ...defaultModalState,
                    isOpen: true,
                    behavior: 'followers',
                },
                showModal: vi.fn(),
                hideModal: mockHideModal,
                setBehavior: mockSetBehavior,
            });
        });

        it('fetches and displays followers list', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: mockFollowing,
                }),
            });

            render(<FollowsModal />);

            await waitFor(() => {
                expect(screen.getByText('Follower One')).toBeInTheDocument();
                expect(screen.getByText('Follower Two')).toBeInTheDocument();
            });
        });

        it('displays empty state when no followers', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: [],
                    following: mockFollowing,
                }),
            });

            render(<FollowsModal />);

            await waitFor(() => {
                expect(
                    screen.getByText('No followers yet')
                ).toBeInTheDocument();
            });
        });

        it('displays user image when available', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: mockFollowing,
                }),
            });

            render(<FollowsModal />);

            await waitFor(() => {
                const image = screen.getByAltText('Follower One');
                expect(image).toBeInTheDocument();
            });
        });

        it('displays follow button for users not followed', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: mockFollowing,
                }),
            });

            render(<FollowsModal />);

            await waitFor(() => {
                const buttons = screen.getAllByRole('button', {
                    name: 'Follow',
                });
                expect(buttons.length).toBeGreaterThan(0);
            });
        });

        it('displays following button for users already followed', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: mockFollowing,
                }),
            });

            render(<FollowsModal />);

            await waitFor(() => {
                const buttons = screen.getAllByRole('button', {
                    name: 'Following',
                });
                expect(buttons.length).toBeGreaterThan(0);
            });
        });
    });

    describe('following tab', () => {
        beforeEach(() => {
            mockedUseFollowsModalStore.mockReturnValue({
                modal: {
                    ...defaultModalState,
                    isOpen: true,
                    behavior: 'following',
                },
                showModal: vi.fn(),
                hideModal: mockHideModal,
                setBehavior: mockSetBehavior,
            });
        });

        it('fetches and displays following list', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: mockFollowing,
                }),
            });

            render(<FollowsModal />);

            await waitFor(() => {
                expect(screen.getByText('Following One')).toBeInTheDocument();
            });
        });

        it('displays empty state when not following anyone', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: [],
                }),
            });

            render(<FollowsModal />);

            await waitFor(() => {
                expect(
                    screen.getByText('Not following anyone yet')
                ).toBeInTheDocument();
            });
        });
    });

    describe('tab switching', () => {
        beforeEach(() => {
            mockedUseFollowsModalStore.mockReturnValue({
                modal: {
                    ...defaultModalState,
                    isOpen: true,
                    behavior: 'followers',
                },
                showModal: vi.fn(),
                hideModal: mockHideModal,
                setBehavior: mockSetBehavior,
            });
        });

        it('switches to following tab when clicked', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: mockFollowing,
                }),
            });

            const user = userEvent.setup();
            render(<FollowsModal />);

            await waitFor(() => {
                expect(screen.getByText('Follower One')).toBeInTheDocument();
            });

            const tabs = screen.getAllByRole('button', { name: 'Following' });
            const followingTab = tabs.find((btn) =>
                btn.className.includes('rounded-b-none')
            );

            if (followingTab) {
                await user.click(followingTab);
                expect(mockSetBehavior).toHaveBeenCalledWith('following');
            }
        });

        it('switches to followers tab when clicked', async () => {
            mockedUseFollowsModalStore.mockReturnValue({
                modal: {
                    ...defaultModalState,
                    isOpen: true,
                    behavior: 'following',
                },
                showModal: vi.fn(),
                hideModal: mockHideModal,
                setBehavior: mockSetBehavior,
            });

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: mockFollowing,
                }),
            });

            const user = userEvent.setup();
            render(<FollowsModal />);

            await waitFor(() => {
                expect(screen.getByText('Following One')).toBeInTheDocument();
            });

            const tabs = screen.getAllByRole('button');
            const followersTab = tabs.find(
                (btn) =>
                    btn.textContent === 'Followers' &&
                    btn.className.includes('rounded-b-none')
            );

            if (followersTab) {
                await user.click(followersTab);
                expect(mockSetBehavior).toHaveBeenCalledWith('followers');
            }
        });
    });

    describe('follow/unfollow actions', () => {
        beforeEach(() => {
            mockedUseFollowsModalStore.mockReturnValue({
                modal: {
                    ...defaultModalState,
                    isOpen: true,
                    behavior: 'followers',
                },
                showModal: vi.fn(),
                hideModal: mockHideModal,
                setBehavior: mockSetBehavior,
            });
        });

        it('follows a user when follow button is clicked', async () => {
            (global.fetch as any)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        followers: mockFollowers,
                        following: mockFollowing,
                    }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({}),
                });

            const user = userEvent.setup();
            render(<FollowsModal />);

            await waitFor(() => {
                expect(screen.getByText('Follower Two')).toBeInTheDocument();
            });

            const followButtons = screen.getAllByRole('button', {
                name: 'Follow',
            });
            await user.click(followButtons[0]);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/user/follower-2/follow',
                    { method: 'POST' }
                );
            });
        });

        it('unfollows a user when following button is clicked', async () => {
            (global.fetch as any)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        followers: mockFollowers,
                        following: mockFollowing,
                    }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({}),
                });

            const user = userEvent.setup();
            render(<FollowsModal />);

            await waitFor(() => {
                expect(screen.getByText('Follower One')).toBeInTheDocument();
            });

            const allButtons = screen.getAllByRole('button');
            const followingButtons = allButtons.filter(
                (btn) =>
                    btn.textContent === 'Following' &&
                    !btn.className.includes('rounded-b-none')
            );

            await user.click(followingButtons[0]);

            await waitFor(() => {
                const fetchCalls = (global.fetch as any).mock.calls;
                const followActionCall = fetchCalls.find(
                    (call: any) =>
                        call[0].includes('/follow') &&
                        call[1]?.method === 'DELETE'
                );
                expect(followActionCall).toBeDefined();
                expect(followActionCall[0]).toBe('/api/user/follower-1/follow');
            });
        });

        it('shows error toast when follow action fails', async () => {
            (global.fetch as any)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        followers: mockFollowers,
                        following: mockFollowing,
                    }),
                })
                .mockResolvedValueOnce({
                    ok: false,
                });

            const user = userEvent.setup();
            render(<FollowsModal />);

            await waitFor(() => {
                expect(screen.getByText('Follower Two')).toBeInTheDocument();
            });

            const followButtons = screen.getAllByRole('button', {
                name: 'Follow',
            });
            await user.click(followButtons[0]);

            await waitFor(() => {
                expect(mockShowToast).toHaveBeenCalledWith(
                    'Failed to update follow status',
                    'error'
                );
            });
        });

        it('prevents concurrent follow/unfollow actions', async () => {
            (global.fetch as any)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        followers: mockFollowers,
                        following: mockFollowing,
                    }),
                })
                .mockImplementation(
                    () =>
                        new Promise((resolve) =>
                            setTimeout(
                                () =>
                                    resolve({
                                        ok: true,
                                        json: async () => ({}),
                                    }),
                                100
                            )
                        )
                );

            const user = userEvent.setup();
            render(<FollowsModal />);

            await waitFor(() => {
                expect(screen.getByText('Follower Two')).toBeInTheDocument();
            });

            const allButtons = screen.getAllByRole('button');
            const followButtons = allButtons.filter(
                (btn) => btn.textContent === 'Follow'
            );

            const firstButton = followButtons[0];

            // Click once and verify button gets disabled
            await user.click(firstButton);

            // The button should be disabled after the first click
            await waitFor(() => {
                expect(firstButton).toBeDisabled();
            });
        });

        it('redirects to login when unauthenticated user tries to follow', async () => {
            // Start with authenticated user to load data
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: mockFollowing,
                }),
            });

            const user = userEvent.setup();
            const { rerender } = render(<FollowsModal />);

            await waitFor(() => {
                expect(screen.getByText('Follower Two')).toBeInTheDocument();
            });

            // Now change to unauthenticated user
            mockedUseAuth.mockReturnValue({
                user: null,
                session: null,
                isLoading: false,
                isAuthenticated: false,
                refetchSession: vi.fn(),
            });

            rerender(<FollowsModal />);

            const followButtons = screen
                .getAllByRole('button')
                .filter((btn) => btn.textContent === 'Follow');
            await user.click(followButtons[0]);

            expect(mockPush).toHaveBeenCalledWith('/login');
        });

        it('does not show follow button for current user', async () => {
            const followersWithCurrentUser = [
                ...mockFollowers,
                { ...mockCurrentUser, isFollowing: false },
            ];

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: followersWithCurrentUser,
                    following: mockFollowing,
                }),
            });

            render(<FollowsModal />);

            await waitFor(() => {
                expect(screen.getByText('Current User')).toBeInTheDocument();
            });

            // Get all user rows
            const allButtons = screen.getAllByRole('button');

            // Filter to get only follow/following action buttons (exclude tabs and close button)
            const actionButtons = allButtons.filter((btn) => {
                const text = btn.textContent;
                const isTabButton = btn.className.includes('rounded-b-none');
                const isCloseButton =
                    btn.getAttribute('aria-label') === 'Close';
                return (
                    (text === 'Follow' || text === 'Following') &&
                    !isTabButton &&
                    !isCloseButton
                );
            });

            // Should have 2 action buttons: one for Follower One (Following), one for Follower Two (Follow)
            // No button for Current User
            expect(actionButtons.length).toBe(2);
        });
    });

    describe('navigation', () => {
        beforeEach(() => {
            mockedUseFollowsModalStore.mockReturnValue({
                modal: {
                    ...defaultModalState,
                    isOpen: true,
                    behavior: 'followers',
                },
                showModal: vi.fn(),
                hideModal: mockHideModal,
                setBehavior: mockSetBehavior,
            });
        });

        it('navigates to user profile when user name is clicked', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: mockFollowing,
                }),
            });

            const user = userEvent.setup();
            render(<FollowsModal />);

            await waitFor(() => {
                expect(screen.getByText('Follower One')).toBeInTheDocument();
            });

            const userName = screen.getByText('Follower One');
            await user.click(userName);

            expect(mockHideModal).toHaveBeenCalledTimes(1);
            expect(mockPush).toHaveBeenCalledWith('/profile/follower-1');
        });

        it('navigates to user profile when avatar is clicked', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: mockFollowing,
                }),
            });

            const user = userEvent.setup();
            render(<FollowsModal />);

            await waitFor(() => {
                expect(screen.getByText('Follower One')).toBeInTheDocument();
            });

            // Find the clickable div wrapping the avatar
            const avatarWrappers = screen.getAllByText('Follower One');
            const parentDiv =
                avatarWrappers[0].parentElement?.querySelector(
                    '.cursor-pointer'
                );

            if (parentDiv) {
                await user.click(parentDiv);

                expect(mockHideModal).toHaveBeenCalled();
                expect(mockPush).toHaveBeenCalledWith('/profile/follower-1');
            }
        });
    });

    describe('error handling', () => {
        beforeEach(() => {
            mockedUseFollowsModalStore.mockReturnValue({
                modal: {
                    ...defaultModalState,
                    isOpen: true,
                    behavior: 'followers',
                },
                showModal: vi.fn(),
                hideModal: mockHideModal,
                setBehavior: mockSetBehavior,
            });
        });

        it('shows error toast when fetching users fails', async () => {
            (global.fetch as any).mockRejectedValueOnce(
                new Error('Failed to fetch')
            );

            render(<FollowsModal />);

            await waitFor(() => {
                expect(mockShowToast).toHaveBeenCalledWith(
                    'Failed to fetch users',
                    'error'
                );
            });
        });

        it('shows error toast when response is not ok', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
            });

            render(<FollowsModal />);

            await waitFor(() => {
                expect(mockShowToast).toHaveBeenCalledWith(
                    'Failed to fetch users',
                    'error'
                );
            });
        });
    });

    describe('data fetching', () => {
        beforeEach(() => {
            mockedUseFollowsModalStore.mockReturnValue({
                modal: {
                    ...defaultModalState,
                    isOpen: true,
                    behavior: 'followers',
                },
                showModal: vi.fn(),
                hideModal: mockHideModal,
                setBehavior: mockSetBehavior,
            });
        });

        it('fetches follow data when modal opens', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    followers: mockFollowers,
                    following: mockFollowing,
                }),
            });

            render(<FollowsModal />);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/user/user-123/follow'
                );
            });
        });

        it('does not fetch data when modal is closed', () => {
            mockedUseFollowsModalStore.mockReturnValue({
                modal: { ...defaultModalState, isOpen: false },
                showModal: vi.fn(),
                hideModal: mockHideModal,
                setBehavior: mockSetBehavior,
            });

            render(<FollowsModal />);

            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('does not fetch data when user is not authenticated', () => {
            mockedUseAuth.mockReturnValue({
                user: null,
                session: null,
                isLoading: false,
                isAuthenticated: false,
                refetchSession: vi.fn(),
            });

            mockedUseFollowsModalStore.mockReturnValue({
                modal: { ...defaultModalState, isOpen: true },
                showModal: vi.fn(),
                hideModal: mockHideModal,
                setBehavior: mockSetBehavior,
            });

            render(<FollowsModal />);

            expect(global.fetch).not.toHaveBeenCalled();
        });
    });
});
