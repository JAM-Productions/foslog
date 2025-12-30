import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewOptions } from '@/components/review/review-options';
import { useTranslations } from 'next-intl';
import userEvent from '@testing-library/user-event';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: vi.fn(),
}));

// Mock useToast
vi.mock('@/hooks/useToast', () => ({
    useToast: vi.fn(() => ({
        toast: { isVisible: false, message: '', type: 'success' },
        showToast: vi.fn(),
        hideToast: vi.fn(),
    })),
}));

// Mock Toast component
vi.mock('@/components/toast/toast', () => ({
    Toast: () => null,
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
    Pencil: ({ className }: { className?: string }) => (
        <svg
            data-testid="pencil-icon"
            className={className}
        />
    ),
    Share2: ({ className }: { className?: string }) => (
        <svg
            data-testid="share2-icon"
            className={className}
        />
    ),
    Trash: ({ className }: { className?: string }) => (
        <svg
            data-testid="trash-icon"
            className={className}
        />
    ),
    X: ({ className }: { className?: string }) => (
        <svg
            data-testid="x-icon"
            className={className}
        />
    ),
}));

describe('ReviewOptions', () => {
    const mockTCTA = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            edit: 'Edit',
            delete: 'Delete',
            share: 'Share',
        };
        return translations[key] || key;
    });

    const mockT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            options: 'Options',
            shareTitle: 'Review',
        };
        return translations[key] || key;
    });

    const mockTToast = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            linkCopied: 'Link copied to clipboard!',
            copyFailed: 'Failed to copy link',
        };
        return translations[key] || key;
    });

    const mockedUseTranslations = vi.mocked(useTranslations);

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseTranslations.mockImplementation((namespace?: string) => {
            if (namespace === 'CTA') {
                return mockTCTA as unknown as ReturnType<typeof useTranslations>;
            }
            if (namespace === 'ReviewPage') {
                return mockT as unknown as ReturnType<typeof useTranslations>;
            }
            if (namespace === 'Toast') {
                return mockTToast as unknown as ReturnType<
                    typeof useTranslations
                >;
            }
            return mockTCTA as unknown as ReturnType<typeof useTranslations>;
        });

        // Mock navigator.clipboard
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: vi.fn(() => Promise.resolve()),
            },
            writable: true,
            configurable: true,
        });

        // Mock window.location.origin
        Object.defineProperty(window, 'location', {
            value: {
                origin: 'http://localhost:3000',
            },
            writable: true,
        });

        // Mock window.isSecureContext
        Object.defineProperty(window, 'isSecureContext', {
            value: true,
            writable: true,
            configurable: true,
        });
    });

    describe('Owner actions', () => {
        it('renders edit button when user is owner', () => {
            render(<ReviewOptions reviewId="test-review-id" isOwner={true} />);

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toBeInTheDocument();
        });

        it('renders delete button when user is owner', () => {
            render(<ReviewOptions reviewId="test-review-id" isOwner={true} />);

            const deleteButton = screen.getByRole('button', {
                name: /delete/i,
            });
            expect(deleteButton).toBeInTheDocument();
        });

        it('renders edit icon when user is owner', () => {
            render(<ReviewOptions reviewId="test-review-id" isOwner={true} />);

            const editIcon = screen.getByTestId('pencil-icon');
            expect(editIcon).toBeInTheDocument();
            expect(editIcon).toHaveClass('h-4', 'w-4');
        });

        it('renders delete icon when user is owner', () => {
            render(<ReviewOptions reviewId="test-review-id" isOwner={true} />);

            const deleteIcon = screen.getByTestId('trash-icon');
            expect(deleteIcon).toBeInTheDocument();
            expect(deleteIcon).toHaveClass('h-4', 'w-4');
        });

        it('does not render edit button when user is not owner', () => {
            render(<ReviewOptions isOwner={false} />);

            const editButton = screen.queryByRole('button', { name: /edit/i });
            expect(editButton).not.toBeInTheDocument();
        });

        it('does not render delete button when user is not owner', () => {
            render(<ReviewOptions isOwner={false} />);

            const deleteButton = screen.queryByRole('button', {
                name: /delete/i,
            });
            expect(deleteButton).not.toBeInTheDocument();
        });
    });

    describe('Share action', () => {
        it('renders share button for owner', () => {
            render(<ReviewOptions reviewId="test-review-id" isOwner={true} />);

            const shareButton = screen.getByRole('button', { name: /share/i });
            expect(shareButton).toBeInTheDocument();
        });

        it('renders share button for non-owner', () => {
            render(<ReviewOptions isOwner={false} />);

            const shareButton = screen.getByRole('button', { name: /share/i });
            expect(shareButton).toBeInTheDocument();
        });

        it('renders share icon', () => {
            render(<ReviewOptions isOwner={false} />);

            const shareIcon = screen.getByTestId('share2-icon');
            expect(shareIcon).toBeInTheDocument();
            expect(shareIcon).toHaveClass('h-4', 'w-4');
        });
    });

    describe('Mobile variant', () => {
        it('renders with mobile variant by default', () => {
            render(<ReviewOptions reviewId="test-review-id" isOwner={true} />);

            const buttons = screen.getAllByRole('button');
            buttons.forEach((button) => {
                expect(button).toHaveClass('flex', 'w-full', 'sm:w-auto');
            });
        });

        it('does not render options title with mobile variant', () => {
            render(
                <ReviewOptions
                    reviewId="test-review-id"
                    isOwner={true}
                    variant="mobile"
                />
            );

            const optionsTitle = screen.queryByText('Options');
            expect(optionsTitle).not.toBeInTheDocument();
        });

        it('applies mobile button classes', () => {
            render(
                <ReviewOptions
                    reviewId="test-review-id"
                    isOwner={true}
                    variant="mobile"
                />
            );

            const shareButton = screen.getByRole('button', { name: /share/i });
            expect(shareButton).toHaveClass(
                'flex',
                'w-full',
                'items-center',
                'gap-1.5',
                'sm:w-auto'
            );
        });
    });

    describe('Desktop variant', () => {
        it('renders options title with desktop variant', () => {
            render(
                <ReviewOptions
                    reviewId="test-review-id"
                    isOwner={true}
                    variant="desktop"
                />
            );

            const optionsTitle = screen.getByText('Options');
            expect(optionsTitle).toBeInTheDocument();
        });

        it('applies correct styling to options title', () => {
            render(
                <ReviewOptions
                    reviewId="test-review-id"
                    isOwner={true}
                    variant="desktop"
                />
            );

            const optionsTitle = screen.getByText('Options');
            expect(optionsTitle).toHaveClass(
                'text-foreground',
                'text-2xl',
                'font-bold',
                'sm:text-3xl'
            );
        });

        it('applies desktop button classes', () => {
            render(
                <ReviewOptions
                    reviewId="test-review-id"
                    isOwner={true}
                    variant="desktop"
                />
            );

            const shareButton = screen.getByRole('button', { name: /share/i });
            expect(shareButton).toHaveClass(
                'flex',
                'w-full',
                'items-center',
                'gap-1.5'
            );
            expect(shareButton).not.toHaveClass('sm:w-auto');
        });
    });

    describe('Button styling', () => {
        it('applies outline variant to all buttons', () => {
            render(<ReviewOptions reviewId="test-review-id" isOwner={true} />);

            const buttons = screen.getAllByRole('button');
            buttons.forEach((button) => {
                expect(button).toHaveClass('border', 'border-input');
            });
        });

        it('applies small size to all buttons', () => {
            render(<ReviewOptions reviewId="test-review-id" isOwner={true} />);

            const buttons = screen.getAllByRole('button');
            buttons.forEach((button) => {
                expect(button).toHaveClass('h-9', 'rounded-md', 'px-3');
            });
        });

        it('applies gap classes to button content', () => {
            render(<ReviewOptions reviewId="test-review-id" isOwner={true} />);

            const shareButton = screen.getByRole('button', { name: /share/i });
            expect(shareButton).toHaveClass('gap-1.5');
        });
    });

    describe('Button order', () => {
        it('renders buttons in correct order for owner', () => {
            render(<ReviewOptions reviewId="test-review-id" isOwner={true} />);

            const buttons = screen.getAllByRole('button');
            expect(buttons[0]).toHaveTextContent('Edit');
            expect(buttons[1]).toHaveTextContent('Delete');
            expect(buttons[2]).toHaveTextContent('Share');
        });

        it('renders only share button for non-owner', () => {
            render(<ReviewOptions reviewId="test-review-id" isOwner={false} />);

            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(1);
            expect(buttons[0]).toHaveTextContent('Share');
        });
    });

    describe('Translations', () => {
        it('uses correct translation namespace for CTA buttons', () => {
            render(<ReviewOptions reviewId="test-review-id" isOwner={true} />);

            expect(mockTCTA).toHaveBeenCalledWith('edit');
            expect(mockTCTA).toHaveBeenCalledWith('delete');
            expect(mockTCTA).toHaveBeenCalledWith('share');
        });

        it('uses correct translation namespace for options title', () => {
            render(
                <ReviewOptions
                    reviewId="test-review-id"
                    isOwner={true}
                    variant="desktop"
                />
            );

            expect(mockT).toHaveBeenCalledWith('options');
        });
    });

    describe('Icon and text alignment', () => {
        it('aligns icon and text in edit button', () => {
            render(<ReviewOptions reviewId="test-review-id" isOwner={true} />);

            const editButton = screen.getByRole('button', { name: /edit/i });
            const icon = editButton.querySelector('[data-testid="pencil-icon"]');
            const text = editButton.querySelector('span');

            expect(icon).toBeInTheDocument();
            expect(text).toBeInTheDocument();
            expect(editButton).toHaveClass('items-center');
        });

        it('aligns icon and text in delete button', () => {
            render(<ReviewOptions reviewId="test-review-id" isOwner={true} />);

            const deleteButton = screen.getByRole('button', {
                name: /delete/i,
            });
            const icon = deleteButton.querySelector('[data-testid="trash-icon"]');
            const text = deleteButton.querySelector('span');

            expect(icon).toBeInTheDocument();
            expect(text).toBeInTheDocument();
            expect(deleteButton).toHaveClass('items-center');
        });

        it('aligns icon and text in share button', () => {
            render(<ReviewOptions reviewId="test-review-id" isOwner={false} />);

            const shareButton = screen.getByRole('button', { name: /share/i });
            const icon = shareButton.querySelector('[data-testid="share2-icon"]');
            const text = shareButton.querySelector('span');

            expect(icon).toBeInTheDocument();
            expect(text).toBeInTheDocument();
            expect(shareButton).toHaveClass('items-center');
        });
    });

    describe('Share functionality', () => {
        it('handles share button click when Web Share API not available', async () => {
            const user = userEvent.setup();
            const writeTextMock = vi.fn(() => Promise.resolve());

            // No navigator.share - will use clipboard
            Object.defineProperty(navigator, 'share', {
                value: undefined,
                writable: true,
                configurable: true,
            });

            Object.defineProperty(navigator, 'clipboard', {
                value: {
                    writeText: writeTextMock,
                },
                writable: true,
                configurable: true,
            });

            render(<ReviewOptions reviewId="test-review-id" isOwner={false} />);

            const shareButton = screen.getByRole('button', { name: /share/i });
            await user.click(shareButton);

            expect(writeTextMock).toHaveBeenCalledWith(
                'http://localhost:3000/review/test-review-id'
            );
        });

        it('uses Web Share API when available', async () => {
            const user = userEvent.setup();
            const shareMock = vi.fn(() => Promise.resolve());

            Object.defineProperty(navigator, 'share', {
                value: shareMock,
                writable: true,
                configurable: true,
            });

            render(<ReviewOptions reviewId="test-review-id" isOwner={false} />);

            const shareButton = screen.getByRole('button', { name: /share/i });
            await user.click(shareButton);

            expect(shareMock).toHaveBeenCalledWith({
                title: 'Review',
                url: 'http://localhost:3000/review/test-review-id',
            });
        });

        it('does not fallback to clipboard on share cancel', async () => {
            const user = userEvent.setup();
            const writeTextMock = vi.fn(() => Promise.resolve());
            const shareMock = vi.fn(() =>
                Promise.reject(new DOMException('AbortError', 'AbortError'))
            );

            Object.defineProperty(navigator, 'share', {
                value: shareMock,
                writable: true,
                configurable: true,
            });

            Object.defineProperty(navigator, 'clipboard', {
                value: {
                    writeText: writeTextMock,
                },
                writable: true,
                configurable: true,
            });

            render(<ReviewOptions reviewId="test-review-id" isOwner={false} />);

            const shareButton = screen.getByRole('button', { name: /share/i });
            await user.click(shareButton);

            expect(shareMock).toHaveBeenCalled();
            // Should not fallback to clipboard on user cancel
            expect(writeTextMock).not.toHaveBeenCalled();
        });

        it('falls back to clipboard on share error', async () => {
            const user = userEvent.setup();
            const writeTextMock = vi.fn(() => Promise.resolve());
            const shareMock = vi.fn(() =>
                Promise.reject(new Error('Share failed'))
            );

            Object.defineProperty(navigator, 'share', {
                value: shareMock,
                writable: true,
                configurable: true,
            });

            Object.defineProperty(navigator, 'clipboard', {
                value: {
                    writeText: writeTextMock,
                },
                writable: true,
                configurable: true,
            });

            render(<ReviewOptions reviewId="test-review-id" isOwner={false} />);

            const shareButton = screen.getByRole('button', { name: /share/i });
            await user.click(shareButton);

            expect(shareMock).toHaveBeenCalled();
            // Should fallback to clipboard on error
            expect(writeTextMock).toHaveBeenCalledWith(
                'http://localhost:3000/review/test-review-id'
            );
        });
    });
});
