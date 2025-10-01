import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BackButton } from '@/components/ui/back-button';
import { ReactNode } from 'react';

interface MockLinkProps {
    children: ReactNode;
    href: string;
    className?: string;
    prefetch?: boolean;
    [key: string]: unknown;
}

// Mock Next.js Link component
vi.mock('next/link', () => {
    return {
        default: ({
            children,
            href,
            className,
            prefetch,
            ...props
        }: MockLinkProps) => (
            <a
                href={href}
                className={className}
                data-prefetch={prefetch?.toString()}
                {...props}
            >
                {children}
            </a>
        ),
    };
});

describe('BackButton', () => {
    it('renders with default props', () => {
        render(<BackButton />);
        const link = screen.getByRole('link');

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/');
        expect(link).toHaveAttribute('aria-label', 'Go back');
        expect(link).toHaveClass(
            'flex',
            'items-center',
            'justify-center',
            'rounded-md',
            'p-2',
            'transition-colors',
            'text-primary',
            'hover:bg-gray-100',
            'dark:hover:bg-background'
        );
    });

    it('renders ArrowLeft icon', () => {
        render(<BackButton />);
        const icon = screen.getByRole('link').querySelector('svg');

        expect(icon).toBeInTheDocument();
        expect(icon).toHaveStyle({
            width: '20px',
            height: '20px',
        });
    });

    it('accepts custom href prop', () => {
        render(<BackButton href="/dashboard" />);
        const link = screen.getByRole('link');

        expect(link).toHaveAttribute('href', '/dashboard');
    });

    it('accepts custom aria-label prop', () => {
        render(<BackButton aria-label="Return to previous page" />);
        const link = screen.getByRole('link');

        expect(link).toHaveAttribute('aria-label', 'Return to previous page');
    });

    it('accepts custom className prop', () => {
        render(<BackButton className="custom-class bg-blue-500" />);
        const link = screen.getByRole('link');

        expect(link).toHaveClass('custom-class', 'bg-blue-500');
        // Should also maintain base classes
        expect(link).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('accepts custom iconSize prop', () => {
        render(<BackButton iconSize={24} />);
        const icon = screen.getByRole('link').querySelector('svg');

        expect(icon).toHaveStyle({
            width: '24px',
            height: '24px',
        });
    });

    it('combines all custom props correctly', () => {
        render(
            <BackButton
                href="/settings"
                className="custom-style"
                iconSize={32}
                aria-label="Go to settings"
            />
        );

        const link = screen.getByRole('link');
        const icon = link.querySelector('svg');

        expect(link).toHaveAttribute('href', '/settings');
        expect(link).toHaveAttribute('aria-label', 'Go to settings');
        expect(link).toHaveClass('custom-style');
        expect(icon).toHaveStyle({
            width: '32px',
            height: '32px',
        });
    });

    it('maintains base classes when custom className is provided', () => {
        render(<BackButton className="extra-class" />);
        const link = screen.getByRole('link');

        // Should have both base classes and custom class
        expect(link).toHaveClass(
            'flex',
            'items-center',
            'justify-center',
            'rounded-md',
            'p-2',
            'transition-colors',
            'extra-class'
        );
    });

    it('handles undefined className gracefully', () => {
        render(<BackButton className={undefined} />);
        const link = screen.getByRole('link');

        expect(link).toHaveClass('flex', 'items-center', 'justify-center');
        expect(link.className).not.toContain('undefined');
    });

    it('has prefetch attribute set to true', () => {
        render(<BackButton />);
        const link = screen.getByRole('link');

        expect(link).toHaveAttribute('data-prefetch', 'true');
    });

    it('renders with correct lucide icon classes', () => {
        render(<BackButton />);
        const icon = screen.getByRole('link').querySelector('svg');

        expect(icon).toHaveStyle({ width: '20px', height: '20px' });
    });
});
