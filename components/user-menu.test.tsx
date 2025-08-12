import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserMenu from '@/components/user-menu';
import { useAppStore } from '@/lib/store';
import { useClickOutside } from '@/hooks/useClickOutside';
import type { User } from '@/lib/store';

// Mock dependencies
vi.mock('@/lib/store', () => ({
    useAppStore: vi.fn(),
}));

vi.mock('@/hooks/useClickOutside', () => ({
    useClickOutside: vi.fn(),
}));

describe('UserMenu', () => {
    const mockSetUser = vi.fn();
    const mockedUseAppStore = vi.mocked(useAppStore);
    const mockedUseClickOutside = vi.mocked(useClickOutside);

    const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg',
        bio: 'Test user',
        joinedAt: new Date('2023-01-01'),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseClickOutside.mockImplementation(() => {});
    });

    describe('when user is not logged in', () => {
        beforeEach(() => {
            mockedUseAppStore.mockReturnValue({
                user: null,
                setUser: mockSetUser,
                // Add other store properties
                theme: 'system',
                setTheme: vi.fn(),
                selectedMediaType: 'all',
                setSelectedMediaType: vi.fn(),
                searchQuery: '',
                setSearchQuery: vi.fn(),
                mediaItems: [],
                setMediaItems: vi.fn(),
                addMediaItem: vi.fn(),
                reviews: [],
                setReviews: vi.fn(),
                addReview: vi.fn(),
                updateReview: vi.fn(),
                deleteReview: vi.fn(),
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
    });

    describe('when user is logged in', () => {
        beforeEach(() => {
            mockedUseAppStore.mockReturnValue({
                user: mockUser,
                setUser: mockSetUser,
                // Add other store properties
                theme: 'system',
                setTheme: vi.fn(),
                selectedMediaType: 'all',
                setSelectedMediaType: vi.fn(),
                searchQuery: '',
                setSearchQuery: vi.fn(),
                mediaItems: [],
                setMediaItems: vi.fn(),
                addMediaItem: vi.fn(),
                reviews: [],
                setReviews: vi.fn(),
                addReview: vi.fn(),
                updateReview: vi.fn(),
                deleteReview: vi.fn(),
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
            const userWithoutImage = { ...mockUser, image: undefined };
            mockedUseAppStore.mockReturnValue({
                user: userWithoutImage,
                setUser: mockSetUser,
                theme: 'system',
                setTheme: vi.fn(),
                selectedMediaType: 'all',
                setSelectedMediaType: vi.fn(),
                searchQuery: '',
                setSearchQuery: vi.fn(),
                mediaItems: [],
                setMediaItems: vi.fn(),
                addMediaItem: vi.fn(),
                reviews: [],
                setReviews: vi.fn(),
                addReview: vi.fn(),
                updateReview: vi.fn(),
                deleteReview: vi.fn(),
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

            expect(mockSetUser).toHaveBeenCalledWith(null);
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
    });
});
