import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BackButton } from '@/components/button/back-button';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

// Mock the custom useRouter from @/i18n/navigation
const mockRouterBack = vi.fn();
vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({
        back: mockRouterBack,
    }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        back: mockRouterBack,
    }),
}));

describe('BackButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders as a button with default props', () => {
        render(<BackButton />);
        const button = screen.getByRole('button');

        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', 'Go back');
        expect(button).toHaveClass(
            'inline-flex',
            'items-center',
            'gap-2',
            'px-4',
            'py-2',
            'rounded-lg',
            'font-medium',
            'transition-all',
            'duration-200',
            'text-foreground',
            'bg-card',
            'border',
            'border-border',
            'hover:bg-accent',
            'hover:shadow-md',
            'focus:outline-none',
            'focus:ring-2',
            'focus:ring-ring',
            'focus:ring-offset-2',
            'focus:ring-offset-background'
        );
    });

    it('calls router.back on click', () => {
        render(<BackButton />);
        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockRouterBack).toHaveBeenCalledTimes(1);
    });

    it('renders ArrowLeft icon with default size', () => {
        render(<BackButton />);
        const icon = screen.getByRole('button').querySelector('svg');

        expect(icon).toBeInTheDocument();
        expect(icon).toHaveStyle({
            width: '20px',
            height: '20px',
        });
    });

    it('accepts custom aria-label prop', () => {
        render(<BackButton aria-label="Return to previous page" />);
        const button = screen.getByRole('button');

        expect(button).toHaveAttribute('aria-label', 'Return to previous page');
    });

    it('accepts custom className prop', () => {
        render(<BackButton className="custom-class bg-blue-500" />);
        const button = screen.getByRole('button');

        expect(button).toHaveClass('custom-class', 'bg-blue-500');
    });

    it('accepts custom iconSize prop', () => {
        render(<BackButton iconSize={24} />);
        const icon = screen.getByRole('button').querySelector('svg');

        expect(icon).toHaveStyle({
            width: '24px',
            height: '24px',
        });
    });

    it('combines all custom props correctly', () => {
        render(
            <BackButton
                className="custom-style"
                iconSize={32}
                aria-label="Go to settings"
            />
        );

        const button = screen.getByRole('button');
        const icon = button.querySelector('svg');

        expect(button).toHaveAttribute('aria-label', 'Go to settings');
        expect(button).toHaveClass('custom-style');
        expect(icon).toHaveStyle({
            width: '32px',
            height: '32px',
        });
    });
});
