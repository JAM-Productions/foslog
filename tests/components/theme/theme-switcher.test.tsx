import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en.json';

const mockSetTheme = vi.fn();

vi.mock('next-themes', () => ({
    useTheme: () => ({
        setTheme: mockSetTheme,
        theme: 'light',
    }),
}));

describe('ThemeSwitcher', () => {
    const renderComponent = () =>
        render(
            <NextIntlClientProvider
                messages={messages}
                locale="en"
            >
                <ThemeSwitcher />
            </NextIntlClientProvider>
        );

    it('renders buttons for all themes', () => {
        renderComponent();
        expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /system/i })).toBeInTheDocument();
    });

    it('highlights the active theme', () => {
        renderComponent();
        const activeButton = screen.getByRole('button', { name: /light/i });
        expect(activeButton).toHaveClass('bg-primary');
    });

    it('calls setTheme with the correct theme when a button is clicked', () => {
        renderComponent();
        const darkButton = screen.getByRole('button', { name: /dark/i });
        fireEvent.click(darkButton);
        expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });
});
