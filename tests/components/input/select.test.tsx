import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Select, { SelectOption } from '@/components/input/select';

vi.mock('@/hooks/useClickOutside', () => ({
    useClickOutside: vi.fn(),
}));

vi.mock('next-intl', () => ({
    useTranslations: vi.fn(() => (key: string) => {
        const translations: Record<string, string> = {
            selectPlaceholder: 'Selecciona una opción',
            noOptions: 'No options',
        };
        return translations[key] || key;
    }),
}));

const mockOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'disabled', label: 'Disabled Option', disabled: true },
];

describe('Select', () => {
    it('renders with default props', () => {
        render(<Select options={mockOptions} />);
        const selectButton = screen.getByRole('button');
        expect(selectButton).toBeInTheDocument();
        expect(selectButton).toHaveClass('flex', 'w-full', 'cursor-pointer');
        expect(selectButton).toHaveTextContent('Selecciona una opción');
    });

    it('renders with custom placeholder', () => {
        render(
            <Select
                options={mockOptions}
                placeholder="Choose an option"
            />
        );
        const selectButton = screen.getByRole('button');
        expect(selectButton).toHaveTextContent('Choose an option');
    });

    it('displays selected option label', () => {
        render(
            <Select
                options={mockOptions}
                value="option2"
            />
        );
        const selectButton = screen.getByRole('button');
        expect(selectButton).toHaveTextContent('Option 2');
    });

    it('applies custom className', () => {
        render(
            <Select
                options={mockOptions}
                className="custom-class"
            />
        );
        const selectContainer = screen.getByRole('button').closest('div')?.parentElement;
        expect(selectContainer).toHaveClass('custom-class');
    });

    it('opens dropdown when clicked', async () => {
        const user = userEvent.setup();
        render(<Select options={mockOptions} />);

        const selectButton = screen.getByRole('button');
        await user.click(selectButton);

        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('calls onChange when option is selected', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();

        render(
            <Select
                options={mockOptions}
                onChange={handleChange}
            />
        );

        const selectButton = screen.getByRole('button');
        await user.click(selectButton);

        const option = screen.getByText('Option 2');
        await user.click(option);

        expect(handleChange).toHaveBeenCalledWith('option2');
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('closes dropdown after selecting an option', async () => {
        const user = userEvent.setup();
        render(<Select options={mockOptions} />);

        const selectButton = screen.getByRole('button');
        await user.click(selectButton);

        expect(screen.getByText('Option 1')).toBeInTheDocument();

        const option = screen.getByText('Option 2');
        await user.click(option);

        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('highlights selected option in dropdown', async () => {
        const user = userEvent.setup();
        render(
            <Select
                options={mockOptions}
                value="option2"
            />
        );

        const selectButton = screen.getByRole('button');
        await user.click(selectButton);

        const dropdown = screen.getByTestId('dropdown-content');
        const selectedOption = within(dropdown).getByRole('button', {
            name: 'Option 2',
        });
        expect(selectedOption).toHaveClass('bg-accent');
    });

    it('disables individual options', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();

        render(
            <Select
                options={mockOptions}
                onChange={handleChange}
            />
        );

        const selectButton = screen.getByRole('button');
        await user.click(selectButton);

        const disabledOption = screen.getByText('Disabled Option');
        expect(disabledOption).toBeDisabled();

        await user.click(disabledOption);
        expect(handleChange).not.toHaveBeenCalled();
    });

    it('is disabled when disabled prop is true', () => {
        render(
            <Select
                options={mockOptions}
                disabled
            />
        );
        const selectButton = screen.getByRole('button');
        expect(selectButton).toBeDisabled();
    });

    it('does not open when disabled', async () => {
        const user = userEvent.setup();
        render(
            <Select
                options={mockOptions}
                disabled
            />
        );

        const selectButton = screen.getByRole('button');
        await user.click(selectButton);

        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    it('does not show dropdown when disabled', () => {
        render(
            <Select
                options={mockOptions}
                disabled
            />
        );

        const selectContainer = screen.getByRole('button').closest('div');

        expect(
            selectContainer?.querySelector('[class*="absolute"]')
        ).not.toBeInTheDocument();
    });

    it('handles empty options array', () => {
        render(<Select options={[]} />);
        const selectButton = screen.getByRole('button');
        expect(selectButton).toBeInTheDocument();
        expect(selectButton).toHaveTextContent('Selecciona una opción');
    });

    it('shows empty dropdown when opened with no options', async () => {
        const user = userEvent.setup();
        render(<Select options={[]} />);

        const selectButton = screen.getByRole('button');
        await user.click(selectButton);

        const dropdown = screen.getByTestId('dropdown-content');
        expect(dropdown).toBeInTheDocument();
    });

    it('handles keyboard navigation', async () => {
        render(<Select options={mockOptions} />);
        const selectButton = screen.getByRole('button');

        selectButton.focus();
        expect(selectButton).toHaveFocus();

        fireEvent.keyDown(selectButton, { key: 'Enter' });
    });

    it('maintains accessibility attributes', () => {
        render(<Select options={mockOptions} />);
        const selectButton = screen.getByRole('button');

        expect(selectButton).toHaveClass(
            'focus-visible:outline-none',
            'focus-visible:ring-2',
            'focus-visible:ring-ring',
            'focus-visible:ring-offset-2'
        );
    });

    it('renders with proper dropdown positioning', async () => {
        const user = userEvent.setup();
        render(<Select options={mockOptions} />);

        const selectButton = screen.getByRole('button');
        await user.click(selectButton);

        const dropdown = screen.getByTestId('dropdown-content');
        expect(dropdown).toBeInTheDocument();
    });

    it('has scrollable dropdown for long option lists', async () => {
        const longOptions = Array.from({ length: 20 }, (_, i) => ({
            value: `option${i}`,
            label: `Option ${i + 1}`,
        }));

        const user = userEvent.setup();
        render(<Select options={longOptions} />);

        const selectButton = screen.getByRole('button');
        await user.click(selectButton);

        const dropdown = screen.getByTestId('dropdown-content');
        expect(dropdown).toHaveClass('max-h-60', 'overflow-y-auto');
    });
});
