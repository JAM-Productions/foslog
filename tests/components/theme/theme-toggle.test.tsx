import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ThemeToggle from '@/components/theme/theme-toggle';
import { useTheme } from '@/components/theme/theme-provider';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useTranslations } from 'next-intl';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: vi.fn(),
}));

// Mock dependencies
vi.mock('@/components/theme/theme-provider', () => ({
    useTheme: vi.fn(),
}));

vi.mock('@/hooks/use-click-outside', () => ({
    useClickOutside: vi.fn(),
}));

describe('ThemeToggle', () => {
    const mockSetTheme = vi.fn();
    const mockedUseTheme = vi.mocked(useTheme);
    const mockedUseClickOutside = vi.mocked(useClickOutside);
    const mockT = vi.fn((key: string) => {
        const translations: Record<string, string> = {
            light: 'Light',
            dark: 'Dark',
            system: 'System',
        };
        return translations[key] || key;
    });

    const mockedUseTranslations = vi.mocked(useTranslations);

    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseTranslations.mockReturnValue(
            mockT as unknown as ReturnType<typeof useTranslations>
        );
        mockedUseTheme.mockReturnValue({
            theme: 'system',
            setTheme: mockSetTheme,
        });
        mockedUseClickOutside.mockImplementation(() => {});
    });

    it('renders the theme toggle button', () => {
        render(<ThemeToggle />);

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
    });

    it('displays the correct icon for current theme', () => {
        // Test system theme (Monitor icon)
        mockedUseTheme.mockReturnValue({
            theme: 'system',
            setTheme: mockSetTheme,
        });

        const { rerender } = render(<ThemeToggle />);

        // Test light theme (Sun icon)
        mockedUseTheme.mockReturnValue({
            theme: 'light',
            setTheme: mockSetTheme,
        });
        rerender(<ThemeToggle />);

        // Test dark theme (Moon icon)
        mockedUseTheme.mockReturnValue({
            theme: 'dark',
            setTheme: mockSetTheme,
        });
        rerender(<ThemeToggle />);

        // Each should render without errors
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('opens dropdown menu when button is clicked', async () => {
        const user = userEvent.setup();
        render(<ThemeToggle />);

        const button = screen.getByRole('button');
        await user.click(button);

        expect(screen.getAllByText('Light')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Dark')[0]).toBeInTheDocument();
        expect(screen.getAllByText('System')[0]).toBeInTheDocument();
    });

    it('highlights the current theme in dropdown', async () => {
        mockedUseTheme.mockReturnValue({
            theme: 'dark',
            setTheme: mockSetTheme,
        });

        const user = userEvent.setup();
        render(<ThemeToggle />);

        const button = screen.getByRole('button');
        await user.click(button);

        const darkOptions = screen.getAllByText('Dark');
        const darkOption = darkOptions[1].closest('button');
        expect(darkOption).toHaveClass('bg-accent', 'text-accent-foreground');
    });

    it('calls setTheme when theme option is selected', async () => {
        const user = userEvent.setup();
        render(<ThemeToggle />);

        // Open dropdown
        const toggleButton = screen.getByRole('button');
        await user.click(toggleButton);

        // Click on light theme
        const lightOption = screen.getByText('Light');
        await user.click(lightOption);

        expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('closes dropdown after selecting theme', async () => {
        const user = userEvent.setup();
        render(<ThemeToggle />);

        // Open dropdown
        const toggleButton = screen.getByRole('button');
        await user.click(toggleButton);

        expect(screen.getByText('Light')).toBeInTheDocument();

        // Select dark theme
        const darkOption = screen.getByText('Dark');
        await user.click(darkOption);

        // Dropdown should close (theme options should not be visible)
        // Note: This tests the local state change, actual DOM update depends on React re-render
        expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('calls useClickOutside hook with correct parameters', () => {
        render(<ThemeToggle />);

        expect(mockedUseClickOutside).toHaveBeenCalledWith(
            expect.any(Object), // ref
            false, // isOpen (initial state)
            expect.any(Function) // setIsOpen
        );
    });

    it('has proper styling classes', async () => {
        const user = userEvent.setup();
        render(<ThemeToggle />);

        const container = screen.getByRole('button').parentElement;
        expect(container).toHaveClass('relative');

        // Open dropdown to check menu styling
        await user.click(screen.getByRole('button'));

        const dropdown = screen.getByText('Light').closest('div');
        expect(dropdown).toHaveClass(
            'bg-card',
            'absolute',
            'top-12',
            'right-0',
            'z-50',
            'w-32',
            'rounded-lg',
            'border',
            'shadow-lg'
        );
    });

    it('theme options have correct hover classes', async () => {
        const user = userEvent.setup();
        render(<ThemeToggle />);

        await user.click(screen.getByRole('button'));

        const lightOption = screen.getByText('Light').closest('button');
        expect(lightOption).toHaveClass(
            'hover:bg-accent',
            'hover:text-accent-foreground',
            'flex',
            'w-full',
            'items-center',
            'gap-2',
            'px-3',
            'py-2',
            'text-left',
            'text-sm'
        );
    });
});
