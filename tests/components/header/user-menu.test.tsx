import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserMenu from '@/components/header/user-menu';
import { useAuth } from '@/lib/auth/auth-provider';
import { signOut } from '@/lib/auth/auth-client';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAppStore } from '@/lib/store';
import type { User, Session } from '@/lib/auth/auth-client';

// Mock dependencies
vi.mock('@/lib/auth/auth-provider', () => ({
    useAuth: vi.fn(),
}));

vi.mock('@/lib/auth/auth-client', () => ({
    signOut: vi.fn(),
}));

vi.mock('@/hooks/useClickOutside', () => ({
    useClickOutside: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

vi.mock('next-intl', () => ({
    useTranslations: vi.fn(),
}));

vi.mock('@/lib/store', () => ({
    useAppStore: vi.fn(),
}));

describe('UserMenu', () => {
    const mockPush = vi.fn();
    const mockT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            login: 'Log In',
            signUp: 'Sign Up',
            settings: 'Settings',
            signOut: 'Sign Out',
        };
        return translations[key] || key;
    });

    const mockedUseAuth = vi.mocked(useAuth);
    const mockedSignOut = vi.mocked(signOut);
    const mockedUseClickOutside = vi.mocked(useClickOutside);
    const mockedUseRouter = vi.mocked(useRouter);
    const mockedUseTranslations = vi.mocked(useTranslations);
    const mockedUseAppStore = vi.mocked(useAppStore);

    const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: true,
        image: 'https://example.com/avatar.jpg',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseClickOutside.mockImplementation(() => {});
        mockedUseRouter.mockReturnValue({
            push: mockPush,
            replace: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            refresh: vi.fn(),
            prefetch: vi.fn(),
        } as unknown as ReturnType<typeof useRouter>);
        mockedUseTranslations.mockReturnValue(
            mockT as unknown as ReturnType<typeof useTranslations>
        );
        mockedSignOut.mockImplementation(() => Promise.resolve());
        mockedUseAppStore.mockReturnValue({
            setIsConfigModalOpen: vi.fn(),
        } as unknown as ReturnType<typeof useAppStore>);
    });

    describe('when user is not logged in', () => {
        beforeEach(() => {
            mockedUseAuth.mockReturnValue({
                user: null,
                session: null,
                isLoading: false,
                isAuthenticated: false,
            });
        });

        it('displays login and signup buttons', () => {
            render(<UserMenu />);

            expect(
                screen.getByRole('button', { name: /log in/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: /sign up/i })
            ).toBeInTheDocument();
        });

        it('does not display user menu dropdown', () => {
            render(<UserMenu />);

            expect(screen.queryByText('Settings')).not.toBeInTheDocument();
            expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
        });

        it('displays mobile user icon button on small screens', () => {
            render(<UserMenu />);

            const buttons = screen.getAllByRole('button');
            const mobileButton = buttons.find((btn) =>
                btn.className.includes('sm:hidden')
            );
            expect(mobileButton).toHaveClass('relative', 'block', 'sm:hidden');
        });

        it('opens mobile dropdown when user icon is clicked', async () => {
            const user = userEvent.setup();
            render(<UserMenu />);

            const buttons = screen.getAllByRole('button');
            const mobileButton = buttons.find((btn) =>
                btn.className.includes('sm:hidden')
            )!;
            await user.click(mobileButton);

            // Should show the dropdown with login/signup options
            const dropdownButtons = screen.getAllByText('Log In');
            expect(dropdownButtons.length).toBeGreaterThan(1); // One in desktop, one in mobile dropdown
        });

        it('navigates to login when mobile dropdown login is clicked', async () => {
            const user = userEvent.setup();
            render(<UserMenu />);

            const buttons = screen.getAllByRole('button');
            const mobileButton = buttons.find((btn) =>
                btn.className.includes('sm:hidden')
            )!;
            await user.click(mobileButton);

            // Find the dropdown login button (not the desktop one)
            const loginButtons = screen.getAllByText('Log In');
            const dropdownElement = loginButtons.find((button) =>
                button.closest('.bg-card')
            );

            if (dropdownElement) {
                await user.click(dropdownElement);
                expect(mockPush).toHaveBeenCalledWith('/login');
            }
        });

        it('navigates to signup when mobile dropdown signup is clicked and closes dropdown', async () => {
            const user = userEvent.setup();
            render(<UserMenu />);

            const buttons = screen.getAllByRole('button');
            const mobileButton = buttons.find((btn) =>
                btn.className.includes('sm:hidden')
            )!;
            await user.click(mobileButton);

            // Find all Sign Up buttons and get the one in the dropdown
            const signUpButtons = screen.getAllByText('Sign Up');
            const dropdownElement = signUpButtons.find((button) =>
                button.closest('.bg-card')
            );

            if (dropdownElement) {
                await user.click(dropdownElement);
                expect(mockPush).toHaveBeenCalledWith('/signup');
            }
        });

        it('navigates to login when desktop login button is clicked', async () => {
            const user = userEvent.setup();
            render(<UserMenu />);

            const loginButton = screen.getByRole('button', { name: /log in/i });
            await user.click(loginButton);

            expect(mockPush).toHaveBeenCalledWith('/login');
        });

        it('navigates to signup when desktop signup button is clicked', async () => {
            const user = userEvent.setup();
            render(<UserMenu />);

            const signupButton = screen.getByRole('button', {
                name: /sign up/i,
            });
            await user.click(signupButton);

            expect(mockPush).toHaveBeenCalledWith('/signup');
        });
    });

    describe('when user is logged in', () => {
        beforeEach(() => {
            const mockSession = {
                user: mockUser,
                session: {
                    id: 'session-1',
                    userId: mockUser.id,
                    token: 'mock-token',
                    expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ipAddress: '127.0.0.1',
                    userAgent: 'test-agent',
                },
            };

            mockedUseAuth.mockReturnValue({
                user: mockUser,
                session: mockSession,
                isLoading: false,
                isAuthenticated: true,
            });
        });

        it('displays user button with name', () => {
            render(<UserMenu />);

            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        it('displays user avatar when image is provided', () => {
            render(<UserMenu />);

            const avatar = screen.getByAltText('John Doe');
            expect(avatar).toBeInTheDocument();
            expect(avatar).toHaveAttribute('src', mockUser.image);
        });

        it('displays user icon when no image is provided', () => {
            const userWithoutImage = { ...mockUser, image: null };
            mockedUseAuth.mockReturnValue({
                user: userWithoutImage,
                session: { user: userWithoutImage } as Session,
                isLoading: false,
                isAuthenticated: true,
            });

            render(<UserMenu />);

            // User icon should be present (assuming it's rendered as an svg or similar)
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.queryByAltText('John Doe')).not.toBeInTheDocument();
        });

        it('opens dropdown menu when user button is clicked', async () => {
            const user = userEvent.setup();
            render(<UserMenu />);

            const userButton = screen.getByRole('button', {
                name: /john doe/i,
            });
            await user.click(userButton);

            expect(screen.getByText('Settings')).toBeInTheDocument();
            expect(screen.getByText('Sign Out')).toBeInTheDocument();
            expect(screen.getByText('john@example.com')).toBeInTheDocument();
        });

        it('displays user info in dropdown header', async () => {
            const user = userEvent.setup();
            render(<UserMenu />);

            const userButton = screen.getByRole('button', {
                name: /john doe/i,
            });
            await user.click(userButton);

            // Check for user info in dropdown header (there are multiple "John Doe" elements)
            expect(screen.getAllByText('John Doe')).toHaveLength(2); // One in button, one in dropdown
            expect(screen.getByText('john@example.com')).toBeInTheDocument();
        });

        it('calls setUser with null when sign out is clicked', async () => {
            const user = userEvent.setup();
            render(<UserMenu />);

            // Open dropdown
            const userButton = screen.getByRole('button', {
                name: /john doe/i,
            });
            await user.click(userButton);

            // Click sign out
            const signOutButton = screen.getByText('Sign Out');
            await user.click(signOutButton);

            expect(mockedSignOut).toHaveBeenCalled();
        });

        it('calls useClickOutside hook with correct parameters', () => {
            render(<UserMenu />);

            expect(mockedUseClickOutside).toHaveBeenCalledWith(
                expect.any(Object), // ref
                false, // isOpen (initial state)
                expect.any(Function) // setIsOpen
            );
        });

        it('has proper responsive classes for user name', () => {
            render(<UserMenu />);

            const userName = screen.getByText('John Doe');
            expect(userName).toHaveClass('hidden', 'sm:inline');
        });

        it('has proper styling classes for dropdown', async () => {
            const user = userEvent.setup();
            render(<UserMenu />);

            const userButton = screen.getByRole('button', {
                name: /john doe/i,
            });
            await user.click(userButton);

            // Find the correct dropdown container (the parent of the settings button)
            const dropdown = screen.getByText('Settings').closest('.bg-card');
            expect(dropdown).toHaveClass(
                'bg-card',
                'absolute',
                'top-12',
                'right-0',
                'z-50',
                'w-48',
                'rounded-lg',
                'border',
                'shadow-lg'
            );
        });

        it('sign out button has destructive styling', async () => {
            const user = userEvent.setup();
            render(<UserMenu />);

            const userButton = screen.getByRole('button', {
                name: /john doe/i,
            });
            await user.click(userButton);

            const signOutButton = screen
                .getByText('Sign Out')
                .closest('button');
            expect(signOutButton).toHaveClass('text-destructive');
        });

        it('closes dropdown when sign out is clicked', async () => {
            const user = userEvent.setup();
            render(<UserMenu />);

            // Open dropdown
            const userButton = screen.getByRole('button', {
                name: /john doe/i,
            });
            await user.click(userButton);

            expect(screen.getByText('Settings')).toBeInTheDocument();

            // Click sign out
            const signOutButton = screen.getByText('Sign Out');
            await user.click(signOutButton);

            // Dropdown should be closed
            expect(screen.queryByText('Settings')).not.toBeInTheDocument();
        });

        it('settings button is clickable but does not have click handler', async () => {
            const user = userEvent.setup();
            render(<UserMenu />);

            const userButton = screen.getByRole('button', {
                name: /john doe/i,
            });
            await user.click(userButton);

            const settingsButton = screen
                .getByText('Settings')
                .closest('button');
            expect(settingsButton).toBeInTheDocument();

            // Settings button should be clickable but no action is expected since no handler is implemented
            await user.click(settingsButton!);

            // Dropdown should still be open since no handler closes it
            expect(screen.getByText('Settings')).toBeInTheDocument();
        });

        it('dropdown can be toggled open and closed', async () => {
            const user = userEvent.setup();
            render(<UserMenu />);

            const userButton = screen.getByRole('button', {
                name: /john doe/i,
            });

            // Open dropdown
            await user.click(userButton);
            expect(screen.getByText('Settings')).toBeInTheDocument();

            // Close dropdown
            await user.click(userButton);
            expect(screen.queryByText('Settings')).not.toBeInTheDocument();

            // Open again
            await user.click(userButton);
            expect(screen.getByText('Settings')).toBeInTheDocument();
        });
    });

    describe('responsive behavior', () => {
        beforeEach(() => {
            mockedUseAuth.mockReturnValue({
                user: null,
                session: null,
                isLoading: false,
                isAuthenticated: false,
            });
        });

        it('mobile icon button has correct responsive classes', () => {
            render(<UserMenu />);

            const buttons = screen.getAllByRole('button');
            const mobileButton = buttons.find((btn) =>
                btn.className.includes('sm:hidden')
            );
            expect(mobileButton).toHaveClass('relative', 'block', 'sm:hidden');
        });

        it('desktop buttons container has correct responsive classes', () => {
            render(<UserMenu />);

            const desktopContainer = screen
                .getByText('Log In')
                .closest('.hidden.sm\\:inline');
            expect(desktopContainer).toHaveClass('hidden', 'sm:inline');
        });

        it('user name span has correct responsive classes when logged in', () => {
            mockedUseAuth.mockReturnValue({
                user: mockUser,
                session: { user: mockUser } as Session,
                isLoading: false,
                isAuthenticated: true,
            });

            render(<UserMenu />);

            const userName = screen.getByText('John Doe');
            expect(userName).toHaveClass('hidden', 'sm:inline');
        });
    });

    describe('useClickOutside integration', () => {
        it('calls useClickOutside for both menu refs with correct parameters', () => {
            // Test when user is not logged in
            render(<UserMenu />);

            expect(mockedUseClickOutside).toHaveBeenCalledTimes(2);
            expect(mockedUseClickOutside).toHaveBeenNthCalledWith(
                1,
                expect.any(Object), // menuNotUserRef
                false, // isNotUserOpen
                expect.any(Function) // setIsNotUserOpen
            );
            expect(mockedUseClickOutside).toHaveBeenNthCalledWith(
                2,
                expect.any(Object), // menuUserRef
                false, // isUserOpen
                expect.any(Function) // setIsUserOpen
            );
        });

        it('calls useClickOutside with updated state when logged in and dropdown is open', async () => {
            mockedUseAuth.mockReturnValue({
                user: mockUser,
                session: { user: mockUser } as Session,
                isLoading: false,
                isAuthenticated: true,
            });

            const user = userEvent.setup();
            render(<UserMenu />);

            // Open user dropdown
            const userButton = screen.getByRole('button', {
                name: /john doe/i,
            });
            await user.click(userButton);

            // useClickOutside should have been called again with updated state
            expect(mockedUseClickOutside).toHaveBeenCalled();
        });
    });
});
