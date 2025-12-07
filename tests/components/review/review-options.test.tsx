import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewOptions } from '@/components/review/review-options';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: vi.fn(),
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
    useToast: vi.fn(),
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
            shareText: 'Share this review',
        };
        return translations[key] || key;
    });

    const mockedUseTranslations = vi.mocked(useTranslations);
    const mockedUseToast = vi.mocked(useToast);

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseTranslations.mockImplementation((namespace?: string) => {
            if (namespace === 'CTA') {
                return mockTCTA as unknown as ReturnType<typeof useTranslations>;
            }
            if (namespace === 'ReviewPage') {
                return mockT as unknown as ReturnType<typeof useTranslations>;
            }
            return mockTCTA as unknown as ReturnType<typeof useTranslations>;
        });
        mockedUseToast.mockReturnValue({
            showToast: false,
            toastMessage: '',
            show: vi.fn(),
            hide: vi.fn(),
        });
    });

    describe('Owner actions', () => {
        it('renders edit button when user is owner', () => {
            render(<ReviewOptions
                isOwner={true}
                reviewId="123"
            />);

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toBeInTheDocument();
        });

        it('renders delete button when user is owner', () => {
            render(<ReviewOptions
                isOwner={true}
                reviewId="123"
            />);

            const deleteButton = screen.getByRole('button', {
                name: /delete/i,
            });
            expect(deleteButton).toBeInTheDocument();
        });

        it('renders edit icon when user is owner', () => {
            render(<ReviewOptions
                isOwner={true}
                reviewId="123"
            />);

            const editIcon = screen.getByTestId('pencil-icon');
            expect(editIcon).toBeInTheDocument();
            expect(editIcon).toHaveClass('h-4', 'w-4');
        });

        it('renders delete icon when user is owner', () => {
            render(<ReviewOptions
                isOwner={true}
                reviewId="123"
            />);

            const deleteIcon = screen.getByTestId('trash-icon');
            expect(deleteIcon).toBeInTheDocument();
            expect(deleteIcon).toHaveClass('h-4', 'w-4');
        });

        it('does not render edit button when user is not owner', () => {
            render(<ReviewOptions
                isOwner={false}
                reviewId="123"
            />);

            const editButton = screen.queryByRole('button', { name: /edit/i });
            expect(editButton).not.toBeInTheDocument();
        });

        it('does not render delete button when user is not owner', () => {
            render(<ReviewOptions
                isOwner={false}
                reviewId="123"
            />);

            const deleteButton = screen.queryByRole('button', {
                name: /delete/i,
            });
            expect(deleteButton).not.toBeInTheDocument();
        });
    });

    describe('Share action', () => {
        it('renders share button for owner', () => {
            render(<ReviewOptions
                isOwner={true}
                reviewId="123"
            />);

            const shareButton = screen.getByRole('button', { name: /share/i });
            expect(shareButton).toBeInTheDocument();
        });

        it('renders share button for non-owner', () => {
            render(<ReviewOptions
                isOwner={false}
                reviewId="123"
            />);

            const shareButton = screen.getByRole('button', { name: /share/i });
            expect(shareButton).toBeInTheDocument();
        });

        it('renders share icon', () => {
            render(<ReviewOptions
                isOwner={false}
                reviewId="123"
            />);

            const shareIcon = screen.getByTestId('share2-icon');
            expect(shareIcon).toBeInTheDocument();
            expect(shareIcon).toHaveClass('h-4', 'w-4');
        });

        it('calls navigator.share when share button is clicked', () => {
            const mockShare = vi.fn();
            global.navigator.share = mockShare;

            render(<ReviewOptions
                isOwner={false}
                reviewId="123"
            />);

            const shareButton = screen.getByRole('button', { name: /share/i });
            fireEvent.click(shareButton);

            expect(mockShare).toHaveBeenCalledWith({
                title: 'Share this review',
                url: '/review/123',
            });
        });

        it('copies link to clipboard if navigator.share is not available', async () => {
            const mockWriteText = vi.fn(() => Promise.resolve());
            global.navigator.share = undefined;
            global.navigator.clipboard = { writeText: mockWriteText };
            const mockShow = vi.fn();
            mockedUseToast.mockReturnValue({
                showToast: false,
                toastMessage: '',
                show: mockShow,
                hide: vi.fn(),
            });

            render(<ReviewOptions
                isOwner={false}
                reviewId="123"
            />);

            const shareButton = screen.getByRole('button', { name: /share/i });
            await fireEvent.click(shareButton);

            expect(mockWriteText).toHaveBeenCalledWith(
                'http://localhost:3000/review/123'
            );
            expect(mockShow).toHaveBeenCalledWith('clipboardSuccess');
        });
    });

    describe('Mobile variant', () => {
        it('renders with mobile variant by default', () => {
            render(<ReviewOptions
                isOwner={true}
                reviewId="123"
            />);

            const buttons = screen.getAllByRole('button');
            buttons.forEach((button) => {
                expect(button).toHaveClass('flex', 'w-full', 'sm:w-auto');
            });
        });

        it('does not render options title with mobile variant', () => {
            render(
                <ReviewOptions
                    isOwner={true}
                    variant="mobile"
                    reviewId="123"
                />
            );

            const optionsTitle = screen.queryByText('Options');
            expect(optionsTitle).not.toBeInTheDocument();
        });

        it('applies mobile button classes', () => {
            render(
                <ReviewOptions
                    isOwner={true}
                    variant="mobile"
                    reviewId="123"
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
                    isOwner={true}
                    variant="desktop"
                    reviewId="123"
                />
            );

            const optionsTitle = screen.getByText('Options');
            expect(optionsTitle).toBeInTheDocument();
        });

        it('applies correct styling to options title', () => {
            render(
                <ReviewOptions
                    isOwner={true}
                    variant="desktop"
                    reviewId="123"
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
                    isOwner={true}
                    variant="desktop"
                    reviewId="123"
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
            render(<ReviewOptions
                isOwner={true}
                reviewId="123"
            />);

            const buttons = screen.getAllByRole('button');
            buttons.forEach((button) => {
                expect(button).toHaveClass('border', 'border-input');
            });
        });

        it('applies small size to all buttons', () => {
            render(<ReviewOptions
                isOwner={true}
                reviewId="123"
            />);

            const buttons = screen.getAllByRole('button');
            buttons.forEach((button) => {
                expect(button).toHaveClass('h-9', 'rounded-md', 'px-3');
            });
        });

        it('applies gap classes to button content', () => {
            render(<ReviewOptions
                isOwner={true}
                reviewId="123"
            />);

            const shareButton = screen.getByRole('button', { name: /share/i });
            expect(shareButton).toHaveClass('gap-1.5');
        });
    });

    describe('Button order', () => {
        it('renders buttons in correct order for owner', () => {
            render(<ReviewOptions
                isOwner={true}
                reviewId="123"
            />);

            const buttons = screen.getAllByRole('button');
            expect(buttons[0]).toHaveTextContent('Edit');
            expect(buttons[1]).toHaveTextContent('Delete');
            expect(buttons[2]).toHaveTextContent('Share');
        });

        it('renders only share button for non-owner', () => {
            render(<ReviewOptions
                isOwner={false}
                reviewId="123"
            />);

            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(1);
            expect(buttons[0]).toHaveTextContent('Share');
        });
    });

    describe('Translations', () => {
        it('uses correct translation namespace for CTA buttons', () => {
            render(<ReviewOptions
                isOwner={true}
                reviewId="123"
            />);

            expect(mockTCTA).toHaveBeenCalledWith('edit');
            expect(mockTCTA).toHaveBeenCalledWith('delete');
            expect(mockTCTA).toHaveBeenCalledWith('share');
        });

        it('uses correct translation namespace for options title', () => {
            render(
                <ReviewOptions
                    isOwner={true}
                    variant="desktop"
                    reviewId="123"
                />
            );

            expect(mockT).toHaveBeenCalledWith('options');
        });
    });

    describe('Icon and text alignment', () => {
        it('aligns icon and text in edit button', () => {
            render(<ReviewOptions
                isOwner={true}
                reviewId="123"
            />);

            const editButton = screen.getByRole('button', { name: /edit/i });
            const icon = editButton.querySelector('[data-testid="pencil-icon"]');
            const text = editButton.querySelector('span');

            expect(icon).toBeInTheDocument();
            expect(text).toBeInTheDocument();
            expect(editButton).toHaveClass('items-center');
        });

        it('aligns icon and text in delete button', () => {
            render(<ReviewOptions
                isOwner={true}
                reviewId="123"
            />);

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
            render(<ReviewOptions
                isOwner={false}
                reviewId="123"
            />);

            const shareButton = screen.getByRole('button', { name: /share/i });
            const icon = shareButton.querySelector('[data-testid="share2-icon"]');
            const text = shareButton.querySelector('span');

            expect(icon).toBeInTheDocument();
            expect(text).toBeInTheDocument();
            expect(shareButton).toHaveClass('items-center');
        });
    });
});
