import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from '@/components/input/checkbox';

describe('Checkbox', () => {
    it('renders with label', () => {
        render(
            <Checkbox
                label="Accept terms"
                checked={false}
                onCheckedChange={() => { }}
            />
        );
        expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
    });

    it('renders checked state correctly', () => {
        render(
            <Checkbox
                label="Checked option"
                checked={true}
                onCheckedChange={() => { }}
            />
        );
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
    });

    it('calls onCheckedChange when clicked', () => {
        const handleChange = vi.fn();
        render(
            <Checkbox
                label="Click me"
                checked={false}
                onCheckedChange={handleChange}
            />
        );

        const checkbox = screen.getByLabelText('Click me');
        fireEvent.click(checkbox);
        expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('is disabled when disabled prop is true', () => {
        render(
            <Checkbox
                label="Disabled"
                checked={false}
                onCheckedChange={() => { }}
                disabled={true}
            />
        );

        const checkbox = screen.getByLabelText('Disabled');
        expect(checkbox).toBeDisabled();
    });
});
