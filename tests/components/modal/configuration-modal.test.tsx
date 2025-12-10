import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfigurationModal from '@/components/modal/configuration-modal';
import { useAppStore } from '@/lib/store';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en.json';

vi.mock('@/lib/store', () => ({
    useAppStore: vi.fn(),
}));

vi.mock('@/components/header/language-selector', () => ({
    __esModule: true,
    default: () => <div data-testid="language-selector">LanguageSelector</div>,
}));

vi.mock('@/components/theme/theme-toggle', () => ({
    default: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}));

describe('ConfigurationModal', () => {
    it('renders the modal when isConfigurationModalOpen is true', () => {
        (useAppStore as any).mockReturnValue({
            isConfigurationModalOpen: true,
            setIsConfigurationModalOpen: () => {},
        });

        render(
            <NextIntlClientProvider locale="en" messages={messages}>
                <ConfigurationModal />
            </NextIntlClientProvider>
        );

        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        expect(screen.getByTestId('modal-container')).toBeInTheDocument();
        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            'Configuration'
        );
        expect(screen.getByTestId('modal-description')).toHaveTextContent(
            'Configure your language and theme preferences.'
        );
        expect(screen.getByTestId('language-selector')).toBeInTheDocument();
        expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('does not render the modal when isConfigurationModalOpen is false', () => {
        (useAppStore as any).mockReturnValue({
            isConfigurationModalOpen: false,
            setIsConfigurationModalOpen: () => {},
        });

        render(
            <NextIntlClientProvider locale="en" messages={messages}>
                <ConfigurationModal />
            </NextIntlClientProvider>
        );

        expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
    });

    it('calls setIsConfigurationModalOpen with false when the close button is clicked', () => {
        const setIsConfigurationModalOpen = vi.fn();
        (useAppStore as any).mockReturnValue({
            isConfigurationModalOpen: true,
            setIsConfigurationModalOpen,
        });

        render(
            <NextIntlClientProvider locale="en" messages={messages}>
                <ConfigurationModal />
            </NextIntlClientProvider>
        );

        fireEvent.click(screen.getByTestId('modal-close-button'));
        expect(setIsConfigurationModalOpen).toHaveBeenCalledWith(false);
    });
});
