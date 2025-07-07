import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
    it('renders with default props', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: 'Click me' });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass(
            'bg-primary',
            'text-primary-foreground',
            'h-10',
            'px-4',
            'py-2'
        );
    });

    it('renders with secondary variant', () => {
        render(<Button variant="secondary">Secondary</Button>);
        const button = screen.getByRole('button', { name: 'Secondary' });
        expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('renders with destructive variant', () => {
        render(<Button variant="destructive">Delete</Button>);
        const button = screen.getByRole('button', { name: 'Delete' });
        expect(button).toHaveClass(
            'bg-destructive',
            'text-destructive-foreground'
        );
    });

    it('renders with outline variant', () => {
        render(<Button variant="outline">Outline</Button>);
        const button = screen.getByRole('button', { name: 'Outline' });
        expect(button).toHaveClass('border', 'border-input', 'bg-background');
    });

    it('renders with ghost variant', () => {
        render(<Button variant="ghost">Ghost</Button>);
        const button = screen.getByRole('button', { name: 'Ghost' });
        expect(button).toHaveClass(
            'hover:bg-accent',
            'hover:text-accent-foreground'
        );
    });

    it('renders with small size', () => {
        render(<Button size="sm">Small</Button>);
        const button = screen.getByRole('button', { name: 'Small' });
        expect(button).toHaveClass('h-9', 'rounded-md', 'px-3');
    });

    it('renders with large size', () => {
        render(<Button size="lg">Large</Button>);
        const button = screen.getByRole('button', { name: 'Large' });
        expect(button).toHaveClass('h-11', 'rounded-md', 'px-8');
    });

    it('renders with icon size', () => {
        render(<Button size="icon">Icon</Button>);
        const button = screen.getByRole('button', { name: 'Icon' });
        expect(button).toHaveClass('h-10', 'w-10');
    });

    it('applies custom className', () => {
        render(<Button className="custom-class">Custom</Button>);
        const button = screen.getByRole('button', { name: 'Custom' });
        expect(button).toHaveClass('custom-class');
    });

    it('handles click events', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(<Button onClick={handleClick}>Clickable</Button>);
        const button = screen.getByRole('button', { name: 'Clickable' });

        await user.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole('button', { name: 'Disabled' });
        expect(button).toBeDisabled();
        expect(button).toHaveClass(
            'disabled:pointer-events-none',
            'disabled:opacity-50'
        );
    });

    it('prevents click when disabled', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(
            <Button
                onClick={handleClick}
                disabled
            >
                Disabled
            </Button>
        );
        const button = screen.getByRole('button', { name: 'Disabled' });

        await user.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('forwards ref correctly', () => {
        const ref = vi.fn();
        render(<Button ref={ref}>Ref test</Button>);
        expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });

    it('accepts additional HTML button attributes', () => {
        render(
            <Button
                type="submit"
                data-testid="submit-button"
            >
                Submit
            </Button>
        );
        const button = screen.getByTestId('submit-button');
        expect(button).toHaveAttribute('type', 'submit');
    });

    it('has correct accessibility attributes', () => {
        render(<Button>Accessible button</Button>);
        const button = screen.getByRole('button', {
            name: 'Accessible button',
        });
        expect(button).toHaveClass(
            'focus-visible:outline-none',
            'focus-visible:ring-2',
            'focus-visible:ring-ring',
            'focus-visible:ring-offset-2'
        );
    });
});
