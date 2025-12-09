import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LocaleSwitcher } from '@/components/header/locale-switcher';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en.json';

const mockRouter = {
    replace: vi.fn(),
};

vi.mock('@/i18n/navigation', () => ({
    useRouter: () => mockRouter,
    usePathname: () => '/',
}));

describe('LocaleSwitcher', () => {
    const renderComponent = (locale = 'en') =>
        render(
            <NextIntlClientProvider
                messages={messages}
                locale={locale}
            >
                <LocaleSwitcher />
            </NextIntlClientProvider>
        );

    it('renders buttons for all locales', () => {
        renderComponent();
        expect(screen.getByRole('button', { name: /en/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /es/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ca/i })).toBeInTheDocument();
    });

    it('highlights the active locale', () => {
        renderComponent('es');
        const activeButton = screen.getByRole('button', { name: /es/i });
        expect(activeButton).toHaveClass('bg-primary');
    });

    it('calls router.replace with the correct locale when a button is clicked', () => {
        renderComponent();
        const spanishButton = screen.getByRole('button', { name: /es/i });
        fireEvent.click(spanishButton);
        expect(mockRouter.replace).toHaveBeenCalledWith('/', { locale: 'es' });
    });
});
