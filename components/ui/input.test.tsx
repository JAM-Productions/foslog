import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '@/components/ui/input';

describe('Input', () => {
    it('renders with default props', () => {
        render(<Input placeholder="Enter text" />);
        const input = screen.getByPlaceholderText('Enter text');
        expect(input).toBeInTheDocument();
        expect(input).toHaveClass(
            'border',
            'border-input',
            'bg-background',
            'h-10',
            'px-3',
            'py-2'
        );
        expect(input).toHaveAttribute('type', 'text');
    });

    it('renders with outline variant', () => {
        render(
            <Input
                variant="outline"
                placeholder="Outline input"
            />
        );
        const input = screen.getByPlaceholderText('Outline input');
        expect(input).toHaveClass('border-2', 'border-input', 'bg-transparent');
    });

    it('renders with filled variant', () => {
        render(
            <Input
                variant="filled"
                placeholder="Filled input"
            />
        );
        const input = screen.getByPlaceholderText('Filled input');
        expect(input).toHaveClass('border-0', 'bg-muted');
    });

    it('renders with small size', () => {
        render(
            <Input
                inputSize="sm"
                placeholder="Small input"
            />
        );
        const input = screen.getByPlaceholderText('Small input');
        expect(input).toHaveClass('h-8', 'px-2', 'py-1');
    });

    it('renders with large size', () => {
        render(
            <Input
                inputSize="lg"
                placeholder="Large input"
            />
        );
        const input = screen.getByPlaceholderText('Large input');
        expect(input).toHaveClass('h-12', 'px-4', 'py-3', 'text-lg');
    });

    it('renders with custom type', () => {
        render(
            <Input
                type="email"
                placeholder="Email input"
            />
        );
        const input = screen.getByPlaceholderText('Email input');
        expect(input).toHaveAttribute('type', 'email');
    });

    it('applies custom className', () => {
        render(
            <Input
                className="custom-class"
                placeholder="Custom input"
            />
        );
        const input = screen.getByPlaceholderText('Custom input');
        expect(input).toHaveClass('custom-class');
    });

    it('handles change events', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();

        render(
            <Input
                onChange={handleChange}
                placeholder="Change test"
            />
        );
        const input = screen.getByPlaceholderText('Change test');

        await user.type(input, 'test value');
        expect(handleChange).toHaveBeenCalled();
        expect(input).toHaveValue('test value');
    });

    it('handles focus events', async () => {
        const user = userEvent.setup();
        const handleFocus = vi.fn();

        render(
            <Input
                onFocus={handleFocus}
                placeholder="Focus test"
            />
        );
        const input = screen.getByPlaceholderText('Focus test');

        await user.click(input);
        expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('handles blur events', async () => {
        const user = userEvent.setup();
        const handleBlur = vi.fn();

        render(
            <Input
                onBlur={handleBlur}
                placeholder="Blur test"
            />
        );
        const input = screen.getByPlaceholderText('Blur test');

        await user.click(input);
        await user.tab();
        expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
        render(
            <Input
                disabled
                placeholder="Disabled input"
            />
        );
        const input = screen.getByPlaceholderText('Disabled input');
        expect(input).toBeDisabled();
        expect(input).toHaveClass(
            'disabled:cursor-not-allowed',
            'disabled:opacity-50'
        );
    });

    it('prevents input when disabled', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();

        render(
            <Input
                onChange={handleChange}
                disabled
                placeholder="Disabled input"
            />
        );
        const input = screen.getByPlaceholderText('Disabled input');

        await user.type(input, 'test');
        expect(handleChange).not.toHaveBeenCalled();
        expect(input).toHaveValue('');
    });

    it('forwards ref correctly', () => {
        const ref = vi.fn();
        render(
            <Input
                ref={ref}
                placeholder="Ref test"
            />
        );
        expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });

    it('accepts additional HTML input attributes', () => {
        render(
            <Input
                required
                maxLength={10}
                data-testid="test-input"
                placeholder="Attributes test"
            />
        );
        const input = screen.getByTestId('test-input');
        expect(input).toHaveAttribute('required');
        expect(input).toHaveAttribute('maxLength', '10');
    });

    it('has correct accessibility attributes', () => {
        render(<Input placeholder="Accessible input" />);
        const input = screen.getByPlaceholderText('Accessible input');
        expect(input).toHaveClass(
            'focus-visible:outline-none',
            'focus-visible:ring-2',
            'focus-visible:ring-ring',
            'focus-visible:ring-offset-2'
        );
    });

    it('handles password type correctly', () => {
        render(
            <Input
                type="password"
                placeholder="Password input"
            />
        );
        const input = screen.getByPlaceholderText('Password input');
        expect(input).toHaveAttribute('type', 'password');
    });

    it('handles number type correctly', async () => {
        const user = userEvent.setup();
        render(
            <Input
                type="number"
                placeholder="Number input"
            />
        );
        const input = screen.getByPlaceholderText('Number input');

        expect(input).toHaveAttribute('type', 'number');

        await user.type(input, '123');
        expect(input).toHaveValue(123);
    });

    it('combines variant and size classes correctly', () => {
        render(
            <Input
                variant="outline"
                inputSize="lg"
                placeholder="Combined styles"
            />
        );
        const input = screen.getByPlaceholderText('Combined styles');
        expect(input).toHaveClass(
            'border-2',
            'border-input',
            'bg-transparent',
            'h-12',
            'px-4',
            'py-3',
            'text-lg'
        );
    });

    it('handles file input type with correct styling', () => {
        const { container } = render(<Input type="file" />);
        const input = container.querySelector('input[type="file"]');
        expect(input).toHaveAttribute('type', 'file');
        expect(input).toHaveClass(
            'file:border-0',
            'file:bg-transparent',
            'file:text-base',
            'file:font-medium'
        );
    });

    it('displays placeholder text correctly', () => {
        const placeholderText = 'Enter your name';
        render(<Input placeholder={placeholderText} />);
        const input = screen.getByPlaceholderText(placeholderText);
        expect(input).toHaveClass('placeholder:text-muted-foreground');
    });
});
